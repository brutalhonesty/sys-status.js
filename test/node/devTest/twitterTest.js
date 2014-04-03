var settings = require('../../../lib/controllers/settings');
var Twit = require('twit');
var twitter = new Twit({
  consumer_key: settings.twitter.apiKey,
  consumer_secret: settings.twitter.apiSecret,
  access_token: '',
  access_token_secret: ''
});
/*twitter.get('account/verify_credentials', function (error, twitterData) {
  if(error) {
    console.log(error);
    return;
  }
  console.log(twitterData);
});*/
twitter.post('statuses/update', {status: 'Test tweet from Node.js!'}, function (error, reply) {
  if(error) {
    console.log(error);
    return;
  }
  console.log(reply);
});