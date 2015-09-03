// Require the nedb module
var Datastore = require('nedb'),
    fs = require('fs');

// Initialize nedb databases. Notice the autoload parameter.
var users = new Datastore({ filename: __dirname + '/data/users', autoload: true }),
    battles = new Datastore({ filename: __dirname + '/data/battles', autoload: true });
    endbattle = new Datastore({ filename: __dirname + '/data/archive', autoload: true });

// Create a "unique" index
users.ensureIndex({fieldName: 'username', unique: true});

// Make the data sets available to the code
// that uses require() on this module:

module.exports = {
    users: users,
    battles: battles,
    endbattle: endbattle
};