var settings = require('../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
// TODO Move this DB view and the one in the api.js mock file to a setting file somewhere.
var userView = {views: {"all": {"map": "function(doc) {emit(null, doc) }","reduce": "_count"},"by_email": {"map": "function(doc) {emit(doc.email, doc) }","reduce": "_count"},"by_user": {"map": "function(doc) {emit(doc._id, doc) }","reduce": "_count"}}};
var colors = require('colors');
nano.db.create(settings.couchdb.users, function (err, body) {
  if(err && err.status_code !== 412) {
    console.log(err);
    return;
  }
  var users = nano.db.use(settings.couchdb.users);
  // Insert views to make lookup calls with.
  users.insert(userView, '_design/users', function (err) {
    if(err) {
      console.log('Error recreating database.'.red);
      return done(err);
    }
    nano.db.create(settings.couchdb.metrics, function (err) {
      if(err && err.status_code !== 412) {
        console.log(err);
        return;
      }
      nano.db.create(settings.couchdb.sites, function (err) {
        if(err && err.status_code !== 412) {
          console.log(err);
          return;
        }
        console.log('DB Installation successful.'.green);
      });
    });
  });
});