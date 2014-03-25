var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

var users = nano.use(settings.couchdb.users);
var sites = nano.use(settings.couchdb.sites);

exports.login = function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(validator.isNull(password)) {
    return res.json(400, {message: 'Missing password.'});
  }
  users.view('users', 'by_email', {reduce: false, startkey: email, endkey: email + '\u9999'}, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem logging in.'});
    }
    if(reply.rows.length === 0) {
      return res.json(400, {message: 'Invalid username.'});
    }
    bcrypt.compare(password, reply.rows[0].value.password, function (error, compareResult) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem logging in.'});
      }
      if(!compareResult) {
        return res.json(400, {message: 'Invalid password.'});
      }
      req.session = req.session || {};
      req.session.email = email;
      req.session.siteid = reply.rows[0].value.siteid;
      sites.get(reply.rows[0].value.siteid, function (error, siteReply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem logging in.'});
        }
        return res.json({message: 'Logged in.', name: siteReply.siteName});
      });
    });
  });
};