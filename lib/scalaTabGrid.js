(
  function() {
    "use strict";
    agGrid.initialiseAgGridWithAngular1(angular);

    var monitor = angular.module("monitor");
    monitor.factory('ScalaTabGrid', ['ScalaGrid', 'AddNotes', 'AddDates', function(ScalaGrid, AddNotes, AddDates) {
      var ScalaTabGrid = function(id) {
        this.id = id;
        this.name = this.id.charAt(0).toUpperCase() + this.id.slice(1);
        let endPoints = createEndPoints(this.name);
        let columnDefs = scalaColumnDefs.slice(0);
        ScalaGrid.call(this, this.id, endPoints, specialColumns, columnDefs, gridOptionsExtra);
      };

      function createEndPoints(name) {
        var endPoints = {};
        endPoints.main = 'main' + name;
        let volatiles = {};
        // volatiles['scala' + name + 'Vol'] = 'scala' + name + 'Vol';
        volatiles['main' + name] = 'main' + name;
        // volatiles['niagara' + name + 'Vol'] = 'niagara' + name + 'Vol';
        endPoints.volatiles = volatiles;
        return endPoints;
      }

      ScalaTabGrid.prototype = Object.create(ScalaGrid.prototype);
      ScalaTabGrid.prototype.constructor = ScalaGrid;
      var specialColumns = {};


      let gridOptionsExtra = {
        getRowClass: function(params) {
          if (params.data && params.data.state) {
            if (params.data.state === 'HEALTHY') {
              return 'green';
            } else if (params.data.state === 'UNHEALTHY') {
              return 'amber';
            } else if (params.data.state === 'HEARTBEAT_OVERDUE') {
              return 'red';
            } else return 'white';

          }
        }
      };


      var scalaColumnDefs = [{
          headerName: 'P.Id',
          width: 60,
          field: 'panelId',
        }, {
          headerName: 'U.Id',
          field: 'unitId',
          width: 60,
        }, {
          headerName: 'IP',
          field: 'host',
          width: 100,
          cellRenderer: function(params) {
            if (params.value) {
              return params.value.replace(/-/g, '.');
            }
          },
        }, {
          headerName: 'Dist',
          field: 'district',
          width: 50,
        }, {
          headerName: 'Site',
          field: 'site',
          width: 50,
        }, {
          headerName: 'P.No',
          field: 'panelNo',
          width: 40,
        }, {
          headerName: 'Depot',
          field: 'depot',
          width: 150,
        }, {
          headerName: 'Address',
          field: 'address',
          width: 190,
        }, {
          headerName: 'P.Code',
          field: 'postCode',
          width: 50,
        }, {
          headerName: 'All Content',
          field: 'inventoryCompleted',
          width: 90,
          volatile: true,
        }, {
          headerName: 'Plan',
          field: 'planState',
          valueGetter: function(params) {
            if (params && params.data) {
              let val = params.data.planState;
              if (val === 'PLAYER_HAS_LATEST_PLAN') {
                return 'Latest Plan';
              } else if (val === 'PLAYER_NOT_RECEIVED_LATEST_PLAN') {
                return 'Not Received';
              }
            } else return "";
          },
          width: 90,
          volatile: true,
        }, {
          headerName: 'Last Accessed',
          field: 'lastReported',
          volatile: true,
          width: 130,
          valueGetter: function(params) {
            var val = "";
            if (params && params.data) {
              val = params.data.lastReported;
              var patternApplied = false;
              if (val.indexOf('now') >= 0) {
                return 'just now';
              } else {
                if (val.indexOf('minute') >= 0) {
                  val = val.replace(/\{time.minutes.ago\}|\{time.minute.ago\}|\{time.minutes\}|\{time.minute\}|\{time.some.minutes\}/g, 'm ');
                  patternApplied = true;
                }
                if (val.indexOf('second') >= 0) {
                  return 'OK';
                }
                if (val.indexOf('hour') >= 0) {
                  val = val.replace(/\{time.hours\}|\{time.hour\}/g, 'h ');
                  patternApplied = true;
                }
              }
              if (patternApplied) {
                return val + " ago";
              }
            }
            return val;
          }
        }, {
          headerName: 'PanelType',
          field: 'panelType',
          volatile: true,
          width: 120,
        }, {
          headerName: 'Scala State',
          field: 'state',
          volatile: true,
          width: 150,
          comparator: ScalaGrid.prototype.healthComparator,
          sort: 'desc'
        }, {
          headerName: 'Active',
          field: 'active',
          volatile: true,

          width: 150,
          sort: 'desc'
        }, {
          headerName: 'Notes',
          field: 'tabNote',
          volatile: true,
          onCellClicked: AddNotes,
          // hide: true,
          width: 100,
        }, {
          headerName: 'C.Playing',
          field: 'playing',
          volatile: true,
          onCellClicked: AddNotes,
          // hide: true,
          width: 100,
        }, {
          headerName: 'Comp.Date',
          field: 'compDate',
          volatile: true,
          onCellClicked: AddDates,
          // hide: true,
          width: 100,
        }, {
          headerName: 'Last Update',
          field: 'lastUpdate',
          volatile: true,
          // hide: true,
          width: 190,
        },
      ];
      return ScalaTabGrid;
    }]);
  })()