'use strict';

statusPitApp.controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {
}]);

statusPitApp.controller('LoginCtrl', ['$scope', 'API', '$location', '$window', function ($scope, api, $location, $window) {
	$scope.login = function() {
		api.login($scope.email, $scope.password).success(function (data) {
			$window.localStorage.setItem('email', $scope.email);
			$location.path('/dashboard');
		}).error(function (error) {
			$scope.asideError = error.message
		});
	};
}]);

statusPitApp.controller('GetStartedCtrl', ['$scope', 'API', '$location', '$window', function ($scope, api, $location, $window) {
	$scope.register = function () {
		api.register($scope.site, $scope.email, $scope.password).success(function (response) {
			$window.localStorage.setItem('email', $scope.email);
			$location.path('/dashboard').search({'registered': '1'});
		}).error(function (error) {
			$scope.aside = error.message;
		});
	};
}]);

statusPitApp.controller('DashboardCtrl', ['$scope', '$location', 'API', '$window', '$modal', function ($scope, $location, api, $window, $modal) {
	if($location.search().registered) {
		$scope.asideSuccess = 'Successfully registered.';
	}
	getComponents($scope, $window, api);
	getIncidents($scope, $window, api);
	var createIncidentModal = $modal({
		html: true,
		backdrop: false,
		show: false,
		scope: $scope,
		animation: 'animation-fadeAndScale',
		template: 'views/partials/newIncidentModal.html'
	});
	$scope.updateComponent = function(componentID, status) {
		var updateData = {
			id: componentID,
			status: status,
			email: $window.localStorage.getItem('email') || null
		};
		api.updateComponent(updateData).success(function (data) {
			$scope.asideSuccess = data.message;
		}).error(function (error) {
			$scope.asideError = error.message;
		});
	};
	$scope.newIncident = function() {
		createIncidentModal.$promise.then(function() {
			$scope.$$postDigest(function() {
				createIncidentModal.show();
			});
		});
	};
	$scope.createIncident = function(incident, incidentValue, message) {
		var incidentData = {
			name: incident,
			type: incidentValue,
			message: message,
			email: $window.localStorage.getItem('email') || null
		};
		api.createIncident(incidentData).success(function (data) {
			$scope.asideSuccess = data.message;
			$scope.incident = '';
			$scope.message = '';
			$scope.incidentValue = 'Investigating'
		}).error(function (error) {
			$scope.asideError = error.message;
		});
	};
}]);
statusPitApp.controller('ComponentsCtrl', ['$scope', '$window', 'API', '$modal', function ($scope, $window, api, $modal) {
	getComponents($scope, $window, api);
	var componentModal = $modal({
		html: true,
		backdrop: false,
		show: false,
		scope: $scope,
		animation: 'animation-fadeAndScale',
		template: 'views/partials/componentModal.html'
	});
	$scope.addComponent = function() {
		componentModal.$promise.then(function() {
			$scope.$$postDigest(function() {
				componentModal.show();
			});
		});
	};
	$scope.createComponent = function (componentName, description) {
		var component = {
			name: componentName,
			description: description,
			email: $window.localStorage.getItem('email') || null
		};
		api.setComponent(component).success(function (data) {
			$scope.asideSuccess = data.message;
			if(!scope.componentError) {
				delete($scope.componentError);
			}
			$scope.components = [];
			$scope.components.push(component);
		}).error(function (error) {
			$scope.asideError = error.message;
		});
	};
}]);

statusPitApp.controller('StatusPageCtrl', ['$scope', '$window', 'API', function ($scope, $window, api) {
	getCompany($scope, $window, api);
	$scope.lastUpdate = $window.localStorage.getItem('lastUpdate') || Date.now()
}]);

statusPitApp.controller('NotificationsCtrl', ['$scope', '$window', 'API', function ($scope, $window, api) {
	
}]);

function getComponents($scope, $window, api) {
	// TODO add session
	var email = $window.localStorage.getItem('email') || null;
	api.getComponents(email).success(function (data) {
		if(data.components.length === 0) {
			$scope.componentError = 'No components found.';
		} else {
			$scope.components = data.components;
		}
	}).error(function (error) {
		$scope.componentError = error.message;
	});
}

function getIncidents($scope, $window, api) {
	// TODO add session
	var email = $window.localStorage.getItem('email') || null;
	api.getIncidents(email).success(function (data) {
		if(data.incidents.length > 0) {
			console.log(data.incidents);
			$scope.incidents = data.incidents;
		}
	}).error(function (error) {
		$scope.componentError = error.message;
	});	
}

function getCompany($scope, $window, api) {
	var email = $window.localStorage.getItem('email') || null;
	api.getCompany(email).success(function (companyData) {
		console.log(companyData.company);
		$scope.company = companyData.company;
	}).error(function (error) {
		$scope.companyError = error.message;
	});
}