var validator = require('validator');
var redis = require('redis');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var fs = require('fs');
var uuid = require('node-uuid');
var settings = require('./settings.js');

var client = redis.createClient(settings.redis.port, settings.redis.ip);

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
        } else if(obj[key] === 'true' || obj[key] === 'false') {
            obj[key] = validator.toBoolean(obj[key]); // strict option available
        } else if(obj[key] instanceof Array) {
            for(var counter = 0; counter < obj[key].length; counter++) {
                _toDataType(obj[key][counter]);
            }
        }
    }
}

exports.getMetrics = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting metrics.'});
        }
        try {
            reply = JSON.parse(reply);
        } catch(e) {
            return res.json(400, {message: 'Invalid email.'});
        }
        if(reply.metrics.length === 0) {
            return res.json([]);
        }
        for(var metricCounter = 0; metricCounter < reply.metrics.length; metricCounter++) {
            reply.metrics[metricCounter] = 'metric:' + reply.metrics[metricCounter];
        }
        client.mget(reply.metrics, function (error, metrics) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem getting metrics.'});
            }
            if(reply.metrics.length === 1) {
                try {
                    metrics = JSON.parse(metrics);
                    return res.json([metrics]);
                } catch(e) {
                    console.log(e);
                    return res.json(500, {message: 'Problem getting metrics.'});
                }
            }
            var newMetrics = [];
            for(var metricCounter = 0; metricCounter < metrics.length; metricCounter++) {
                try {
                    var metric = JSON.parse(metrics[metricCounter]);
                    newMetrics.push(metric);
                } catch(e) {
                    console.log(e);
                    return res.json(500, {message: 'Problem getting metrics.'});
                }
            }
            return res.json(newMetrics);
        });
    });
};

exports.getMetric = function(req, res) {
    var metricID = req.query.id;
    if(validator.isNull(metricID)) {
        return res.json(400, {message: 'Missing metric id.'});
    }
    client.get('metric:' + metricID, function (error, metric) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem getting metric.'});
        }
        try {
            metric = JSON.parse(metric);
            _getMetricTemplate(metric.id, metric.metrickey, function (error, template) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem getting metric.'});
                }
                return res.json({metric: metric, template: template});
            });
        } catch(e) {
            return res.json(400, {message: 'Metric does not exist.'});
        }
    });
};

exports.createMetric = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
    var displayName = req.body.name;
    var displaySuffix = req.body.suffix;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(displayName) || validator.isNull(displaySuffix)) {
        return res.json(400, {message: 'Missing metric elements.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem adding the metric.'});
        }
        try {
            reply = JSON.parse(reply);
            var metricID = uuid.v4();
            var metric = {
                id: metricID,
                metrickey: crypto.createHash('sha256').update(metricID).update(settings.crypto.salt).digest('hex'),
                name: displayName,
                suffix: displaySuffix,
                visible: false,
                description: '',
                decimalPlaces: 0,
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
            client.set('metric:' + metricID, JSON.stringify(metric), function(error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem adding the metric.'});
                }
                client.set(email, JSON.stringify(reply), function (error) {
                    if(error) {
                        console.log(error);
                        // Delete the metric we just added, hopefully we can access it :D
                        client.del('metric:' + metricID, function (error) {
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
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.updateMetric = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    // TODO delete req.body.email client-side
    var metric = req.body;
    if(!validator.isNumeric(metric.decimalPlaces) ||
        !validator.isNumeric(metric.axis.x.min) ||
        !validator.isNumeric(metric.axis.x.max) ||
        !validator.isNumeric(metric.axis.y.min) ||
        !validator.isNumeric(metric.axis.y.max) ||
        !validator.isUUID(metric.id, 4) ||
        validator.isNull(metric.name) ||
        validator.isNull(metric.suffix)) {
        return res.json(400, {message: 'Invalid metric elements.'});
    }
    _toDataType(metric);
    client.get('metric:' + metric.id, function (error, oldMetric) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem updating the metric.'});
        }
        try {
            oldMetric = JSON.parse(oldMetric);
            oldMetric.name = metric.name;
            oldMetric.description = metric.description;
            oldMetric.suffix = metric.suffix;
            oldMetric.decimalPlaces = metric.decimalPlaces;
            // TODO: X-axis is disabled from changing right now so it should also not be updated in DB either.
            oldMetric.axis = metric.axis;
            client.set('metric:' + oldMetric.id, JSON.stringify(oldMetric), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem updating the metric.'});
                }
                return res.json({message: 'Metric updated.'});
            });
        } catch(e) {
            console.log(e);
            res.json(400, {message: 'Metric does not exist.'});
        }
    });
};

exports.updateMetricVisibility = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
    var metricID = req.body.id;
    var visibility = req.body.visibility;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(metricID) || validator.isNull(visibility) || (visibility !== 'true' && visibility !== 'false')) {
        return res.json(400, {message: 'Missing/Invalid metric elements.'});
    }
    visibility = validator.toBoolean(visibility, true);
    client.get('metric:' + metricID, function (error, metric) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem updating the metric.'});
        }
        try {
            metric = JSON.parse(metric);
            metric.visible = visibility;
            client.set('metric:' + metricID, JSON.stringify(metric), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem updating the metric.'});
                }
                return res.json({message: 'Metric updated.'});
            });
        } catch(e) {
            console.log(e);
            return res.json(500, {message: 'Problem updating the metric.'});
        }
    });
};

