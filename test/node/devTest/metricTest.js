'use strict';
var metricid = '002493d1-291f-4415-aa53-4fca580f0e1c';
var metrickey = '6155bf50a09b2f049fb93c0559c46ef890909c9c663b56ae7d17c533ec512282';
var request = require('request');
setInterval(function () {
	// Your data object, make sure you include timeStamp and value as the keys.
	var dhash = {
		timeStamp: Date.now(Date.UTC()),
		value: (Math.random()*200)
	};
	request.post('http://localhost:9000/api/inputMetricData', {form:{dhash: dhash, metrickey: metrickey, metricID: metricid}}, function (err, res, body) {
		if(err) {
			// Handle error
		}
		if(res.statusCode !== 200) {
			// Handle issue with input or server error
		}
		console.log(body); // Expected {}
	});
}, 300000); // Every 5 minutes