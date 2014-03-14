/*global sysStatusApp, jQuery */
'use strict';

sysStatusApp.animation('.customize-error', function() {
  return {
    beforeAddClass : function(element, className, done) {
      if(className === 'ng-hide') {
        jQuery(element).animate({
          opacity:0
        }, done);
      }
      else {
        done();
      }
    },
    removeClass : function(element, className, done) {
      if(className === 'ng-hide') {
        element.css('opacity',0);
        jQuery(element).animate({
          opacity:1
        }, done);
      }
      else {
        done();
      }
    }
  };
});