/* jshint unused: false */
'use strict';

var sysStatusApp = angular.module('sysStatusApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'nvd3ChartDirectives', 'ui.ace', 'angularMoment', 'ui.bootstrap']).config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/main',
    controller: 'MainCtrl'
  }).when('/login', {
    templateUrl: 'partials/login',
    controller: 'LoginCtrl'
  }).when('/statusPage', {
    templateUrl: 'partials/statusPage',
    controller: 'StatusPageCtrl'
  }).when('/getStarted', {
    templateUrl: 'partials/getStarted',
    controller: 'GetStartedCtrl'
  }).when('/dashboard', {
    templateUrl: 'partials/dashboard',
    controller: 'DashboardCtrl'
  }).when('/components', {
    templateUrl: 'partials/components',
    controller: 'ComponentsCtrl'
  }).when('/incidents', {
    templateUrl: 'partials/incidents/incidents',
    controller: 'IncidentsCtrl'
  }).when('/incidents/maintenance', {
    templateUrl: 'partials/incidents/maintenance',
    controller: 'MaintenancesCtrl'
  }).when('/incidents/maintenance/new', {
    templateUrl: 'partials/incidents/newMaintenance',
    controller: 'MaintenancesCtrl'
  }).when('/incidents/maintenance/:id', {
    templateUrl: 'partials/incidents/updateMaintenance',
    controller: 'MaintenanceCtrl'
  }).when('/incidents/maintenance/:id/details', {
    templateUrl: 'partials/incidents/maintenanceDetails',
    controller: 'MaintenanceCtrl'
  }).when('/incidents/templates', {
    templateUrl: 'partials/incidents/templates',
    controller: 'TemplatesCtrl'
  }).when('/incident/:id', {
    templateUrl: 'partials/incidents/incident',
    controller: 'IncidentCtrl'
  }).when('/notifications', {
    templateUrl: 'partials/notifications/notifications',
    controller: 'NotificationsCtrl'
  }).when('/notifications/settings', {
    templateUrl: 'partials/notifications/settings',
    controller: 'NotificationsCtrl'
  }).when('/notifications/faq', {
    templateUrl: 'partials/notifications/FAQ',
    controller: 'NotificationsCtrl'
  }).when('/metrics', {
    templateUrl: 'partials/metrics/metrics',
    controller: 'MetricsCtrl'
  }).when('/metric/:id', {
    templateUrl: 'partials/metrics/metric',
    controller: 'MetricCtrl'
  }).when('/metrics/dataSources', {
    templateUrl: 'partials/metrics/dataSources',
    controller: 'MetricSourceCtrl'
  }).when('/metrics/tutorials', {
    templateUrl: 'partials/metrics/tutorials'
  }).when('/customize', {
    templateUrl: 'partials/customize/customize',
    controller: 'CustomizeCtrl'
  }).when('/customize/url', {
    templateUrl: 'partials/customize/url',
    controller: 'CustomizeURLCtrl'
  }).when('/customize/code', {
    templateUrl: 'partials/customize/code',
    controller: 'CustomizeCodeCtrl'
  }).otherwise({
    redirectTo: '/'
  });
  $locationProvider.html5Mode(true);
});