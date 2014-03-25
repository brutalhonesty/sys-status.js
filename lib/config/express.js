'use strict';

var express = require('express'),
    path = require('path'),
    RedisStore = require('connect-redis')(express),
    config = require('./config'),
    settings = require('../controllers/settings'),
    cacheMaxAge = 604800000;

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
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.set('views', config.root + '/app/views');
    app.set('view cache', false);
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
    app.set('view cache', true);
  });

  app.configure(function(){
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.methodOverride());
    app.use(express.urlencoded());
    app.use(express.json());
    app.set('uploadDir', path.join(config.root, 'uploads'));
    app.set('uploadRelative', path.resolve('uploads'));
    app.use(function (req, res, next) {
      req.uploadDir = app.get('uploadDir');
      req.uploadRelative = app.get('uploadRelative');
      next();
    });
    app.use(express.bodyParser({ keepExtensions: true, uploadDir: app.get('uploadDir') }));
    app.use(express.cookieParser(settings.cookie.secret));
    // Used instead of app.use(express.cookieSession());
    app.use(express.session({
      store: new RedisStore({
        host: settings.redis.ip,
        port: settings.redis.port
      }),
      proxy: true, // Trust the reverse proxy when setting secure cookies
      cookie: {
        secure: false, // Important! Otherwise you'll get Forbidden 403
        maxAge: cacheMaxAge, // 1 week
        httpOnly: true
      }
    }));
    app.use(function (req, res, next) {
      // POSTS send an OPTIONS request first so let's make sure we handle those
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
      res.header('Content-Security-Policy', 'script-src \'self\'');
      res.header('Content-Security-Policy', 'style-src \'self\' \'unsafe-inline\';');
      res.header('X-Frame-Options', 'SAMEORIGIN');
      res.header('X-Content-Type-Options', 'nosniff');
      next();
    });
    // Router needs to be last
    app.use(app.router);
  });
};