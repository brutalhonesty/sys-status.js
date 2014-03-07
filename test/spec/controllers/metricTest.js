var metricid = '5ddbeb81-b1d1-4ba8-a18b-f8001b326c57';
var metrickey = '438c7b32138d501b766b948842cf25762ca7eacaaef7997a56f6be51351f3103';
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