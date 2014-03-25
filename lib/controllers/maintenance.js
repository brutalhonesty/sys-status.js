var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var uuid = require('node-uuid');
var moment = require('moment');

var sites = nano.use(settings.couchdb.sites);

/**
 * Traverses JSON object and converts strings and array values to ints, and booleans
 * @param  {object} obj The object to Traverse
 */
function _toDataType(obj) {
  for(var key in obj) {
    if(typeof(obj[key]) === 'object') {
      _toDataType(obj[key]);
    } else if(validator.isInt(obj[key])) {
      obj[key] = parseInt(obj[key], 10);
    } else if(validator.isFloat(obj[key])) {
      obj[key] = parseFloat(obj[key], 10);
    } else if(validator.isBoolean(obj[key])) {
        obj[key] = validator.toBoolean(obj[key]); // strict option available
    } else if(obj[key] instanceof Array) {
      for(var counter = 0; counter < obj[key].length; counter++) {
        _toDataType(obj[key][counter]);
      }
    }
  }
}

exports.getMaintenance = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var maintenanceID = req.query.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(maintenanceID, 4)) {
    return res.json(400, {message: 'Invalid maintenance id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting maintenance data.'});
    }
    for(var maintenanceCounter = 0; maintenanceCounter < reply.maintenance.length; maintenanceCounter++) {
      if(reply.maintenance[maintenanceCounter].id === maintenanceID) {
        return res.json(reply.maintenance[maintenanceCounter]);
      }
    }
    return res.json(400, {message: 'Requested maintenance ID does not exist.'});
  });
};

exports.updateMaintenanceEvent = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var maintenanceID = req.body.id;
  var maintenanceType = req.body.type;
  var maintenanceDetails = req.body.details;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(maintenanceID, 4)) {
    return res.json(400, {message: 'Invalid maintenance id.'});
  }
  if(validator.isNull(maintenanceType) || validator.isNull(maintenanceDetails)) {
    return res.json(400, {message: 'Missing maintenance elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting maintenance data.'});
    }
    var updated = false;
    for(var maintenanceCounter = 0; maintenanceCounter < reply.maintenance.length; maintenanceCounter++) {
      if(reply.maintenance[maintenanceCounter].id === maintenanceID) {
        var now = Date.now(Date.UTC());
        var maintenanceEvent = {
          id: uuid.v4(),
          type: maintenanceType,
          details: maintenanceDetails,
          date: now,
        };
        reply.maintenance[maintenanceCounter].events.push(maintenanceEvent);
        // If we are done with this maintenance, set the closed time to now.
        if(maintenanceType === 'Completed') {
            // TODO Trigger closing of any maintenance stuff that's still open for this maintenance incident
            reply.maintenance[maintenanceCounter].completedTime = now;
          }
          updated = true;
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Requested maintenance ID does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating maintenance request.'});
      }
      return res.json({message: 'Maintenance request updated.'});
    });
  });
};

exports.updateMaintenance = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  if(!validator.isInt(req.body.start.dateTime) ||
    !validator.isInt(req.body.end.dateTime) ||
    validator.isNull(req.body.name) ||
    validator.isNull(req.body.setProgress) ||
    validator.isNull(req.body.remindSubs)) {
    return res.json(400, {message: 'Missing maintenance elements.'});
  }
  _toDataType(req.body);
  var maintenanceName = req.body.name;
  var maintenanceID = req.body.id;
  var maintenanceType = req.body.type;
  var startTime = req.body.start.dateTime;
  var endTime = req.body.end.dateTime;
  var remindSubs = req.body.remindSubs;
  var setProgress = req.body.setProgress;
  var email = req.session.email;
  var siteid = req.session.siteid;
  var momentStart = moment.utc(startTime);
  var momentEnd = moment.utc(endTime);
  var now = moment.utc();
  if(!validator.isUUID(maintenanceID, 4)) {
    return res.json(400, {message: 'Invalid maintenance id.'});
  }
  if(momentEnd.isBefore(momentStart) || momentStart.isSame(momentEnd)) {
    return res.json(400, {message: 'Invalid maintenance times.'});
  }
  if(momentStart.isBefore(now)) { // We will allow the same time of now to be allowed.
    return res.json(400, {message: 'Invalid maintenance start time.'});
  }
  if(momentEnd.isBefore(now) || momentEnd.isSame(now)) {
    return res.json(400, {message: 'Invalid maintenance end time.'});
  }
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting maintenance data.'});
    }
    var updated = false;
    for(var maintenanceCounter = 0; maintenanceCounter < reply.maintenance.length; maintenanceCounter++) {
      if(reply.maintenance[maintenanceCounter].id === maintenanceID) {
        reply.maintenance[maintenanceCounter].name = maintenanceName;
        reply.maintenance[maintenanceCounter].type = maintenanceType;
        reply.maintenance[maintenanceCounter].startTime = startTime;
        reply.maintenance[maintenanceCounter].endTime = endTime;
        reply.maintenance[maintenanceCounter].setProgress = setProgress;
        reply.maintenance[maintenanceCounter].remindSubs = remindSubs;
        updated = true;
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Requested maintenance ID does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating maintenance request.'});
      }
      // TODO trigger events for boolean values and anything else we need to do to kick start the maintenance with new times.
      return res.json({message: 'Maintenance request updated.'});
    });
  });
};

