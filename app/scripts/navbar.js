/* global sysStatusApp, YUI */
'use strict';
sysStatusApp.directive('yuiMenu', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      YUI({classNamePrefix: 'pure'}).use('gallery-sm-menu', function (Y) {
        var horizontalMenu = new Y.Menu({
          container: '.pure-menu',
          sourceNode: '#'+attrs.id,
          orientation: 'horizontal',
          hideOnOutsideClick: false,
          hideOnClick: false
        });
        horizontalMenu.render();
        horizontalMenu.show();
        $rootScope.$on('$routeChangeSuccess', function () {
          horizontalMenu.destory();
          var newMenu = new Y.Menu({
            container: '.pure-menu',
            sourceNode: '#'+attrs.id,
            orientation: 'horizontal',
            hideOnOutsideClick: false,
            hideOnClick: false
          });
          newMenu.render();
        });
      });
    }
  };
}]);