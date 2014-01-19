'use strict';

statusPitApp.directive('aside', function () {
	return {
		restrict: 'E',
		link: function ($scope, element, attrs) {
			$scope.$watch('asideSuccess', function (newVar, oldVar) {
				if(newVar) {
					element.slideDown('slow');
					setTimeout(function () {
						element.slideUp('slow');
					},2000);
				}
			});
			$scope.$watch('asideError', function (newVar, oldVar) {
				if(newVar) {
					element.slideDown('slow');
					setTimeout(function () {
						element.slideUp('slow');
					},2000);
				}
			});
		}
	}
});