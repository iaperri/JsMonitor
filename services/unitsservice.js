"use strict";
var monitor = angular.module("monitor");


monitor.service('ReadData', ['$http', 'CopyArrayFieldsInto', 'CopyFieldsInto', 'FilterObjects', 'GetNotes', 'GetExtraColumns',
  function($http, CopyArrayFieldsInto, CopyFieldsInto, FilterObjects, GetNotes, GetExtraColumns) {

    function onGridReady(monitor, results, tabNotifier) {
      monitor.gridOptions.api.setRowData(results);
      monitor.setDataReady(true);
      // tabNotifier();
    }

    function setResults(monitor, callResults, notes, extraColumns, tabNotifier) {
      var resultsArray = [];
      // volatiles = false;

      function updateGridNodes(monitor) {
        function updateNodes(monitor) {
          let endPoints = Object.keys(resultsArray);
          monitor.gridOptions.api.forEachNode(
            function(node) {
              for (let i = 0; i < endPoints.length; i++) {
                let dataObj = resultsArray[endPoints[i]],
                  unitId = node.data.unitId;
                new CopyFieldsInto(dataObj[unitId], node.data);
                // new FilterObjects()dataObj[unitId], node.data, 
              }
            }
          );
        }
        //these results are the main results or the volatile ones, as we called the same endpoint adding the last update timestamp in case of volatiles
        let results = callResults['main' + monitor.name];
        if (results.hasOwnProperty('data')) {
          results = results.data;
          monitor.setEmptyUpdate(Object.keys(results).length === 0);
        } else {
          monitor.setEmptyUpdate(true);
        }
        if (monitor.volatiles === true) {
          updateNodes(monitor);
          monitor.gridOptions.api.setRowData(monitor.gridOptions.rowData);
        } else {
          //     new GetNotes(function(err, cols) {
          //         if (err !== null) {
          //             console.log('error when adding notes');
          //         } else {
          //             resultsArray.push(cols);
          //         }
          let resultsWithNotes = new CopyArrayFieldsInto(resultsArray, results);
          //         // let unitIds = Object.keys(results);
          if (monitor.ready) {
            onGridReady(monitor, resultsWithNotes, tabNotifier);
          } else {
            monitor.gridOptions.onGridReady = function(params) {
              console.log('the ' + monitor.id + ' is ready');
              monitor.ready = true;
              onGridReady(monitor, params.api, resultsWithNotes);
            };
          }
          //     });
        }
      }

      function dealWithOpeningHours(monitor) {
        $http.get('api/hoursdata')
          .success(function(hData) {
            console.log("success reading data!");
            resultsArray.push(hData);
            updateGridNodes(monitor);
          })
          .error(function() {
            console.log('error in addOpeningHours');
            updateGridNodes(monitor);
          });
      }

      if (typeof callResults === 'object' && monitor.volatiles === false) {
        let results = callResults['main' + monitor.name];
        monitor.setEndpointError(false);
        if (results.hasOwnProperty('bodyList') || !results.hasOwnProperty('data')) {
          monitor.setEndpointError(true);
          console.log('error when calling main data in ' + monitor.name);
          return;
        }
      } else if (typeof callResults == 'string') {
        monitor.setEndpointError(true);
        return;
      }
      let endPointKeys = Object.keys(monitor.endPoints.volatiles),
        l = endPointKeys.length,
        json;
      // new GetNotes(function(err, cols) {
      //     if (err !== null) {
      //         console.log('error when adding notes');
      //     } else {
      //         resultsArray.push(cols);

      for (let j = 0; j < l; j++) {
        if (callResults[endPointKeys[j]] !== undefined && Object.keys(callResults[endPointKeys[j]]).length !== 0) {
          monitor.setEndpointError(false);
          try {
            json = callResults[endPointKeys[j]];
          } catch (err) {
            console.log('error while calling ' + endPointKeys[j]);
            monitor.setEndpointError(true);
            json = {};
          }
          if (json.hasOwnProperty('lastUpdate')) {
            // if ((monitor.id !== 'socialite') && monitor.id !== 'socialiteAndTest' && monitor.id !== 'mall') {
            monitor.lastUpdates[endPointKeys[j]] = json.lastUpdate;
            monitor.setLastUpdates(monitor.lastUpdates);
            // }
            resultsArray.push(json.data);
          } else {
            resultsArray.push(json);
          }
        }
      }
      resultsArray.push(notes);
      resultsArray.push(extraColumns);
      // else {

      // }
      if (monitor.specialColumns.hoursPresent) {
        dealWithOpeningHours(monitor);
      } else {
        updateGridNodes(monitor);
      }
      //     }
      // });
    }
    return function ReadData(endPoints, monitors, tabNotifier) {
      this.endPoints = endPoints;
      // this.monitors = monitors;
      var self = this;
      console.log('request going to be created: ' + JSON.stringify(endPoints));
      $http.get('api/firstData', {
          params: {
            endPoints: self.endPoints
          }
        })
        .success(function(callResults) {
          var results = {},
            ids = Object.keys(monitors),
            len = ids.length;
          new GetNotes(function(err, notes) {
            if (err !== null) {
              console.log('error when adding notes');
              notes = {};
            }
            // resultsArray.push(cols);
            new GetExtraColumns(function(err, extraColumns) {
              if (err !== null) {
                console.log('error when adding extra columns');
                extraColumns = {};
              }
              for (let i = 0; i < len; i++) {
                let monitor = monitors[ids[i]];
                monitor.requesting = false;
                setResults.call(self, monitor, callResults, notes, extraColumns, tabNotifier);
              }
            });
          });
        })
        .error(function() {
          console.log("error when calling read first data");
        });
    }
  }
]);
/**
 * copies all the fields from the orig object into the destination object
 * @param  {[origObj]} ................. [description]
 * @return {[destObj]}                  [description]
 */
