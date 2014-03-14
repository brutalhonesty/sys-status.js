var validator = require('validator');
var redis = require('redis');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
exports.getPrivateCompany = function(req, res) {
  if(!req.session.email) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  client.get(email, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting company information.'});
    }
    if(!reply) {
      return res.json(400, {message: 'Invalid email.'});
    }
    try {
      reply = JSON.parse(reply);
      delete reply.password;
      delete reply.email;
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
            return res.json(500, {message: 'Problem getting metrics.'});
          }
        }
        reply.metrics = newMetrics;
        return res.json({company: reply});
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Email.'});
    }
  });
};

  exports.getCompany = function(req, res) {

  };