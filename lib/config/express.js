'use strict';

var express = require('express'),
    path = require('path'),
    RedisStore = require('connect-redis')(express),
    config = require('./config'),
    cacheMaxAge = 86400000;

/**
 * Express configuration
 */
module.exports = function(app) {
  app.configure('development', function(){
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  });

  app.configure(function(){
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.cookieParser("UF!J^6T7f!SrNpJL551nGmQ8arorAscZHmRByeb3*M$EF2lV"));
    // Used instead of app.use(express.cookieSession());
    app.use(express.session({
      store: new RedisStore,
      proxy: true, // Trust the reverse proxy when setting secure cookies 
      cookie: {
        secure: false, // Important! Otherwise you'll get Forbidden 403
        maxAge: cacheMaxAge, // 1 week
        httpOnly: true
      }
    }));
    app.use(function (req, res, next) {
      // POSTS send an OPTIONS request first so let's make sure we handle those
      res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
      next();
    });
    // Router needs to be last
    app.use(app.router);
  });
};