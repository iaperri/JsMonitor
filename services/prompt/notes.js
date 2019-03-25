var monitor = angular.module('monitor');
monitor.controller('NotesController', [
  '$scope', '$element', 'row', 'field', 'close',

  function($scope, $element, row, field, close) {

    $scope.text = row[field];
    $scope.row = row;
    var initialNote = row[field];
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