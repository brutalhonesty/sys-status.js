var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var moment = require('moment');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

exports.createIncident = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
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
            var now = Date.now(Date.UTC());
            var incident = {
                id: uuid.v4(),
                name: incidentName,
                events: [{
                    id: uuid.v4(),
                    type: incidentType,
                    message: incidentMessage,
                    date: now,
                }],
                update: now,
                completedTime: null,
                postmortem: null
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
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
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

// This will still return the incidents even if it fails to delete from DB
exports.getIncidents = function(req, res) {
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
                if(updateThreshold.isBefore(moment.utc())) {
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
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var incidentID = req.body.id;
    var incidentType = req.body.type;
    var incidentMessage = req.body.message;
    var email = req.session.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(incidentMessage) || validator.isNull(incidentType)) {
        return res.json(400, {message: 'Missing incident elements.'});
    }
    if(!validator.isUUID(incidentID, 4)) {
        return res.json(400, {message: 'Invalid incident id.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting incidents.'});
        }
        try {
            reply = JSON.parse(reply);
            var updated = false;
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                if(reply.incidents[incidentCounter].id === incidentID) {
                    var now = Date.now(Date.UTC());
                    var incidentEvent = {
                        id: uuid.v4(),
                        message: incidentMessage,
                        type: incidentType,
                        date: now
                    };
                    reply.incidents[incidentCounter].events.push(incidentEvent);
                    reply.incidents[incidentCounter].update = now;
                    // If we are done with this maintenance, set the closed time to now.
                    if(incidentType === 'Resolved') {
                        reply.incidents[incidentCounter].completedTime = now;
                    }
                    updated = true;
                }
            }
            if(!updated) {
                return res.json(400, {message: 'Incident does not exist.'});
            }
            client.set(email, JSON.stringify(reply), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem updating incident.'});
                }
                return res.json({message: 'Incident updated.'});
            });
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.updatePrevIncident = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var eventID = req.body.id;
    var incidentType = req.body.type;
    var incidentDate = req.body.date;
    var incidentMessage = req.body.message;
    var email = req.session.email;
    var incidentID = req.body.incidentID;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(incidentMessage) || validator.isNull(incidentType)) {
        return res.json(400, {message: 'Missing incident elements.'});
    }
    if(!validator.isInt(incidentDate)) {
        return res.json(400, {message: 'Invalid incident date.'});
    }
    if(!validator.isUUID(incidentID, 4)) {
        return res.json(400, {message: 'Invalid incident id.'});
    }
    if(!validator.isUUID(eventID, 4)) {
        return res.json(400, {message: 'Invalid event id.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting incidents.'});
        }
        try {
            reply = JSON.parse(reply);
            var updated = false;
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                if(reply.incidents[incidentCounter].id === incidentID) {
                    for(var eventCounter = 0; eventCounter < reply.incidents[incidentCounter].events.length; eventCounter++) {
                        if(reply.incidents[incidentCounter].events[eventCounter].id === eventID) {
                            reply.incidents[incidentCounter].events[eventCounter].type = incidentType;
                            reply.incidents[incidentCounter].events[eventCounter].date = incidentDate;
                            reply.incidents[incidentCounter].events[eventCounter].message = incidentMessage;
                            reply.incidents[incidentCounter].events[eventCounter].update = Date.now(Date.UTC());
                            updated = true;
                        }
                    }
                }
            }
            if(!updated) {
                return res.json(400, {message: 'Incident event does not exist.'});
            }
            client.set(email, JSON.stringify(reply), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem updating incident event.'});
                }
                return res.json({message: 'Incident event updated.'});
            });
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.deleteIncident = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var incidentID = req.body.id;
    var email = req.session.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(!validator.isUUID(incidentID, 4)) {
        return res.json(400, {message: 'Invalid incident id.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem deleting incident.'});
        }
        try {
            reply = JSON.parse(reply);
            var deleted = false;
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                if(reply.incidents[incidentCounter].id === incidentID) {
                    reply.incidents.splice(incidentCounter, 1);
                    deleted = true;
                }
            }
            if(!deleted) {
                return res.json(400, {message: 'Incident does not exist.'});
            }
            client.set(email, JSON.stringify(reply), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem deleting incident.'});
                }
                return res.json({message: 'Incident deleted.'});
            });
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.savePostMortem = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var incidentID = req.body.id;
    var report = req.body.data;
    var completed = req.body.completed;
    var email = req.session.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(!validator.isUUID(incidentID, 4)) {
        return res.json(400, {message: 'Invalid incident id.'});
    }
    if(!validator.isBoolean(completed)) {
        return res.json(400, {message: 'Invalid completion type.'});
    }
    completed = validator.toBoolean(completed);
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem saving report.'});
        }
        try {
            reply = JSON.parse(reply);
            var updated = false;
            for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
                var incident = reply.incidents[incidentCounter];
                if(incident.id === incidentID) {
                    updated = true;
                    incident.postmortem = {
                        completed: completed,
                        data: report,
                        // TODO fix this
                        published: completed && incident.postmortem.published.length > 0 ? report : incident.postmortem.published
                    };
                }
            }
            if(!updated) {
                return res.json(400, {message: 'Incident does not exist.'});
            }
            client.set(email, JSON.stringify(reply), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem saving report.'});
                }
                return res.json({message: 'Report saved.'});
            });
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

validator.extend('isBoolean', function (str) {
    switch(str) {
        case 'true':
        case 'false':
        case '1':
        case '0':
        case 1:
        case 0:
        case true:
        case false:
        return true;
        default:
        return false;
    }
});