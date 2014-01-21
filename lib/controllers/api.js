'use strict';

var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var moment = require('moment');
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
            id: crypto.randomBytes(10).toString('hex'),
            siteName: siteName,
            email: email,
            password: hash,
            components: [],
            incidents: []
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
            return res.json({message: 'Logged in.'});
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

exports.createIncident = function(req, res) {
    var email = req.body.email;
    var incidentName = req.body.name;
    var incidentType = req.body.type;
    var incidentMessage = req.body.message;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(incidentName) || validator.isNull(incidentType) || validator.isNull(incidentMessage)) {
        return res.json(400, {message: 'Missing incident elements.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem adding incident.'});
        }
        reply = JSON.parse(reply);
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        var now = Date.now();
        var incident = {
            name: incidentName,
            type: incidentType,
            message: incidentMessage,
            date: now,
            update: now
        };
        reply.incidents.push(incident);
        client.set(email,  JSON.stringify(reply), function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem adding incident.'});   
            }
            return res.json({message: 'Incident added.'});
        });
    });
};

exports.getIncidents = function(req, res) {
    var email = req.query.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting incidents.'});
        }
        reply = JSON.parse(reply);
        for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
            reply.incidents[incidentCounter].time = moment(reply.incidents[incidentCounter].date).fromNow()
            reply.incidents[incidentCounter].updated = moment(reply.incidents[incidentCounter].update).fromNow()
        }
        return res.json({incidents: reply.incidents});
    });
};

exports.getCompany = function(req, res) {
    var email = req.query.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting company information.'});
        }
        reply = JSON.parse(reply);
        delete reply.password;
        return res.json({company: reply});
    });
};

exports.logout = function(req, res) {
    delete req.session.email;
    req.session.destroy(function () {
        return res.json({message: 'Logged out.'});
    });
};