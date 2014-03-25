var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

var sites = nano.use(settings.couchdb.sites);

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
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(subscriberType) || validator.isNull(subscriberData)) {
    return res.json(400, {message: 'Missing subscriber elements.'});
  }
  switch(subscriberType) {
    case 'email':
    case 'sms':
    case 'webhook':
    sites.get(siteid, function (error, reply) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem getting subscribers.'});
      }
      reply.subscribers[subscriberType].data.push(subscriberData);
      reply.subscribers[subscriberType].count = parseInt(reply.subscribers[subscriberType].count, 10);
      if(isNaN(reply.subscribers[subscriberType].count)) {
        console.log('Subscriber count is not int.');
        return res.json(500, {message: 'Problem adding subscriber.'});
      }
      reply.subscribers[subscriberType].count++;
      sites.insert(reply, siteid, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem adding subscriber.'});
        }
        return res.json({message: 'Subscription added.'});
      });
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
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting subscribers.'});
    }
    return res.json({subscribers: reply.subscribers});
  });
};