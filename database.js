var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    async = require('async');

// Connection URL
var url = process.env.MONGOLAB_URI;
// Use connect method to connect to the Server

var e = null;

function connect(cb) {
    if (e) return cb(e);

    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        async.parallel({
            users: function (next) {
                db.collection('users', {}, function (err, col) {
                    if (err) return next(err);

                    col.ensureIndex({username: 1}, {unique: true}, function (err) {
                        next(err, { get: function () { return col } });
                    })
                })
            },

            battles: function (next) {
                db.collection('battles', {}, function (err, col) {
                    next(err, { get: function () { return col } });
                })
            },
            endbattle: function(next) {
                db.collection('endbattle', {}, function (err, col) {
                    col.ensureIndex({username1: 1, status1: 1}, {}, function (err) {
                        if (err) return next(err);
                        col.ensureIndex({username2: 1, status2: 1}, {}, function (err) {
                            next(err, { get: function () { return col } });
                        })
                    })
                })
            }
        }, function (err, data) {
            if (err) {
                console.error(err.stack);
                throw err;
            }

            e = {};
            Object.defineProperties(e, data);
            cb(e);
        });
    });
}

module.exports = connect;