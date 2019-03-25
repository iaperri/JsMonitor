(
  function() {
    "use strict";
    agGrid.initialiseAgGridWithAngular1(angular);

    var monitor = angular.module("monitor");
    monitor.factory('SocialiteGrid', ['MonitorGrid', function(MonitorGrid) {

      var SocialiteGrid = function(id, endPoints, specialColumns, columnDefs) {
        this.id = id;
        this.closedUnits = {};
        this.name = this.id.charAt(0).toUpperCase() + this.id.slice(1);
        MonitorGrid.call(this, id, endPoints, specialColumns, this.closedUnits, columnDefs);
      };

      SocialiteGrid.prototype = Object.create(MonitorGrid.prototype);
      SocialiteGrid.prototype.constructor = MonitorGrid;


      // SocialiteGrid.prototype.showHours = function(params) {
      //   new ShowHours(params.data, MonitorGrid.prototype.gridOptions);
      //   // MonitorGrid.prototype.showHours(params);
      //   console.log("Opening Hours [Unit " + params.data.unitId + "]: " + JSON.stringify(params.data.hours));
      // };

      return SocialiteGrid;
    }]);
  })()