'use strict';

statusPitApp.controller('MainCtrl', ['$scope', '$location', function ($scope, $location) {
}]);

statusPitApp.controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.menu = [
        {title: 'Dashboard', link: '/dashboard'},
        {title: 'Incidents', link: '/incidients'},
        {title: 'Components', link: '/components'},
        {title: 'Public Metrics', link: '/metrics'},
        {title: 'Customize Page', link: '/customize'},
        {title: 'Notifications', link: '/notifications'},
        {title: 'Team Members', link: '/team'},
        {title: 'Integrations', link: '/integration'}
    ];
    $scope.isActive = function(route) {
        return route === $location.path();
    };
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
            $location.path('/dashboard').search({'registered': 1});
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
            if(!$scope.componentError) {
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
    var email = $window.localStorage.getItem('email') || null;
    api.getSubscriptions(email).success(function (data) {
        $scope.allowAutoSubscribe = data.subscribers.types.autoIncident;
        $scope.userIndivComponents = data.subscribers.types.individComponent;
        $scope.userIndivIncidents = data.subscribers.types.individIncident;
        $scope.allowEmailSubs = !data.subscribers.email.disabled;
        $scope.allowSMSSubs = !data.subscribers.sms.disabled;
        $scope.allowWebSubs = !data.subscribers.webhook.disabled;
        $scope.subscribers = data.subscribers;
    }).error(function (error) {
        $error.asideError = error.message;
    });
    $scope.allowAutoIncidentTool = {
        "title": "Users can choose to be auto-subscribed to any incident that is posted.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
    $scope.allowIndivCompTool = {
        "title": "Users can subscribe to components that interest them.<br />They will only receive notifications for incidents and scheduled maintainence for that component.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
    $scope.allowIndivIncidentsTool = {
        "title": "Users can subscribe to a specific incident after it has been created.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
    $scope.allowEmailSubsTool = {
        "title": "Users can get updates sent to them via email.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
    $scope.allowSMSSubsTools = {
        "title": "Users can get updates sent to them via SMS.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
    $scope.allowWebSubsTools = {
        "title": "Users can get updates sent to them via webhook.<br />All incident and component status changes will be sent.",
        "animation": "animation-fade",
        "placement": "top",
        "trigger": "hover click"
    };
}]);

statusPitApp.controller('MetricsCtrl', ['$scope', '$modal', 'API', '$window', '$route', '$location', function ($scope, $modal, api, $window, $route, $location) {
    if($route.current.params.deleted == 1) { // Use '==' instead of '===' for datatypes (string vs int)
        $scope.asideSuccess = 'Metric deleted.';
    }
    getMetrics($scope, $window, api);
    var metricModal = $modal({
        html: true,
        backdrop: false,
        show: false,
        scope: $scope,
        animation: 'animation-fadeAndScale',
        template: 'views/partials/metricModal.html'
    });
    $scope.dataSources = [{value: 'selfData', displayName: 'I\'ll submit my own data for this metric.'}];
    $scope.addMetric = function() {
        metricModal.$promise.then(function() {
            $scope.$$postDigest(function() {
                metricModal.show();
            });
        });
    };
    $scope.storeMetric = function(dataSource, displayName, displaySuffix) {
        var metric = {
            source: dataSource,
            name: displayName,
            suffix: displaySuffix,
            email: $window.localStorage.getItem('email') || null
        };
        api.createMetric(metric).success(function (metricResponse) {
            $location.path('/metric/'+metricResponse.id).search({'added': 1});
            $window.localStorage.setItem('metrickey', metricResponse.metrickey);
        }).error(function (error) {
            $scope.asideError = error.message;
        });
    };
}]);

statusPitApp.controller('MetricCtrl', ['$scope', '$window', 'API', '$route', '$modal', '$location', function ($scope, $window, api, $route, $modal, $location) {
    var metricID = $route.current.params.id || null;
    if($route.current.params.added == 1) { // Use '==' instead of '===' for datatypes (string vs int)
        $scope.asideSuccess = 'Metric added';
    }
    $scope.metrickey = $window.localStorage.getItem('metrickey') || null;
    getMetric($scope, $window, api, metricID);
    $scope.fn = {};
    $scope.lineData = {};
    $scope.decimals = [
        {value: 0, displayName: 0},
        {value: 1, displayName: 1},
        {value: 2, displayName: 2},
        {value: 3, displayName: 3}
    ];
    var metricDeleteReqModal = $modal({
        html: true,
        backdrop: false,
        show: false,
        scope: $scope,
        animation: 'animation-fadeAndScale',
        template: 'views/partials/metricDeleteReqModal.html'
    });
    $scope.deleteMetricReq = function() {
        metricDeleteReqModal.$promise.then(function() {
            $scope.$$postDigest(function() {
                metricDeleteReqModal.show();
            });
        });
    };
    $scope.deleteMetric = function() {
        var metricDeleteData = {
            id: metricID,
            email: $window.localStorage.getItem('email') || null
        };
        api.deleteMetric(metricDeleteData).success(function (deleteMetricResponse) {
            $location.path('/metrics').search({'deleted': 1});
        }).error(function (error) {
            $scope.error = error.message;
        });
    };
    $scope.updateMetric = function() {
        var metric = $scope.metric;
        metric.email = $window.localStorage.getItem('email') || null;
        api.updateMetric(metric).success(function (updateMetricResponse) {
            $scope.asideSuccess = updateMetricResponse.message;
        }).error(function (error) {
            $scope.error = error.message;
        });
    };
}]);

statusPitApp.controller('MetricSourceCtrl', ['$scope', function ($scope) {

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
            $scope.incidents = data.incidents;
        }
    }).error(function (error) {
        $scope.componentError = error.message;
    }); 
}

function getCompany($scope, $window, api) {
    // TODO add session
    var email = $window.localStorage.getItem('email') || null;
    api.getCompany(email).success(function (companyData) {
        $scope.company = companyData.company;
    }).error(function (error) {
        $scope.companyError = error.message;
    });
}

function getMetrics($scope, $window, api) {
    // TODO add session
    var email = $window.localStorage.getItem('email') || null;
    api.getMetrics(email).success(function (metricsData) {
        $scope.metrics = metricsData.metrics
    }).error(function (error) {
        $scope.asideError = error.message;
    });
}

function getMetric($scope, $window, api, metricID) {
    // TODO add session
    var email = $window.localStorage.getItem('email') || null;
    api.getMetric(email, metricID).success(function (metricData) {
        $scope.metric = metricData.metric;
        $scope.metric.data.sort(function (a, b) { return a.timeStamp > b.timeStamp;});
        var graphData = [];
        for(var metricCounter = 0; metricCounter < $scope.metric.data.length; metricCounter++) {
            var graphInnerData = [];
            //$scope.metric.data[metricCounter].timeStamp = $scope.metric.data[metricCounter].timeStamp.slice(0, -3);
            graphInnerData.push(parseInt($scope.metric.data[metricCounter].timeStamp, 10), parseInt($scope.metric.data[metricCounter].value, 10));
            graphData.push(graphInnerData);
        }
        $scope.exampleData = [{
            "key": $scope.metric.name,
            "values": graphData
        }];
        $scope.xAxisTickFormat = function(){
            return function(d){
                return d3.time.format('%X')(new Date(d));
            }
        }
        $scope.xAxisTickFormatFunction = function(){
            return function(d){
                return d3.time.format('%H:%M')(moment.unix(d).toDate());
            }
        };
        $scope.xAxisTickValuesFunction = function(){
            return function(d){
                var tickVals = [];
                var values = d[0].values;
                var interestedTimeValuesArray = [0, 15, 30, 45];
                for(var i in values){
                    if(interestedTimeValuesArray.indexOf(moment.unix(values[i][0]).minute()) >= 0){
                        tickVals.push(values[i][0]);
                    }
                }
                return tickVals;
            };
        };
        $scope.aceInput = metricData.template;
    }).error(function (error) {
        $scope.error = error.message;
    });
}