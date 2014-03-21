var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

exports.register = function(req, res) {
  var siteName = req.body.siteName;
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
      return res.json(400, {message: error});
    }
    var registerStore = {
      id: uuid.v4(),
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
      }
    };
    var registerUser = {
      id: uuid.v4(),
      firstName: '',
      lastName: '',
      phone: '',
      password: hash,
      isOwner: true,
      // TODO We might want to add an array of sites that a user is linked to
      siteid: registerStore.id
    };
    registerStore.members.push(registerUser.id);
    // Get site to see if it exists
    client.get(registerStore.siteName, function (error, reply) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem registering your site, please try again.'});
      }
      if(reply) {
        return res.json(500, {message: 'Site already exists.'});
      }
      // Create site
      client.set(registerStore.id, JSON.stringify(registerStore), function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registering your site, please try again.'});
        }
      });
      // Get user to see if they exist
      client.get(email, function (error, reply) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem registering user, please try again.'});
        }
        if(reply) {
          return res.json(500, {message: 'User already exists.'});
        }
        // Create user
        client.set(email, JSON.stringify(registerUser), function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem registering your site, please try again.'});
          }
          req.session.email = email;
          req.session.siteid = registerStore.id;
          return res.json({message: 'Registered.'});
        });
      });
    });
  });
};