var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var generatePassword = require('password-generator');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

exports.getMembers = function() {
  // TODO need to write code to get members from the site
};

exports.addMember = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var memberEmail = req.session.email;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  client.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding team member.'});
    }
    try {
      reply = JSON.parse(reply);
      client.get(memberEmail, function (error, memberReply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem adding team member.'});
        }
        try {
          memberReply = JSON.parse(memberReply);
          return res.json(400, {message: 'Member already exists.'});
        } catch(e) {
          var tempPass = generatePassword(12, false);
          bcrypt.hash(tempPass, 10, function (error, hash) {
            if(error) {
              console.log(error);
              return res.json(500, {message: 'Problem adding team member.'});
            }
            var member = {
              id: uuid.v4(),
              firstName: '',
              lastName: '',
              phone: '',
              password: hash,
              isOwner: false,
              // TODO We might want to add an array of sites that a user is linked to
              siteid: siteid
            };
            client.set(memberEmail, JSON.stringify(member), function (error) {
              if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem adding team member.'});
              }
              reply.members.push(member.id);
              // TODO Send email out to user that their account has been made
              return res.json({message: 'Team member added.'});
            });
          });
        }
      });
    } catch(e) {
      return res.json(400, {message: 'Invalid Site Id.'});
    }
  });
};