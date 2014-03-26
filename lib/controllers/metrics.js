var validator = require('validator');
var settings = require('./settings');
var nano = require('nano')(settings.couchdb.url);
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var fs = require('fs');
var uuid = require('node-uuid');

var metrics = nano.use(settings.couchdb.metrics);
var sites = nano.use(settings.couchdb.sites);

function _getMetricTemplate(metricid, metrickey, callback) {
  fs.readFile(__dirname + '/../templates/metricTemplate-js.txt', {encoding: 'utf-8'}, function(error, data) {
    if(error) {
      return callback(error);
    }
    data = data.replace('&metricid&', "'" + metricid + "'");
    data = data.replace('&metrickey&', "'" + metrickey + "'");
    return callback(null, data);
  });
}

/**
 * Compute the average for each metric
 * @return {Int} The metric average
 */
function _metricAverage(metricData, callback) {
  if(metricData.length === 0) {
    return callback(null);
  }
  var sum = 0;
  for(var valueCounter = 0; valueCounter < metricData.length; valueCounter++) {
    sum += metricData[valueCounter][1];
  }
  var average = sum / metricData.length;
  return callback(average);
}

/**
 * Traverses JSON object and converts strings and array values to ints, and booleans
 * @param  {object} obj The object to Traverse
 */
function _toDataType(obj) {
  for(var key in obj) {
    if(typeof(obj[key]) === 'object') {
      _toDataType(obj[key]);
    } else if(validator.isInt(obj[key])) {
      obj[key] = parseInt(obj[key], 10);
    } else if(validator.isFloat(obj[key])) {
      obj[key] = parseFloat(obj[key], 10);
    } else if(validator.isBoolean(obj[key])) {
      obj[key] = validator.toBoolean(obj[key]); // strict option available
    } else if(obj[key] instanceof Array) {
      for(var counter = 0; counter < obj[key].length; counter++) {
        _toDataType(obj[key][counter]);
      }
    }
  }
}

exports.getMetrics = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting metrics.'});
    }
    if(reply.metrics.length === 0) {
      return res.json([]);
    }
    metrics.fetch({keys: reply.metrics}, function (error, metrics) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem getting metrics.'});
      }
      if(metrics.rows.length === 1) {
        var metric = [metrics.rows[0].doc];
        return res.json(metric);
      }
      var newMetrics = [];
      for(var metricCtr = 0; metricCtr < metrics.rows.length; metricCtr++) {
        newMetrics.push(metrics.rows[metricCtr].doc);
      }
      return res.json(newMetrics);
    });
  });
};

exports.getMetric = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var metricID = req.query.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(metricID)) {
    return res.json(400, {message: 'Missing metric id.'});
  }
  metrics.get(metricID, function (error, metric) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem getting metric.'});
    }
    _getMetricTemplate(metric.id, metric.metrickey, function (error, template) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem getting metric.'});
      }
      return res.json({metric: metric, template: template});
    });
  });
};

exports.createMetric = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var displayName = req.body.name;
  var displaySuffix = req.body.suffix;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(validator.isNull(displayName) || validator.isNull(displaySuffix)) {
    return res.json(400, {message: 'Missing metric elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem adding the metric.'});
    }
    var metricID = uuid.v4();
    var metric = {
      id: metricID,
      metrickey: crypto.createHash('sha256').update(metricID).update(settings.crypto.salt).digest('hex'),
      name: displayName,
      suffix: displaySuffix,
      visible: false,
      description: '',
      decimalPlaces: 0,
      average: null,
      axis: {
        y: {
          min: 0,
          max: 100,
          hide: false
        },
        x: {
          min: 0,
          max: 100,
          hide: false
        }
      },
      data: []
    };
    reply.metrics.push(metricID);
    metrics.insert(metric, metricID, function (error, body) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem adding the metric.'});
      }
      sites.insert(reply, siteid, function (error) {
        if(error) {
          console.log(error);
          // Delete the metric we just added, hopefully we can access it :D
          metrics.destroy(metricID, body.rev, function (error) {
            if(error) {
              // Shit, we couldn't access it.
              console.log(error);
            }
          });
          return res.json(500, {message: 'Problem adding the metric.'});
        }
        return res.json({message: 'Metric added.', id: metric.id, metrickey: metric.metrickey});
      });
    });
  });
};

