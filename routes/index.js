var express = require('express'),
  router = express.Router(),
  units = require('../lib/units'),
  tabs = require('../lib/tabs'),
  columns = require('../lib/extracolumns'),
  ensure = require('../passport/ensureAuthenticated'),
  api = require('./api'),
  openinghours = require('../lib/openinghours'),
  logger = require('../lib/logger'),
  isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated()) return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('./');
  };
module.exports = function(passport) {
  router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('index', {
      message: req.flash('message')
    });
  });
  "use strict";
  /* Handle Login POST */
  router.post('/login', passport.authenticate('login', {
    successRedirect: 'monitor',
    failureRedirect: './',
    failureFlash: true
  }));
  router.get('/monitor', isAuthenticated, function(req, res) {
    logger.info('request user ' + req.user.username)
    // columns.recreateColumns(req.user.username);

    setTimeout(function() {
      require('../lib/tabs').getTabs(req.user.username, (err, tabs) => {
        if (err || (tabs.length === 0)) {
          logger.error('error when searching for tabs for user ' + req.user.username);
          res.redirect('./');
        }
        logger.info('tabs ' + JSON.stringify(tabs));
        res.render('monitorTab', { tabsA: tabs });
      });
      // var tabs =[{'id':'socialite','name':'Socialite','resolution': ''},{'id':'scala','name':'Scala','resolution':"width: 1000px"}];

    }, 1000);
    // startTest();
  });
  /* Handle Logout */
  router.get('/signout', function(req, res) {
    req.logout();
    res.redirect('./');
  });
  router.all('/api/*', ensure);
  // router.get('/api/user-check', api.userCheck);
  router.get('/api/hoursdata', openinghours.getHoursDataFromDb);
  // router.get('/api/hoursdata', openinghours.getOpeningHoursFromDb);
  router.get('/api/firstData', units.multiFetch);
  router.get('/api/gettabs', api.getTabs);
  router.get('/api/fetchdata', units.fetchData);
  router.get('/api/extracolumns/isopen', api.isOpen);
  router.get('/api/columns', api.getColumns);
  router.get('/api/extraColumns', api.getExtraColumns);
  // router.post('/api/extracolumns/externalstore', api.externalStoreOneObj);
  router.post('/api/extracolumns/addCol', api.addCol);
  router.post('/api/extracolumns/removeCol', api.removeCol);
  router.get('/')
  // router.post('/secure/store', passport.authenticate('rest', {
  //     failureRedirect: '/login'
  // }), units.storeUnits);
  return router;
}