/**
 * This is the main file of the application. Run it with the
 * `node index.js` command from your terminal
 *
 * Remember to run `npm install` in the project folder, so
 * all the required libraries are downloaded and installed.
 */

var express = require('express');

// Create a new express.js web app:

var app = express();

app.set('port', (process.env.PORT || 5000));

// Configure express with the settings found in
// our config.js file

require('./config')(app);

// Add the routes that the app will react to,
// as defined in our routes.js file

require('./routes')(app);

// This file has been called directly with 
// `node index.js`. Start the server!

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});