'use strict';

var statusPitApp = angular.module('statusPitApp', ['ngCookies', 'ngResource', 'ngSanitize', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap.modal']).config(function ($routeProvider, $locationProvider, $modalProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
    }).when('/getStarted', {
        templateUrl: 'partials/getStarted',
        controller: 'GetStartedCtrl'
    }).when('/dashboard', {
        templateUrl: 'partials/dashboard',
        controller: 'DashboardCtrl'
    }).when('/components', {
        templateUrl: 'partials/components',
        controller: 'ComponentsCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
    angular.extend($modalProvider.defaults, {
        html: true
    });
    $locationProvider.html5Mode(true);
});