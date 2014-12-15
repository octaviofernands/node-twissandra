/*global require, exports, console, module*/
var user = require('../controllers/user');

module.exports = function (router) {
    "use strict";

    var publicURLs = ['login', 'login/send', 'signup', 'signup/send'];

    router.get('*', function (req, res, next) {
        //verifying authentication
        if (publicURLs.indexOf(req.url.replace('/', '')) >= 0) { return next(); }
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    });

    router.get('/', function (req, res) {
        user.getTimeline(req.user.username, function (posts) {
            res.render('home', {posts: posts});
        });
    });

    router.get('/signup', function (req, res) {
        res.render('signup');
    });

    router.get('/login', function (req, res) {
        res.render('login');
    });

    router.post('/login/send', function (req, res) {
        user.postLogin(req, res, function () {
            res.redirect('/');
        });
    });

    router.post('/signup/send', function (req, res) {
        user.postSignup(req, function () {
            res.redirect('/login');
        });
    });

    router.get('/post', function (req, res) {
        res.render('post');
    });

    router.post('/post/send', function (req, res) {
        user.post(req, function () {
            res.redirect('/');
        });
    });

    router.get('/users', function (req, res) {
        user.search(function (users) {
            res.render('search', {users: users});
        });
    });

    router.get('/follow/:username', function (req, res) {
        user.follow(req.params.username, req, function () {
            res.redirect('/');
        });
    });

    router.get('/followers', function (req, res) {
        user.getFollowers(req, function (followers) {
            res.render('followers', {followers: followers});
        });
    });

    router.get('/following', function (req, res) {
        user.getFriends(req, function (friends) {
            res.render('friends', {friends: friends});
        });
    });

    router.get('/logout', function (req, res) {
        user.getLogout(req, function () {
            res.redirect('/login');
        });
    });

    return router;
};