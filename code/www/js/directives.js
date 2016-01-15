var app = angular.module('songhop.directives',['ionic'])

app.directive('draggable', function($ionicGesture) {
	return {
		link: function(scope, element, attrs) {
			var elementSize = 100;
			var x = Math.round((window.screen.height - elementSize)/2, 0);

			scope.pos.x = x;
			scope.pos.y = y;

			element[0].style[ionic.CSS.TRANSFORM]
		}
	}
})

app.directive('gravatar', function() {
	var defaultGravatarUrl = "http://www.gravatar.com/avatar/000?s=200";
	var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	function getGravatarUrl(email) {
		if (!regex.test(email)) {
			return defaultGravatarUrl;
		}

		return 'http://www.gravatar.com/avatar/' + md5(email) + ".jpg?s=100";
	}

	function linker(scope) {
		scope.url = getGravatarUrl(scope.email);

		scope.$watch('email', function (newVal, oldVal) {
			if (newVal !== oldVal) {
				scope.url = getGravatarUrl(scope.email);
			}
		});
	}

	return {
		template: '<img ng-src="{{url}}"></img>',
		restrict: 'EA',
		replace: true,
		scope: {
			email: '='
		},
		link: linker
	}; 

})

;