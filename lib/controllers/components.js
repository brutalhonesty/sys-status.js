var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

var sites = nano.use(settings.couchdb.sites);

exports.getComponents = function(req, res) {
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
      return res.json(500, {message: 'Problem getting components.'});
    }
    return res.json({components: reply.components});
  });
};

exports.editComponent = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var componentID = req.body.id;
  var componentName = req.body.name;
  var description = req.body.description;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(componentName) || !validator.isUUID(componentID, 4) || validator.isNull(description)) {
    return res.json(400, {message: 'Missing component elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting components.'});
    }
    var updated = false;
    for(var componentCounter = 0; componentCounter < reply.components.length; componentCounter++) {
      if(reply.components[componentCounter].id === componentID) {
        reply.components[componentCounter].name = componentName;
        reply.components[componentCounter].description = description;
        updated = true;
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Component not found.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating components.'});
      }
      return res.json({message: 'Component updated.'});
    });
  });
};

exports.updateComponent = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var componentID = req.body.id;
  var componentStatus = req.body.status;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isComponentStatus(componentStatus) || !validator.isUUID(componentID, 4)) {
    return res.json(400, {message: 'Missing component elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating components.'});
    }
    var updated = false;
    for(var componentCounter = 0; componentCounter < reply.components.length; componentCounter++) {
      if(reply.components[componentCounter].id === componentID) {
        // TODO, when we update the status, we need to create a new incident if the status is not operational
        // This incident will be displayed on the status page for the customers
        reply.components[componentCounter].status = componentStatus;
        updated = true;
      }
    }
    if(!updated) {
      return res.json(400, {message: 'Component not found.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating components.'});
      }
      return res.json({message: 'Component updated.'});
    });
  });
};

exports.setComponent = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var componentName = req.body.name;
  var componentDescription = req.body.description;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(componentName) || validator.isNull(componentDescription)) {
    return res.json(400, {message: 'Missing component elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem setting components.'});
    }
    var component = {
      id: uuid.v4(),
      name: componentName,
      description: componentDescription,
      status: 'Operational' // Start with Default
    };
    reply.components.push(component);
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem setting components.'});
      }
      return res.json({message: 'Component added.'});
    });
  });
};

exports.deleteComponent = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var componentId = req.body.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(componentId, 4)) {
    return res.json(400, {message: 'Invalid component id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem setting components.'});
    }
    var deleted = false;
    for(var componentCounter = 0; componentCounter < reply.components.length; componentCounter++) {
      if(reply.components[componentCounter].id === componentId) {
        reply.components.splice(componentCounter, 1);
        deleted = true;
      }
    }
    if(!deleted) {
      return res.json(400, {message: 'Component does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem deleting component.'});
      }
      return res.json({message: 'Component deleted.'});
    });
  });
};

validator.extend('isComponentStatus', function (str) {
  switch(str) {
    case 'Operational':
    case 'Degraded Performance':
    case 'Partial Outage':
    case 'Major Outage':
    return true;
    default:
    return false;
  }
});