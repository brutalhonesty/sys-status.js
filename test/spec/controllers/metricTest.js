var metricid = '64089c65-5296-4b97-8e8b-2330807a53e7';
var metrickey = '978fbc5351b228e924325cbcd4ccf5fc9f1956e952dd181445fa58d2d49bdf29';
var request = require('request');
setInterval(function () {
	var dhash = {
		timeStamp: Date.now() - Math.floor((Math.random()*288)+0) * 5 * 60,
		value: (Math.random()*100)
	};
	request.post('http://localhost:9000/api/inputMetricData', {form:{dhash: dhash, metrickey: metrickey, metricID: metricid}}, function (err, res, body) {
		if(err) {
			throw err;
		}
		if(res.statusCode !== 200) {
			throw body;
		}
		console.log(body);
	});
}, 5000);