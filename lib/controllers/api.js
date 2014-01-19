'use strict';

var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
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
            siteName: siteName,
            email: email,
            password: hash,
            components: []
        };
        client.set(email, JSON.stringify(registerStore), function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem registering your site, please try again.'});
            }
            req.session.email = email;
            return res.json({message: 'Registered.'});
        });
    });
};

exports.getComponents = function(req, res) {
    var email = req.query.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting components.'});
        }
        reply = JSON.parse(reply);
        return res.json({components: reply.components});
    });
};

exports.setComponent = function(req, res) {
    var email = req.body.email;
    var component = req.body.component;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(component)) {
        return res.json(400, {message: 'Missing component.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem setting components.'});
        }
        reply = JSON.parse(reply);
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply.components.push(component);
        client.set(email, function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem setting components.'});   
            }
            return res.json({message: 'Component added.'});
        });
    });
};

exports.logout = function(req, res) {
    delete req.session.email;
    req.session.destroy(function () {
        return res.json({message: 'Logged out.'});
    });
};