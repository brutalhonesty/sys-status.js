/* jshint undef: false, unused: false */
/* global sysStatusApp, d3, moment */
'use strict';

/* API calls for some of the controllers */
function getComponents($scope, $location, api) {
  // Get components from the server
  api.getComponents().success(function (data) {
    // No components so display "Error"
    // TODO we could load some markup to say "Create a component now"
    if(data.components.length === 0) {
      $scope.componentError = 'No components found.';
    } else {
      // Show components on page
      $scope.components = data.components;
    }
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.componentError = error.message;
  });
}

function getIncidents($scope, $location, api) {
  // Get Incidents from the server
  api.getIncidents().success(function (data) {
    // Initialize boolean check for open incidents
    $scope.openIncidents = false;
    // If we have incidents
    if(data.incidents.length > 0) {
      // Set incidents to scope
      $scope.incidents = data.incidents;
      // If we have an incident that is not resolve, we have an open incident
      for(var incidentCounter = 0; incidentCounter < $scope.incidents.length; incidentCounter++) {
        var incident = $scope.incidents[incidentCounter];
        if(incident.events[incident.events.length - 1].type !== 'Resolved') {
          $scope.openIncidents = true;
        }
      }
    }
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
}

/**
 * Gets the current day and creates an array of the last 10 days in milliseconds
 * @return {Array} timeArray The array of times
 */
function pastTenDays() {
  var today = moment().startOf('day').valueOf();
  var timeArray = [today];
  for(var timeCounter = 1; timeCounter <= 10; timeCounter++) {
    timeArray.push(today - (86400000 * timeCounter));
  }
  return timeArray;
}

function getPrivateCompany($scope, $location, api) {
  // Get the company object from the server
  api.getPrivateCompany().success(function (companyData) {
    $scope.company = companyData.company;
    $scope.incidentDates = pastTenDays();
    // Used for graphs
    $scope.xAxisTickFormatFunction = function(){
      return function(d) {
        return d3.time.format('%H:%M')(moment(d).toDate());
        // TODO figure out how this changes when the data is repainted
        /*$scope.$watch('interval', function (newValue, oldValue) {
          switch(newValue) {
            case 'day':
              return d3.time.format('%H:%M')(moment(d).toDate());
            case 'week':
              return d3.time.format('%a %b %e %X')(moment(d).toDate());
            case 'month':
              return d3.time.format('%b %e %X')(moment(d).toDate());
            default:
              return d3.time.format('%H:%M')(moment(d).toDate());
          }
        });*/
      };
    };
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.companyError = error.message;
  });
}

function getMetrics($scope, $location, api) {
  // Get metrics from the server
  api.getMetrics().success(function (metricsData) {
    $scope.metrics = metricsData;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
}

function getMetric($scope, $location, api, metricID) {
  // Get single metric from the server
  api.getMetric(metricID).success(function (metricData) {
    $scope.metric = metricData.metric;
    // Load HTML template of the ace-ui text editor
    $scope.aceInput = metricData.template;
    if($scope.metric.data.length === 0) {
    // TODO figure out a way to poll new metric data.
    } else {
      // Sort timestamps even though we expect the values to be in numerical order from the server because we expect the user to send them in sequencial order
      $scope.metric.data.sort(function (a, b) { return a[0] - b[0]; });
      // Prepare data for graph
      $scope.metricData = [{
        'key': $scope.metric.name,
        'values': $scope.metric.data
      }];
      // Graph related functions
      $scope.yAxisLabel = function() {
        return $scope.metric.suffix;
      };
      $scope.forceY = function() {
        return [$scope.metric.axis.y.min, $scope.metric.axis.y.max];
      };
      $scope.showX = function() {
        return !$scope.metric.axis.x.hide;
      };
      $scope.showY = function() {
        return !$scope.metric.axis.y.hide;
      };
      $scope.xAxisTickFormatFunction = function(){
        return function(d) {
          return d3.time.format('%H:%M')(moment(d).toDate());
          // TODO figure out how this changes when the data is repainted
          /*$scope.$watch('interval', function (newValue, oldValue) {
            switch(newValue) {
              case 'day':
                return d3.time.format('%H:%M')(moment(d).toDate());
              case 'week':
                return d3.time.format('%a %b %e %X')(moment(d).toDate());
              case 'month':
                return d3.time.format('%b %e %X')(moment(d).toDate());
              default:
                return d3.time.format('%H:%M')(moment(d).toDate());
            }
          });*/
        };
      };
    }
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.error = error.message;
  });
}

function createIncident(incidentData, $scope, api) {
  api.createIncident(incidentData).success(function (data) {
    $scope.asideSuccess = data.message;
    $scope.incident = '';
    $scope.message = '';
    $scope.incidentValue = 'Investigating';
  }).error(function (error) {
    $scope.asideError = error.message;
  });
}

function getMaintenances($scope, $location, api) {
  // Get maintenance list from the server
  api.getMaintenances().success(function (maintenanceResponse) {
    $scope.maintenances = maintenanceResponse;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
}

/**
 * Controllers start here
 */

sysStatusApp.controller('MainCtrl', [function () {}]);

sysStatusApp.controller('NavbarCtrl', ['$scope', '$location', function ($scope, $location) {
  $scope.menu = [
    {title: 'Dashboard', link: '/dashboard'},
    {title: 'Incidents', link: '/incidents'},
    {title: 'Components', link: '/components'},
    {title: 'Public Metrics', link: '/metrics'},
    {title: 'Customize Page', link: '/customize'},
    {title: 'Notifications', link: '/notifications'},
    {title: 'Team Members', link: '/team'},
    {title: 'Integrations', link: '/integration'}
  ];
  // If we are on the link that is passed to the function, set the class as active
  $scope.isActive = function(route) {
    return route === $location.path();
  };
}]);

sysStatusApp.controller('LoginCtrl', ['$scope', 'API', '$location', '$window', function ($scope, api, $location, $window) {
  $scope.login = function() {
    api.login($scope.email, $scope.password).success(function (data) {
      // Get site name to local storage
      $window.localStorage.setItem('name', data.name);
      $location.path('/dashboard');
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('GetStartedCtrl', ['$scope', 'API', '$location', function ($scope, api, $location) {
  $scope.register = function () {
    var registerData = {
      siteName: $scope.site,
      email: $scope.email,
      domain: $scope.domain,
      password: $scope.password
    };
    api.register(registerData).success(function () {
      $location.path('/dashboard').search({'registered': 1});
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('DashboardCtrl', ['$scope', '$location', 'API', '$modal', '$route', function ($scope, $location, api, $modal, $route) {
  if(parseInt($route.current.params.registered, 10) === 1) {
    $scope.asideSuccess = 'Successfully registered.';
  }
  getComponents($scope, $location, api);
  getIncidents($scope, $location, api);
  $scope.newIncident = function() {
    var createIncidentModal = $modal.open({
      // Find controller in modals.js
      controller: NewIncidentModalCtrl,
      templateUrl: 'views/partials/newIncidentModal.html'
    });
    // Upon successful closing of modal, create incident on the server
    createIncidentModal.result.then(function (incidentData) {
      createIncident(incidentData, $scope, api);
    });
  };
  $scope.createIncident = function(incident, incidentValue, message) {
    var incidentData = {
      name: incident,
      type: incidentValue,
      message: message
    };
    createIncident(incidentData, $scope, api);
  };
  $scope.updateComponent = function(componentID, status) {
    console.log(status);
    var updateData = {
      id: componentID,
      status: status
    };
    api.updateComponent(updateData).success(function (data) {
      $scope.asideSuccess = data.message;
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
  $scope.updateIncident = function(incidentID) {
    $location.path('/incident/'+incidentID);
  };
}]);

sysStatusApp.controller('IncidentsCtrl', ['$scope', '$window', 'API', '$modal', '$route', '$location', function ($scope, $window, api, $modal, $route, $location) {
  if(parseInt($route.current.params.deleted, 10) === 1) {
    $scope.asideSuccess = 'Incident deleted.';
  } else if(parseInt($route.current.params.updated, 10) === 1) {
    $scope.asideSuccess = 'Incident updated.';
  } else if(parseInt($route.current.params.added, 10) === 1) {
    $scope.asideSuccess = 'Incident Added.';
  }
  getIncidents($scope, $location, api);
  $scope.newIncident = function() {
    var createIncidentModal = $modal.open({
        // Find controller in modals.js
        controller: NewIncidentModalCtrl,
        templateUrl: 'views/partials/newIncidentModal.html'
      });
    createIncidentModal.result.then(function (incidentData) {
      // This call has to be separate than createIncident() because we switch locations afterward, though we could TODO and setup the function to do it as well
      api.createIncident(incidentData).success(function (data) {
        $scope.asideSuccess = data.message;
        $scope.incident = '';
        $scope.message = '';
        $scope.incidentValue = 'Investigating';
        $location.path('/incidents').search({added: 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
  $scope.createIncident = function(incident, incidentValue, message) {
    var incidentData = {
      name: incident,
      type: incidentValue,
      message: message
    };
    createIncident(incidentData, $scope, api);
  };
  $scope.deleteIncidentReq = function(incidentID) {
    var incidentDeleteReqModal = $modal.open({
      controller: DeleteIncidentModalCtrl,
      resolve: {
        incidentID: function() {
          return incidentID;
        }
      },
      templateUrl: 'views/partials/incidents/incidentDeleteReqModal.html'
    });
    incidentDeleteReqModal.result.then(function (incidentDelData) {
      api.deleteIncident(incidentDelData).success(function () {
        $location.path('/incidents').search({'deleted': 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
}]);

sysStatusApp.controller('MaintenancesCtrl', ['$scope', '$window', '$location', 'API', '$route', '$modal', function ($scope, $window, $location, api, $route, $modal) {
  if(parseInt($route.current.params.added, 10) === 1) {
    $scope.asideSuccess = 'Maintenance added.';
  } else if(parseInt($route.current.params.deleted, 10) === 1) {
    $scope.asideSuccess = 'Maintenance deleted.';
  } else if(parseInt($route.current.params.updated, 10) === 1) {
    $scope.asideSuccess = 'Maintenance updated.';
  }
  getMaintenances($scope, $location, api);
  $scope.now = Date.now() + 120000; // Now plus 2 minutes
  $scope.remindSubsTool = {
    'title': 'Will send a reminder notification to email and SMS subscribers 60 minutes before maintainence is scheduled to start.',
    'animation': 'animation-fade',
    'placement': 'top',
    'trigger': 'hover click'
  };
  $scope.scheduleMaintenance = function() {
    $scope.maintenance.start.dateTime = $window.moment($scope.maintenance.start.date + ' ' + $scope.maintenance.start.time).valueOf();
    $scope.maintenance.end.dateTime = $window.moment($scope.maintenance.end.date + ' ' + $scope.maintenance.end.time).valueOf();
    api.addMaintenance($scope.maintenance).success(function () {
      $location.path('/incidents/maintenance/').search({'added': 1});
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
  $scope.deleteMaintenanceReq = function(maintainenceID) {
    var maintenanceDeleteReqModal = $modal.open({
      controller: DeleteMaintenanceModalCtrl,
      resolve: {
        maintainenceID: function() {
          return maintainenceID;
        }
      },
      templateUrl: 'views/partials/maintenanceDeleteReqModal.html'
    });
    maintenanceDeleteReqModal.result.then(function (maintenanceObj) {
      api.deleteMaintenance(maintenanceObj).success(function () {
        $location.path('/incidents/maintenance').search({'deleted': 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
}]);

sysStatusApp.controller('MaintenanceCtrl', ['$scope', '$window', '$location', 'API', '$route', '$filter', function ($scope, $window, $location, api, $route, $filter) {
  var maintenanceID = $route.current.params.id;
  api.getMaintenance(maintenanceID).success(function (maintenanceResponse) {
    $scope.maintenance = maintenanceResponse;
    $scope.maintenance.start = {};
    $scope.maintenance.end = {};
    $scope.maintenance.start.date = $filter('date')($scope.maintenance.startTime, 'yyyy-MM-dd');
    $scope.maintenance.start.time = $filter('date')($scope.maintenance.startTime, 'HH:mm');
    $scope.maintenance.end.date = $filter('date')($scope.maintenance.endTime, 'yyyy-MM-dd');
    $scope.maintenance.end.time = $filter('date')($scope.maintenance.endTime, 'HH:mm');
  }).error(function (error) {
    $scope.asideError = error.message;
  });
  $scope.updateMaintenanceEvent = function() {
    var maintenanceReq = {
      id: maintenanceID,
      type: $scope.maintenanceValue,
      details: $scope.details
    };
    api.updateMaintenanceEvent(maintenanceReq).success(function () {
      $location.path('/incidents/maintenance').search({'updated': 1});
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
  $scope.updatePrev = function(event) {
    event.maintenanceID = maintenanceID;
    event.date = $window.moment(event.days + ' ' + event.time).valueOf();
    api.updatePrevMaintenance(event).success(function (eventUpdateRes) {
      $scope.asideSuccess = eventUpdateRes.message;
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
  $scope.updateMaintenance = function() {
    $scope.maintenance.start.dateTime = $window.moment($scope.maintenance.start.date + ' ' + $scope.maintenance.start.time).valueOf();
    $scope.maintenance.end.dateTime = $window.moment($scope.maintenance.end.date + ' ' + $scope.maintenance.end.time).valueOf();
    api.updateMaintenance($scope.maintenance).success(function () {
      $location.path('/incidents/maintenance').search({'updated': 1});
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('TemplatesCtrl', [function () {}]);

sysStatusApp.controller('IncidentCtrl', ['$scope', '$route', '$window', 'API', '$location', function ($scope, $route, $window, api, $location) {
  var incidentID = $route.current.params.id;
  api.getIncident(incidentID).success(function (incidentResponse) {
    $scope.incident = incidentResponse.incident;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.updateIncident = function() {
    var incidentReq = {
      id: incidentID,
      type: $scope.incidentValue,
      message: $scope.message
    };
    api.updateIncident(incidentReq).success(function () {
      $location.path('/incidents').search({'updated': 1});
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
  $scope.updatePrev = function(event) {
    event.incidentID = incidentID;
    event.date = $window.moment(event.days + ' ' + event.time).valueOf();
    api.updatePrevIncident(event).success(function (eventUpdateRes) {
      $scope.asideSuccess = eventUpdateRes.message;
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('ComponentsCtrl', ['$scope', '$location', 'API', '$modal', '$route', function ($scope, $location, api, $modal, $route) {
  if(parseInt($route.current.params.deleted, 10) === 1) { // Use '==' instead of '===' for datatypes (string vs int)
    $scope.asideSuccess = 'Component deleted.';
  }
  getComponents($scope, $location, api);
  $scope.addComponent = function() {
    var componentModal = $modal.open({
      controller: ComponentModalCtrl,
      templateUrl: 'views/partials/componentModal.html'
    });
    componentModal.result.then(function (component) {
      api.setComponent(component).success(function (data) {
        $scope.asideSuccess = data.message;
        if($scope.componentError) {
          delete($scope.componentError);
        }
        $scope.components = $scope.components || [];
        // Set predefined status like the server-side
        component.status = 'Operational';
        $scope.components.push(component);
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
  $scope.deleteComponentReq = function(componentID) {
    var deleteComponentReqModal = $modal.open({
      controller: DeleteComponentModalCtrl,
      resolve: {
        componentID: function() {
          return componentID;
        }
      },
      templateUrl: 'views/partials/componentDeleteReqModal.html'
    });
    deleteComponentReqModal.result.then(function (component) {
      api.deleteComponent(component).success(function () {
        $location.path('/components').search({'deleted': 1});
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.asideError = error.message;
      });
    });
  };
}]);

sysStatusApp.controller('StatusPageCtrl', ['$scope', '$window', 'API', '$location', function ($scope, $window, api, $location) {
  getPrivateCompany($scope, $location, api);
  $scope.lastUpdate = $window.localStorage.getItem('lastUpdate') || Date.now();
}]);

sysStatusApp.controller('NotificationsCtrl', ['$scope', '$window', 'API', function ($scope, $window, api) {
  api.getSubscriptions().success(function (data) {
    $scope.allowAutoSubscribe = data.subscribers.types.autoIncident;
    $scope.userIndivComponents = data.subscribers.types.individComponent;
    $scope.userIndivIncidents = data.subscribers.types.individIncident;
    $scope.allowEmailSubs = !data.subscribers.email.disabled;
    $scope.allowSMSSubs = !data.subscribers.sms.disabled;
    $scope.allowWebSubs = !data.subscribers.webhook.disabled;
    $scope.subscribers = data.subscribers;
  }).error(function (error) {
    $scope.asideError = error.message;
  });
  $scope.allowAutoIncidentTool = {
    'title': 'Users can choose to be auto-subscribed to any incident that is posted.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
  $scope.allowIndivCompTool = {
    'title': 'Users can subscribe to components that interest them.<br />They will only receive notifications for incidents and scheduled maintainence for that component.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
  $scope.allowIndivIncidentsTool = {
    'title': 'Users can subscribe to a specific incident after it has been created.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
  $scope.allowEmailSubsTool = {
    'title': 'Users can get updates sent to them via email.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
  $scope.allowSMSSubsTools = {
    'title': 'Users can get updates sent to them via SMS.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
  $scope.allowWebSubsTools = {
    'title': 'Users can get updates sent to them via webhook.<br />All incident and component status changes will be sent.',
    'animation': true,
    'placement': 'top',
    'trigger': 'mouseenter'
  };
}]);

sysStatusApp.controller('MetricsCtrl', ['$scope', '$modal', 'API', '$window', '$route', '$location', function ($scope, $modal, api, $window, $route, $location) {
  if(parseInt($route.current.params.deleted, 10) === 1) {
    $scope.asideSuccess = 'Metric deleted.';
  }
  getMetrics($scope, $location, api);
  $scope.dataSources = [{value: 'selfData', displayName: 'I\'ll submit my own data for this metric.'}];
  $scope.addMetricReq = function() {
    var metricModal = $modal.open({
      controller: MetricModalCtrl,
      resolve: {
        dataSources: function() {
          return $scope.dataSources;
        }
      },
      templateUrl: 'views/partials/metricModal.html'
    });
    metricModal.result.then(function(metric) {
      api.createMetric(metric).success(function (metricResponse) {
        $location.path('/metric/'+metricResponse.id).search({'added': 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
  $scope.updateMetric = function(metricID, visibility) {
    var metric = {
      id: metricID,
      visibility: visibility
    };
    api.updateMetricVisibility(metric).success(function (metricResponse) {
      $scope.asideSuccess = metricResponse.message;
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('MetricCtrl', ['$scope', '$window', 'API', '$route', '$modal', '$location', '$filter', function ($scope, $window, api, $route, $modal, $location, $filter) {
  var metricID = $route.current.params.id || null;
  if(parseInt($route.current.params.added, 10) === 1) {
    $scope.asideSuccess = 'Metric added.';
  } else if(parseInt($route.current.params.updated, 10) === 1) {
    $scope.asideSuccess = 'Metric updated.';
  }
  getMetric($scope, $location, api, metricID);
  // TODO figure out why these are here
  //$scope.fn = {};
  //$scope.lineData = {};
  $scope.decimals = [
    {value: 0, displayName: 0},
    {value: 1, displayName: 1},
    {value: 2, displayName: 2},
    {value: 3, displayName: 3}
  ];
  $scope.updateInterval = function(newValue) {
    $scope.interval = newValue;
    // TODO repaint the graph with new changes
    switch($scope.interval) {
      case 'day':
        $scope.metric.data = $filter('dailyData')($scope.metric.data);
        break;
      case 'week':
        $scope.metric.data = $filter('weeklyData')($scope.metric.data);
        break;
      case 'month':
        $scope.metric.data = $filter('monthlyData')($scope.metric.data);
        break;
      default:
        break;
    }
  };
  $scope.deleteMetricReq = function() {
    var metricDeleteReqModal = $modal.open({
      controller: MetricDeleteModalCtrl,
      resolve: {
        metricID: function() {
          return metricID;
        }
      },
      templateUrl: 'views/partials/metricDeleteReqModal.html'
    });
    metricDeleteReqModal.result.then(function (metricDeleteData) {
      api.deleteMetric(metricDeleteData).success(function () {
        $location.path('/metrics').search({'deleted': 1});
      }).error(function (error) {
        $scope.error = error.message;
      });
    });
  };
  $scope.updateMetric = function() {
    var metric = $scope.metric;
    if(metric.data) {
      delete metric.data;
    }
    api.updateMetric(metric).success(function () {
      $window.location.href = '/metric/'+metric.id+'?updated=1';
    }).error(function (error) {
      $scope.error = error.message;
    });
  };
  $scope.aceLoaded = function(_editor){
    _editor.setShowPrintMargin(false);
  };
}]);

sysStatusApp.controller('MetricSourceCtrl', [function () {}]);

sysStatusApp.controller('CustomizeCtrl', ['$scope', '$window', 'API', '$modal', '$location', '$anchorScroll', function ($scope, $window, api, $modal, $location, $anchorScroll) {
  $scope.siteName = $window.localStorage.getItem('name') || null;
  api.getCustomData().success(function (customData) {
    $scope.customData = customData;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.addLogoModal = function() {
    var addLogoModal = $modal.open({
      controller: AddImageModalCtrl,
      templateUrl: 'views/partials/customize/addLogoModal.html'
    });
    addLogoModal.result.then(function (logoObj) {
      api.uploadLogo(logoObj).success(function (uploadResponse) {
        $scope.asideSuccess = uploadResponse.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.logoError = error.message;
      });
    });
  };
  $scope.addCoverModal = function() {
    var addCoverModal = $modal.open({
      controller: AddImageModalCtrl,
      templateUrl: 'views/partials/customize/addCoverModal.html'
    });
    addCoverModal.result.then(function (coverObj) {
      api.uploadCover(coverObj).success(function (uploadResponse) {
        $scope.asideSuccess = uploadResponse.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.coverError = error.message;
      });
    });
  };
  $scope.addFavModal = function() {
    var addFavModal = $modal.open({
      controller: AddFavModalCtrl,
      templateUrl: 'views/partials/customize/addFaviconModal.html'
    });
    addFavModal.result.then(function (favObj) {
      api.uploadFavicon(favObj).success(function (uploadResponse) {
        $scope.asideSuccess = uploadResponse.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.favError = error.message;
      });
    });
  };
  $scope.saveDesign = function() {
    // Scroll to top
    $anchorScroll();
    var customData = angular.copy($scope.customData);
    delete customData.favicon;
    delete customData.logo;
    delete customData.cover;
    api.setCustomData(customData).success(function (customResponse) {
      $scope.asideSuccess = customResponse.message;
    }).error(function (error) {
      $scope.error = error.message;
    });
  };
}]);

sysStatusApp.controller('CustomizeURLCtrl', ['$scope', 'API', '$location', function ($scope, api, $location) {
  api.getDomain().success(function (domainResponse) {
    $scope.customDomain = domainResponse.domain;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.updateDomain = function() {
    var domainData = {
      domain: $scope.customDomain
    };
    api.updateDomain(domainData).success(function (domainResponse) {
      $scope.asideSuccess = domainResponse.message;
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
}]);

sysStatusApp.controller('CustomizeCodeCtrl', [function () {}]);

sysStatusApp.controller('TeamMembersCtrl', [function() {}]);