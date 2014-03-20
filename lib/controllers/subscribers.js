var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
exports.createSubscriber = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var subscriberType = req.body.type;
  var subscriberData = req.body.subscriberData;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  if(validator.isNull(subscriberType) || validator.isNull(subscriberData)) {
    return res.json(400, {message: 'Missing subscriber elements.'});
  }
  switch(subscriberType) {
    case 'email':
    case 'sms':
    case 'webhook':
    client.get(siteid, function (error, reply) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem getting subscribers.'});
      }
      try {
        reply = JSON.parse(reply);
        reply.subscribers[subscriberType].data.push(subscriberData);
        reply.subscribers[subscriberType].count = parseInt(reply.subscribers[subscriberType].count, 10);
        if(isNaN(reply.subscribers[subscriberType].count)) {
          console.log('Subscriber count is not int.');
          return res.json(500, {message: 'Problem adding subscriber.'});
        }
        reply.subscribers[subscriberType].count++;
        client.set(email, JSON.stringify(reply), function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem adding subscriber.'});
          }
          return res.json({message: 'Subscription added.'});
        });
      } catch(e) {
        return res.json(400, {message: 'Invalid Site Id.'});
      }
    });
    break;
    default:
    return res.json(400, {message: 'Missing subscriber elements.'});
  }
};

exports.getSubscribers = function(req, res) {
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
      return res.json(500, {message: 'Problem getting subscribers.'});
    }
    try {
      reply = JSON.parse(reply);
      return res.json({subscribers: reply.subscribers});
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
  });
};