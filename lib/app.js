(
  function() {
    "use strict";
    agGrid.initialiseAgGridWithAngular1(angular);
    var monitor = angular.module('monitor', ['agGrid', 'ui.bootstrap', "angularModalService", "angular-clipboard", 'ngCookies']);

    monitor.controller('MainCtrl', ['$injector', '$scope', '$filter', '$timeout', 'ReadData', 'ReadUserTabs', '$http', '$cookies', '$window',

      function($injector, $scope, $filter, $timeout, ReadData, ReadUserTabs, $http, $cookies, $window) {
        $scope.hideClosed = $scope.hideClosed || {
          value: false
        };

        $scope.resolution = '';
        var monitors = monitors || {},
          closedUnits = {},
          pressedTabId;

        function getEndpoints(monitor) {
          var endPoints = {},
            endPointKeys = {};
          // endPointKeys = Object.keys(monitor.endPoints.volatiles);
          let l = endPointKeys.length;
          endPoints['main' + monitor.name] = monitor.endPoints.main;
          // for (let j = 0; j < l; j++) {
          //   endPoints[endPointKeys[j]] = monitor.endPoints.volatiles[endPointKeys[j]];
          // }
          return endPoints;
        }

        function addMessage(message) {
          var text = document.createTextNode(message),
            el = document.createElement('li'),
            messages = document.getElementById('messages');

          el.appendChild(text);
          messages.appendChild(el);
        }
        angular.element(document).ready(function() {
          var allEndPoints = {},
            ids, len;

          function createMonitors() {
            function getTabData(tab, i) {
              let endPoints = {};
              let TabGrid = $injector.get(`${tab.group}TabGrid`);
              let monitor = new TabGrid(tab.id);
              monitor.prepareGrid();

              monitor.onFilterChangedCallBack = function() {
                var that = this;
                $timeout(function() {
                  $scope.rowsAfterFilter = that.gridOptions.api.inMemoryRowController.rowsAfterFilter.length;
                }, 0);
              };

              endPoints = getEndpoints(monitor);
              let gridDiv = document.querySelector('#gridOptions' + monitor.id);
              new agGrid.Grid(gridDiv, monitor.gridOptions);
              if (monitor.hasOwnProperty('specialColumns') && monitor.specialColumns.hasOwnProperty('hoursPresent')) {
                monitor.closedUnits = new Map();
              }

              monitor.lastUpdates = {};
              monitors[ids[i]] = monitor;
              var ks = Object.keys(endPoints);
              for (let i = 0; i < ks.length; i++) {
                allEndPoints[ks[i]] = endPoints[ks[i]];
              }

            }

            new ReadUserTabs(function(err, tabs) {
              if (err) {
                console.log(`Error while reading tabs  - ${err}`);
                return;
              }
              $scope.tabs = {};
              tabs.map((v) => {
                $scope.tabs[v.id] = v;
              });
              ids = Object.keys($scope.tabs);
              len = ids.length;
              if (ids.length === 0) {
                alert('General Error !!');
                return;
              }
              // $scope.tabs = tabObj;
              for (let i = 0; i < len; i++) {
                let tab = $scope.tabs[ids[i]];
                getTabData($scope.tabs[ids[i]], i);
              }
              pressedTabId = ids[0];

              $timeout(() => {
                document.querySelector('*[href="#' + pressedTabId).click();
              }, 0);
              new ReadData(allEndPoints, monitors, $scope.checkMonitors);
            });
          }
          createMonitors();
        });

        // (function checkMonitors() {
        //   var timeout,
        //     // checking = false,
        //     emptyMonitors = {},
        //     allEndPoints = {};
        //   // function getTabStyle(monitorId) {
        //   //   let tabCss = document.querySelector(`#${monitorId} h2`).style;
        //   // }
        //   // function setTabBackgroundColor(monitorId) {

        //   // }
        //   function checkUpdates(monitorId) {
        //     let monitor = monitors[monitorId];
        //     console.log('last update: ' + new Date(monitor.lastUpdates['main' + monitor.name]));
        //     if (monitor.lastUpdates['main' + monitor.name] !== undefined) {
        //       let lastUpdate = new Date(monitor.lastUpdates['main' + monitor.name]),
        //         checkMinsLater = new Date(lastUpdate.getTime() + 10 * 60000),
        //         now = new Date();
        //       if (checkMinsLater < now) {
        //         let tabCss = document.querySelector(`#${monitor.id} h2`).style;
        //         monitor.tabColor = '#FA8092';
        //         if (pressedTabId !== monitorId) {
        //           tabCss.backgroundColor = monitor.tabColor;
        //         }
        //       }
        //     }
        //   }
        //   /**
        //    * check if there are any rows in each tab, chaning its color accordingly
        //    */
        //   function checkRows() {
        //     function addEndpoints(monitorId) {
        //       let mon = monitors[monitorId];
        //       if (emptyMonitors[mon.id] === undefined) {
        //         emptyMonitors[mon.id] = mon;
        //         // endPoints[mon.id] = getEndpoints(mon);
        //         let endPoints = getEndpoints(mon);
        //         var ks = Object.keys(endPoints);
        //         for (let i = 0; i < ks.length; i++) {
        //           allEndPoints[ks[i]] = endPoints[ks[i]];
        //         }
        //       }
        //     }
        //     var keys = Object.keys(monitors),
        //       len = keys.length;
        //     for (let i = 0; i < len; i++) {
        //       let monitor = monitors[keys[i]];
        //       let tabCss = document.querySelector(`#${monitor.id} h2`).style;
        //       // if (pressedTabId !== keys[i]) {
        //       if (monitor.emptyUpdate === true) {
        //         monitor.tabColor = '#FA8092';
        //         if (pressedTabId !== keys[i]) {
        //           tabCss.backgroundColor = monitor.tabColor;
        //         }
        //         // tabCss['background-color'] = monitor.tabColor;
        //         addEndpoints(keys[i]);
        //       } else {
        //         delete emptyMonitors[keys[i]];
        //         monitor.tabColor = '#14C895';
        //         // tabCss['background-color'] = monitor.tabColor;
        //         if (pressedTabId !== keys[i]) {
        //           tabCss.backgroundColor = monitor.tabColor;
        //         }
        //       }
        //     }
        //   }

        //   function checkTabs() {
        //     checkRows();
        //     // checkUpdates(pressedTabId);
        //   }

        //   function checkTabsLoop() {
        //     checkTabs();
        //     timeout = $timeout(function() {
        //       console.log('checking monitors');
        //       if (!$cookies.get('connect.sid')) {
        //         $window.location.reload();
        //       }
        //       checkTabs();
        //       let ids = Object.keys(emptyMonitors),
        //         len = ids.length;
        //       if (len > 0) {
        //         new ReadData(allEndPoints, emptyMonitors);
        //       }
        //       checkTabsLoop();
        //     }, 30000);
        //   }

        //   function checker() {
        //     console.log('checking monitors');
        //     checkTabsLoop();
        //     // updateSocialiteLoop();
        //   }
        //   return checker();
        // });





        // /**
        //  * check if there are any rows in each tab, chaning its color accordingly
        //  */
        // $scope.checkMonitors = function checkRows(monitorId) {
        //   let emptyMonitors = {},
        //     allEndPoints = {};

        //   function addEndpoints(monitorId) {
        //     let mon = monitors[monitorId];
        //     if (emptyMonitors[mon.id] === undefined) {
        //       emptyMonitors[mon.id] = mon;
        //       // endPoints[mon.id] = getEndpoints(mon);
        //       let endPoints = getEndpoints(mon);
        //       var ks = Object.keys(endPoints);
        //       for (let i = 0; i < ks.length; i++) {
        //         allEndPoints[ks[i]] = endPoints[ks[i]];
        //       }
        //     }
        //   }
        //   // var keys = Object.keys(monitors),
        //   //     len = keys.length;
        //   // for (let i = 0; i < len; i++) {
        //   //     let monitor = monitors[monitorId];
        //   let monitor = monitors[monitorId];
        //   let tabCss = document.querySelector(`#${monitor.id} h2`).style;
        //   // if (pressedTabId !== monitorId) {
        //   if (monitor.emptyUpdate === true) {
        //     monitor.tabColor = '#FA8092';
        //     if (pressedTabId !== monitorId) {
        //       tabCss.backgroundColor = monitor.tabColor;
        //     }
        //     // tabCss['background-color'] = monitor.tabColor;
        //     addEndpoints(monitorId);
        //   } else {
        //     delete emptyMonitors[monitorId];
        //     monitor.tabColor = '#14C895';
        //     // tabCss['background-color'] = monitor.tabColor;
        //     if (pressedTabId !== monitorId) {
        //       tabCss.backgroundColor = monitor.tabColor;
        //     }
        //   }
        // };



        /**
         * called when the user change tabs
         * @param  {[type]} id  the chosen tab
         * @return {[type]}    [description]
         */
        $scope.changeTab = function(id) {
          var keys = Object.keys(monitors),
            len = keys.length;
          pressedTabId = id;
          for (let i = 0; i < len; i++) {
            let monId = keys[i];
            let monitor = monitors[monId];
            let tabCss = document.querySelector(`#${monitor.id} h2`).style;
            if (monId === id) {
              // tabCss.style['background-color'] = '#f5f5f5';
              monitor.tabColor = tabCss.backgroundColor;
              tabCss.backgroundColor = '#f5f5f5';
              $scope.gridOptions = monitor.gridOptions;
              //it will start dealing with volatiles after it has the first results
              monitor.start();
              $scope.onFilterChanged();
              if (monitor.specialColumns.hoursPresent) {
                $scope.closedUnits = closedUnits[monId];
                $scope.hoursPresent = true;
                monitor.showHideClosed($scope.hideClosed);
              } else {
                $scope.hoursPresent = false;
                // tabCss['background-color'] = monitor.tabColor;
                // tabCss.backgroundColor = monitor.tabColor;
              }
            } else {
              // tabCss.style['background-color'] = monitor.tabColor;
              tabCss.backgroundColor = monitor.tabColor;
              monitor.stop();
            }
          }
        };
        $scope.togglePanel = function() {
          monitors[pressedTabId].togglePanel();
        };
        $scope.onFilterChanged = function() {
          console.log($scope.filterValue);
          $scope.rowsAfterFilter = monitors[pressedTabId].onFilterChanged($scope.filterValue);
        };

        $scope.showHideClosed = function() {
          monitors[pressedTabId].showHideClosed($scope.hideClosed, monitors[pressedTabId].gridOptions);
        };

        $scope.export = function() {
          var params = {
            skipHeader: $scope.skipHeader === false,
            skipFooters: $scope.skipFooters === true,
            skipGroups: $scope.skipGroups === true,
            fileName: $scope.fileName
          };
          monitors[pressedTabId].gridOptions.api.exportDataAsCsv(params);
        }
      }
    ]);
  })()