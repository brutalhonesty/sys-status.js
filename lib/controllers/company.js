var validator = require('validator');
var redis = require('redis');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
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
      return res.json(400, {message: 'Invalid Site Id.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting company information.'});
    }
    try {
      reply = JSON.parse(reply);
      if(reply.metrics.length === 0) {
          reply.metrics = [];
          return res.json({company: reply});
      }
      for(var metricCounter = 0; metricCounter < reply.metrics.length; metricCounter++) {
          reply.metrics[metricCounter] = 'metric:' + reply.metrics[metricCounter];
      }
      client.mget(reply.metrics, function (error, metrics) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem getting metrics.'});
        }
        if(reply.metrics.length === 1) {
          try {
            metrics = JSON.parse(metrics);
            reply.metrics = [metrics];
            return res.json({company: reply});
          } catch(e) {
            console.log(e);
            return res.json(500, {message: 'Problem getting metrics.'});
          }
        }
        var newMetrics = [];
        for(var metricCounter = 0; metricCounter < metrics.length; metricCounter++) {
          try {
            var metric = JSON.parse(metrics[metricCounter]);
            delete metric.metrickey;
            newMetrics.push(metric);
          } catch(e) {
            console.log(e);
            return res.json(500, {message: 'Problem getting metrics.'});
          }
        }
        reply.metrics = newMetrics;
        return res.json({company: reply});
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
  });
};

exports.getCompany = function(req, res) {

};