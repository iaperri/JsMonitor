"use strict";
var monitor = angular.module("monitor");

/**
  add/removes notes to the memory and the mongo db via post request
**/
monitor.service('PopUp', ['ModalService', function(ModalService) {

  return function PopUpService(msg) {

    ModalService.showModal({
      templateUrl: "./services/prompt/popup.html",
      controller: "PopUpController",
      inputs: {
        'msg': msg
      }
    }).then(function(modal) {
      modal.element.modal();
    });
  };
}])