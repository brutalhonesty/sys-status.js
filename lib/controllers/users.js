var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');

var users = nano.use(settings.couchdb.users);
var sites = nano.use(settings.couchdb.sites);

exports.register = function(req, res) {
  var siteName = req.body.name;
  var domain = req.body.domain;
  var email = req.body.email;
  var password = req.body.password;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isURL(domain)) {
    return res.json(400, {message: 'Invalid domain.'});
  }
  bcrypt.hash(password, 10, function (error, hash) {
    if(error) {
      console.log(error);
      return res.json(400, {message: 'Problem registering site, please try again.'});
    }
    var siteid = uuid.v4();
    var registerSite = {
      siteName: siteName,
      domain: domain,
      components: [],
      incidents: [],
      maintenance: [],
      metrics: [],
      members: [],
      customize: {
        logo: '',
        favicon: '',
        cover: '',
        bodyBackground: 'ffffff',
        fontColor: '000000',
        lightFontColor: 'AAAAAA',
        greenColor: '1CB841',
        yellowColor: 'F1C40F',
        orangeColor: 'E67E22',
        redColor: 'E74C3C',
        linkColor: '0078E7',
        borderColor: 'E0E0E0',
        graphColor: '0078E7',
        headline: '',
        aboutPage: '',
        layoutType: 'basic'
      },
      subscribers: {
        email: {
          count: 0,
          data: [],
          disabled: false
        },
        sms: {
          count: 0,
          data: [],
          disabled: false
        },
        webhook: {
          count: 0,
          data: [],
          disabled: false
        },
        types: {
          autoIncident: false,
          indvidIncident: false,
          individComponent: false
        }
      },
      twitter: {
        allowTweets: false,
        prefix: '<status>',
        suffix: '<siteurl>'
      }
    };
    var userid = uuid.v4();
    var registerUser = {
      email: email,
      firstName: '',
      lastName: '',
      phone: '',
      password: hash,
      isOwner: true,
      // TODO We might want to add an array of sites that a user is linked to
      siteid: siteid
    };
    registerSite.members.push(userid);
    // Get site to see if it exists
    sites.head(siteid, function (error, reply) {
      if(error && error.status_code !== 404) {
        console.log(error);
        return res.json(500, {message: 'Problem registering your site, please try again.'});
      }
      if(reply) {
        return res.json(400, {message: 'Site already exists.'});
      }
      // Create site
      sites.insert(registerSite, siteid, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registering your site, please try again.'});
        }
        // Get user to see if they exist
        users.view('users', 'by_email', {reduce: false, startkey: email, endkey: email + '\u9999'}, function (error, reply) {
          if(error && error.status_code !== 404) {
            console.log(error);
            return res.json(500, {message: 'Problem registering user, please try again.'});
          }
          if(reply.rows.length > 0) {
            return res.json(400, {message: 'User already exists.'});
          }
          // Create user
          users.insert(registerUser, userid, function (error) {
            if(error) {
              console.log(error);
              return res.json(500, {message: 'Problem registering your site, please try again.'});
            }
            req.session.email = email;
            req.session.siteid = siteid;
            return res.json({message: 'Registered.', site: registerSite.siteName});
          });
        });
      });
    });
  });
};

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
      req.session.email = email;
      req.session.siteid = reply.rows[0].value.siteid;
      sites.get(reply.rows[0].value.siteid, function (error, siteReply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem logging in.'});
        }
        // If we don't have a first name, then return empty string, else, use full name.
        var fullName = reply.rows[0].value.firstName.length === 0 ? '' : reply.rows[0].value.firstName + ' ' + reply.rows[0].value.lastName;
        return res.json({message: 'Logged in.', site: siteReply.siteName, name: fullName});
      });
    });
  });
};

exports.logout = function(req, res) {
    delete req.session.email;
    delete req.session.siteid;
    req.session.destroy(function () {
        return res.json({message: 'Logged out.'});
    });
};

exports.checkCookie = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
      return res.json(401, {message: 'Invalid'});
  }
  return res.json({message: 'Valid'});
};

exports.getProfile = function(req, res) {
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
  users.view('users', 'by_email', {reduce: false, startkey: email, endkey: email + '\u9999'}, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting profile.'});
    }
    var user = reply.rows[0].value;
    if(!user) {
      console.log('Someone deleted the user fromt the DB? Might have been the server-side tests!');
      return res.json(500, {message: 'Problem getting profile.'});
    }
    delete user.password;
    delete user._rev;
    return res.json({profile: user});
  });
};

exports.updateProfile = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var phone = req.body.phone;
  var newEmail = req.body.email;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isNull(phone) && !validator.isPhoneNumber(phone)) {
    return res.json(400, {message: 'Invalid phone number.'});
  }
  if(!validator.isEmail(newEmail)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  users.view('users', 'by_email', {reduce: false, startkey: email, endkey: email + '\u9999'}, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating profile.'});
    }
    var user = reply.rows[0].value;
    var signout = false;
    if(!user) {
      console.log('Someone deleted the user fromt the DB? Might have been the server-side tests!');
      return res.json(500, {message: 'Problem updating profile.'});
    }
    var userid = user.id;
    if(user.phone !== phone) {
      user.phone = phone;
    }
    if(user.lastName !== lastName) {
      user.lastName = lastName;
    }
    if(user.firstName !== firstName) {
      user.firstName = firstName;
    }
    if(user.email !== newEmail) {
      user.email = newEmail;
      signout = true;
    }
    users.insert(user, userid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating profile.'});
      }
      if(signout) {
        delete req.session.email;
        delete req.session.siteid;
        req.session.destroy(function () {
            return res.json({message: 'Profile updated, please sign in again.'});
        });
      } else {
        var fullName = firstName.length === 0 ? '' : firstName + ' ' + lastName;
        return res.json({message: 'Profile updated.', name: fullName});
      }
    });
  });
};

exports.changePassword = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var oldPassword = req.body.oldPassword;
  var newPassword = req.body.newPassword;
  var confirmNewPass = req.body.confirmNewPassword;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(newPassword !== confirmNewPass) {
    return res.json(400, {message: 'New passwords mismatch.'});
  }
  if(oldPassword === newPassword) {
    return res.json(400, {message: 'Cannot use old password as new password.'});
  }
  users.view('users', 'by_email', {reduce: false, startkey: email, endkey: email + '\u9999'}, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating password.'});
    }
    var user = reply.rows[0].value;
    if(!user) {
      console.log('Someone deleted the user fromt the DB? Might have been the server-side tests!');
      return res.json(500, {message: 'Problem updating password.'});
    }
    bcrypt.compare(oldPassword, user.password, function (error, result) {
      if(error) {
        console.log(error);
        return res.json(400, {message: 'Problem updating password.'});
      }
      if(!result) {
        return res.json(400, {message: 'Invalid old password.'});
      }
      bcrypt.hash(newPassword, 10, function (error, newHash) {
        if(error) {
          console.log(error);
          return res.json(400, {message: 'Problem updating password.'});
        }
        user.password = newHash;
        users.insert(user, reply.rows[0]._id, function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem updating password.'});
          }
          return res.json({message: 'Password updated.'});
        });
      });
    });
  });
};

/*http://www.w3resource.com/javascript/form/phone-no-validation.php*/
// Allows for XXX-XXX-XXXX or (XXX)-XXX-XXXX
validator.extend('isPhoneNumber', function (str) {
  var phoneRegex = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
  return phoneRegex.test(str);
});
