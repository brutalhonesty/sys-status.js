/* jshint unused: false */
'use strict';

var sysStatusApp = angular.module('sysStatusApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'nvd3ChartDirectives', 'ui.ace', 'angularMoment', 'ui.bootstrap', 'angular-markdown', 'meta', 'angular.css.injector']).config(function ($routeProvider, $locationProvider, MetaProvider) {
  $routeProvider.when('/', {
    templateUrl: 'partials/main.html',
    controller: 'MainCtrl'
  }).when('/login', {
    templateUrl: 'partials/login.html',
    controller: 'LoginCtrl'
  }).when('/statusPage', {
    templateUrl: 'partials/statusPage.html',
    controller: 'StatusPageCtrl'
  }).when('/getStarted', {
    templateUrl: 'partials/getStarted.html',
    controller: 'GetStartedCtrl'
  }).when('/logout', {
    templateUrl: 'partials/logout.html',
    controller: 'LogoutCtrl'
  }).when('/profile', {
    templateUrl: 'partials/profile/profile.html',
    controller: 'ProfileCtrl'
  }).when('/dashboard', {
    templateUrl: 'partials/dashboard.html',
    controller: 'DashboardCtrl'
  }).when('/components', {
    templateUrl: 'partials/components.html',
    controller: 'ComponentsCtrl'
  }).when('/incidents', {
    templateUrl: 'partials/incidents/incidents.html',
    controller: 'IncidentsCtrl'
  }).when('/incidents/maintenance', {
    templateUrl: 'partials/incidents/maintenance.html',
    controller: 'MaintenancesCtrl'
  }).when('/incidents/maintenance/new', {
    templateUrl: 'partials/incidents/newMaintenance.html',
    controller: 'MaintenancesCtrl'
  }).when('/incidents/maintenance/:id', {
    templateUrl: 'partials/incidents/updateMaintenance.html',
    controller: 'MaintenanceCtrl'
  }).when('/incidents/maintenance/:id/details', {
    templateUrl: 'partials/incidents/maintenanceDetails.html',
    controller: 'MaintenanceCtrl'
  }).when('/incidents/templates', {
    templateUrl: 'partials/incidents/templates.html',
    controller: 'TemplatesCtrl'
  }).when('/incident/:id', {
    templateUrl: 'partials/incidents/incident.html',
    controller: 'IncidentCtrl'
  }).when('/incident/:id/postmortem', {
    templateUrl: 'partials/incidents/postmortem.html',
    controller: 'IncidentPostmortemCtrl'
  }).when('/notifications', {
    templateUrl: 'partials/notifications/notifications.html',
    controller: 'NotificationsCtrl'
  }).when('/notifications/settings', {
    templateUrl: 'partials/notifications/settings.html',
    controller: 'NotificationsCtrl'
  }).when('/notifications/faq', {
    templateUrl: 'partials/notifications/FAQ.html',
    controller: 'NotificationsCtrl'
  }).when('/metrics', {
    templateUrl: 'partials/metrics/metrics.html',
    controller: 'MetricsCtrl'
  }).when('/metric/:id', {
    templateUrl: 'partials/metrics/metric.html',
    controller: 'MetricCtrl'
  }).when('/metrics/dataSources', {
    templateUrl: 'partials/metrics/dataSources.html',
    controller: 'MetricSourceCtrl'
  }).when('/metrics/tutorials', {
    templateUrl: 'partials/metrics/tutorials.html'
  }).when('/customize', {
    templateUrl: 'partials/customize/customize.html',
    controller: 'CustomizeCtrl'
  }).when('/customize/url', {
    templateUrl: 'partials/customize/url.html',
    controller: 'CustomizeURLCtrl'
  }).when('/customize/code', {
    templateUrl: 'partials/customize/code.html',
    controller: 'CustomizeCodeCtrl'
  }).when('/team', {
    templateUrl: 'partials/team/team.html',
    controller: 'TeamMembersCtrl'
  }).when('/integration', {
    templateUrl: 'partials/integration/integration.html',
    controller: 'IntegrationCtrl'
  }).when('/integration/twitter', {
    templateUrl: 'partials/integration/twitter.html',
    controller: 'TwitterCtrl'
  }).when('/integration/automate', {
    templateUrl: 'partials/integration/automate.html',
    controller: 'AutomateCtrl'
  }).when('/404', {
    templateUrl: 'partials/notfound.html',
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