var settings = require('../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
var colors = require('colors');
nano.db.create(settings.couchdb.users, function (err, body) {
  if(err && err.status_code !== 412) {
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
      console.log('DB Installation successful.'.green);
    });
  });
});