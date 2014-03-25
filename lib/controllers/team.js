var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var generatePassword = require('password-generator');

var sites = nano.use(settings.couchdb.sites);
var users = nano.use(settings.couchdb.users);

exports.getMembers = function(req, res) {
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
  sites.get(siteid, function (error, reply) {
    if(error && error.status_code !== 404) {
      console.log(error);
      return res.json(500, {message: 'Problem getting team members.'});
    }
    if(error) {
      return res.json(400, {message: 'Site does not exist.'});
    }
    if(reply.members.length === 0) {
      // TODO Finish getting members from DB.
    }
  });
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
  // Check user to see if they exist already
  users.view('users', 'by_email', {reduce: false, startkey: memberEmail, endkey: memberEmail + '\u9999'}, function (err, memberReply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding team member.'});
    }
    if(memberReply.rows.length > 0) {
      return res.json(400, {message: 'Member already exists.'});
    }
    // They don't exist, let's add them
    var tempPass = generatePassword(12, false);
    bcrypt.hash(tempPass, 10, function (error, hash) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem adding team member.'});
      }
      var member = {
        id: uuid.v4(),
        email: memberEmail,
        firstName: '',
        lastName: '',
        phone: '',
        password: hash,
        isOwner: false,
        // TODO We might want to add an array of sites that a user is linked to
        siteid: siteid
      };
      // Add user to DB
      users.insert(member, memberEmail, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem adding team member.'});
        }
        // Check site to see if it exists
        sites.get(siteid, function (error, reply) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem adding team member to site.'});
          }
          if(!reply) {
            console.log('Invalid session request with siteid ' + siteid + ' with session email of ' + email + ' and member email of' + memberEmail);
            return res.json(400, {message: 'Site does not exist.'});
          }
          // Site exists, let's add user to the site
          reply.members.push(member.id);
          sites.insert(reply, siteid, function (error) {
            if(error) {
              console.log(error);
              return res.json(500, {message: 'Problem adding team member to site.'});
            }
            // TODO, send out email with clear-text temp password
            return res.json({message: 'Team member added.'});
          });
        });
      });
    });
  });
};