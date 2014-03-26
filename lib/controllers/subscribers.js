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
  var subscriberData = req.body.data;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isSubscriberType(subscriberType)) {
    return res.json(400, {message: 'Invalid subscriber type.'});
  }
  switch(subscriberType) {
    case 'email':
    var subscriberEmail = subscriberData.email;
    if(!validator.isEmail(subscriberEmail)) {
      return res.json(400, {message: 'Invalid subscriber email.'});
    }
    break;
    case 'webhook':
    var subscriberHook = subscriberData.webhook;
    if(!validator.isURL(subscriberHook, {protocols: ['http','https'], require_tld: true, require_protocol: false})) {
      return res.json(400, {message: 'Invalid subscriber webhook.'});
    }
    break;
    case 'sms':
    var subscriberPhone = subscriberData.phone;
    if(!validator.isPhoneNumber(subscriberPhone)) {
      return res.json(400, {message: 'Invalid subscriber number.'});
    }
    break;
    default:
    break;
  }
  var storedData = {
    email: subscriberEmail || '',
    webhook: subscriberHook || '',
    sms: subscriberPhone || ''
  };
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting subscribers.'});
    }
    reply.subscribers[subscriberType].data.push(storedData);
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

validator.extend('isSubscriberType', function (str) {
  switch(str) {
    case 'email':
    case 'sms':
    case 'webhook':
    return true;
    default:
    return false;
  }
});

/*http://www.w3resource.com/javascript/form/phone-no-validation.php*/
// Allows for XXX-XXX-XXXX or (XXX)-XXX-XXXX
validator.extend('isPhoneNumber', function (str) {
  var phoneRegex = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
  return phoneRegex.test(str);
});