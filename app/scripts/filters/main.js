/*global sysStatusApp, moment*/
'use strict';

sysStatusApp.filter('mfromNow', [function () {
  return function (epoch) {
    return moment(epoch).fromNow();
  };
}]);
sysStatusApp.filter('dailyData', [function () {
  return function (metricData) {
    var startOfToday = moment.utc().startOf('day');
    var endOfToday = moment.utc().endOf('day');
    var newMetricData = [];
    for(var metricCounter = 0; metricCounter < metricData.length; metricCounter++) {
      var tempTime = metricData[metricCounter][0];
      var tempMoment = moment(tempTime);
      if(tempMoment.isAfter(startOfToday) && tempMoment.isBefore(endOfToday)) {
        newMetricData.push([tempTime, metricData[metricCounter][1]]);
      }
    }
    return metricData;
  };
}]);
sysStatusApp.filter('weeklyData', [function () {
  return function (metricData) {
    var startOfWeek = moment.utc().startOf('week');
    var endOfWeek = moment.utc().endOf('week');
    var newMetricData = [];
    for(var metricCounter = 0; metricCounter < metricData.length; metricCounter++) {
      var tempTime = metricData[metricCounter][0];
      var tempMoment = moment(tempTime);
      if(tempMoment.isAfter(startOfWeek) && tempMoment.isBefore(endOfWeek)) {
        newMetricData.push([tempTime, metricData[metricCounter][1]]);
      }
    }
    return metricData;
  };
}]);
sysStatusApp.filter('monthlyData', [function () {
  return function (metricData) {
    var startOfMonth = moment.utc().startOf('month');
    var endOfMonth = moment.utc().endOf('month');
    var newMetricData = [];
    for(var metricCounter = 0; metricCounter < metricData.length; metricCounter++) {
      var tempTime = metricData[metricCounter][0];
      var tempMoment = moment(tempTime);
      if(tempMoment.isAfter(startOfMonth) && tempMoment.isBefore(endOfMonth)) {
        newMetricData.push([tempTime, metricData[metricCounter][1]]);
      }
    }
    return metricData;
  };
}]);