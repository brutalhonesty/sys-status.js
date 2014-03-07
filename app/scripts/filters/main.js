/*global statusPitApp*/
'use strict';

statusPitApp.filter('mfromNow', ['$window', function ($window) {
  return function(epoch) {
    return $window.moment(epoch).fromNow();
  };
}]);