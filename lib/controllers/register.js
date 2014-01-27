var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

exports.register = function(req, res) {
    var siteName = req.body.siteName;
    var email = req.body.email;
    var password = req.body.password;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    bcrypt.hash(password, 10, function (error, hash) {
        if(error) {
            return res.json(400, {message: error});
        }
        var registerStore = {
            id: uuid.v4(),
            siteName: siteName,
            email: email,
            password: hash,
            components: [],
            incidents: [],
            metrics: [],
            subscribers: {
                email: {
                    count: 0,
                    data: [],
                    disabled: false
                },
                sms: {
                    count: 0,
                    data: [],
                    disabled: false
                },
                webhook: {
                    count: 0,
                    data: [],
                    disabled: false
                },
                types: {
                    autoIncident: false,
                    indvidIncident: false,
                    individComponent: false
                }
            }
        };
        client.get(email, function (error, reply) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem registering your site, please try again.'});
            }
            if(reply) {
                return res.json(500, {message: 'Account already exists.'});
            }
            client.set(email, JSON.stringify(registerStore), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem registering your site, please try again.'});
                }
                req.session.email = email;
                return res.json({message: 'Registered.'});
            });
        });
    });
};