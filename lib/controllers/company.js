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
        reply = JSON.parse(reply);
        delete reply.password;
        return res.json({company: reply});
    });
};

exports.getCompany = function(req, res) {

};