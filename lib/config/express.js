'use strict';

var express = require('express'),
    path = require('path'),
    RedisStore = require('connect-redis')(express),
    config = require('./config'),
    helmet = require('helmet'),
    settings = require('../controllers/settings'),
    cacheMaxAge = 604800000;

/**
 * Express configuration
 */
module.exports = function(app) {
  var scriptSrc, connectSrc;
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
    scriptSrc = ["'self'", "'unsafe-inline'", "http://www.google-analytics.com", config.url, 'http://localhost:35729', "'unsafe-eval'"];
    connectSrc = ["'self'", "ws://localhost:35729"];
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
    app.set('view cache', true);
    scriptSrc = ["'self'", "'unsafe-inline'", "http://www.google-analytics.com", config.url, "'unsafe-eval'"];
    connectSrc = ["'self'"];
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
    app.set('uploadRelative', 'uploads');
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
        httpOnly: false // Disabling allows us to see the cookie in Angular
      }
    }));
    app.use(helmet.csp({
      'default-src': ["'self'"],
      'script-src': scriptSrc,
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "http://placehold.it"],
      'connect-src': connectSrc,
      'font-src': ["'self'"],
      'object-src': ["'self'"],
      'media-src': ["'self'"],
      'frame-src': ["'self'"],
      reportOnly: false, // set to true if you only want to report errors
      setAllHeaders: false, // set to true if you want to set all headers
      safari5: false // set to true if you want to force buggy CSP in Safari 5
    }));
    // This middleware adds the Strict-Transport-Security header to the response.
    // To use the default header of Strict-Transport-Security: maxAge=15768000 (about 6 months)
    app.use(helmet.hsts());
    // `X-Frame` specifies whether your app can be put in a frame or iframe.
    app.use(helmet.xframe('deny'));
    // The X-XSS-Protection header is a basic protection against XSS.
    app.use(helmet.iexss());
    // Sets the `X-Download-Options` header to noopen to prevent IE users from executing downloads in your site's context.
    app.use(helmet.ienoopen());
    // The following sets the `X-Content-Type-Options` header to its only and default option, nosniff.
    app.use(helmet.contentTypeOptions());
    // This middleware will remove the `X-Powered-By` header if it is set.
    app.use(helmet.hidePoweredBy());
    app.use(function (req, res, next) {
      // POSTS send an OPTIONS request first so let's make sure we handle those
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
      next();
    });
    // Router needs to be last
    app.use(app.router);
  });
};