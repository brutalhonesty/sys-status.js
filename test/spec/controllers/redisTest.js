var redis = require('redis');

var client = redis.createClient(6379, '127.0.0.1');

client.mget(['metric:1590aab9-879f-4e24-bc29-cf88a23cb5eb'], function (error, metrics) {
	if(error) {
		console.log(error);
		return;
	}
	console.log(metrics);
});