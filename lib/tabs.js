"use strict";
var db = require('../lib/mongo.js');
(function getTabs() {
  module.exports = {
    getTabs: function(username, callback) {
      db.findOne('users', { 'username': username },
        function(err, user) {
          // In case of any error, return using the done method
          if (err) {
            callback(err);
          }
          db.findWithQuery('tabs', { 'id': { '$in': user.tabs } },
            function(err, tabs) {
              if (err) {
                callback(err);
              }
              callback(null, tabs.sort((t1, t2) => {
                return t1.name.localeCompare(t2.name);
              }));
            });
        });
    }
  };
})()