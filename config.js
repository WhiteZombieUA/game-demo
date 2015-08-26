/**
 * This file runs some configuration settings on your express application.
 */

// Include the handlebars templating library
var jade = require('jade'),
    express = require('express'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    DB = require('./database'),
    flash = require('connect-flash');

// Require()-ing this module will return a function
// that the index.js file will use to configure the
// express application

module.exports = function(app){

    // Set .jade as the default template extension
    app.set('view engine', 'jade');

    // Tell express where it can find the templates
    app.set('views', __dirname + '/views');

    // Make the files in the public folder available to the world
    app.use(express.static(__dirname + '/public'));

    // Parse POST request data. It will be available in the req.body object
    app.use(express.urlencoded());

    app.configure(function() {
        app.use(express.static('public'));
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'keyboard cat' }));
        app.use(flash());
        app.use(passport.initialize());
        app.use(passport.session());
    });

    passport.use(new LocalStrategy({
            usernameField: 'nickname',
            passwordField: 'password'
        }, function(username, password, done) {
            DB.users.find({ username: username }, function (err, users) {
                if (err) { return done(err); }
                var user = users[0];

                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (user.password !== password) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        DB.users.find({_id: id}, function(err, users) {
            done(err, users[0]);
        });
    });
};