'use strict';

var statusPitApp = angular.module('statusPitApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap.modal', 'angularMoment', 'mgcrea.ngStrap.tooltip', 'nvd3ChartDirectives', 'ace']).config(function ($routeProvider, $locationProvider, $modalProvider, $tooltipProvider) {
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
    }).otherwise({
        redirectTo: '/'
    });
    angular.extend($modalProvider.defaults, {
        html: true
    });
    angular.extend($tooltipProvider.defaults, {
        html: true
    });
    $locationProvider.html5Mode(true);
});