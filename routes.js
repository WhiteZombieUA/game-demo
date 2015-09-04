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
            hp: 50,
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
                    this_user_battles.forEach(function(user){
                        user.winrate = user.battles_end ? Math.round(100*user.battles_win/user.battles_end) : 0;
                    });
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
                    {$and: [{username1: req.user.username},{status1: 0}]},
                    {$and: [{username2: req.user.username},{status2: 0}]}
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

    app.post('/invite', function(req, res) {
        battles.insert({
            date: new Date(),
            username1: req.user.username,
            class: req.user.class,
            lvl: req.user.lvl,
            hp: req.user.hp,
            battles_end: req.user.battles_end,
            battles_win: req.user.battles_win,
            attack1: req.body.attack1,
            attack2: req.body.attack2,
            attack3: req.body.attack3,
            defence1: req.body.defence1,
            defence2: req.body.defence2,
            defence3: req.body.defence3,
            username2: req.body.username2
        });
        res.redirect('/arena');
    });

    app.get('/battle:id', function(req, res) {
        battles.find({_id: req.params.id}, function(err, battle) {
            res.render('acceptbattle', {
                battle: battle[0]
            });
        });
    });

    app.post('/battle:id', function(req, res, next) {
        battles.find({_id: req.body.battleid}, function(err, battle) {
            if (err) return next(err);

            async.parallel({
                dropped: function (next) {
                    battles.remove({_id: req.body.battleid}, {}, next);
                },
                inserted: function (next) {
                    endbattle.insert({
                        date: new Date(),
                        username1: battle[0].username1,
                        class1: battle[0].class,
                        status1: 0,
                        username2: battle[0].username2,
                        class2: req.user.class,
                        status2: 0,
                        p1attack1: battle[0].attack1,
                        p2defence1: req.body.defence1,
                        p2attack1: req.body.attack1,
                        p1defence1: battle[0].defence1,
                        p1attack2: battle[0].attack2,
                        p2defence2: req.body.defence2,
                        p2attack2: req.body.attack2,
                        p1defence2: battle[0].defence2,
                        p1attack3: battle[0].attack3,
                        p2defence3: req.body.defence3,
                        p2attack3: req.body.attack3,
                        p1defence3: battle[0].defence3
                    }, next);
                }
            }, function (err, data) {
                if (err) return next(err);

                res.redirect('/log' + data.inserted._id);
            });
        });
    });

    app.get('/log:id', function(req, res) {
        endbattle.find({_id: req.params.id}, function(err, log) {
            var process = log[0],
                winer = "",
                winner = "",
                turn1part1 = "",
                turn1part2 = "",
                turn2part1 = "",
                turn2part2 = "",
                turn3part1 = "",
                turn3part2 = "",
                p1hp, p2hp,
                p1dmg = 0,
                p2dmg = 0;

            if (process.p1attack1 == process.p2defence1) {
                turn1part1 = 'successful block';
            } else {
                turn1part1 = '-15 HP';
                p1dmg += 15;
            }
            if (process.p2attack1 == process.p1defence1) {
                turn1part2 = 'successful block';
            } else {
                turn1part2 = '-15 HP';
                p2dmg += 15;
            }
            if (process.p1attack2 == process.p2defence2) {
                turn2part1 = 'successful block';
            } else {
                turn2part1 = '-15 HP';
                p1dmg += 15;
            }
            if (process.p2attack2 == process.p1defence2) {
                turn2part2 = 'successful block';
            } else {
                turn2part2 = '-15 HP';
                p2dmg += 15;
            }
            if (process.p1attack3 == process.p2defence3) {
                turn3part1 = 'successful block';
            } else {
                turn3part1 = '-15 HP';
                p1dmg += 15;
            }
            if (process.p2attack3 == process.p1defence3) {
                turn3part2 = 'successful block';
            } else {
                turn3part2 = '-15 HP';
                p2dmg += 15;
            }

            if (p1dmg > p2dmg) {
                winer = "" + process.username1 + " WIN!!!";
                winner = process.username1;
            } else if (p1dmg == p2dmg) {
                winer = 'DRAW';
            } else {
                winer = "" + process.username2 + " WIN!!!";
                winner = process.username2;
            }

            p1hp = Math.round(100*(50-p2dmg)/50);
            p2hp = Math.round(100*(50-p1dmg)/50);

            res.render('log', {
                this_user: req.user.username,
                log: process,
                turn1part1: turn1part1,
                turn1part2: turn1part2,
                turn2part1: turn2part1,
                turn2part2: turn2part2,
                turn3part1: turn3part1,
                turn3part2: turn3part2,
                p1dmg: p1dmg,
                p2dmg: p2dmg,
                p1hp: p1hp,
                p2hp: p2hp,
                winer: winer,
                winner: winner
            });
        });
    });

    app.post('/result', function(req, res, next) {
        async.parallel({
            updateLog: function (next) {
                if (req.user.username == req.body.username1) {
                    endbattle.update({_id: req.body.logid}, {$set: {status1: 1}}, {}, next);
                } else if (req.user.username == req.body.username2) {
                    endbattle.update({_id: req.body.logid}, {$set: {status2: 1}}, {}, next);
                } else {
                    next(null);
                }
            },

            updateUser: function (next) {

                if (req.body.winer == req.user.username) {
                    users.update({username: req.user.username}, {$inc: {exp: 10, battles_end: 1, battles_win: 1}}, {}, next);
                } else {
                    users.update({username: req.user.username}, {$inc: {exp: 1, battles_end: 1}}, {}, next);
                }
            }
        }, function (err, results) {
            if (err) return next(err);

            res.redirect('/home')
        });
    });

    app.post('/cancel:id', function(req, res) {
        battles.remove({_id: req.params.id}, {}, function() {
            res.redirect(req.headers.referer);
        });
    });

    app.get('/:id/invite', function(req, res) {
        res.render('battle', {
            username1: req.user.username,
            username2: req.params.id
        });
    });

    app.get('/:id/profile', function(req, res) {
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
