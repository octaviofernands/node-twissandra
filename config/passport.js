var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./main');
var passUser = require('../models/user');

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  passUser.findByUsername(username, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'username' }, function(username, password, done) {
	passUser.findByUsername(username, function(err, user) {
    	if (!user) return done(null, false, { message: 'username ' + username + ' not found'});
      console.log(user);
    	passUser.comparePassword(password, user.password, function(err, isMatch) {
	      	if (isMatch) {
	        	return done(null, user);
	      	} else {
	        	return done(null, false, { message: 'Invalid username or password.' });
	      	}
    	});
  	});
}));