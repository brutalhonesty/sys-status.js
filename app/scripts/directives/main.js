'use strict';

statusPitApp.directive('aside', function () {
	return {
		restrict: 'E',
		link: function ($scope, element, attrs) {
			$scope.$watch('[asideSuccess, asideError]', function (newVar, oldVar) {
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
	}
});