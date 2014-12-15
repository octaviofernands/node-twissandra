/*jslint node: true, nomen: true*/
/*global require, exports, console, __dirname, module*/
/******* INITIALIZE *******/
var express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    router = express.Router(),
    path = require('path'),
    swig = require('swig'),
    fs = require('fs'),
    flash = require('express-flash'),
    expressValidator = require('express-validator'),
    passport = require('passport'),
    client = require('./lib/database'),
    methodOverride = require('method-override'),
    passportConf = require('./config/passport'),
    cassandraStore = require('connect-cassandra')(session),
    app = express(),
    //Config file
    config = require('./config/main');


/******* USES *******/
//Logger
app.use(morgan('dev'));

//Bind JSON
app.use(bodyParser.json());

//Bind GET requests
app.use(bodyParser.urlencoded({ extended: false }));

//Cookies
app.use(cookieParser());

//public folder will serve assets
app.use(express.static(path.join(__dirname, 'public')));

//Data validation
app.use(expressValidator());

//Override request methods via HTML forms
app.use(methodOverride(function (req, res) {
    "use strict";
    if (req.body && typeof req.body === 'object' && req.body._method !== 'undefined') {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

//Views path
app.set('views', path.join(__dirname, 'views'));

//View engine witchcraft
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('view cache', false);
swig.setDefaults({cache: false});

client.connect(function (err, result) {
    "use strict";
    if (err === null) {
        console.log('Connected.');

        //Session handler
        app.use(session({
            secret: 'supersecretkeygoeshere',
            store: new cassandraStore({ pool: client })
        }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());

        //Server port
        app.set('port', 3000);

        /******* ROUTES *******/

        //Applies user object (session) to all templates
        app.use(function (req, res, next) {
            res.locals.session = req.user;
            next();
        });

        //Get route files via Filesystem and assign dinamically to router object.
        var files = fs.readdirSync('routes');
        files.forEach(function (file) {
            var routeName = file.substr(0, file.indexOf('.'));
            app.use(require('./routes/' + routeName)(router));
        });


        /******* SERVER *******/
        app.listen(app.get('port'), function () {
            "use strict";
            console.log('Express server listening on port %d in %s mode', app.get('port'), 'dev');
        });

        module.exports = app;

    } else {
        console.log('Not Connected');
    }
});