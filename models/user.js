/*global require, exports, console, module*/
var config = require('../config/main');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var cassandra = require('../lib/database');
var uuid = require('node-uuid');

exports.teste = function (req, next) {
    "use strict";
    var query = 'SELECT * FROM users';
    cassandra.execute(query, function (err, result) {
        console.log(result);
        next(result);
    });
};

exports.create = function (req, next) {
    "use strict";
    var username = req.body.username,
        password = req.body.password;

    bcrypt.genSalt(5, function (err, salt) {
        if (err) { return next(err); }

        bcrypt.hash(password, salt, null, function (err, hash) {
            if (err) { return next(err); }
            password = hash;


            var query = 'INSERT INTO users (username, password) VALUES (?,?)',
                params = [username, password];

            cassandra.execute(query, params, {prepare: true}, function (err) {
                if (err) { console.log(err); }
                console.log('Row inserted on the cluster');
            });
        });
    });
};

exports.findByUsername = function (username, next) {
    "use strict";
    var query = 'SELECT * FROM users WHERE username = ?',
        params = [username];
    cassandra.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { console.log(err, result); }
        next(err, result.rows[0]);
    });
};

exports.comparePassword = function (candidatePassword, userPassword, next) {
    "use strict";
    bcrypt.compare(candidatePassword, userPassword, function (err, isMatch) {
        if (err) { return next(err); }
        next(null, isMatch);
    });
};

exports.userTimeline = function (username, next) {
    "use strict";
    var posts = [],
        query = 'SELECT * FROM timeline WHERE username = ?',
        params = [username];

    cassandra.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { console.log(err, result); }
        if (result.rows.length > 0) {
            result.rows.forEach(function (row, i, array) {
                var ln = result.rows[i],
                    query_tweet = 'SELECT * FROM tweets WHERE tweet_id = ?',
                    params_tweet = [ln.tweet_id];
                cassandra.execute(query_tweet, params_tweet, {prepare: true}, function (err, result2) {
                    if (err) { console.log(err, result2); }



                    if (result2.rows[0] !== 'undefined') {
                        var tweet = result2.rows[0];
                        posts.push(tweet);
                    }

                    if (i === (result.rows.length - 1)) {
                        next(posts);
                        return;
                    }
                });
            });
        } else {
            next(posts);
        }


    });
};

//exports.post = function (username, post, next) {
exports.post = function (req, next) {
    "use strict";
    var gen_uuid = uuid.v1(),
        username = req.user.username,
        post = req.body.post,
        queries = [
            {
                query: 'INSERT INTO tweets (tweet_id, username, body) VALUES (?,?,?)',
                params: [gen_uuid, username, post]
            },
            {
                query: 'INSERT INTO userline (username, time, tweet_id) VALUES (?, now(), ?)',
                params: [username, gen_uuid]
            },
            {
                query: 'INSERT INTO timeline (username, time, tweet_id) VALUES (?, now(), ?)',
                params: [username, gen_uuid]
            }
        ],
        queryOptions = { };

    cassandra.batch(queries, queryOptions, function (err) {
        if (err) { console.log(err); }

        var arr_queries = [];
        exports.getFollowersUsernames(username, function (users) {
            users.forEach(function (user, i, array) {
                var objQuery = {
                    query: 'INSERT INTO timeline (username, time, tweet_id) VALUES (?, now(), ?)',
                    params: [user.follower, gen_uuid]
                };
                arr_queries.push(objQuery)
            });

            cassandra.batch(queries, queryOptions, function (err) {
                if (err) { console.log(err); }
                next();
            });
        });
    });
};

exports.getFollowersUsernames = function (username, next) {
    "use strict";
    var query = 'SELECT follower FROM followers WHERE username=?',
        params = [username];

    cassandra.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { console.log(err, result); }
        if (result.rows.length > 0) {
            next(result.rows);
        } else {
            next([]);
        }
    });
};

exports.search = function (next) {
    "use strict";
    var query = 'SELECT * FROM users';

    cassandra.execute(query, function (err, result) {
        if (err) { console.log(err); }
        next(result.rows);
    });
};

exports.follow = function (username, req, next) {
    "use strict";
    var me = req.user.username,
        queries = [{
            query: 'INSERT INTO friends (username, friend, since) VALUES (?, ?, dateof(now()))',
            params: [me, username]
        }, {
            query: 'INSERT INTO followers (username, follower, since) VALUES (?, ?, dateof(now()))',
            params: [username, me]
        }],
        queryOptions = { };
    cassandra.batch(queries, queryOptions, function (err) {
        if (err) { console.log(err); }
        next();
    });
};

exports.getFollowers = function (req, next) {
    "use strict";
    var me = req.user.username,
        query = 'SELECT * FROM followers WHERE username = ?',
        params = [me];

    cassandra.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { console.log(err); }
        next(result.rows);
    });
};

exports.getFriends = function (req, next) {
    "use strict";
    var me = req.user.username,
        query = 'SELECT * FROM friends WHERE username = ?',
        params = [me];

    cassandra.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { console.log(err); }
        next(result.rows);
    });
};