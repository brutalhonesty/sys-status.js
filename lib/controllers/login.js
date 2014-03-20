var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
exports.login = function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(password)) {
        return res.json(400, {message: 'Missing password.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem logging in.'});
        }
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply = JSON.parse(reply);
        bcrypt.compare(password, reply.password, function (error, result) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem logging in.'});
            }
            if(!result) {
                return res.json(500, {message: 'Invalid password.'});
            }
            req.session.email = email;
            req.session.siteid = reply.siteid;
            return res.json({message: 'Logged in.', name: reply.siteName});
        });
    });
};