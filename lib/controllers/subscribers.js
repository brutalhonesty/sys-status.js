var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
exports.createSubscriber = function(req, res) {
    var email = req.body.email;
    var subscriberType = req.body.type;
    var subscriberData = req.body.subscriberData;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(subscriberType) || validator.isNull(subscriberData)) {
        return res.json(400, {message: 'Missing subscriber elements.'});
    }
    switch(subscriberType) {
        case 'email':
        case 'sms':
        case 'webhook':
        client.get(email, function (error, reply) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem getting subscribers.'});
            }
            if(!reply) {
                return res.json(400, {message: 'Invalid email.'});
            }
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
        });
        break;
        default:
        return res.json(400, {message: 'Missing subscriber elements.'});
    }
};

exports.getSubscribers = function(req, res) {
    var email = req.query.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting subscribers.'});
        }
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply = JSON.parse(reply);
        return res.json({subscribers: reply.subscribers});
    });
};