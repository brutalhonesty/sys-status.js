'use strict';

statusPitApp.service('API', ['$http', function ($http) {
    return {
        register: function(siteName, email, password) {
            var registerData = {
                siteName: siteName,
                email: email,
                password: password
            };
            return $http({
                url: '/api/register', 
                method: 'POST',
                data: $.param(registerData),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        },
        getComponents: function(email) {
            return $http.get('/api/getComponents?email=' + email);
        }
    }
}]);