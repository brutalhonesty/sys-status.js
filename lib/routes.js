'use strict';

var users = require('./controllers/users');

var components = require('./controllers/components');
var incidents = require('./controllers/incidents');
var company = require('./controllers/company');
var subscribers = require('./controllers/subscribers');
var maintenance = require('./controllers/maintenance');
var metrics = require('./controllers/metrics');
var customize = require('./controllers/customize');
var team = require('./controllers/team');
var integration = require('./controllers/integration');

var index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/getComponents', components.getComponents);
  app.post('/api/setComponent', components.setComponent);
  app.post('/api/editComponent', components.editComponent);
  app.post('/api/updateComponent', components.updateComponent);
  app.post('/api/deleteComponent', components.deleteComponent);

  app.get('/api/getIncident', incidents.getIncident);
  app.get('/api/getIncidents', incidents.getIncidents);
  app.post('/api/createIncident', incidents.createIncident);
  app.post('/api/updateIncident', incidents.updateIncident);
  app.post('/api/updatePrevIncident', incidents.updatePrevIncident);
  app.get('/api/getIncidentHistory', incidents.getIncidentHistory);
  app.post('/api/deleteIncident', incidents.deleteIncident);
  app.post('/api/savePostMortem', incidents.savePostMortem);

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
  app.get('/uploads/cover/:fileName', customize.retrieveUpload);
  app.get('/api/getCustomData', customize.getCustomData);
  app.post('/api/setCustomData', customize.setCustomData);
  app.post('/api/upload/logo', customize.uploadLogo);
  app.post('/api/upload/favicon', customize.uploadFavicon);
  app.post('/api/upload/cover', customize.uploadCover);
  app.post('/api/updateDomain', customize.updateDomain);
  app.get('/api/getDomain', customize.getDomain);

  app.get('/api/getSubscribers', subscribers.getSubscribers);
  app.post('/api/createSubscriber', subscribers.createSubscriber);

  app.get('/api/getMetrics', metrics.getMetrics);
  app.get('/api/getMetric', metrics.getMetric);
  app.post('/api/createMetric', metrics.createMetric);
  app.post('/api/updateMetric', metrics.updateMetric);
  app.post('/api/updateMetricVisibility', metrics.updateMetricVisibility);
  app.post('/api/deleteMetric', metrics.deleteMetric);
  app.post('/api/inputMetricData', metrics.inputMetricData);

  app.get('/api/getMembers', team.getMembers);
  app.post('/api/addMember', team.addMember);

  app.post('/api/register', users.register);
  app.get('/api/checkCookie', users.checkCookie);
  app.get('/api/getProfile', users.getProfile);
  app.post('/api/updateProfile', users.updateProfile);
  app.post('/api/changePassword', users.changePassword);
  app.post('/api/login', users.login);
  app.get('/api/logout', users.logout);

  app.get('/api/getTwitter', integration.getTwitter);
  app.post('/api/storeTwitter', integration.storeTwitter);
  app.post('/api/updateTwitter', integration.updateTwitter);
  app.get('/api/removeTwitter', integration.removeTwitter);

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};