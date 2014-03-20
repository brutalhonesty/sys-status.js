/* global sysStatusApp, $ */
'use strict';

sysStatusApp.service('API', ['$http', function ($http) {
  return {
    register: function(registerData) {
      return $http({
        url: '/api/register',
        method: 'POST',
        data: $.param(registerData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    login: function(email, password) {
      var loginData = {
        email: email,
        password: password
      };
      return $http({
        url: '/api/login',
        method: 'POST',
        data: $.param(loginData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    getComponents: function() {
      return $http.get('/api/getComponents');
    },
    setComponent: function(component) {
      return $http({
        url: '/api/setComponent',
        method: 'POST',
        data: $.param(component),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updateComponent: function(updateData) {
      return $http({
        url: '/api/updateComponent',
        method: 'POST',
        data: $.param(updateData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    deleteComponent: function(componentData) {
      return $http({
        url: '/api/deleteComponent',
        method: 'POST',
        data: $.param(componentData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    createIncident: function(incidentData) {
      return $http({
        url: '/api/createIncident',
        method: 'POST',
        data: $.param(incidentData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    getIncidents: function() {
      return $http.get('/api/getIncidents');
    },
    getIncident: function(id) {
      return $http.get('/api/getIncident?id=' + id);
    },
    updateIncident: function(incidentData) {
      return $http({
        url: '/api/updateIncident',
        method: 'POST',
        data: $.param(incidentData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    savePostMortem: function(reportData) {
      return $http({
        url: '/api/savePostMortem',
        method: 'POST',
        data: $.param(reportData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    getPrivateCompany: function() {
      return $http.get('/api/getPrivateCompany');
    },
    getSubscriptions: function() {
      return $http.get('/api/getSubscribers');
    },
    getMetrics: function() {
      return $http.get('/api/getMetrics');
    },
    getMetric: function(id) {
      return $http.get('/api/getMetric?id=' + id);
    },
    createMetric: function(metricData) {
      return $http({
        url: '/api/createMetric',
        method: 'POST',
        data: $.param(metricData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    deleteMetric: function(metricData) {
      return $http({
        url: '/api/deleteMetric',
        method: 'POST',
        data: $.param(metricData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updateMetric: function(metricData) {
      return $http({
        url: '/api/updateMetric',
        method: 'POST',
        data: $.param(metricData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updateMetricVisibility: function(metricData) {
      return $http({
        url: '/api/updateMetricVisibility',
        method: 'POST',
        data: $.param(metricData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    deleteIncident: function(incidentData) {
      return $http({
        url: '/api/deleteIncident',
        method: 'POST',
        data: $.param(incidentData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updatePrevIncident: function(incidentData) {
      return $http({
        url: '/api/updatePrevIncident',
        method: 'POST',
        data: $.param(incidentData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    addMaintenance: function(maintenanceData) {
      delete(maintenanceData.start.date);
      delete(maintenanceData.start.time);
      delete(maintenanceData.end.date);
      delete(maintenanceData.end.time);
      return $http({
        url: '/api/addMaintenance',
        method: 'POST',
        data: $.param(maintenanceData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    getMaintenances: function() {
      return $http.get('/api/getMaintenances');
    },
    deleteMaintenance: function(maintenanceData) {
      return $http({
        url: '/api/deleteMaintenance',
        method: 'POST',
        data: $.param(maintenanceData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updateMaintenanceEvent: function(maintenanceData) {
      return $http({
        url: '/api/updateMaintenanceEvent',
        method: 'POST',
        data: $.param(maintenanceData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updateMaintenance: function(maintenanceData) {
      delete(maintenanceData.start.date);
      delete(maintenanceData.start.time);
      delete(maintenanceData.end.date);
      delete(maintenanceData.end.time);
      return $http({
        url: '/api/updateMaintenance',
        method: 'POST',
        data: $.param(maintenanceData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    updatePrevMaintenance: function(maintenanceData) {
      return $http({
        url: '/api/updatePrevMaintenance',
        method: 'POST',
        data: $.param(maintenanceData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    getMaintenance: function(id) {
      return $http.get('/api/getMaintenance?id=' + id);
    },
    uploadLogo: function(logoData) {
      //By setting ‘Content-Type’: undefined, the browser sets the Content-Type to multipart/form-data for us and fills in the correct boundary. Manually setting ‘Content-Type’: multipart/form-data will fail to fill in the boundary parameter of the request.
      var formData = new FormData();
      formData.append('file', logoData.file || null);
      formData.append('url', logoData.url || null);
      return $http.post('/api/upload/logo', formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    },
    getCustomData: function() {
      return $http.get('/api/getCustomData');
    },
    setCustomData: function(customData) {
      return $http({
        url: '/api/setCustomData',
        method: 'POST',
        data: $.param(customData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    },
    uploadFavicon: function(favData) {
      var formData = new FormData();
      formData.append('file', favData.file || null);
      formData.append('url', favData.url || null);
      return $http.post('/api/upload/favicon', formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    },
    uploadCover: function(coverData) {
      var formData = new FormData();
      formData.append('file', coverData.file || null);
      formData.append('url', coverData.url || null);
      return $http.post('/api/upload/cover', formData, {
        headers: {'Content-Type': undefined},
        transformRequest: angular.identity
      });
    },
    getDomain: function() {
      return $http.get('/api/getDomain');
    },
    updateDomain: function(domainData) {
      return $http({
        url: '/api/updateDomain',
        method: 'POST',
        data: $.param(domainData),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    }
  };
}]);