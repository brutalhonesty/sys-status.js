/*jshint unused:false */
'use strict';
sysStatusApp.controller('NewIncidentModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.createIncident = function(incident, incidentValue, message) {
    var incidentData = {
      name: incident,
      type: incidentValue,
      message: message
    };
    $modalInstance.close(incidentData);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('DeleteIncidentModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance, incidentID) {
  $scope.incidentID = incidentID;
  $scope.deleteIncident = function(incidentID) {
    var delIncidentData = {
      id: incidentID
    };
    $modalInstance.close(delIncidentData);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('DeleteMaintenanceModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance, maintainenceID) {
  $scope.maintainenceID = maintainenceID;
  $scope.deleteMaintenance = function(maintainenceID) {
    var maintenanceObj = {
      id: $scope.maintainenceID
    };
    $modalInstance.close(maintenanceObj);
  };
  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('ComponentModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.createComponent = function(componentName, description) {
    var component = {
      name: componentName,
      description: description
    };
    $modalInstance.close(component);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('DeleteComponentModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance, componentID) {
  $scope.componentID = componentID;
  $scope.deleteComponent = function(componentID) {
    var component = {
      id: componentID
    };
    $modalInstance.close(component);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('MetricModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance, dataSources) {
  $scope.dataSources = dataSources;
  $scope.storeMetric = function(dataSource, displayName, displaySuffix) {
    var metric = {
      source: dataSource,
      name: displayName,
      suffix: displaySuffix
    };
    $modalInstance.close(metric);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('MetricDeleteModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance, metricID) {
  $scope.metricID = metricID;
  $scope.deleteMetric = function(metricID) {
    var metricDeleteData = {
      id: metricID
    };
    $modalInstance.close(metricDeleteData);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('AddImageModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.isCompVisible = true;
  $scope.uploadLogo = function(imageForm, urlForm, imageFile, imageURL) {
    var imageObj = {};
    if(imageFile && !urlForm.$valid) {
      imageObj = {
        file: imageFile,
        url: imageURL
      };
      $modalInstance.close(imageObj);
    } else if(urlForm.$valid) {
      imageObj = {
        file: imageFile,
        url: imageURL
      };
      $modalInstance.close(imageObj);
    }
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.viewComp = function() {
    $scope.isCompVisible = true;
    $scope.isLinkVisible = false;
  };
  $scope.viewLink = function() {
    $scope.isLinkVisible = true;
    $scope.isCompVisible = false;
  };
}]);

sysStatusApp.controller('AddFavModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.isCompVisible = true;
  $scope.uploadLogo = function(imageForm, urlForm, imageFile, imageURL) {
    var imageObj = {};
    if(imageFile && !urlForm.$valid) {
      imageObj = {
        file: imageFile,
        url: imageURL
      };
      $modalInstance.close(imageObj);
    } else if(urlForm.$valid) {
      imageObj = {
        file: imageFile,
        url: imageURL
      };
      $modalInstance.close(imageObj);
    }
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.viewComp = function() {
    $scope.isCompVisible = true;
    $scope.isLinkVisible = false;
  };
  $scope.viewLink = function() {
    $scope.isLinkVisible = true;
    $scope.isCompVisible = false;
  };
}]);
