(
  function() {
    "use strict";
    agGrid.initialiseAgGridWithAngular1(angular);

    var monitor = angular.module("monitor");
    monitor.factory('ScalaGrid', ['MonitorGrid', function(MonitorGrid) {
      var health = {
        HEALTHY: 10,
        UNHEALTHY: 20,
        HEARTBEAT_OVERDUE: 30,
        NOT_REPORTED: 0
      }
      var ScalaGrid = function(id, endPoints, specialColumns, columnDefs, gridOptionsExtra) {
        this.id = id;
        this.closedUnits = {};
        this.name = this.id.charAt(0).toUpperCase() + this.id.slice(1);
        MonitorGrid.call(this, this.id, endPoints, specialColumns, undefined, columnDefs, gridOptionsExtra);
      };

      ScalaGrid.prototype = Object.create(MonitorGrid.prototype);
      ScalaGrid.prototype.constructor = MonitorGrid;

      // var copyText = function copyText(params) {
      //     MonitorGrid.prototype.copyText(params.value);
      // };



      ScalaGrid.prototype.healthComparator = function(health1, health2) {
        if (health[health1] > health[health2]) {
          return 1;
        } else if (health[health2] > health[health1]) {
          return -1;
        }
        return 0;
      }

      return ScalaGrid;
    }]);
  })()