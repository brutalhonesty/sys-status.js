'use strict';

var Twit = require('twit');
var settings = require('./settings');

function Twitter(token, secret) {
  this.token = token;
  this.secret = secret;
}

Twitter.prototype.create = function(callback) {
  if(!this.token || !this.secret) {
    return callback('Missing oauth token and secret in instantiation.');
  }
  if(!settings.twitter.apiKey || !settings.twitter.apiSecret) {
    return callback('Missing server Twitter settings, please update settings file.');
  }
  this.client = new Twit({
    consumer_key: settings.twitter.apiKey,
    consumer_secret: settings.twitter.apiSecret,
    access_token: this.token,
    access_token_secret: this.secret
  });
  return callback();
};

Twitter.prototype.getTwitterName = function(callback) {
  this.client.get('account/verify_credentials', function (error, twitterData) {
    if(error) {
      return callback(error);
    }
    return callback(null, twitterData.screen_name);
  });
};

Twitter.prototype.incidentTweet = function(prefix, suffix, tweet, callback) {
  this.client.post('statuses/update', {status: prefix + tweet + suffix}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

module.exports = Twitter;