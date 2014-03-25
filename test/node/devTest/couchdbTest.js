var settings = require('../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
var colors = require('colors');

var users = nano.db.use(settings.couchdb.users);
users.view('users', 'by_email', {reduce: false, startkey: 'sparky1010@gmail.com', endkey: 'sparky1010@gmail.com\u9999'}, function (err, body) {
  if(err) {
    console.log(err);
    return;
  }
  console.log(body);
});