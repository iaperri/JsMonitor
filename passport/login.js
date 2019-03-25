"use strict";

const LocalStrategy = require('passport-local').Strategy,
  bCrypt = require('bcrypt-nodejs'),
  db = require('../lib/mongo.js'),
  logger = require('../lib/logger');

module.exports = function(passport) {
  passport.use('login', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      db.findOne('users', { 'username': username },

        // check in mongo if a user with username exists or not
        // User.findOne({ 'username' :  username },
        function(err, user) {
          // In case of any error, return using the done method
          if (err)
            return done(err);
          // Username does not exist, log error & redirect back
          // console.log('err ' + err + ' user ' + JSON.stringify(user));
          if (!user) {
            logger.info('User Not Found with username ' + username);
            return done(null, false, req.flash('message', 'User Not found.'));
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user, password)) {
            logger.info('Invalid User Password combination');
            return done(null, false,
              req.flash('message', 'Invalid Password'));
          }

          // require('../lib/username.js').setName(username);
          // User and password both match, return user from
          // done method which will be treated like success
          return done(null, user);
        }
      );
    }));
  var isValidPassword = function(user, password) {
    // bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    return bCrypt.compareSync(password, user.password);
  };
  passport.use('rest', new LocalStrategy({
      passReqToCallback: true,
      passwordField: 'token'
    },
    function(req, username, password, done) {
      db.findOne('rests', { 'username': username },

        // check in mongo if a user with username exists or not
        // User.findOne({ 'username' :  username },
        function(err, user) {
          // In case of any error, return using the done method
          if (err)
            return done(err);
          // Username does not exist, log error & redirect back
          // if (!user){
          //   logger.info('User Not Found with username ' + username);
          //   return done(null, false, req.flash('message', 'User Not found.'));
          // }
          // User exists but wrong password, log the error
          if (!isValidCryptedPassword(user, password)) {
            logger.info('Invalid User Password combination');
            return done(null, false,
              req.flash('message', 'Invalid Password'));
          }
          // User and password both match, return user from
          // done method which will be treated like success
          return done(null, user);
        }
      );
    }));
  var isValidCryptedPassword = function(user, password) {
    // bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    return password === user.password;
  };
  passport.use('admin', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {
      db.findOne('admins', { 'username': username },

        // check in mongo if a user with username exists or not
        // User.findOne({ 'username' :  username },
        function(err, user) {
          // In case of any error, return using the done method
          if (err)
            return done(err);
          // Username does not exist, log error & redirect back
          if (!user) {
            logger.info('User Not Found with username ' + username);
            return done(null, false, req.flash('message', 'User Not found.'));
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user, password)) {
            logger.info('Invalid Password');
            return done(null, false,
              req.flash('message', 'Invalid Password'));
          }
          // User and password both match, return user from
          // done method which will be treated like success
          return done(null, user);
        }
      );
    }));
};

//
// var LocalStrategy   = require('passport-local').Strategy;
// // var User = require('../models/user');
// var bCrypt = require('bcrypt-nodejs');
// var db = require('../routes/mongo.js');
//
// module.exports = function(passport){
//     passport.use('login', new LocalStrategy({
//       passReqToCallback : true
//     },
//     function(req, username, password, done) {
//       db.findOne('users', {'username':username.toString()},
//
//       // check in mongo if a user with username exists or not
//       // User.findOne({ 'username' :  username },
//         function(err, user) {
//           // In case of any error, return using the done method
//           if (err)
//             return done(err);
//           // Username does not exist, log error & redirect back
//           if (!user){
//             console.log('User Not Found with username ' + username);
//             return done(null, false, req.flash('message', 'User Not found.'));
//           }
//           // User exists but wrong password, log the error
//           if (!isValidPassword(user, password)){
//             console.log('Invalid Password');
//             return done(null, false,
//                 req.flash('message', 'Invalid Password'));
//           }
//           // User and password both match, return user from
//           // done method which will be treated like success
//           return done(null, user);
//         }
//       );
//   }));
//   var isValidPassword = function(user, password){
//     // bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
//       return bCrypt.compareSync(password, user.password);
//   }
// };