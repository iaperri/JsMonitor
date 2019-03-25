var monitor = angular.module('monitor');
monitor.controller('HoursController', [
  '$scope', '$sce', '$element', 'row', 'close',
  function($scope, $sce, $element, row, close) {
    var WEEKDAYS = { "2": "Monday", "3": "Tuesday", "4": "Wednesday", "5": "Thurday", "6": "Friday", "7": "Saturday", "1": "Sunday" };
    $scope.unitId = row.unitId;
    $scope.hours = row.hours;
    var openCloseH, i, weekDay, dow, dayHours,
      hours = '',
      hoursStr = '',
      end = false;
    hoursA = [],
      dow = new Date().getDay() + 1;

    console.log('dow ' + dow);

    openCloseH = row.openCloseHours;

    for (i = 1; i < 8 && !end; i++) {
      if (i === 7) {
        i = 0;
        end = true;
      }
      dayHours = openCloseH[i];
      hoursA.push(dayHours);
      hours = dayHours.hours;
      hoursStr += "<p>" + WEEKDAYS[dayHours.dow] + '</br>';
      if (dow.toString() === dayHours.dow) {
        if (row.isOpen === 'open') {
          hoursStr += "<div style='background-color:#16C895'>";
        } else {
          hoursStr += "<div style='background-color:#F05959'>";
        }
        hoursStr += hours + '</div></p>';
      } else {
        hoursStr += hours + '</p>';
      }
    }
    $scope.hours = hoursStr;
    $scope.trustedHours = $sce.trustAsHtml($scope.hours);
    $scope.isOpen = row.isOpen;

    // $scope.hours = row.hours;
    //  This close function doesn't need to use jQuery or bootstrap, because
    //  the button has the 'data-dismiss' attribute.
    $scope.ok = function() {
      close({}, 500); // close, but give 500ms for bootstrap to animate
    };

  }
]);