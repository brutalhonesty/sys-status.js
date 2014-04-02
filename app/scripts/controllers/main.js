/* jshint undef: false, unused: false, camelcase: false */
/* global sysStatusApp, d3, moment, OAuth */
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

function getCompany($scope, $location, api, favicoService) {
  // Get the company object from the server
  api.getCompany().success(function (companyData) {
    $scope.company = companyData.company;
    var badgeCtr = 0;
    for(var cmpCtr = 0; cmpCtr < $scope.company.components.length; cmpCtr++) {
      if($scope.company.components[cmpCtr].status !== 'Operational') {
        badgeCtr++;
      }
    }
    // TODO We would change this check to a for-loop and check for 'not completion' incase we flagged an incident instead of actually deleting it
    favicoService.badge($scope.company.incidents.length + badgeCtr);
    $scope.incidentDates = pastTenDays();
    // Used for graphs
    $scope.xAxisTickFormatFunction = function(){
      return function(d) {
        return d3.time.format('%H:%M')(moment(d).toDate());
        // TODO Figure out how this changes when the data is repainted
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
    // TODO Figure out a way to poll new metric data.
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

function MainCtrl(api, $location) {
  api.checkCookie().success(function () {
    $location.path('/dashboard');
  });
}
MainCtrl.$inject = ['API', '$location'];
sysStatusApp.controller('MainCtrl', MainCtrl);
function NotFoundCtrl(cssInjector) {
  cssInjector.add('../../styles/notfound.css');
  cssInjector.setSinglePageMode(true);
}
NotFoundCtrl.$inject = ['cssInjector'];

sysStatusApp.controller('NotFoundCtrl', NotFoundCtrl);
function NavbarCtrl($scope, $location, $window) {
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
  $scope.name = $window.localStorage.getItem('name') || null;
  $scope.site = $window.localStorage.getItem('site') || null;
  // If we are on the link that is passed to the function, set the class as active
  $scope.isActive = function(route) {
    return route === $location.path();
  };
}
NavbarCtrl.$inject = ['$scope', '$location', '$window'];
sysStatusApp.controller('NavbarCtrl', NavbarCtrl);

function LoginCtrl($scope, api, $location, $window) {
  $scope.login = function() {
    api.login($scope.email, $scope.password).success(function (data) {
      // Get site name to local storage
      $window.localStorage.setItem('site', data.site);
      $window.localStorage.setItem('name', data.name);
      $location.path('/dashboard');
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
}
LoginCtrl.$inject = ['$scope', 'API', '$location', '$window'];
sysStatusApp.controller('LoginCtrl', LoginCtrl);

function GetStartedCtrl($scope, api, $location, $window) {
  $scope.register = function () {
    var registerData = {
      name: $scope.site,
      email: $scope.email,
      domain: $scope.domain,
      password: $scope.password
    };
    api.register(registerData).success(function (registerResponse) {
      $location.path('/dashboard').search({'registered': 1});
      $window.localStorage.setItem('site', registerResponse.site);
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
}
GetStartedCtrl.$inject = ['$scope', 'API', '$location', '$window'];
sysStatusApp.controller('GetStartedCtrl', GetStartedCtrl);

function DashboardCtrl($scope, $location, api, $modal, $route) {
  if(parseInt($route.current.params.registered, 10) === 1) {
    $scope.asideSuccess = 'Successfully registered.';
  }
  getComponents($scope, $location, api);
  getIncidents($scope, $location, api);
  $scope.newIncident = function() {
    var createIncidentModal = $modal.open({
      // Find controller in modals.js
      controller: 'NewIncidentModalCtrl',
      templateUrl: 'partials/newIncidentModal.html'
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
}
DashboardCtrl.$inject = ['$scope', '$location', 'API', '$modal', '$route'];
sysStatusApp.controller('DashboardCtrl', DashboardCtrl);


function IncidentsCtrl($scope, $window, api, $modal, $route, $location) {
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
        controller: 'NewIncidentModalCtrl',
        templateUrl: 'partials/newIncidentModal.html'
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
      controller: 'DeleteIncidentModalCtrl',
      resolve: {
        incidentID: function() {
          return incidentID;
        }
      },
      templateUrl: 'partials/incidents/incidentDeleteReqModal.html'
    });
    incidentDeleteReqModal.result.then(function (incidentDelData) {
      api.deleteIncident(incidentDelData).success(function () {
        $location.path('/incidents').search({'deleted': 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
}
IncidentsCtrl.$inject = ['$scope', '$window', 'API', '$modal', '$route', '$location'];

sysStatusApp.controller('IncidentsCtrl', IncidentsCtrl);

function MaintenancesCtrl($scope, $location, api, $route, $modal) {
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
    $scope.maintenance.start.dateTime = moment($scope.maintenance.start.date + ' ' + $scope.maintenance.start.time).valueOf();
    $scope.maintenance.end.dateTime = moment($scope.maintenance.end.date + ' ' + $scope.maintenance.end.time).valueOf();
    api.addMaintenance($scope.maintenance).success(function () {
      $location.path('/incidents/maintenance/').search({'added': 1});
    }).error(function (error) {
      $scope.asideError = error.message;
    });
  };
  $scope.deleteMaintenanceReq = function(maintainenceID) {
    var maintenanceDeleteReqModal = $modal.open({
      controller: 'DeleteMaintenanceModalCtrl',
      resolve: {
        maintainenceID: function() {
          return maintainenceID;
        }
      },
      templateUrl: 'partials/maintenanceDeleteReqModal.html'
    });
    maintenanceDeleteReqModal.result.then(function (maintenanceObj) {
      api.deleteMaintenance(maintenanceObj).success(function () {
        $location.path('/incidents/maintenance').search({'deleted': 1});
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
}
MaintenancesCtrl.$inject = ['$scope', '$location', 'API', '$route', '$modal'];
sysStatusApp.controller('MaintenancesCtrl', MaintenancesCtrl);

function MaintenanceCtrl($scope, $window, $location, api, $route, $filter) {
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
}
MaintenanceCtrl.$inject = ['$scope', '$window', '$location', 'API', '$route', '$filter'];

sysStatusApp.controller('MaintenanceCtrl', MaintenanceCtrl);

function TemplatesCtrl() {}
TemplatesCtrl.$inject = [];
sysStatusApp.controller('TemplatesCtrl', TemplatesCtrl);


function IncidentCtrl($scope, $route, $window, api, $location) {
  if(parseInt($route.current.params.saved, 10) === 1) {
    $scope.asideSuccess = 'Postmortem saved.';
  } else if(parseInt($route.current.params.reported, 10) === 1) {
    $scope.asideSuccess = 'Postmortem reported.';
  }
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
}
IncidentCtrl.$inject = ['$scope', '$route', '$window', 'API', '$location'];
sysStatusApp.controller('IncidentCtrl', IncidentCtrl);

function IncidentPostmortemCtrl($scope, api, $route, $location) {
  var incidentID = $route.current.params.id;
  api.getIncident(incidentID).success(function (incidentResponse) {
    $scope.incident = incidentResponse.incident;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.submitReport = function() {
    var reportReq = {
      id: incidentID,
      data: $scope.incident.postmortem.data,
      completed: true
    };
    api.savePostMortem(reportReq).success(function () {
      $location.path('/incident/' + incidentID).search({'reported': 1});
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
  $scope.saveDraft = function() {
    var reportReq = {
      id: incidentID,
      data: $scope.incident.postmortem.data,
      completed: false
    };
    api.savePostMortem(reportReq).success(function () {
      $location.path('/incident/' + incidentID).search({'saved': 1});
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
  $scope.editReport = function() {
    $scope.incident.postmortem.completed = !$scope.incident.postmortem.completed;
    $scope.report = $scope.incident.postmortem.data;
  };
}
IncidentPostmortemCtrl.$inject = ['$scope', 'API', '$route', '$location'];
sysStatusApp.controller('IncidentPostmortemCtrl', IncidentPostmortemCtrl);

function ComponentsCtrl($scope, $location, api, $modal, $route) {
  if(parseInt($route.current.params.deleted, 10) === 1) { // Use '==' instead of '===' for datatypes (string vs int)
    $scope.asideSuccess = 'Component deleted.';
  }
  getComponents($scope, $location, api);
  $scope.addComponent = function() {
    var componentModal = $modal.open({
      controller: 'ComponentModalCtrl',
      templateUrl: 'partials/componentModal.html'
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
  $scope.editComponent = function(componentID, componentName, description) {
    var editComponentModal = $modal.open({
      controller: 'EditComponentModalCtrl',
      templateUrl: 'partials/editComponentModal.html',
      resolve: {
        componentID: function() {
          return componentID;
        },
        componentName: function() {
          return componentName;
        },
        description: function() {
          return description;
        }
      }
    });
    editComponentModal.result.then(function (component) {
      api.editComponent(component).success(function (componentResponse) {
        $scope.asideSuccess = componentResponse.message;
      }).error(function (error) {
        $scope.asideError = error.message;
      });
    });
  };
  $scope.deleteComponentReq = function(componentID) {
    var deleteComponentReqModal = $modal.open({
      controller: 'DeleteComponentModalCtrl',
      resolve: {
        componentID: function() {
          return componentID;
        }
      },
      templateUrl: 'partials/componentDeleteReqModal.html'
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
}
ComponentsCtrl.$inject = ['$scope', '$location', 'API', '$modal', '$route'];
sysStatusApp.controller('ComponentsCtrl', ComponentsCtrl);

function StatusPageCtrl($scope, $window, api, $location, favicoService) {
  getCompany($scope, $location, api, favicoService);
  $scope.lastUpdate = $window.localStorage.getItem('lastUpdate') || Date.now();
}
StatusPageCtrl.$inject = ['$scope', '$window', 'API', '$location', 'favicoService'];
sysStatusApp.controller('StatusPageCtrl', StatusPageCtrl);

function NotificationsCtrl($scope, $window, api) {
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
}
NotificationsCtrl.$inject = ['$scope', '$window', 'API'];
sysStatusApp.controller('NotificationsCtrl', NotificationsCtrl);

function MetricsCtrl($scope, $modal, api, $window, $route, $location) {
  if(parseInt($route.current.params.deleted, 10) === 1) {
    $scope.asideSuccess = 'Metric deleted.';
  }
  getMetrics($scope, $location, api);
  $scope.dataSources = [{value: 'selfData', displayName: 'I\'ll submit my own data for this metric.'}];
  $scope.addMetricReq = function() {
    var metricModal = $modal.open({
      controller: 'MetricModalCtrl',
      resolve: {
        dataSources: function() {
          return $scope.dataSources;
        }
      },
      templateUrl: 'partials/metricModal.html'
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
}
MetricsCtrl.$inject = ['$scope', '$modal', 'API', '$window', '$route', '$location'];
sysStatusApp.controller('MetricsCtrl', MetricsCtrl);


function MetricCtrl($scope, $window, api, $route, $modal, $location, $filter) {
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
      controller: 'MetricDeleteModalCtrl',
      resolve: {
        metricID: function() {
          return metricID;
        }
      },
      templateUrl: 'partials/metricDeleteReqModal.html'
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
}
MetricCtrl.$inject = ['$scope', '$window', 'API', '$route', '$modal', '$location', '$filter'];
sysStatusApp.controller('MetricCtrl', MetricCtrl);

function MetricSourceCtrl() {}
MetricSourceCtrl.$inject = [];
sysStatusApp.controller('MetricSourceCtrl', MetricSourceCtrl);

function CustomizeCtrl($scope, $window, api, $modal, $location, $anchorScroll) {
  $scope.siteName = $window.localStorage.getItem('site') || null;
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
      controller: 'AddImageModalCtrl',
      templateUrl: 'partials/customize/addLogoModal.html'
    });
    addLogoModal.result.then(function (logoObj) {
      api.uploadLogo(logoObj).success(function (uploadResponse) {
        $anchorScroll();
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
      controller: 'AddImageModalCtrl',
      templateUrl: 'partials/customize/addCoverModal.html'
    });
    addCoverModal.result.then(function (coverObj) {
      api.uploadCover(coverObj).success(function (uploadResponse) {
        $anchorScroll();
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
      controller: 'AddFavModalCtrl',
      templateUrl: 'partials/customize/addFaviconModal.html'
    });
    addFavModal.result.then(function (favObj) {
      api.uploadFavicon(favObj).success(function (uploadResponse) {
        $anchorScroll();
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
}
CustomizeCtrl.$inject = ['$scope', '$window', 'API', '$modal', '$location', '$anchorScroll'];
sysStatusApp.controller('CustomizeCtrl', CustomizeCtrl);

function CustomizeURLCtrl($scope, api, $location) {
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
}
CustomizeURLCtrl.$inject = ['$scope', 'API', '$location'];
sysStatusApp.controller('CustomizeURLCtrl', CustomizeURLCtrl);

function CustomizeCodeCtrl(){}
CustomizeCodeCtrl.$inject = [];
sysStatusApp.controller('CustomizeCodeCtrl', CustomizeCodeCtrl);

function TeamMembersCtrl($scope, $modal, api, $location) {
  api.getMembers().success(function (membersResponse) {
    $scope.members = membersResponse.members;
  }).error(function (error) {
    $scope.asideError = error.message;
  });
  $scope.addMember = function() {
    var memberModal = $modal.open({
      controller: 'AddMemberModalCtrl',
      templateUrl: 'partials/team/addMemberModal.html'
    });
    memberModal.result.then(function (memberObj) {
      api.addMember(memberObj).success(function (memberResponse) {
        $scope.asideSuccess = memberResponse.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.asideError = error.message;
      });
    });
  };
}
TeamMembersCtrl.$inject = ['$scope', '$modal', 'API', '$location'];
sysStatusApp.controller('TeamMembersCtrl', TeamMembersCtrl);

function ProfileCtrl($scope, api, $window, $location, $modal) {
  $scope.siteName = $window.localStorage.getItem('site') || null;
  api.getProfile().success(function (profileResponse) {
    $scope.user = profileResponse.profile;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.updateProfile = function(user) {
    api.updateProfile(user).success(function (updateResponse) {
      $scope.asideSuccess = updateResponse.message;
      // Update user's full  name if we get it.
      $window.localStorage.setItem('name', updateResponse.name);
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
  $scope.changePassword = function() {
    var changePassModal = $modal.open({
      controller: 'ChangePasswordModalCtrl',
      templateUrl: 'partials/changePasswordModal.html'
    });
    changePassModal.result.then(function (passData) {
      api.changePassword(passData).success(function(passwordResponse) {
        $scope.asideSuccess = passwordResponse.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.asideError = error.message;
      });
    });
  };
}
ProfileCtrl.$inject = ['$scope', 'API', '$window', '$location', '$modal'];
sysStatusApp.controller('ProfileCtrl', ProfileCtrl);

function LogoutCtrl($scope, api, $location, $window) {
  api.logout().success(function () {
    $window.localStorage.clear();
    $location.path('/');
  }).error(function (error) {
    $location.path('/');
  });
}
LogoutCtrl.$inject = ['$scope', 'API', '$location', '$window'];
sysStatusApp.controller('LogoutCtrl', LogoutCtrl);

function IntegrationCtrl(){}
IntegrationCtrl.$inject = [];
sysStatusApp.controller('IntegrationCtrl', IntegrationCtrl);

function TwitterCtrl($scope, $rootScope, $location, $route, api, $modal) {
  if(parseInt($route.current.params.success, 10) === 1) {
    $scope.asideSuccess = 'Twitter Integration added successfully.';
  }
  api.getTwitter().success(function (twitterData) {
    $scope.twitter = twitterData.twitter;
  }).error(function (error, statusCode) {
    if(statusCode === 401) {
      $location.path('/login');
    }
    $scope.asideError = error.message;
  });
  $scope.connect = function() {
    OAuth.clearCache('twitter');
    // TODO We need to allow users to add their own public key into the OAuth.intialize() call.
    OAuth.initialize('ZNZlK8viQrfv1XHS0oKElhe9lNw');
    OAuth.popup('twitter', {authorize: {force_login: true}}, function (err, res) {
      if(err) {
        $scope.asideError = err.message;
      } else {
        api.storeTwitter(res).success(function () {
          $location.path('/integration/twitter').search({'success': 1});
        }).error(function (error, statusCode) {
          if(statusCode === 401) {
            $location.path('/login');
          }
          $scope.asideError = error.message;
        });
      }
      $scope.$apply();
    });
  };
  $scope.deauthorize = function() {
    var deauthorizeModal = $modal.open({
      controller: 'DeauthorizeModalCtrl',
      templateUrl: 'partials/integration/deauthorizeModal.html'
    });
    deauthorizeModal.result.then(function () {
      api.removeTwitter().success(function (removedData) {
        $scope.asideSuccess = removedData.message;
      }).error(function (error, statusCode) {
        if(statusCode === 401) {
          $location.path('/login');
        }
        $scope.asideError = error.message;
      });
    });
  };
  $scope.updateTwitter = function(twitter) {
    api.updateTwitter(twitter).success(function (updateData) {
      $scope.asideSuccess = updateData.message;
    }).error(function (error, statusCode) {
      if(statusCode === 401) {
        $location.path('/login');
      }
      $scope.asideError = error.message;
    });
  };
  $scope.prefixMessage = 'Tweets can get the status type or any string prefixed to them to differentiate them from other status tweets.<br><br>Example: &lt;status&gt;Issue with component, looking into it.';
  $scope.suffixMessage = 'Tweets can get the url or any string suffixed to them.<br><br>Example: Issue with component, looking into it.&lt;siteurl&gt;';
}
TwitterCtrl.$inject = ['$scope', '$rootScope', '$location', '$route', 'API', '$modal'];
sysStatusApp.controller('TwitterCtrl', TwitterCtrl);

function AutomateCtrl(){}
AutomateCtrl.$inject = [];
sysStatusApp.controller('AutomateCtrl', AutomateCtrl);