exports.updatePrevMaintenance = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var eventID = req.body.id;
  var maintenanceType = req.body.type;
  var maintenanceDate = req.body.date;
  var maintenanceDetails = req.body.details;
  var email = req.session.email;
  var siteid = req.session.siteid;
  var maintenanceID = req.body.maintenanceID;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(maintenanceDetails) || !validator.isMaintenanceStatus(maintenanceType)) {
    return res.json(400, {message: 'Missing maintenance elements.'});
  }
  if(!validator.isInt(maintenanceDate)) {
    return res.json(400, {message: 'Invalid maintenance date.'});
  }
  if(!validator.isUUID(maintenanceID, 4)) {
    return res.json(400, {message: 'Invalid maintenance id.'});
  }
  if(!validator.isUUID(eventID, 4)) {
    return res.json(400, {message: 'Invalid event id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting maintenance requests.'});
    }
    var updated = false;
    for(var maintenanceCounter = 0; maintenanceCounter < reply.maintenance.length; maintenanceCounter++) {
      if(reply.maintenance[maintenanceCounter].id === maintenanceID) {
        for(var eventCounter = 0; eventCounter < reply.maintenance[maintenanceCounter].events.length; eventCounter++) {
          if(reply.maintenance[maintenanceCounter].events[eventCounter].id === eventID) {
            reply.maintenance[maintenanceCounter].events[eventCounter].type = maintenanceType;
            reply.maintenance[maintenanceCounter].events[eventCounter].date = maintenanceDate;
            reply.maintenance[maintenanceCounter].events[eventCounter].details = maintenanceDetails;
            reply.maintenance[maintenanceCounter].events[eventCounter].update = Date.now(Date.UTC());
            updated = true;
          }
        }
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Maintenance event does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating maintenance event.'});
      }
      return res.json({message: 'Maintenance event updated.'});
    });
  });
};

exports.getMaintenances = function(req, res) {
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
      return res.json(500, {message: 'Problem getting maintenance data.'});
    }
    return res.json(reply.maintenance);
  });
};

exports.addMaintenance = function(req, res) {
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
  if(!validator.isInt(req.body.start.dateTime) ||
    !validator.isInt(req.body.end.dateTime) ||
    validator.isNull(req.body.name) ||
    validator.isNull(req.body.details) ||
    !validator.isBoolean(req.body.setProgress) ||
    !validator.isBoolean(req.body.remindSubs)) {
    return res.json(400, {message: 'Missing maintenance elements.'});
  }
  _toDataType(req.body);
  var maintenanceName = req.body.name;
  var maintenanceDetails = req.body.details;
  var startTime = req.body.start.dateTime;
  var endTime = req.body.end.dateTime;
  var remindSubs = req.body.remindSubs;
  var setProgress = req.body.setProgress;
  var momentStart = moment.utc(startTime);
  var momentEnd = moment.utc(endTime);
  var now = moment.utc();
  if(momentEnd.isBefore(momentStart) || momentStart.isSame(momentEnd)) {
    return res.json(400, {message: 'Invalid maintenance times.'});
  }
  if(momentStart.isBefore(now)) { // We will allow the same time of now to be allowed.
    return res.json(400, {message: 'Invalid maintenance start time.'});
  }
  if(momentEnd.isBefore(now) || momentEnd.isSame(now)) {
    return res.json(400, {message: 'Invalid maintenance end time.'});
  }
  // TODO Trigger events if remindSubs and/or setProgress is enabled.
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding new maintenance request.'});
    }
    var maintenanceObj = {
      id: uuid.v4(),
      name: maintenanceName,
      type: 'Scheduled',
      remindSubs: remindSubs,
      setProgress: setProgress,
      startTime: startTime,
      endTime: endTime,
      events: [{
        id: uuid.v4(),
        type: 'Scheduled',
        details: maintenanceDetails,
        date: Date.now(Date.UTC()),
      }],
      completedTime: null,
      postmortem: null
    };
    reply.maintenance.push(maintenanceObj);
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem adding new maintenance request.'});
      }
      return res.json({message: 'Added maintenance request.'});
    });
  });
};

exports.deleteMaintenance = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var maintenanceID = req.body.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem deleting new maintenance request.'});
    }
    var deleted = false;
    for(var maintenanceCounter = 0; maintenanceCounter < reply.maintenance.length; maintenanceCounter++) {
      if(reply.maintenance[maintenanceCounter].id === maintenanceID) {
        reply.maintenance.splice(maintenanceCounter, 1);
        deleted = true;
      }
    }
    if(!deleted) {
      return res.json(400, {message: 'Maintenance request does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem deleting the maintenance request.'});
      }
      return res.json({message: 'Maintenance request deleted.'});
    });
  });
};

validator.extend('isMaintenanceStatus', function (str) {
  switch(str) {
    case 'Scheduled':
    case 'In Progress':
    case 'Verifying':
    case 'Completed':
    return true;
    default:
    return false;
  }
});

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