var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var moment = require('moment');
var url = require('url');
var Twitter = require('./twitter');

var sites = nano.use(settings.couchdb.sites);

function _parseFixes(fix, options, callback) {
  if(typeof(fix) !== 'string') {
    return callback('Fix needs to be a string.');
  }
  if(typeof(options) !== 'object') {
    return callback('Options needs to be an object.');
  }
  if(fix[0] !== '<') {
    return callback(null, fix);
    // We are looking for `status` or `siteurl` in `<status>` or `<siteurl>`.
  } else {
    switch(fix.substring(1, fix.length - 1)) {
      case 'status':
      var status = options.status;
      if(options.type === 'prefix') {
        status += ': ';
      } else {
        status = ' ' + status;
      }
      return callback(null, status);
      case 'siteurl':
        var siteurl = options.siteurl;
        if(options.type === 'prefix') {
          siteurl += ': ';
        } else {
          siteurl = ' ' + siteurl;
        }
        return callback(null, siteurl);
      default:
        return callback('Invalid fix option.');
    }
  }
}

exports.createIncident = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var incidentName = req.body.name;
  var incidentType = req.body.type;
  var incidentMessage = req.body.message;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(incidentName) || !validator.isInicidentType(incidentType) || validator.isNull(incidentMessage)) {
    return res.json(400, {message: 'Missing incident elements.'});
  }
  if(incidentType === 'Resolved') {
    return res.json(400, {message: 'Cannot create an incident with "resolved" status.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding incident.'});
    }
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
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem adding incident.'});
      }
      if(reply.twitter.allowTweets) {
        var twitter = new Twitter(reply.twitter.oauthToken, reply.twitter.oauthSecret);
        twitter.create(function (error) {
          if(error) {
            console.log(error);
            return res.json(400, {message: 'Problem adding incident.'});
          }
          var options = {
            status: incidentType,
            type: 'prefix',
            // TODO if we have sub-domains, this siteurl might change and we need to account for that.
            siteurl: url.resolve(reply.domain, '/statusPage')
          };
          _parseFixes(reply.twitter.prefix, options, function (error, prefix) {
            if(error) {
              console.log(error);
              return res.json(400, {message: 'Problem adding incident.'});
            }
            options.type = 'suffix';
            _parseFixes(reply.twitter.suffix, options, function (error, suffix) {
              if(error) {
                console.log(error);
                return res.json(400, {message: 'Problem adding incident.'});
              }
              twitter.incidentTweet(prefix, suffix, incidentMessage, function(error) {
                if(error) {
                  console.log(error);
                  return res.json(400, {message: 'Problem adding incident.'});
                }
                // We don't need to track any Twitter information right now so we will leave the reponse alone.
                return res.json({message: 'Incident added, tweet posted.'});
              });
            });
          });
        });
      } else {
        return res.json({message: 'Incident added.'});
      }
    });
  });
};

exports.getIncident = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var incidentID = req.query.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(incidentID) || !validator.isUUID(incidentID, 4)) {
    return res.json(400, {message: 'Missing incident elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting incidents.'});
    }
    for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
      if(reply.incidents[incidentCounter].id === incidentID) {
        return res.json({incident: reply.incidents[incidentCounter]});
      }
    }
    return res.json(400, {message: 'Incident does not exist.'});
  });
};

// This will still return the incidents even if it fails to delete from DB
exports.getIncidents = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting incidents.'});
    }
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
      sites.insert(reply, siteid, function (error) {
        if(error) {
          console.log(error);
        }
      });
    }
    return res.json({incidents: reply.incidents});
  });
};

exports.updateIncident = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var incidentID = req.body.id;
  var incidentType = req.body.type;
  var incidentMessage = req.body.message;
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(incidentMessage) || !validator.isInicidentType(incidentType)) {
    return res.json(400, {message: 'Missing incident elements.'});
  }
  if(!validator.isUUID(incidentID, 4)) {
    return res.json(400, {message: 'Invalid incident id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting incidents.'});
    }
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
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating incident.'});
      }
      return res.json({message: 'Incident updated.'});
    });
  });
};

exports.updatePrevIncident = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var eventID = req.body.id;
  var incidentType = req.body.type;
  var incidentDate = req.body.date;
  var incidentMessage = req.body.message;
  var email = req.session.email;
  var incidentID = req.body.incidentID;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(incidentMessage) || !validator.isInicidentType(incidentType)) {
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
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting incidents.'});
    }
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
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating incident event.'});
      }
      return res.json({message: 'Incident event updated.'});
    });
  });
};

exports.deleteIncident = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var incidentID = req.body.id;
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(incidentID, 4)) {
    return res.json(400, {message: 'Invalid incident id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem deleting incident.'});
    }
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
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem deleting incident.'});
      }
      // TODO We might want to add an option to allow users to delete the tweet associated with it as well.
      return res.json({message: 'Incident deleted.'});
    });
  });
};

exports.savePostMortem = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var incidentID = req.body.id;
  var report = req.body.data;
  var completed = req.body.completed;
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(incidentID, 4)) {
    return res.json(400, {message: 'Invalid incident id.'});
  }
  if(!validator.isBoolean(completed)) {
    return res.json(400, {message: 'Invalid completion type.'});
  }
  completed = validator.toBoolean(completed);
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem saving report.'});
    }
    var updated = false;
    for(var incidentCounter = 0; incidentCounter < reply.incidents.length; incidentCounter++) {
      var incident = reply.incidents[incidentCounter];
      if(incident.id === incidentID) {
        updated = true;
        incident.postmortem = {
          completed: completed,
          data: report,
          published: completed ? report : incident.postmortem.published
        };
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Incident does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem saving report.'});
      }
      return res.json({message: 'Report saved.'});
    });
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

validator.extend('isInicidentType', function (str) {
  switch(str) {
    case 'Investigating':
    case 'Identified':
    case 'Monitoring':
    case 'Resolved':
    return true;
    default:
    return false;
  }
});