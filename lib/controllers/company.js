var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);

var metrics = nano.use(settings.couchdb.metrics);
var sites = nano.use(settings.couchdb.sites);

exports.getPrivateCompany = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
      return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
      return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting company information.'});
    }
    if(reply.metrics.length === 0) {
        reply.metrics = [];
        return res.json({company: reply});
    }
    metrics.fetch({keys: reply.metrics}, function (error, metrics) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem getting metrics.'});
      }
      if(reply.metrics.length === 1) {
          reply.metrics = [metrics.rows[0].doc];
          return res.json({company: reply});
      }
      var newMetrics = [];
      for(var metricCounter = 0; metricCounter < metrics.length; metricCounter++) {
          delete metrics.rows[metricCounter].doc.metrickey;
          newMetrics.push(metrics.rows[metricCounter].doc);
      }
      reply.metrics = newMetrics;
      return res.json({company: reply});
    });
  });
};

exports.getCompany = function(req, res) {
  // TODO Write getCompany() API call
};