'use strict';
var request = require('supertest');
var assert = require('assert');
var colors = require('colors');
var config = require('../../../lib/config/config');
var settings = require('../../../lib/controllers/settings');
var nano = require('nano')(settings.couchdb.url);

var app = require('../../../server');

describe('SysStatus API', function () {

  // To checked out the expanded versions of these, check out http://jsoneditoronline.org/
  var userView = {views: {"all": {"map": "function(doc) {emit(null, doc) }","reduce": "_count"},"by_email": {"map": "function(doc) {emit(doc.email, doc) }","reduce": "_count"},"by_user": {"map": "function(doc) {emit(doc._id, doc) }","reduce": "_count"}}};
  var site = {"siteName":"MySite","domain":"http://example.com","components":[{"id":"886ed7d3-d922-42de-b9f4-0dfb8d80e2d7","name":"MyComponent","description":"MyDescription","status":"Operational"}],"incidents":[{"id":"47e8ef9e-3758-401c-9223-a8a1b7e524a7","name":"MyIncident","events":[{"id":"d4b401c5-1949-4b70-9274-8c55281f6f61","type":"Investigating","message":"MyMessage","date":1395436865568}],"update":1395436865568,"completedTime":null,"postmortem":null}],"maintenance":[{"id":"aadedc7a-cb61-4a98-b668-54df0fd6e013","name":"MyMaintenance","type":"Scheduled","remindSubs":false,"setProgress":false,"startTime":1395719460000,"endTime":1395723060000,"events":[{"id":"48bd075c-3d3c-4b42-9739-5bdf607d46bd","type":"Scheduled","details":"MyMaintenanceDetails","date":1395719378881}],"completedTime":null,"postmortem":null}],"metrics":["88ae5e88-7ce1-429e-bf37-e1886aa561d3"],"members":["06b27b24-139f-4ea5-bf84-8632b0db4698"],"customize":{"logo":"","favicon":"","cover":"","bodyBackground":"ffffff","fontColor":"000000","lightFontColor":"AAAAAA","greenColor":"1CB841","yellowColor":"F1C40F","orangeColor":"E67E22","redColor":"E74C3C","linkColor":"0078E7","borderColor":"E0E0E0","graphColor":"0078E7","headline":"MySite","aboutPage":"My status page!","layoutType":"basic"},"subscribers":{"email":{"count":0,"data":[],"disabled":false},"sms":{"count":0,"data":[],"disabled":false},"webhook":{"count":0,"data":[],"disabled":false},"types":{"autoIncident":false,"indvidIncident":false,"individComponent":false}}};
  var siteid = 'c9f6d4cc-bb9f-4093-b1ce-f0f7739de75e';
  var user = {"email":"joeshmo@gmail.com","firstName":"Joe","lastName":"Shmo","phone":"","password":"$2a$10$4EmeMSBNdovYIyyTUW6iueTaEzeCXCJ.WTcGOGgFU5KiUviJeLFXq","isOwner":true,"siteid":"c9f6d4cc-bb9f-4093-b1ce-f0f7739de75e"};
  var userid = '06b27b24-139f-4ea5-bf84-8632b0db4698';
  var metric = {"id":"88ae5e88-7ce1-429e-bf37-e1886aa561d3","metrickey":"c5c0d50a16ee18d1c9e21769b0d6ad5294a6f98c78d6a23435d8dd4e3b642682","name":"MyMetric","suffix":"reqs/min","visible":false,"description":"MyMetricDescription","decimalPlaces":0,"average":51.40663939923979,"axis":{"y":{"min":0,"max":100,"hide":false},"x":{"min":0,"max":100,"hide":false}},"data":[[1391509126000,2.2798279998824],[1391509426000,71.93394717760384],[1391509726000,47.1880299737677],[1391510026000,22.96928984578699],[1391510326000,77.911517303437],[1391510626000,36.290781712159514],[1391510926000,81.67001761030406],[1391511226000,35.232820734381676],[1391511526000,32.342112553305924],[1391511826000,31.066758139058948],[1391512126000,55.44260782189667],[1391512426000,2.3968492401763797],[1391512726000,62.9243228584528],[1391513026000,94.76854358799756],[1391513326000,64.14343379437923],[1391513626000,56.724655511789024],[1391513926000,32.82505236566067],[1391514226000,92.1302431030199],[1391514526000,81.95754820480943],[1391514826000,85.71722668129951],[1391515126000,33.875234820879996],[1391515426000,18.148271343670785],[1391515726000,93.7437898479402],[1391516026000,42.575450567528605],[1391516326000,33.627826580777764],[1391516626000,37.968967435881495],[1391516926000,12.062922585755587],[1391517226000,13.873387966305017],[1391517526000,54.24688053317368],[1391517826000,72.66754393931478],[1391518126000,24.315243517048657],[1391518426000,28.484817780554295],[1391518726000,6.504750391468406],[1391519026000,59.02239952702075],[1391519326000,21.562627190724015],[1391519626000,1.533134700730443],[1391519926000,65.07830414921045],[1391520226000,43.5399332549423],[1391520526000,82.1577297989279],[1391520826000,31.736525893211365],[1391521126000,26.053892308846116],[1391521426000,71.01820970419794],[1391521726000,45.29880390036851],[1391522026000,76.4412157703191],[1391522326000,56.92658119369298],[1391522626000,37.63926303945482],[1391522926000,88.99351758882403],[1391523226000,84.9959091283381],[1391523526000,54.43716775625944],[1391523826000,70.82524523139],[1391524126000,84.26847006194293],[1391524426000,21.594268991611898],[1391524726000,17.427729652263224],[1391525026000,74.06825553625822],[1391525326000,44.926696782931685],[1391525626000,15.810385392978787],[1391525926000,67.0688541373238],[1391526226000,68.88940772041678],[1391526526000,18.982579582370818],[1391526826000,62.14370906818658],[1391527126000,9.66747235506773],[1391527426000,52.23941709846258],[1391527726000,64.33511269278824],[1391528026000,71.9908719882369],[1391528326000,47.34931632410735],[1391528626000,87.90316595695913],[1391528926000,75.12295788619667],[1391529226000,6.305596092715859],[1391529526000,3.080255025997758],[1391529826000,61.445594346150756],[1391530126000,56.01469718385488],[1391530426000,66.76345714367926],[1391530726000,26.94374762941152],[1391531026000,5.922662955708802],[1391531326000,70.2563093509525],[1391531626000,26.37754804454744],[1391531926000,99.79697233065963],[1391532226000,68.23279291857034],[1391532526000,45.6523688044399],[1391532826000,79.22664401121438],[1391533126000,33.0005147960037],[1391533426000,90.93715755734593],[1391533726000,98.89168201480061],[1391534026000,45.01161859370768],[1391534326000,7.4729448184370995],[1391534626000,48.03630912210792],[1391534926000,44.86643453128636],[1391535226000,72.34754299279302],[1391535526000,59.42453150637448],[1391535826000,93.90321881510317],[1391536126000,53.85487787425518],[1391536426000,73.44005345366895],[1391536726000,9.367239428684115],[1391537026000,13.763560820370913],[1391537326000,94.75936973467469],[1391537626000,90.1134458836168],[1391537926000,82.94689527247101],[1391538226000,94.76328634191304],[1391538526000,34.87182550597936],[1391538826000,41.81298012845218]]};
  var metricid = '88ae5e88-7ce1-429e-bf37-e1886aa561d3';
  var cookie;

  // TODO We should fix the callback hell (http://callbackhell.com/) in the mock testings.
  beforeEach(function (done) {
    // Delete previous sites database
    nano.db.destroy(settings.couchdb.sites, function () {
      // Create sites database
      nano.db.create(settings.couchdb.sites, function() {
        var sites = nano.db.use(settings.couchdb.sites);
        // Insert mock site
        sites.insert(site, siteid, function (err, body) {
          // Delete previous users database
          nano.db.destroy(settings.couchdb.users, function () {
            // Create users database
            nano.db.create(settings.couchdb.users, function() {
              var users = nano.db.use(settings.couchdb.users);
              // Insert mock user
              users.insert(user, userid, function (err, body) {
                // Insert views to make lookup calls with
                users.insert(userView, '_design/users', function (err, body) {
                  // Delete previous metrics database
                  nano.db.destroy(settings.couchdb.metrics, function () {
                    // Create metrics database
                    nano.db.create(settings.couchdb.metrics, function() {
                      var metrics = nano.db.use(settings.couchdb.metrics);
                      // Inset mock metric
                      metrics.insert(metric, metricid, function (err,body) {
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
                          assert.equal(res.body.name, site.siteName);
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
          .send({id: eventid, type: 'Monitoring', date: 1395436865568, message: 'MyOldEventMockMessage', incidentID: incidentid})
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
    /*describe('POST /api/updateMaintenance')
    describe('POST /api/updateMaintenanceEvent')
    describe('POST /api/updatePrevMaintenance')*/
  });
});
/*

mock.get('/api/getPrivateCompany')
mock.get('/api/getCompany')

mock.get('/uploads/logo/:fileName')
mock.get('/uploads/favicon/:fileName')
mock.get('/uploads/cover/:fileName')
mock.get('/api/getCustomData')
mock.post('/api/setCustomData')
mock.post('/api/upload/logo')
mock.post('/api/upload/favicon')
mock.post('/api/upload/cover')
mock.post('/api/updateDomain')
mock.get('/api/getDomain')

mock.get('/api/getSubscribers')
mock.get('/api/createSubscriber')

mock.get('/api/getMetrics')
mock.get('/api/getMetric')
mock.post('/api/createMetric')
mock.post('/api/updateMetric')
mock.post('/api/updateMetricVisibility')
mock.post('/api/deleteMetric')
mock.post('/api/inputMetricData')

mock.get('/api/getMembers')
mock.post('/api/addMember')

mock.post('/api/register')
mock.post('/api/login')
mock.get('/api/logout')

mock.clean();*/