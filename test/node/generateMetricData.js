// We want to get a time from the past and add 5 minutes 10000 times and use that as our times for generated data
var moment = require('moment');
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

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
for(var timeCounter = 0; timeCounter < 10000; timeCounter++) {
  var tempTime = moment(startTime);
  startTime += 300000;
  var tempObj = [tempTime.valueOf(), (Math.random()*100)];
  timeArr.push(tempObj);
}
client.get('metric:44fe85f7-4327-43c6-9da9-42cd79127c53', function (error, reply) {
  if(error) {
    console.log(error);
    return;
  }
  reply = JSON.parse(reply);
  reply.data = timeArr;
  metricAverage(timeArr, function (average) {
    reply.average = average;
    client.set('metric:44fe85f7-4327-43c6-9da9-42cd79127c53', JSON.stringify(reply), function (error) {
      if(error) {
        console.log(error);
        return;
      }
      console.log('Metric updated.');
    });
  });
});