exports.updateMetric = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  var metric = req.body;
  if(!validator.isNumeric(metric.decimalPlaces) ||
    !validator.isNumeric(metric.axis.x.min) ||
    !validator.isNumeric(metric.axis.x.max) ||
    !validator.isNumeric(metric.axis.y.min) ||
    !validator.isNumeric(metric.axis.y.max) ||
    !validator.isBoolean(metric.axis.x.hide) ||
    !validator.isBoolean(metric.axis.y.hide) ||
    !validator.isUUID(metric.id, 4) ||
    validator.isNull(metric.name) ||
    validator.isNull(metric.suffix)) {
      return res.json(400, {message: 'Invalid metric elements.'});
  }
  _toDataType(metric);
  metrics.get(metric.id, function (error, oldMetric) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating the metric.'});
    }
    oldMetric.name = metric.name;
    oldMetric.description = metric.description;
    oldMetric.suffix = metric.suffix;
    oldMetric.decimalPlaces = metric.decimalPlaces;
    // TODO: X-axis is disabled from changing right now so it should also not be updated in DB either.
    oldMetric.axis = metric.axis;
    metrics.insert(oldMetric, oldMetric.id, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating the metric.'});
      }
      return res.json({message: 'Metric updated.'});
    });
  });
};

exports.updateMetricVisibility = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var metricID = req.body.id;
  var visibility = req.body.visibility;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(metricID, 4) || !validator.isBoolean(visibility)) {
    return res.json(400, {message: 'Missing/Invalid metric elements.'});
  }
  visibility = validator.toBoolean(visibility);
  metrics.get(metricID, function (error, metric) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem updating the metric.'});
    }
    metric.visible = visibility;
    metrics.insert(metric, metricID, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem updating the metric.'});
      }
      return res.json({message: 'Metric updated.'});
    });
  });
};

exports.deleteMetric = function(req, res) {
  if(!req.session.email || !req.session.siteid) {
    return res.json(401, {message: 'Please sign in.'});
  }
  var email = req.session.email;
  var siteid = req.session.siteid;
  var metricID = req.body.id;
  if(!validator.isEmail(email)) {
    return res.json(400, {message: 'Invalid email.'});
  }
  if(!validator.isUUID(siteid, 4)) {
    return res.json(400, {message: 'Invalid site id.'});
  }
  if(!validator.isUUID(metricID, 4)) {
    return res.json(400, {message: 'Missing metric elements.'});
  }
  sites.get(siteid, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem deleting the metric.'});
    }
    var deleted = false;
    for(var metricCounter = 0; metricCounter < reply.metrics.length; metricCounter++) {
      if(reply.metrics[metricCounter] === metricID) {
        reply.metrics.splice(metricCounter, 1);
        deleted = true;
      }
    }
    if(!deleted) {
      return res.json(400, {message: 'Metric does not exist.'});
    }
    sites.insert(reply, siteid, function (error) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Problem deleting the metric.'});
      }
      // Get metric to delete
      metrics.get(metricID, {revs_info: true}, function (err, body) {
        if(err) {
          console.log(err);
          return res.json(500, {message: 'Problem deleting the metric.'});
        }
        // TODO We might not want to truely delete a metric, we might just want to mark as deleted and continue to store for history purposes.
        metrics.destroy(metricID, body._rev, function (err) {
          if(err) {
            console.log(err);
            return res.json(500, {message: 'Problem deleting the metric.'});
          }
          return res.json({message: 'Metric deleted.'});
        });
      });
    });
  });
};

exports.inputMetricData = function(req, res) {
  var metrickey = req.body.metrickey;
  var metricID = req.body.id;
  var dhash = req.body.dhash;
  if(typeof(dhash) !== 'object' || !validator.isInt(dhash.timeStamp) || !validator.isFloat(dhash.value)) {
    return res.json(400, {message: 'Invalid submitted data.'});
  }
  dhash.timeStamp = parseInt(dhash.timeStamp, 10);
  dhash.value = parseFloat(dhash.value, 10);
  if(!validator.isUUID(metricID, 4)) {
    return res.json(400, {message: 'Invalid metric id.'});
  }
  if(validator.isNull(metrickey)) {
    return res.json(400, {message: 'Missing metric key.'});
  }
  metrics.get(metricID, function (error, metric) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Problem submitting metric data.'});
    }
    if(metric.metrickey !== metrickey) {
      return res.json(400, {message: 'Invalid metric key for this metric.'});
    }
    metric.data.push([dhash.timeStamp, dhash.value]);
    _metricAverage(metric.data, function (average) {
      metric.average = average;
      metrics.insert(metric, metricID, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Problem submitting metric data.'});
        }
        return res.json({});
      });
    });
  });
};

validator.extend('isBoolean', function (str) {
  switch(str) {
    case 'true':
    case 'false':
    case '1':
    case '0':
    case 1:
    case 0:
    case true:
    case false:
    return true;
    default:
    return false;
  }
});