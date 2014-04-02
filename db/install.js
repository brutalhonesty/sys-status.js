var settings = require('../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
// TODO Move this DB view and the one in the api.js mock file to a setting file somewhere.
var userView = {views: {"all": {"map": "function(doc) {emit(null, doc) }","reduce": "_count"},"by_email": {"map": "function(doc) {emit(doc.email, doc) }","reduce": "_count"},"by_user": {"map": "function(doc) {emit(doc._id, doc) }","reduce": "_count"}}};
var sitesView = {"views":{"all":{"map":"function(doc) {emit(null, doc) }","reduce":"_count"},"by_url":{"map":"function(doc) {emit(doc.domain, doc) }","reduce":"_count"},"by_id":{"map":"function(doc) {emit(doc._id, doc) }","reduce":"_count"}}};
var colors = require('colors');
nano.db.create(settings.couchdb.users, function (err, body) {
  if(err && err.status_code !== 412) {
    console.log(err);
    return;
  }
  var users = nano.db.use(settings.couchdb.users);
  // Insert views to make lookup calls with.
  users.insert(userView, '_design/users', function (err) {
    // 409 is Document update conflict.
    if(err && err.status_code !== 409) {
      console.log('Error recreating database.'.red);
      console.log(err);
      return;
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
        var sites = nano.db.use(settings.couchdb.sites);
        sites.insert(sitesView, '_design/sites', function (err) {
          // 409 is Document update conflict.
          if(err && err.status_code !== 409) {
            console.log('Error recreating database.'.red);
            console.log(err);
            return;
          }
          console.log('DB Installation successful.'.green);
        });
      });
    });
  });
});