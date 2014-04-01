var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var uuid = require('node-uuid');

var users = nano.use(settings.couchdb.users);
var sites = nano.use(settings.couchdb.sites);

var Twit = require('twit');

function _getTwitterName(token, secret, callback) {
  if(!settings.twitter.apiKey || !settings.twitter.apiSecret) {
    return callback('Missing server Twitter settings, please update settings file.');
  }
  var twitter = new Twit({
    consumer_key: settings.twitter.apiKey,
    consumer_secret: settings.twitter.apiSecret,
    access_token: token,
    access_token_secret: secret
  });
  twitter.get('account/verify_credentials', function (error, twitterData) {
    if(error) {
      return callback(error);
    }
    return callback(null, twitterData.screen_name);
  });
}

exports.getTwitter = function(req, res) {
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
      return res.json(500, {message: 'Problem getting Twitter settings.'});
    }
    delete reply.twitter.oauthToken;
    delete reply.twitter.oauthSecret;
    return res.json({twitter: reply.twitter});
  });
};

exports.storeTwitter = function(req, res) {
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
  var oauthToken = req.body.oauth_token;
  var oauthSecret = req.body.oauth_token_secret;
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding Twitter settings.'});
    }
    // Twitter auth tokens never expire.
    // https://dev.twitter.com/docs/auth/oauth/faq
    reply.twitter.oauthToken = oauthToken;
    reply.twitter.oauthSecret = oauthSecret;
    reply.twitter.allowTweets = true;
    _getTwitterName(oauthToken, oauthSecret, function (error, username) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem adding Twitter settings.'});
      }
      reply.twitter.username = username;
      sites.insert(reply, siteid, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem adding Twitter settings.'});
        }
        return res.json({message: 'Twitter settings added.'});
      });
    });
  });
};

exports.removeTwitter = function(req, res) {
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
      return res.json(500, {message: 'Problem removing Twitter settings.'});
    }
    reply.twitter = {
      allowTweets: false,
      prefix: '<status>',
      suffix: '<siteurl>'
    };
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem removing Twitter settings.'});
      }
      return res.json({message: 'Twitter settings removed.'});
    });
  });
};

exports.updateTwitter = function(req, res) {
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
  var allowTweets = req.body.allowTweets;
  var prefix = req.body.prefix;
  var suffix = req.body.suffix;
  if(!validator.isBoolean(allowTweets)) {
    return res.json(400, {message: 'Invalid twitter settings.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating Twitter settings.'});
    }
    reply.twitter.allowTweets = validator.toBoolean(allowTweets);
    reply.twitter.prefix = prefix;
    reply.twitter.suffix = suffix;
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating Twitter settings.'});
      }
      return res.json({message: 'Twitter settings updating.'});
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