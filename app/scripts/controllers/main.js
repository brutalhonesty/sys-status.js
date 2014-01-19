'use strict';

statusPitApp.controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {
}]);

statusPitApp.controller('GetStartedCtrl', ['$scope', 'API', '$location', '$window', function ($scope, api, $location, $window) {
	$scope.register = function () {
		api.register($scope.site, $scope.email, $scope.password).success(function (response) {
			$window.localStorage.setItem('email', $scope.email);
			$location.path('/dashboard').search({'registered': '1'});
		}).error(function (error) {
			delete($scope.aside);
			$scope.aside = error;
		});
	};
}]);

statusPitApp.controller('DashboardCtrl', ['$scope', '$location', 'API', '$window', function ($scope, $location, api, $window) {
	if($location.search().registered) {
		$scope.asideSuccess = 'Successfully registered.';
	}
	getComponents($scope, $window, api);
}]);
statusPitApp.controller('ComponentsCtrl', ['$scope', '$window', 'API', '$modal', function ($scope, $window, api, $modal) {
	getComponents($scope, $window, api);
	var myModalWithTemplate = $modal({
		html: true,
		backdrop: false,
		show: false,
		animation: 'animation-fadeAndScale',
		template: 'views/partials/componentModal.html'
	});
	$scope.addComponent = function() {
		myModalWithTemplate.$promise.then(function() {
			$scope.$$postDigest(function() {
				myModalWithTemplate.show();
			});
		});
	};
}]);

function getComponents($scope, $window, api) {
	// TODO add session
	var email = $window.localStorage.getItem('email');
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