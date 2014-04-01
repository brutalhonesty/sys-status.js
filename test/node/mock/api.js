'use strict';
var request = require('supertest');
var assert = require('assert');
var colors = require('colors');
var bcrypt = require('bcrypt');
var fs = require('fs');
var config = require('../../../lib/config/config');
var settings = require('../../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);

var app = require('../../../server');

/**
 * Deletes the uploads pictures after the API calls are done testing
 * @param  {Function} done The done() function from mocha
 */
function _deleteUploads(paths, done) {
  fs.unlink(paths.cover, function (err) {
    if(err) {
      return done(err);
    }
    fs.unlink(paths.favicon, function (err) {
      if(err) {
        return done(err);
      }
      fs.unlink(paths.logo, function (err) {
        if(err) {
          return done(err);
        }
        done();
      });
    });
  });
}

function _reCreateDB(userView, sitesView, done) {
  // Delete previous sites database
  nano.db.destroy(settings.couchdb.sites, function (err) {
    if(err) {
      console.log('Error recreating database.'.red);
      return done(err);
    }
    // Create sites database
    nano.db.create(settings.couchdb.sites, function (err) {
      if(err) {
        console.log('Error recreating database.'.red);
        return done(err);
      }
      var sites = nano.db.use(settings.couchdb.sites);
      sites.insert(sitesView, '_design/sites', function (err) {
        if(err) {
          console.log('Error recreating database.'.red);
          return done(err);
        }
        // Delete previous users database
        nano.db.destroy(settings.couchdb.users, function (err) {
          if(err) {
            console.log('Error recreating database.'.red);
            return done(err);
          }
          // Create users database
          nano.db.create(settings.couchdb.users, function (err) {
            if(err) {
              console.log('Error recreating database.'.red);
              return done(err);
            }
            var users = nano.db.use(settings.couchdb.users);
            // Insert views to make lookup calls with
            users.insert(userView, '_design/users', function (err) {
              if(err) {
                console.log('Error recreating database.'.red);
                return done(err);
              }
              // Delete previous metrics database
              nano.db.destroy(settings.couchdb.metrics, function (err) {
                if(err) {
                  console.log('Error recreating database.'.red);
                  return done(err);
                }
                // Create metrics database
                nano.db.create(settings.couchdb.metrics, function (err) {
                  if(err) {
                    console.log('Error recreating database.'.red);
                    return done(err);
                  }
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
}

describe('SysStatus API', function () {

  // To checked out the expanded versions of these, check out http://jsoneditoronline.org/
  var userView = {"views": {"all": {"map": "function(doc) {emit(null, doc) }","reduce": "_count"},"by_email": {"map": "function(doc) {emit(doc.email, doc) }","reduce": "_count"},"by_user": {"map": "function(doc) {emit(doc._id, doc) }","reduce": "_count"}}};
  var sitesView = {"views":{"all":{"map":"function(doc) {emit(null, doc) }","reduce":"_count"},"by_url":{"map":"function(doc) {emit(doc.domain, doc) }","reduce":"_count"},"by_id":{"map":"function(doc) {emit(doc._id, doc) }","reduce":"_count"}}};
  var site = {"siteName":"MySite","domain":"http://example.com","components":[{"id":"886ed7d3-d922-42de-b9f4-0dfb8d80e2d7","name":"MyComponent","description":"MyDescription","status":"Operational"}],"incidents":[{"id":"47e8ef9e-3758-401c-9223-a8a1b7e524a7","name":"MyIncident","events":[{"id":"d4b401c5-1949-4b70-9274-8c55281f6f61","type":"Investigating","message":"MyMessage","date":1395436865568}],"update":1395436865568,"completedTime":null,"postmortem":null}],"maintenance":[{"id":"aadedc7a-cb61-4a98-b668-54df0fd6e013","name":"MyMaintenance","type":"Scheduled","remindSubs":false,"setProgress":false,"startTime":1395719460000,"endTime":1395723060000,"events":[{"id":"48bd075c-3d3c-4b42-9739-5bdf607d46bd","type":"Scheduled","details":"MyMaintenanceDetails","date":1395719378881}],"completedTime":null,"postmortem":null}],"metrics":["88ae5e88-7ce1-429e-bf37-e1886aa561d3"],"members":["06b27b24-139f-4ea5-bf84-8632b0db4698"],"customize":{"logo":"","favicon":"","cover":"","bodyBackground":"ffffff","fontColor":"000000","lightFontColor":"AAAAAA","greenColor":"1CB841","yellowColor":"F1C40F","orangeColor":"E67E22","redColor":"E74C3C","linkColor":"0078E7","borderColor":"E0E0E0","graphColor":"0078E7","headline":"MySite","aboutPage":"My status page!","layoutType":"basic"},"subscribers":{"email":{"count":0,"data":[],"disabled":false},"sms":{"count":0,"data":[],"disabled":false},"webhook":{"count":0,"data":[],"disabled":false},"types":{"autoIncident":false,"indvidIncident":false,"individComponent":false}},"twitter":{"username":"joeshmo", "allowTweets": false, "prefix": "<status>", "suffix": "<siteurl>"}};
  var siteid = 'c9f6d4cc-bb9f-4093-b1ce-f0f7739de75e';
  var user = {"email":"joeshmo@gmail.com","firstName":"","lastName":"","phone":"","password":"","isOwner":true,"siteid":"c9f6d4cc-bb9f-4093-b1ce-f0f7739de75e"};
  var userid = '06b27b24-139f-4ea5-bf84-8632b0db4698';
  var metric = {"id":"88ae5e88-7ce1-429e-bf37-e1886aa561d3","metrickey":"c5c0d50a16ee18d1c9e21769b0d6ad5294a6f98c78d6a23435d8dd4e3b642682","name":"MyMetric","suffix":"reqs/min","visible":false,"description":"MyMetricDescription","decimalPlaces":0,"average":51.40663939923979,"axis":{"y":{"min":0,"max":100,"hide":false},"x":{"min":0,"max":100,"hide":false}},"data":[[1391509126000,2.2798279998824]]};
  var metricid = '88ae5e88-7ce1-429e-bf37-e1886aa561d3';
  var cookie;

  // TODO We should fix the callback hell (http://callbackhell.com/) in the mock testings.
  beforeEach(function (done) {
    // Delete previous sites database
    nano.db.destroy(settings.couchdb.sites, function (err) {
      if(err && err.status_code !== 404) return done(err);
      // console.log('Destroyed Sites DB'.green);
      // Create sites database
      nano.db.create(settings.couchdb.sites, function (err) {
        if(err) return done(err);
        // console.log('Created Sites DB'.green);
        var sites = nano.db.use(settings.couchdb.sites);
        // Insert mock site
        sites.insert(site, siteid, function (err) {
          if(err) return done(err);
          // console.log('Inserted Into Sites DB'.green);
          // Delete previous users database
          sites.insert(sitesView, '_design/sites', function (err) {
            if(err) return done(err);
            nano.db.destroy(settings.couchdb.users, function (err) {
              if(err && err.status_code !== 404) return done(err);
              // console.log('Destroyed Users DB'.green);
              // Create users database
              nano.db.create(settings.couchdb.users, function (err) {
                if(err) return done(err);
                // console.log('Created Users DB'.green);
                var users = nano.db.use(settings.couchdb.users);
                bcrypt.hash('waffles', 10, function (error, hash) {
                  if(error) return done(error);
                  user.password = hash;
                  // Insert mock user
                  users.insert(user, userid, function (err) {
                    if(err) return done(err);
                    // console.log('Inserted Into Users DB'.green);
                    // Insert views to make lookup calls with
                    users.insert(userView, '_design/users', function (err) {
                      if(err) return done(err);
                      // console.log('Inserted View Into Users DB'.green);
                      // Delete previous metrics database
                      nano.db.destroy(settings.couchdb.metrics, function (err) {
                        if(err && err.status_code !== 404) return done(err);
                        // console.log('Destroyed Metrics DB'.green);
                        // Create metrics database
                        nano.db.create(settings.couchdb.metrics, function (err) {
                          if(err) return done(err);
                          // console.log('Created Metrics DB'.green);
                          var metrics = nano.db.use(settings.couchdb.metrics);
                          // Insert mock metric
                          metrics.insert(metric, metricid, function (err) {
                            if(err) return done(err);
                            // console.log('Inserted Into Metrics DB'.green);
                            // Login to the application
                            request(app)
                            .post('/api/login')
                            .send({email: 'joeshmo@gmail.com', password: 'waffles'})
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                              if(err) {
                                console.error(res.body.message.red);
                                return done(err);
                              }
                              cookie = res.headers['set-cookie'];
                              assert.equal(res.body.message, 'Logged in.');
                              assert.equal(res.body.site, site.siteName);
                              assert.equal(res.body.name, user.firstName.length === 0 ? '' : user.firstName + ' ' + user.lastName);
                              done();
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  describe('Components API', function () {
    var componentid;
    describe('GET /api/getComponents', function () {
      describe('when requesting the components', function() {
        it('should return an array of components', function (done) {
          request(app)
          .get('/api/getComponents')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.components[0].id, site.components[0].id);
            componentid = res.body.components[0].id;
            done();
          });
        });
      });
    });
    describe('POST /api/setComponent', function () {
      describe('when submitting a component', function () {
        it('should successfully add a component', function (done) {
          request(app)
          .post('/api/setComponent')
          .send({name: 'MyComponentName', description: 'MyComponentDescription'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Component added.');
            done();
          });
        });
      });
    });
    describe('POST /api/editComponent', function () {
      describe('when editing a component', function () {
        it('should successfully edit a component', function (done) {
          request(app)
          .post('/api/editComponent')
          .send({
            id: componentid,
            name: 'MyMockComponentName',
            description: 'MyMockComponentDescription'
          })
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Component updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateComponent', function () {
      describe('when request to update a component', function () {
        it('should successfully update a component', function (done) {
          request(app)
          .post('/api/updateComponent')
          .send({id: componentid, status: 'Major Outage'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Component updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/deleteComponent', function () {
      describe('when requesting to delete a component', function () {
        it('should successfully delete a component', function (done) {
          request(app)
          .post('/api/deleteComponent')
          .send({id: componentid})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Component deleted.');
            done();
          });
        });
      });
    });
  });
  describe('Incident API', function () {
    var incidentid, eventid;
    describe('GET /api/getIncidents', function () {
      describe('when requesting the incidents', function() {
        it('should return an array of incidents', function (done) {
          request(app)
          .get('/api/getIncidents')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.incidents[0].id, site.incidents[0].id);
            incidentid = res.body.incidents[0].id;
            eventid = res.body.incidents[0].events[0].id;
            done();
          });
        });
      });
    });
    describe('GET /api/getIncident', function () {
      describe('when requesting an incident', function() {
        it('should return a single incident', function (done) {
          request(app)
          .get('/api/getIncident?id=' + incidentid)
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.incident.id, site.incidents[0].id);
            done();
          });
        });
      });
    });
    describe('POST /api/createIncident', function () {
      describe('when creating an incident', function () {
        it('should successfully create an incident', function (done) {
          request(app)
          .post('/api/createIncident')
          .send({name: 'MyMockIncident', type: 'Investigating', message: 'MyMockMessage'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Incident added.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateIncident', function () {
      describe('when updating an incident', function () {
        it('should successfully update the incident', function (done) {
          request(app)
          .post('/api/updateIncident')
          .send({id: incidentid, type: 'Monitoring', message: 'MyNewMockMessage'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Incident updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/updatePrevIncident', function () {
      describe('when updating a previous event in an incident', function () {
        it('should successfully update the event', function (done) {
          request(app)
          .post('/api/updatePrevIncident')
          .send({
            id: eventid,
            type: 'Monitoring',
            date: 1395436865568,
            message: 'MyOldEventMockMessage',
            incidentID: incidentid
          })
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Incident event updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/deleteIncident', function () {
      describe('when deleting an incident', function () {
        it('should successfully delete the incident', function (done) {
          request(app)
          .post('/api/deleteIncident')
          .send({id: incidentid})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Incident deleted.');
            done();
          });
        });
      });
    });
    describe('POST /api/savePostMortem', function () {
      describe('when saving a postmortem report', function () {
        it('should successfully save the report', function (done) {
          request(app)
          .post('/api/savePostMortem')
          .send({id: incidentid, data: 'MyReport\n=======', completed: true})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Report saved.');
            done();
          });
        });
      })
    });
  });
  describe('Maintenance API', function () {
    var maintenanceid, eventid;
    describe('GET /api/getMaintenances', function () {
      describe('when requesting the maintenances', function () {
        it('should return an array of maintenances', function (done) {
          request(app)
          .get('/api/getMaintenances')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body[0].id, site.maintenance[0].id);
            maintenanceid = res.body[0].id;
            eventid = res.body[0].events[0].id
            done();
          });
        });
      });
    });
    describe('GET /api/getMaintenance', function () {
      describe('when requesting a maintenance object', function () {
        it('should successfully return a single maintenance object', function (done) {
          request(app)
          .get('/api/getMaintenance?id=' + maintenanceid)
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.id, site.maintenance[0].id);
            done();
          });
        });
      });
    });
    describe('POST /api/addMaintenance', function () {
      describe('when adding a maintenance request', function () {
        it('should successfully add the maintenance request', function (done) {
          request(app)
          .post('/api/addMaintenance')
          .send({
            name: 'MyMockMaintenance',
            details: 'MyMockDetails',
            start: {
              dateTime: Date.now(Date.UTC()) + 3600 // Add a minute to the start time
            },
            end: {
              dateTime: Date.now(Date.UTC()) + 86400 // Add 24 hours to the end time
            },
            remindSubs: false,
            setProgress: false
          })
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Added maintenance request.');
            done();
          });
        });
      });
    });
    describe('POST /api/deleteMaintenance', function () {
      describe('when deleting a maintenance request', function () {
        it('should successfully delete the maintenance request', function (done) {
          request(app)
          .post('/api/deleteMaintenance')
          .send({id: maintenanceid})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Maintenance request deleted.');
            done();
          });
        });
      })
    });
    describe('POST /api/updateMaintenance', function () {
      describe('when updating a maintenance request', function () {
        it('should successfully update the maintenance request', function (done) {
          request(app)
          .post('/api/updateMaintenance')
          .send({
            id: maintenanceid,
            name: 'MyMockMaintenance',
            details: 'MyMockDetails',
            start: {
              dateTime: Date.now(Date.UTC()) + 3600 // Add a minute to the start time
            },
            end: {
              dateTime: Date.now(Date.UTC()) + 86400 // Add 24 hours to the end time
            },
            remindSubs: false,
            setProgress: false
          })
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Maintenance request updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateMaintenanceEvent', function () {
      describe('when updating a maintenance event', function () {
        it('should successfully update a maintenance event', function (done) {
          request(app)
          .post('/api/updateMaintenanceEvent')
          .send({id: maintenanceid, type: 'Completed', details: 'MyMockEventDetails'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Maintenance request updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/updatePrevMaintenance', function () {
      describe('when updating a previous maintenance event', function () {
        it('should successfully update a previous maintenance event', function (done) {
          request(app)
          .post('/api/updatePrevMaintenance')
          .send({id: eventid,
            type: 'In Progress',
            date: Date.now(Date.UTC()),
            maintenanceID: maintenanceid,
            details: 'MyMockEventDetails'
          })
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Maintenance event updated.');
            done();
          });
        });
      });
    });
  });
  describe('Company API', function () {
    describe('GET /api/getPrivateCompany', function () {
      describe('when getting the company', function () {
        it('should successfully return the whole site', function (done) {
          request(app)
          .get('/api/getPrivateCompany')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.company.siteName, site.siteName);
            done();
          });
        });
      });
    });
    describe('GET /api/getCompany', function () {
      describe('when getting the company', function () {
        it('should successfully return the whole site', function (done) {
          request(app)
          .get('/api/getCompany')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.company.siteName, site.siteName);
            done();
          });
        });
      });
    });
  });
  describe('Upload API', function () {
    var logoPath, faviconPath, coverPath;
    var logoName, faviconName, coverName;
    describe('POST /api/upload/logo', function () {
      describe('when uploading a logo', function () {
        it('should successfully upload the image', function (done) {
          request(app)
          .post('/api/upload/logo')
          .attach('file', __dirname + '/logo.png')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Image registered.');
            logoPath = res.body.path;
            var logoPathArr = logoPath.split('/');
            logoName = logoPathArr[logoPathArr.length - 1];
            done();
          });
        });
      });
    });
    describe('POST /api/upload/favicon', function () {
      describe('when uploading a favicon', function () {
        it('should successfully upload the image', function (done) {
          request(app)
          .post('/api/upload/favicon')
          .attach('file', __dirname + '/favicon.ico')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Image registered.');
            faviconPath = res.body.path;
            var faviconPathArr = faviconPath.split('/');
            faviconName = faviconPathArr[faviconPathArr.length - 1];
            done();
          });
        });
      });
    });
    describe('POST /api/upload/cover', function () {
      describe('when uploading a cover image', function () {
        it('should successfully upload the image', function (done) {
          request(app)
          .post('/api/upload/cover')
          .attach('file', __dirname + '/cover.png')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Image registered.');
            coverPath = res.body.path;
            var coverPathArr = coverPath.split('/');
            coverName = coverPathArr[coverPathArr.length - 1];
            done();
          });
        });
      });
    });
    describe('GET /uploads/logo/:fileName', function () {
      describe('when getting a logo', function () {
        it('should successfully return an image', function (done) {
          request(app)
          .get('/uploads/logo/' + logoName)
          .expect('Content-Type', 'image/png')
          .expect(200, done);
        });
      });
    });
    describe('GET /uploads/favicon/:fileName', function () {
      describe('when getting a favicon', function () {
        it('should successfully return an image', function (done) {
          request(app)
          .get('/uploads/favicon/' + faviconName)
          .expect('Content-Type', 'image/x-icon')
          .expect(200, done);
        });
      });
    });
    describe('GET /uploads/cover/:fileName', function () {
      describe('when getting a cover', function () {
        it('should successfully return an image', function (done) {
          request(app)
          .get('/uploads/cover/' + coverName)
          .expect('Content-Type', 'image/png')
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            var paths = {
              logo: logoPath,
              favicon: faviconPath,
              cover: coverPath
            };
            _deleteUploads(paths, done);
          });
        });
      });
    });
  });
  describe('Cusomtize API', function () {
    var customData = {
      bodyBackground: 'ffffff',
      fontColor: '000000',
      lightFontColor: 'AAAAAA',
      greenColor: '1CB841',
      yellowColor: 'F1C40F',
      orangeColor: 'E67E22',
      redColor: 'E74C3C',
      linkColor: '0078E7',
      borderColor: 'E0E0E0',
      graphColor: '0078E7',
      headline: 'My Mock Headline',
      aboutPage: 'My Mock About Details',
      layoutType: 'basic'
    };
    describe('GET /api/getCustomData', function () {
      describe('when requesting customized data', function () {
        it('should successfully return the customized data', function (done) {
          request(app)
          .get('/api/getCustomData')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.bodyBackground, site.customize.bodyBackground);
            done();
          });
        });
      });
    });
    describe('POST /api/setCustomData', function () {
      describe('when updating customized data', function () {
        it('should successfully set the customized data', function (done) {
          request(app)
          .post('/api/setCustomData')
          .send(customData)
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Settings updated.');
            done();
          });
        });
      });
    });
    describe('GET /api/getDomain', function () {
      describe('when requesting the domain information', function () {
        it('should successfully return the domain information', function (done) {
          request(app)
          .get('/api/getDomain')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.domain, site.domain);
            done();
          });
        });
      });
    });
    describe('POST /api/updateDomain', function () {
      describe('when updating the domain information', function () {
        it('should successfully update the domain information', function (done) {
          request(app)
          .post('/api/updateDomain')
          .send({domain: 'http://mockexample.com'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Domain Updated.');
            done();
          });
        });
      });
    });
  });
  describe('Subscribers API', function () {
    describe('GET /api/getSubscribers', function () {
      describe('when requesting subscribers data', function () {
        it('should successfully return the subscribers data', function (done) {
          request(app)
          .get('/api/getSubscribers')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.subscribers.email.count, site.subscribers.email.count);
            assert.equal(res.body.subscribers.sms.count, site.subscribers.sms.count);
            assert.equal(res.body.subscribers.webhook.count, site.subscribers.webhook.count);
            done();
          });
        });
      });
    });
    describe('POST /api/createSubscriber', function () {
      describe('when creating a subscriber', function () {
        it('should successfully create a subscriber via email', function (done) {
          request(app)
          .post('/api/createSubscriber')
          .send({type: 'email', data: {email: 'johnsmith@gmail.com'}})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Subscription added.');
            done();
          });
        });
        it('should successfully create a subscriber via sms', function (done) {
          request(app)
          .post('/api/createSubscriber')
          .send({type: 'sms', data: {phone: '555-555-5555'}})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Subscription added.');
            done();
          });
        });
        it('should successfully create a subscriber via a webhook', function (done) {
          request(app)
          .post('/api/createSubscriber')
          .send({type: 'webhook', data: {webhook: 'http://mymockwebhook.com/'}})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Subscription added.');
            done();
          });
        });
      });
    });
  });
  describe('Metrics API', function () {
    var metricid, metrickey;
    describe('GET /api/getMetrics', function () {
      describe('when requesting the metrics', function () {
        it('should successfully return the metrics', function (done) {
          request(app)
          .get('/api/getMetrics')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.error(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body[0].id, metric.id);
            assert.equal(res.body[0].metrickey, metric.metrickey);
            metricid = res.body[0].id;
            metrickey = res.body[0].metrickey;
            done();
          });
        });
      });
    });
    describe('GET /api/getMetric', function () {
      describe('when requesting a metric', function () {
        it('should successfully return the metric', function (done) {
          request(app)
          .get('/api/getMetric?id=' + metricid)
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.metric.id, metric.id);
            done();
          });
        });
      });
    });
    describe('POST /api/createMetric', function () {
      describe('when creating a metric', function () {
        it('should successfully create a metric', function (done) {
          request(app)
          .post('/api/createMetric')
          .send({name: 'MyMockMetric', suffix: 'reqs/min'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Metric added.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateMetric', function () {
      describe('when updating a metric', function () {
        it('should successfully update a metric', function (done) {
          request(app)
          .post('/api/updateMetric')
          .expect('Content-Type', /json/)
          .send({
            id: metricid,
            decimalPlaces: 0,
            name: 'MyMockMetric',
            axis: {
              x: {
                min: 0,
                max: 100,
                hide: false
              },
              y: {
                min: 0,
                max: 100,
                hide: false
              }
            },
            suffix: 'reqs/min',
            description: 'MyMockDescription'
          })
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Metric updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateMetricVisibility', function () {
      describe('when updating the metric visibility', function () {
        it('should successfully update the metric visibility', function (done) {
          request(app)
          .post('/api/updateMetricVisibility')
          .expect('Content-Type', /json/)
          .send({
            id: metricid,
            visibility: true
          })
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Metric updated.');
            done();
          });
        });
      });
    });
    describe('POST /api/deleteMetric', function () {
      describe('when deleting a metric', function () {
        it('should successfully delete the metric', function (done) {
          request(app)
          .post('/api/deleteMetric')
          .expect('Content-Type', /json/)
          .send({id: metricid})
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Metric deleted.');
            done();
          });
        });
      });
    });
    describe('POST /api/inputMetricData', function () {
      describe('when inserting metric data', function () {
        it('should successfully insert metric data', function (done) {
          request(app)
          .post('/api/inputMetricData')
          .expect('Content-Type', /json/)
          .send({
            dhash: {
              timeStamp: Date.now(Date.UTC()),
              value: 123.92839
            },
            metrickey: metrickey,
            id: metricid
          })
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(typeof(res.body), 'object');
            assert.equal(Object.keys(res.body).length, 0);
            done();
          });
        });
      });
    });
  });
  describe('Team Members API', function () {
    describe('GET /api/getMembers', function () {
      describe('when getting the team members', function () {
        it('should successfully return the members', function (done) {
          request(app)
          .get('/api/getMembers')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.members[0]._id, userid);
            done();
          });
        });
      })
    })
    describe('POST /api/addMember', function () {
      describe('when adding a new team member', function () {
        it('should successfully add the team member', function (done) {
          request(app)
          .post('/api/addMember')
          .send({email: 'mymockmember@gmail.com'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Team member added.');
            done();
          });
        });
      });
    });
  });
  describe('USER API', function () {
    describe('GET /api/logout', function () {
      describe('when logging out a user',function () {
        it('should successfully log the user out', function (done) {
          request(app)
          .get('/api/logout')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Logged out.');
            done();
          });
        });
      });
    });
    describe('POST /api/register', function () {
      var site = {
        name: 'MyMockSite',
        domain: 'http://mymocksite.com',
        email: 'mymockmember@gmail.com',
        password: 'mymockpassword'
      };
      describe('when registering a site', function () {
        it('should successfully register the site', function (done) {
          request(app)
          .post('/api/register')
          .expect('Content-Type', /json/)
          .send(site)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Registered.');
            assert.equal(res.body.site, site.name);
            done();
          });
        });
      });
    });
    describe('GET /api/getProfile', function () {
      describe('when getting the user\'s profile', function () {
        it('should successfully return the profile', function (done) {
          request(app)
          .get('/api/getProfile')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.profile.email, user.email);
            done();
          });
        });
      });
    });
    describe('POST /api/updateProfile', function () {
      describe('when updaing the user\'s profile', function () {
        it('should successfully update the profile', function (done) {
          request(app)
          .post('/api/updateProfile')
          .send({lastName: 'Shmo', firstName: 'Joe', phone: '555-555-5555', email: 'joeshmo@gmail.com'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Profile updated.');
            assert.equal(res.body.name, 'Joe Shmo');
            done();
          });
        });
      });
    });
    describe('POST /api/changePassword', function () {
      describe('when updating the user\'s password', function () {
        it('should successfully update the password', function (done) {
          request(app)
          .post('/api/changePassword')
          .send({oldPassword: 'waffles', newPassword: 'waffles123', confirmNewPassword: 'waffles123'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Password updated.');
            done();
          });
        });
      });
    });
  });
  describe('Integration API', function () {
    describe('GET /api/getTwitter', function () {
      describe('when getting Twitter data', function () {
        it('should successfully return the Twitter data', function (done) {
          request(app)
          .get('/api/getTwitter')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.twitter.username, site.twitter.username);
            done();
          });
        });
      });
    });
    // We cannot test with adding in a api key and secret for Twitter to the settings file.
    /*describe('POST /api/storeTwitter', function () {
      describe('when storing Twitter information', function () {
        it('should successfully store the Twitter information', function (done) {
          request(app)
          .post('/api/storeTwitter')
          .send({oauth_token: 'blah', oauth_token_secret: 'shhhQuiet!'})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Twitter settings added.');
            done();
          });
        });
      });
    });*/
    describe('POST /api/removeTwitter', function () {
      describe('when removing Twitter information', function () {
        it('should successfully remove the Twitter information', function (done) {
          request(app)
          .get('/api/removeTwitter')
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Twitter settings removed.');
            done();
          });
        });
      });
    });
    describe('POST /api/updateTwitter', function () {
      describe('when updating Twitter information', function () {
        it('should successfully update the Twitter information', function (done) {
          request(app)
          .post('/api/updateTwitter')
          .send({prefix: '', suffix: '', allowTweets: true})
          .expect('Content-Type', /json/)
          .set('cookie', cookie)
          .expect(200)
          .end(function (err, res) {
            if(err) {
              console.log(res.body.message.red);
              return done(err);
            }
            assert.equal(res.body.message, 'Twitter settings updated.');
            _reCreateDB(userView, sitesView, done);
          });
        });
      });
    });
  });
});