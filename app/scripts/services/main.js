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
        login: function(email, password) {
            var loginData = {
                email: email,
                password: password
            };
            return $http({
                url: '/api/login',
                method: 'POST',
                data: $.param(loginData),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        },
        getComponents: function(email) {
            return $http.get('/api/getComponents?email=' + email);
        },
        setComponent: function(component) {
            return $http({
                url: '/api/setComponent',
                method: 'POST',
                data: $.param(component),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        },
        updateComponent: function(updateData) {
            return $http({
                url: '/api/updateComponent',
                method: 'POST',
                data: $.param(updateData),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        },
        createIncident: function(incidentData) {
            return $http({
                url: '/api/createIncident',
                method: 'POST',
                data: $.param(incidentData),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        },
        getIncidents: function(email) {
            return $http.get('/api/getIncidents?email=' + email);
        },
        getCompany: function(email) {
            return $http.get('/api/getCompany?email=' + email);
        }
    }
}]);