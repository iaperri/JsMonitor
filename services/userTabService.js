"use strict";
var monitor = angular.module("monitor");

/**
	add/removes notes to the memory and the mongo db via post request
**/
monitor.service('ReadUserTabs', ['$http', function($http) {

  return function ReadUserTabs(callback) {
    $http.get('api/gettabs', { headers: { 'Content-Type': 'application/json' } })
      .then(function success(response) {
        callback(null, response.data);
      }, function error(err) {
        console.log("error when getting tabs " + err);
        return err;
      });
  };
}])