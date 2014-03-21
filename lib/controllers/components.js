var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);
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
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting components.'});
    }
    try {
      reply = JSON.parse(reply);
      return res.json({components: reply.components});
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
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
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  if(validator.isNull(componentStatus) || !validator.isUUID(componentID, 4)) {
    return res.json(400, {message: 'Missing component elements.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating components.'});
    }
    try {
      reply = JSON.parse(reply);
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
      client.set(siteid, JSON.stringify(reply), function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem updating components.'});
        }
        return res.json({message: 'Component updated.'});
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
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
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  if(validator.isNull(componentName) || validator.isNull(componentDescription)) {
    return res.json(400, {message: 'Missing component elements.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem setting components.'});
    }
    try {
      reply = JSON.parse(reply);
      var component = {
        id: uuid.v4(),
        name: componentName,
        description: componentDescription,
        status: 'Operational' // Start with Default
      };
      reply.components.push(component);
      client.set(siteid, JSON.stringify(reply), function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem setting components.'});
        }
        return res.json({message: 'Component added.'});
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
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
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  if(!validator.isUUID(componentId, 4)) {
    return res.json(400, {message: 'Invalid component.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem setting components.'});
    }
    try {
      reply = JSON.parse(reply);
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
      client.set(siteid, JSON.stringify(reply), function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem deleting component.'});
        }
        return res.json({message: 'Component deleted.'});
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
  });
};