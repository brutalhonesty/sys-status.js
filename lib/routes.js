'use strict';

var register = require('./controllers/register');
var login = require('./controllers/login');
var logout = require('./controllers/logout');

var components = require('./controllers/components');
var incidents = require('./controllers/incidents');
var company = require('./controllers/company');
var subscribers = require('./controllers/subscribers');
var maintenance = require('./controllers/maintenance');
var metrics = require('./controllers/metrics');
var customize = require('./controllers/customize');

var index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/getComponents', components.getComponents);
  app.post('/api/setComponent', components.setComponent);
  app.post('/api/updateComponent', components.updateComponent);
  app.post('/api/deleteComponent', components.deleteComponent);

  app.get('/api/getIncident', incidents.getIncident);
  app.get('/api/getIncidents', incidents.getIncidents);
  app.post('/api/createIncident', incidents.createIncident);
  app.post('/api/updateIncident', incidents.updateIncident);
  app.post('/api/updatePrevIncident', incidents.updatePrevIncident);
  app.post('/api/deleteIncident', incidents.deleteIncident);

  app.post('/api/addMaintenance', maintenance.addMaintenance);
  app.get('/api/getMaintenance', maintenance.getMaintenance);
  app.get('/api/getMaintenances', maintenance.getMaintenances);
  app.post('/api/deleteMaintenance', maintenance.deleteMaintenance);
  app.post('/api/updateMaintenance', maintenance.updateMaintenance);
  app.post('/api/updateMaintenanceEvent', maintenance.updateMaintenanceEvent);
  app.post('/api/updatePrevMaintenance', maintenance.updatePrevMaintenance);

  app.get('/api/getPrivateCompany', company.getPrivateCompany);
  app.get('/api/getCompany', company.getCompany);

  app.get('/uploads/logo/:fileName', customize.retrieveUpload);
  app.get('/uploads/favicon/:fileName', customize.retrieveUpload);
  app.get('/api/getCustomData', customize.getCustomData);
  app.post('/api/upload/logo', customize.uploadLogo);
  app.post('/api/upload/favicon', customize.uploadFavicon);

  app.get('/api/getSubscribers', subscribers.getSubscribers);
  app.get('/api/createSubscriber', subscribers.createSubscriber);

  app.get('/api/getMetrics', metrics.getMetrics);
  app.get('/api/getMetric', metrics.getMetric);
  app.post('/api/createMetric', metrics.createMetric);
  app.post('/api/updateMetric', metrics.updateMetric);
  app.post('/api/updateMetricVisibility', metrics.updateMetricVisibility);
  app.post('/api/deleteMetric', metrics.deleteMetric);
  app.post('/api/inputMetricData', metrics.inputMetricData);

  app.post('/api/register', register.register);
  app.post('/api/login', login.login);
  app.get('/api/logout', logout.logout);

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};