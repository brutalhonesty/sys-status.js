/*global sysStatusApp */
'use strict';

// TODO we can make this more generalized
sysStatusApp.directive('aside', function () {
  return {
    restrict: 'E',
    link: function ($scope, element) {
      $scope.$watch('[asideSuccess, asideError]', function (newVar) {
        if(newVar[0] || newVar[1]) {
          element.slideDown('slow');
          setTimeout(function () {
            element.slideUp('slow');
            delete($scope.asideSuccess);
            delete($scope.asideError);
          },2000);
        }
      }, true);
    }
  };
});

sysStatusApp.directive('hoverEdit', function () {
  return {
    restrict: 'A',
    link: function ($scope, element) {
      element.hover(function () {
        element.find('span').show();
      }, function () {
        element.find('span').hide();
      });
    }
  };
});

sysStatusApp.directive('clickEdit', ['$compile', function ($compile) {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, element) {
      element.click(function () {
        element.parent().parent().parent().hide();
        // TODO Figure out how to call a template, bring in as string and dump into page
        var tpl = '<form class=\'pure-form\' id=\'editForm\'><fieldset class=\'pure-group\'><input type=\'date\' ng-model=\'event.days\' ng-init="event.days=(event.date | date: \'yyyy-MM-dd\')" placeholder=\'yyyy-MM-dd\'><input type=\'time\' ng-model=\'event.time\' ng-init="event.time=(event.date | date: \'HH:mm\')" placeholder=\'HH:MM\'><textarea id=\'message\' class=\'pure-input-1\' placeholder=\'Message\' ng-model=\'event.message\' rows=\'5\' ng-show=\'event.message\'></textarea><textarea id=\'details\' class=\'pure-input-1\' placeholder=\'Details\' ng-model=\'event.details\' rows=\'5\' ng-show=\'event.details\'></textarea></fieldset><button id=\'updatePrevious\' class=\'pure-button pure-button-primary pure-button-medium\' ng-click=\'updatePrev(event)\' cancel-edit>Submit</button><button id=\'cancelPrevious\' class=\'pure-button pure-button-small\' cancel-edit>Cancel</button></form>';
        element.parent().parent().parent().after($compile(tpl)(scope));
        element.parent().parent().parent().parent().find('form#editForm').show();
        scope.$apply();
      });
    }
  };
}]);

sysStatusApp.directive('cancelEdit', function() {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element.click(function () {
        element.parent().parent().find('div#eventContainer').show();
        // More expensive to destory and create elements in the DOM but it currently makes sense to destory the form when its cancelled or not showing.
        element.parent().remove();
      });
    }
  };
});

/*http://jsfiddle.net/JeJenny/ZG9re/*/
sysStatusApp.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);