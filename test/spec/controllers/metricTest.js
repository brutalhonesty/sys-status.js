var metricid = '0e0bc654-e5dd-48f9-a893-0c96a632f074';
var metrickey = 'dec2522c88a461fe533e2018bf4dfa4f433e4224a14ba50770793b3b3adc2d51';
var request = require('request');
setInterval(function () {
	var dhash = {
		timeStamp: Date.now(),
		value: (Math.random()*200)
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
}, 300000);