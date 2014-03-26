var settings = require('../../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);
var colors = require('colors');

var users = nano.db.use(settings.couchdb.users);
var metrics = nano.db.use(settings.couchdb.metrics);
metrics.fetch({keys: ['88ae5e88-7ce1-429e-bf37-e1886aa561d3']}, function (err, body) {
  if(err) {
    console.log(err);
    return;
  }
  console.log(body);
});