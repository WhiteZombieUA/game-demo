/**
 * This file defines the routes used in your application
 * It requires the database module that we wrote previously.
 */
var db = require('./database'),
    passport = require('passport'),
    users = db.users,
    battles = db.battles,
    endbattle = db.endbattle,
    async = require('async');

module.exports = function(app){

    app.get('/', function(req, res){
        res.render('signin');
    });

    app.get('/signup', function(req, res){
        res.render('signup');
    });

    app.post('/signup', function(req, res) {
        users.insert( {
            regdate: new Date(),
            username: req.body.usernamesignup,
            password: req.body.passwordsignup,
            class: req.body.class,
            lvl: 1,
            exp: 0,
            attack1: 15,
            attack2: 15,
            attack3: 15,
            hp: 40,
            battles_end: 0,
            battles_win: 0
        });
        res.redirect('/');
    });

    app.post('/validate-username', function(req, res) {
        users.find({username: req.body.usernamesignup}, function(err, is_username) {
            res.json(is_username[0] ? true : false);
        });
    });

    app.post('/login',
        passport.authenticate('local', { successRedirect: '/home',
            failureRedirect: '/',
            failureFlash: true })
    );

    app.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/home', function(req, res) {
        async.parallel({
            profile_user: function (next) {
                users.find({username: req.user.username}, function (err, users) {
                    next(err, users ? users[0] : null);
                })
            },
            active_battles: function (next) {
                battles.find({username2: req.user.username}, function (err, this_user_battles) {
                    this_user_battles && this_user_battles.sort(function (d1, d2) {
                        return d2.date - d1.date;
                    });

                    next(err, this_user_battles);
                });
            }
        }, function (err, data) {

            var profile_user = data.profile_user,
                this_user_battles = data.active_battles,
                win = profile_user.battles_win,
                all = profile_user.battles_end,
                winrate = all ? Math.round(100*win/all) : 0;

            res.render('home', {
                username: req.user.username,
                profile_user: profile_user,
                active_battles: this_user_battles,
                winrate: winrate
            });
        });
    });

    app.get('/skills', function(req, res) {
        res.render('skills');
    });

    app.get('/arena', function(req, res) {
        async.parallel({
            users_for_battle: function (next) {
                users.find({ $not: { username: req.user.username } }, function (err, users) {
                    users.forEach(function(user){
                        user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
                    });
                    next(err, users);
                })
            },
            active_battles: function (next) {
                battles.find({username2: req.user.username}, function (err, this_user_battles) {
                    this_user_battles.forEach(function(user){
                        user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
                    });
                    this_user_battles && this_user_battles.sort(function (d1, d2) {
                        return d2.date - d1.date;
                    });
                    next(err, this_user_battles);
                })
            },
            unsee_logs: function (next) {
                endbattle.find({$or: [
                    {username1: req.user.username},
                    {username2: req.user.username}
                ]}, function (err, this_user_end_battles) {
                    this_user_end_battles && this_user_end_battles.sort(function (d1, d2) {
                        return d2.date - d1.date;
                    });
                    next(err, this_user_end_battles);
                });
            }
        }, function (err, data) {
            var users_for_battle = data.users_for_battle,
                active_battles = data.active_battles,
                unsee_logs = data.unsee_logs;

            res.render('arena', {
                users: users_for_battle,
                unsee_logs: unsee_logs,
                active_battles: active_battles
            });
        });
    });

    app.get('/:id', function(req, res) {
        async.parallel({
            profile_user: function (next) {
                users.find({username: req.params.id}, function (err, users) {
                    next(err, users ? users[0] : null);
                })
            },
            last_battles: function (next) {
                endbattle.find({$or: [{username1: req.params.id}, {username2: req.params.id}]}, function (err, this_user_battles) {
                    this_user_battles && this_user_battles.sort(function (d1, d2) {
                        return d2.date - d1.date;
                    });

                    next(err, this_user_battles);
                });
            }
        }, function (err, data) {

            var profile_user = data.profile_user,
                this_user_battles = data.last_battles,
                win = profile_user.battles_win,
                all = profile_user.battles_end,
                winrate = all ? Math.round(100*win/all) : 0;

            res.render('profile', {
                username: req.body.username,
                profile_user: profile_user,
                active_battles: this_user_battles,
                winrate: winrate
            });
        });
    });

    app.get('/rating/exp', function(req, res) {
        users.find({}, function(err, all_users) {
            all_users.forEach(function(user){
                user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
            });
            all_users.sort(function(n1, n2) {
                return n2.exp - n1.exp;
            });
            var type = "EXP";
            res.render('rating', {
                users: all_users,
                type: type
            });
        });
    });
    app.get('/rating/battles', function(req, res) {
        users.find({}, function(err, all_users) {
            all_users.forEach(function(user){
                user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
            });
            all_users.sort(function(n1, n2) {
                return n2.battles_end - n1.battles_end;
            });
            var type = "BATTLES";
            res.render('rating', {
                users: all_users,
                type: type
            });
        });
    });
    app.get('/rating/winrate', function(req, res) {
        users.find({}, function(err, all_users) {
            all_users.forEach(function(user){
                user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
            });
            all_users.sort(function(n1, n2) {
                return n2.winrate - n1.winrate;
            });
            var type = "WINRATE";
            res.render('rating', {
                users: all_users,
                type: type
            });
        });
    })

};
