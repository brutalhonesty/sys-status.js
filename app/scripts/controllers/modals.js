/*jshint unused:false */
/* global sysStatusApp */
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

sysStatusApp.controller('DeleteIncidentModalCtrl', ['$scope', '$modalInstance', 'incidentID', function ($scope, $modalInstance, incidentID) {
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

sysStatusApp.controller('DeleteMaintenanceModalCtrl', ['$scope', '$modalInstance', 'maintainenceID', function ($scope, $modalInstance, maintainenceID) {
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

sysStatusApp.controller('EditComponentModalCtrl', ['$scope', '$modalInstance', 'componentID', 'componentName', 'description', function ($scope, $modalInstance, componentID, componentName, description) {
  $scope.componentName = componentName;
  $scope.description = description;
  $scope.componentID = componentID;
  $scope.editComponent = function(componentID, componentName, description) {
    var component = {
      id: componentID,
      name: componentName,
      description: description
    };
    $modalInstance.close(component);
  };
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}]);

sysStatusApp.controller('DeleteComponentModalCtrl', ['$scope', '$modalInstance', 'componentID', function ($scope, $modalInstance, componentID) {
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

sysStatusApp.controller('MetricModalCtrl', ['$scope', '$modalInstance', 'dataSources', function ($scope, $modalInstance, dataSources) {
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

sysStatusApp.controller('MetricDeleteModalCtrl', ['$scope', '$modalInstance', 'metricID', function ($scope, $modalInstance, metricID) {
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

sysStatusApp.controller('AddMemberModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.addMember = function(memberEmail) {
    var member = {
      email: memberEmail
    };
    $modalInstance.close(member);
  };
}]);

sysStatusApp.controller('ChangePasswordModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.chanegPassword = function(oldPassword, newPassword, confirmNewPassword) {
    var passwordData = {
      oldPassword: oldPassword,
      newPassword: newPassword,
      confirmNewPassword: confirmNewPassword
    };
    $modalInstance.close(passwordData);
  };
}]);

sysStatusApp.controller('DeauthorizeModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.deauthorize = function() {
    $modalInstance.close();
  };
}]);