/* global sysStatusApp, Favico */
'use strict';

/* https://github.com/ejci/favico.js/blob/master/example-angular/favicoService.js */
sysStatusApp.factory('favicoService', [function() {
  var favico = new Favico({
    animation : 'fade'
  });

  var badge = function(num) {
    favico.badge(num);
  };
  var reset = function() {
    favico.reset();
  };
  return {
    badge : badge,
    reset : reset
  };
}]);