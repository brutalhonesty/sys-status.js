var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
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
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply = JSON.parse(reply);
        return res.json({components: reply.components});
    });
};

exports.updateComponent = function(req, res) {
    var email = req.body.email;
    var componentID = req.body.id;
    componentID = parseInt(componentID, 10);
    var componentStatus = req.body.status;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(isNaN(componentID) || validator.isNull(componentStatus)) {
        return res.json(400, {message: 'Missing component elements.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem updating components.'});
        }
        reply = JSON.parse(reply);
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply.components[componentID - 1].status = componentStatus; // We start at 1 for the component id but need index 0
        client.set(email, JSON.stringify(reply), function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem updating components.'});   
            }
            return res.json({message: 'Component updated.'});
        });
    });
};

exports.setComponent = function(req, res) {
    var email = req.body.email;
    var componentName = req.body.name;
    var componentDescription = req.body.description;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(componentName) || validator.isNull(componentDescription)) {
        return res.json(400, {message: 'Missing component elements.'});
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
        var component = {
            id: reply.components.length + 1,
            name: componentName,
            description: componentDescription,
            status: 'Operational' // Start with Default
        };
        reply.components.push(component);
        client.set(email, JSON.stringify(reply), function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem setting components.'});   
            }
            return res.json({message: 'Component added.'});
        });
    });
};