monitor.service('FilterObjects', [function() {
  return function CopyFieldsInto(origObj, destObj, fn) {
    var types, j;
    if (origObj) {
      types = Object.keys(origObj);
      for (j = 0; j < types.length; j++) {
        // destObj[types[j]] = origObj[types[j]];
        fn(origObj, destObj);
      }
    }
  }
}]);
/**
 * copies all the fields from the orig object into the destination object
 * @param  {[origObj]} ................. [description]
 * @return {[destObj]}                  [description]
 */
monitor.service('CopyFieldsInto', [function() {
  return function CopyFieldsInto(origObj, destObj) {
    var types, j;
    if ((origObj && !origObj.active) || (origObj && origObj.active && origObj.active === 'ACTIVE'))  {
      types = Object.keys(origObj);
      for (j = 0; j < types.length; j++) {
        // console.log('copying ' + types[j] + ' from ' + JSON.stringify(origObj) + ' to ' + JSON.stringify(destObj));
        destObj[types[j]] = origObj[types[j]];
      }
    }
  }
}]);

/**
 * having an array of results copy each array element fields into the main object.
 * returns an array of the updated main object values (not including the keys)
 * @param  {[type]} origArray [description]
 * @param  {[type]} main      [description]
 * @return {[type]}           [description]
 */
monitor.service('CopyArrayFieldsInto', [function() {
  return function CopyArrayFieldsInto(origArray, main) {
    var types, j, resultArray = [],
      unitIds;
    if (main !== undefined && main !== null) {
      unitIds = Object.keys(main);
      for (let i = unitIds.length - 1; i >= 0; i--) {
        let uId = unitIds[i];
        for (let aIdx = 0; aIdx < origArray.length; aIdx++) {
          let obj = origArray[aIdx][uId];
          if ((obj && !obj.active) || (obj && obj.active && obj.active === 'ACTIVE')) {
            types = Object.keys(obj);
            for (j = 0; j < types.length; j++) {
              main[uId][types[j]] = obj[types[j]];
            }
          }
        }
        resultArray.push(main[uId]);
      }
      return resultArray;
    }
  }
}]);
monitor.service('GetExtraColumns', ['$http', function($http) {
  /**
   * gets the new columns from memory
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  return function getNewColumns(callback) {

    $http.get('api/extraColumns')
      .success(function(docs) {
        //multiple arrays as result (there will bemultiple notes)

        callback(null, docs);
      })
      .error(function() {
        console.log("error when calling api/columns");
        callback("error when calling api/columns");
      });
  };
}]);

monitor.service('GetNotes', ['$http', function($http) {
  /**
   * gets the new columns from memory
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  return function getNewColumns(callback) {

    $http.get('api/columns')
      .success(function(docs) {
        //multiple arrays as result (there will bemultiple notes)

        callback(null, docs);
      })
      .error(function() {
        console.log("error when calling api/columns");
        callback("error when calling api/columns");
      });
  };
}]);

monitor.service('ReadPocs', ['$http', function($http) {

  return function getPocs(url) {
    $http.get('api/firstData', {
      params: {
        endPoints: url
      }
    })
    .success(function(callResults) {
      var results = {};
      
    })
    .error(function() {
      console.log("error when calling read poc");
    });
  }
}]);
/**
 * updates the rows after adding the notes
 * @return {[type]} [description]
 */
monitor.service('AddNotes', ['$http', function($http) {

  /**
   * gets the new columns from memory
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  function getNewColumns(callback) {
    $http.get('api/columns')
      .success(function(cols) {
        if (Object.keys(cols).length !== 0) {
          callback(cols);
        }
      })
      .error(function() {
        console.log("error when calling api/columns");
      });
  }

  return function AddNotes(api) {
    var cols = getNewColumns(
      function(cols) {
        var updatedNodes = [];
        api.forEachNode(function(node) {
          var unitId = node.data.unitId;
          var column = cols[unitId];
          if (column) {
            node.data.note = column.data;
          }
        });
      }
    );
  }
}]);
