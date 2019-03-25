"use strict";
var monitor = angular.module("monitor");

/**
	add/removes notes to the memory and the mongo db via post request
**/
monitor.service('ShowHours', ['ModalService', function(ModalService) {

  return function ShowHours(row) {
    var hours = row.hours;
    ModalService.showModal({
      templateUrl: "./services/prompt/hours.html",
      controller: "HoursController",
      inputs: {
        'row': row
      }
    }).then(function(modal) {
      modal.element.modal();
      // modal.close.then(function(result) {})
    });
  };
}])