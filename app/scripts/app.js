'use strict';

var statusPitApp = angular.module('statusPitApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap.modal', 'angularMoment']).config(function ($routeProvider, $locationProvider, $modalProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
    })
    .when('/login', {
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
        templateUrl: 'partials/notifications',
        controller: 'NotificationsCtrl'
    }).otherwise({
        redirectTo: '/'
    });
    angular.extend($modalProvider.defaults, {
        html: true
    });
    $locationProvider.html5Mode(true);
});