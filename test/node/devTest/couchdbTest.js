var settings = require('../../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
var colors = require('colors');

var users = nano.db.use(settings.couchdb.users);
var metrics = nano.db.use(settings.couchdb.metrics);
users.view('users', 'by_email', {reduce: false, startkey: 'sparky1010@gmail.com', endkey: 'sparky1010@gmail.com' + '\u9999'}, function (error, body) {
  if(error) {
    console.log(error);
    return;
  }
  console.log(body.rows[0]);
});