exports.deleteMetric = function(req, res) {
    if(!req.session.email) {
        return res.json(401, {message: 'Please sign in.'});
    }
    var email = req.session.email;
    var metricID = req.body.id;
    if(!validator.isEmail(email)) {
        return res.json(400, {message: 'Invalid email.'});
    }
    if(validator.isNull(metricID)) {
        return res.json(400, {message: 'Missing metric elements.'});
    }
    client.get(email, function (error, reply) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem deleting the metric.'});
        }
        try {
            reply = JSON.parse(reply);
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
            client.set(email, JSON.stringify(reply), function (error) {
                if(error) {
                    console.log(error);
                    return res.json(500, {message: 'Problem deleting the metric.'});
                }
                client.del('metric:' + metricID, function (err) {
                    if(err) {
                        console.log(err);
                        return res.json(500, {message: 'Problem deleting the metric.'});
                    }
                    return res.json({message: 'Metric deleted.'});
                });
            });
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Invalid email.'});
        }
    });
};

exports.inputMetricData = function(req, res) {
    var metrickey = req.body.metrickey;
    var metricID = req.body.metricID;
    var dhash = req.body.dhash;
    if(typeof(dhash) !== 'object' || !validator.isInt(dhash.timeStamp) || !validator.isFloat(dhash.value)) {
        return res.json(400, {message: 'Invalid submitted data.'});
    }
    dhash.timeStamp = parseInt(dhash.timeStamp, 10);
    dhash.value = parseFloat(dhash.value, 10);
    if(!validator.isUUID(metricID, 4)) {
        // TODO may some throttling to prevent bruteforce
        return res.json(400, {message: 'Invalid metric id.'});
    }
    if(validator.isNull(metrickey)) {
        return res.json(400, {message: 'Missing metric key.'});
    }
    client.get('metric:' + metricID, function (error, metric) {
        if(error) {
            console.log(error);
            return res.json(500, {message: 'Problem submitting metric data.'});
        }
        try {
            // TODO may some throttling to prevent bruteforce
            metric = JSON.parse(metric);
        } catch(e) {
            console.log(e);
            return res.json(400, {message: 'Metric does not exist.'});
        }
        if(metric.metrickey !== metrickey) {
            return res.json(400, {message: 'Invalid metric key for this metric.'});
        }
        metric.data.push([dhash.timeStamp, dhash.value]);
        client.set('metric:' + metricID, JSON.stringify(metric), function (error) {
            if(error) {
                console.log(error);
                return res.json(500, {message: 'Problem submitting metric data.'});
            }
            return res.json({});
        });
    });
};