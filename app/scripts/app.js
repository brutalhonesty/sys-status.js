/* jshint unused: false */
'use strict';

var sysStatusApp = angular.module('sysStatusApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'nvd3ChartDirectives', 'ui.ace', 'angularMoment', 'ui.bootstrap', 'angular-markdown', 'meta', 'angular.css.injector']).config(function ($routeProvider, $locationProvider, MetaProvider) {
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
  }).when('/logout', {
    templateUrl: 'partials/logout',
    controller: 'LogoutCtrl'
  }).when('/profile', {
    templateUrl: 'partials/profile/profile',
    controller: 'ProfileCtrl'
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
  }).when('/incident/:id/postmortem', {
    templateUrl: 'partials/incidents/postmortem',
    controller: 'IncidentPostmortemCtrl'
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
  }).when('/team', {
    templateUrl: 'partials/team/team',
    controller: 'TeamMembersCtrl'
  }).when('/integration', {
    templateUrl: 'partials/integration/integration',
    controller: 'IntegrationCtrl'
  }).when('/integration/twitter', {
    templateUrl: 'partials/integration/twitter',
    controller: 'TwitterCtrl'
  }).when('/integration/automate', {
    templateUrl: 'partials/integration/automate',
    controller: 'AutomateCtrl'
  }).when('/404', {
    templateUrl: 'partials/notfound',
    controller: 'NotFoundCtrl'
  }).otherwise({
    redirectTo: '/404'
  });
  $locationProvider.html5Mode(true);
  MetaProvider.options.title.suffix = ' | Sys Status';
  MetaProvider.when('/', {
    title: 'Setup'
  }).when('/login', {
    title: 'Login'
  }).when('/statusPage', {
    title: 'Status'
  }).when('/logout', {
    title: 'Logout'
  }).when('/getStarted', {
    title: 'Register'
  }).when('/dashboard', {
    title: 'Dashboard'
  }).when('/profile', {
    title: 'Profile'
  }).when('/components', {
    title: 'Components'
  }).when('/incidents', {
    title: 'Incidents'
  }).when('/incidents/maintenance', {
    title: 'Maintenance'
  }).when('/incidents/maintenance/new', {
    title: 'New Maintenance'
  }).when('/incidents/maintenance/:id', {
    title: 'Maintenance'
  }).when('/incidents/maintenance/:id/details', {
    title: 'Maintenance'
  }).when('/incidents/templates', {
    title: 'Templates'
  }).when('/incident/:id', {
    title: 'Incident'
  }).when('/incident/:id/postmortem', {
    title: 'Postmortem'
  }).when('/notifications', {
    title: 'Notifications'
  }).when('/notifications/settings', {
    title: 'Settings'
  }).when('/notifications/faq', {
    title: 'FAQ'
  }).when('/metrics', {
    title: 'Metrics'
  }).when('/metric/:id', {
    title: 'Metrics'
  }).when('/metrics/dataSources', {
    title: 'Data Sources'
  }).when('/metrics/tutorials', {
    title: 'Tutorials'
  }).when('/customize', {
    title: 'Customize'
  }).when('/customize/url', {
    title: 'Url'
  }).when('/customize/code', {
    title: 'Code'
  }).when('/team', {
    title: 'Team Members'
  }).when('/integration', {
    title: 'Integration'
  }).when('/integration/twitter', {
    title: 'Twitter Integration'
  }).when('/integration/automate', {
    title: 'Automate Components'
  }).otherwise({
    title: 'Page Not Found :(',
  });
});

sysStatusApp.run(function(Meta) {
  Meta.init();
});