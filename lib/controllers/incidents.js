var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var moment = require('moment');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
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
        client.set(email, JSON.stringify(reply), function (error) {
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
        if(!reply) {
            return res.json(400, {message: 'Invalid email.'});
        }
        reply = JSON.parse(reply);
        for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
            reply.incidents[incidentCounter].time = moment(reply.incidents[incidentCounter].date).fromNow()
            reply.incidents[incidentCounter].updated = moment(reply.incidents[incidentCounter].update).fromNow()
        }
        return res.json({incidents: reply.incidents});
    });
};