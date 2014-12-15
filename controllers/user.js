/*global require, exports, console, next*/
var passport = require('passport');
var User = require('../models/user');

/**
 * POST /signup/send
 * Create a new local account.
 * @param username
 * @param password
 */

exports.postSignup = function (req, next) {
    "use strict";
    User.create(req, function (data) {
        next(data);
    });
};

/**
 * POST /login/send
 * User login
 * @param username
 * @param password
 */
exports.postLogin = function (req, res, next) {
    "use strict";
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash('errors', { msg: info.message });
            return res.redirect('/login');
        }

        req.logIn(user, function (err) {
            if (err) { console.log(err); }

            console.log('logou');
            res.redirect('/');
        });
    })(req, res, next);
};

/**
 * GET /
 * Retrieves user timeline.
 * @param username
 */

exports.getTimeline = function (username, next) {
    "use strict";
    User.userTimeline(username, function (posts) {
        next(posts);
    });
};

/**
 * POST /post/send
 * Send post
 * @param post
 */
exports.post = function (req, next) {
    "use strict";
    User.post(req, function () {
        next();
    });
};

/**
 * GET /search
 * Retrieves users
 */

exports.search = function (next) {
    "use strict";
    User.search(function (users) {
        next(users);
    });
};

/**
 * GET /follow
 * Follow user.
 * @param username
 */

exports.follow = function (username, req, next) {
    "use strict";
    User.follow(username, req, function () {
        next();
    });
};

/**
 * GET /followers
 * Show followers list
 */

exports.getFollowers = function (req, next) {
    "use strict";
    User.getFollowers(req, function (followers) {
        next(followers);
    });
};

/**
 * GET /following
 * Show friends list
 */

exports.getFriends = function (req, next) {
    "use strict";
    User.getFriends(req, function (friends) {
        next(friends);
    });
};

/**
 * GET /logout
 * Finish user session
 */

exports.getLogout = function (req, next) {
    "use strict";
    req.logout();
    next();
};