(function() {
  "use strict";
  var monitor = angular.module("monitor");

  /**
  	add/removes notes to the memory and the mongo db via post request
  **/
  monitor.service('AddNotes', ['$http', 'ModalService', 'StoreNote', function($http, ModalService, StoreNote) {
    return function AddNotes(params) {
      var row = params.data;
      var initialNote = row[params.colDef.field];
      ModalService.showModal({
        templateUrl: "./services/prompt/notes.html",
        controller: "NotesController",
        inputs: {
          'row': row,
          'field': params.colDef.field
        }
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function(result) {
          if (initialNote !== result.text) {
            var url = 'api/extracolumns/addCol',
              field = {};
            if (result.text !== undefined && result.text.length === 0) {
              url = 'api/extracolumns/removeCol';
            }
            // field[row.unitId] = {};
            // let type = params.api.grid.gridOptions.columnDefs[params.colIndex]['field'];
            // field[row.unitId][type] = result.text;

            params.data[params.colDef.field] = result.text;
            StoreNote(url, params);
            params.api.softRefreshView();
            //send the note to be stored in mongo and in memory
            // $http.post(url, field, { headers: { 'Content-Type': 'application/json' } })
            //     .then(function success(response) {}, function error(err) {
            //         console.log("error when stored");
            //     });
          }
        })
      });
    };
  }]);
  monitor.service('StoreNote', ['$http', function($http) {
    return function Store(url, params) {
      let field = {},
        row = params.data;
      field[row.unitId] = {};
      let type = params.api.grid.gridOptions.columnDefs[params.colIndex]['field'];
      field[row.unitId][type] = params.data[params.colDef.field];

      // params.data[params.colDef.field] = result.text;
      $http.post(url, field, { headers: { 'Content-Type': 'application/json' } })
        .then(function success(response) {}, function error(err) {
          console.log("error when stored");
        });
    };
  }]);
  monitor.service('AddDates', ['$', '$http', 'StoreNote', function($, $http, StoreNote) {

    return function AddDates(params) {
      var oldDate;
      let onCloseDatePicker = function(newDate) {
        var url = 'api/extracolumns/addCol';
        if (newDate != oldDate) {
          params.data[params.colDef.field] = newDate;
          StoreNote(url, params);
        }
      }
      let element = params.eventSource,
        id = params.data.unitId + "_dp";

      if (!element.hasChildNodes()) {
        var el = document.createElement("input");
        el.type = "text";
        el.id = id;
        element.appendChild(el);
        $("#" + id).datepicker({
          onClose: onCloseDatePicker,
          dateFormat: "dd-mm-yy",
          defaultDate: new Date(),
          firstDay: 1
        });

      }
      if ($("#" + id).datepicker) {
        oldDate = $("#" + id).val();
        $("#" + id).datepicker("show");
      }
    }
  }]);
})()