var monitor = angular.module('monitor');
monitor.controller('ComplexController', [
  '$scope', '$element', 'row', 'close',
  function($scope, $element, row, close) {

    $scope.text = row.note;
    $scope.row = row;
    var initialNote = row.note;
    //  This close function doesn't need to use jQuery or bootstrap, because
    //  the button has the 'data-dismiss' attribute.
    $scope.save = function() {
      close({
        text: $scope.text
      }, 500); // close, but give 500ms for bootstrap to animate
    };

    //  This cancel function must use the bootstrap, 'modal' function because
    //  the doesn't have the 'data-dismiss' attribute.
    $scope.cancel = function() {

      //  Manually hide the modal.
      $element.modal('hide');

      //  Now call close, returning control to the caller.
      close({
        text: initialNote
      }, 500); // close, but give 500ms for bootstrap to animate
    };

  }
]);