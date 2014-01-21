'use strict';

var api = require('./controllers/api'),
    index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/getComponents', api.getComponents);
  app.post('/api/setComponent', api.setComponent);
  app.post('/api/updateComponent', api.updateComponent);

  app.get('/api/getIncidents', api.getIncidents);
  app.post('/api/createIncident', api.createIncident);

  app.get('/api/getCompany', api.getCompany);

  app.post('/api/register', api.register);
  app.post('/api/login', api.login);
  app.get('/api/logout', api.logout);
  

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};