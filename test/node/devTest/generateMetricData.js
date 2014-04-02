// We want to get a time from the past and add 5 minutes 10000 times and use that as our times for generated data
var moment = require('moment');
var settings = require('../../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);

var metrics = nano.db.use(settings.couchdb.metrics);

if(!process.argv[2]) {
  console.error('Missing metric id.\nUsage node generateMetricData.js <metricid>');
  return;
} else {
  var metricID = process.argv[2];
}

/**
 * Compute the average for each metric
 * @return {Int} The metric average
 */
function metricAverage(metricData, callback) {
    var sum = 0;
    for(var valueCounter = 0; valueCounter < metricData.length; valueCounter++) {
        sum += metricData[valueCounter][1];
    }
    var average = sum / metricData.length;
    return callback(average);
}

// Current time:
// moment.utc().valueOf()
var startTime = 1391509126000; // Tue Feb 04 2014 03:18:46 GMT-0700 (MST)
var now = moment.utc().valueOf();
var timeArr = [];
for(var timeCounter = 0; timeCounter < 100; timeCounter++) {
  var tempTime = moment(startTime);
  startTime += 300000;
  var tempObj = [tempTime.valueOf(), (Math.random()*100)];
  timeArr.push(tempObj);
}
metrics.get(metricID, function (error, reply) {
  if(error) {
    console.log(error);
    return;
  }
  reply.data = timeArr;
  metricAverage(timeArr, function (average) {
    reply.average = average;
    metrics.insert(reply, metricID, function (error) {
      if(error) {
        console.log(error);
        return;
      }
      console.log('Metric updated.');
    });
  });
});
