var validator = require('validator');
var settings = require('./settings');
var config = require('../config/config');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var ejs = require('ejs');
var fs = require('fs');
var generatePassword = require('password-generator');
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport('Direct');

var sites = nano.use(settings.couchdb.sites);
var users = nano.use(settings.couchdb.users);

function _getCreateTemplate(options, callback) {
  // TODO This template file could look nicer. The HTML looks tacky, even for my standards :).
  fs.readFile(config.root + '/app/views/accountCreate.ejs', 'utf8', function (err, ejsFile) {
    if(err) {
      return callback(err);
    }
    return callback(null, ejs.render(ejsFile.toString(), options));
  });
}

function _deleteUser(memberid, siteid, callback) {
  sites.get(siteid, function (err, reply) {
    if(err) return callback(err);
    var deleted = false;
    for(var memberCtr = 0; memberCtr < reply.members.length; memberCtr++) {
      if(memberid === reply.members[memberCtr]) {
        reply.members.splice(memberCtr, 1);
        deleted = true;
      }
    }
    if(!deleted) {
      return callback('Could not find user in database.');
    }
    sites.insert(reply, siteid, function (error) {
      if(error) return callback(error);
      users.get(memberid, { revs_info: true }, function (err, user) {
        if(err) return callback(err);
        users.destroy(memberid, user._rev, function (err) {
          if(error) return callback(error);
        });
      });
    });
  });
}

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
      return res.json({members: []});
    }
    users.fetch({keys: reply.members}, function (err, members) {
      if(err) {
        console.log(error);
        return res.json(500, {message: 'Problem getting team members.'});
      }
      var newMembers = [];
      for(var memberCtr = 0; memberCtr < members.rows.length; memberCtr++) {
        // We don't want to return the user's passwords from the DB
        delete(members.rows[memberCtr].doc.password);
        delete(members.rows[memberCtr].doc._rev);
        delete(members.rows[memberCtr].doc.siteid);
        newMembers.push(members.rows[memberCtr].doc);
      }
      return res.json({members: newMembers});
    });
  });
};

exports.addMember = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var memberEmail = req.body.email;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  // Check user to see if they exist already
  users.view('users', 'by_email', {reduce: false, startkey: memberEmail, endkey: memberEmail + '\u9999'}, function (error, memberReply) {
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
      users.insert(member, member.id, function (error) {
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
            // Get Template for sending the email.
            _getCreateTemplate({
              siteName: reply.siteName,
              password: tempPass,
              siteUrl: reply.domain,
              toMail: memberEmail
            }, function (err, createHtml) {
              // We could not get the email template, revert all additions.
              if(err) {
                console.log(err);
                _deleteUser(member.id, siteid, function (err) {
                  if(err) {
                    console.log('Failed to delete user from DB.');
                    console.log(err);
                  }
                });
                return res.json(500, {message: 'Problem adding team member to site.'});
              }
              // Send the mail out to the server.
              transport.sendMail({
                from: settings.nodemailer.from,
                to: memberEmail,
                subject: 'SysStat.us Account Created',
                html: createHtml,
              }, function (error, mailResp) {
                if(error) {
                  console.log(error);
                  _deleteUser(member.id, siteid, function (err) {
                    if(err) {
                      console.log('Failed to delete user from DB.');
                      console.log(err);
                    }
                    return res.json(500, {message: 'Problem adding team member to site.'});
                  });
                }
                return res.json({message: 'Team member added.'});
              });
            });
          });
        });
      });
    });
  });
};

exports.deleteMember = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var memberid = req.body.memberid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid Site Id.'});
  }
  if(!validator.isUUID(memberid, 4)) {
    return res.json(400, {message: 'Invalid member id.'});
  }
  // TODO If we delete the owner, a new owner must be specified to take over the site.
  _deleteUser(memberid, siteid, function (error) {
    if(error) return res.json(500, {message: error});
    return res.json({message: 'Team member deleted.'});
  });
};