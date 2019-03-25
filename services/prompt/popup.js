var monitor = angular.module('monitor');

monitor.controller('PopUpController', ['$scope', 'close', 'msg', function($scope, close, msg) {

  $scope.alert = msg;
  $scope.close = close;

}]);