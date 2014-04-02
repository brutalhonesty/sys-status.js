/*jshint unused:false */
/* global sysStatusApp */
'use strict';

function NewIncidentModalCtrl($scope, $modalInstance) {
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
}
NewIncidentModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('NewIncidentModalCtrl', NewIncidentModalCtrl);

function DeleteIncidentModalCtrl($scope, $modalInstance, incidentID) {
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
}
DeleteIncidentModalCtrl.$inject = ['$scope', '$modalInstance', 'incidentID'];
sysStatusApp.controller('DeleteIncidentModalCtrl', DeleteIncidentModalCtrl);

function DeleteMaintenanceModalCtrl($scope, $modalInstance, maintainenceID) {
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
}
DeleteMaintenanceModalCtrl.$inject = ['$scope', '$modalInstance', 'maintainenceID'];
sysStatusApp.controller('DeleteMaintenanceModalCtrl', DeleteMaintenanceModalCtrl);

function ComponentModalCtrl($scope, $modalInstance) {
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
}
ComponentModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('ComponentModalCtrl', ComponentModalCtrl);

function EditComponentModalCtrl($scope, $modalInstance, componentID, componentName, description) {
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
}
EditComponentModalCtrl.$inject = ['$scope', '$modalInstance', 'componentID', 'componentName', 'description'];
sysStatusApp.controller('EditComponentModalCtrl', EditComponentModalCtrl);

function DeleteComponentModalCtrl($scope, $modalInstance, componentID) {
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
}
DeleteComponentModalCtrl.$inject = ['$scope', '$modalInstance', 'componentID'];
sysStatusApp.controller('DeleteComponentModalCtrl', DeleteComponentModalCtrl);

function MetricModalCtrl($scope, $modalInstance, dataSources) {
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
}
MetricModalCtrl.$inject = ['$scope', '$modalInstance', 'dataSources'];
sysStatusApp.controller('MetricModalCtrl', MetricModalCtrl);

function MetricDeleteModalCtrl($scope, $modalInstance, metricID) {
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
}
MetricDeleteModalCtrl.$inject = ['$scope', '$modalInstance', 'metricID'];
sysStatusApp.controller('MetricDeleteModalCtrl', MetricDeleteModalCtrl);

function AddImageModalCtrl($scope, $modalInstance) {
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
}
AddImageModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('AddImageModalCtrl', AddImageModalCtrl);

function AddFavModalCtrl($scope, $modalInstance) {
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
}
AddFavModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('AddFavModalCtrl', AddFavModalCtrl);

function AddMemberModalCtrl($scope, $modalInstance) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.addMember = function(memberEmail) {
    var member = {
      email: memberEmail
    };
    $modalInstance.close(member);
  };
}
AddMemberModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('AddMemberModalCtrl', AddMemberModalCtrl);

function ChangePasswordModalCtrl($scope, $modalInstance) {
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
}
ChangePasswordModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('ChangePasswordModalCtrl', ChangePasswordModalCtrl);

function DeauthorizeModalCtrl($scope, $modalInstance) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
  $scope.deauthorize = function() {
    $modalInstance.close();
  };
}
DeauthorizeModalCtrl.$inject = ['$scope', '$modalInstance'];
sysStatusApp.controller('DeauthorizeModalCtrl', DeauthorizeModalCtrl);