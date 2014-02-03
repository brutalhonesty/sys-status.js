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
        try {
            reply = JSON.parse(reply);
            var now = Date.now();
            var incident = {
                id: uuid.v4(),
                name: incidentName,
                events: [{
                    type: incidentType,
                    message: incidentMessage,
                    date: now,
                }],
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
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.getIncident = function(req, res) {
    var email = req.query.email;
    var incidentID = req.query.id;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(incidentID) || !validator.isUUID(incidentID, 4)) {
        return res.json(400, {message: 'Missing incident elements.'});    
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting incidents.'});
        }
        try {
            reply = JSON.parse(reply);
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                if(reply.incidents[incidentCounter].id === incidentID) {
                    return res.json({incident: reply.incidents[incidentCounter]});
                }
            }
            return res.json(400, {message: 'Incident does not exist.'});
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

// This will still return the incidents even if the _deleteIncidents() fails to delete from DB
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
        try {
            reply = JSON.parse(reply);
            var purged = false;
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                // Get date incident was created
                reply.incidents[incidentCounter].time = moment(reply.incidents[incidentCounter].events[0].date).fromNow();
                // Get last updated time
                reply.incidents[incidentCounter].updated = moment(reply.incidents[incidentCounter].update).fromNow();
                var updateThreshold = moment(reply.incidents[incidentCounter].update).add('month', 1);
                // if thirtydays + last updated time is after today, purge incident from DB
                if(updateThreshold.isAfter(Date.now)) {
                    reply.incidents.splice(incidentCounter, 1);
                    purged = true;
                }
            }
            // Update DB because we deleted some from the DB.
            if(purged) {
                client.set(email, JSON.stringify(reply), function (error) {
                    if(error) {
                        console.log(error);
                    }
                });
            }
            return res.json({incidents: reply.incidents});
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.updateIncident = function(req, res) {
    var incidentID = req.body.id;
    var incidentType = req.body.type;
    var incidentMessage = req.body.message;
    var email = req.body.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(incidentName) || validator.isNull(incidentMessage) || validator.isNull(incidentType)) {
        return res.json(400, {message: 'Missing incident elements.'});    
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting incidents.'});
        }
        try {
            reply = JSON.parse(reply);
            var updated = false;
            for(incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                if(reply.incidents[incidentCounter].id === incidentID) {
                    var now = Date.now();
                    var incidentEvent = {
                        message: incidentMessage,
                        type: incidentType,
                        update: now
                    };
                    reply.incidents[incidentCounter].events.push(incidentEvent);
                    reply.incidents[incidentCounter].update = now;
                    client.set(email, JSON.stringify(reply), function (error) {
                        if(error) {
                            console.log(e);
                            return res.json(500, {message: 'Problem updating incident.'});
                        }
                        updated = true;
                    });
                }
            }
            if(!updated) {
                return res.json(400, {message: 'Incident does not exist.'});
            }
            return res.json({message: 'Incident Updated.'});
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});    
        }
    });
};