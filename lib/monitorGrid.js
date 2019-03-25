agGrid.initialiseAgGridWithAngular1(angular);

var monitor = angular.module("monitor");
monitor.factory('MonitorGrid', ['$http', 'clipboard', 'ReadData', 'GetExtraColumns', '$timeout', 'ExtraColumns', 'ShowHours',
  function($http, clipboard, ReadData, GetExtraColumns, $timeout, ExtraColumns, ShowHours) {
    const CHECKBOX = {
      headerName: '',
      field: '',
      width: 22,
      checkboxSelection: true
    };
    var MonitorGrid = function(id, endPoints, specialColumns, closedUnits, columnDefs, gridOptionsExtra) {
      this.id = id;
      this.endPoints = endPoints;
      this.specialColumns = specialColumns;
      this.closedUnits = closedUnits;
      this.columnDefs = columnDefs;
      this.dataReady = false;
      this.ready = false;
      this.timeout = null;
      this.endpointError = false;
      this.requesting = false;
      this.volatiles = false;
      this.emptyUpdate = false;
      this.tabColor = undefined; //'#ddd';
      this.gridOptionsExtra = gridOptionsExtra;
      this.onFilterChangedCallBack = undefined;
      this.onDataReadyCallBack = undefined;
    };


    MonitorGrid.prototype.addCheckboxColumn = function() {
      this.columnDefs.splice(0, 0, CHECKBOX);
    };

    MonitorGrid.prototype.addExtraColumns = function addExtraColumns() {
      let columns = new ExtraColumns(this.id);

      columns.forEach((col) => {
        let key = Object.keys(col);
        if (key.length != 1) {
          throw Error("badly constructed columns");
        }
        let idx = this.columnDefs.findIndex((el) => {
          return el.field === key[0];
        });
        if (idx == -1) {
          throw Error('column ${key[0]} not found ');
        }
        this.columnDefs.splice(idx + 1, 0, col[key[0]]);
      });
    }

    MonitorGrid.prototype.createGridoptions = function createGridoptions() {
      var self = this;
      this.gridOptions = {
        rowData: null,
        enableColResize: true,
        enableFilter: true,
        enableSorting: true,
        suppressRowClickSelection: true,
        groupHeaders: false,
        rowHeight: 18,
        rowSelection: 'multiple',
        showToolPanel: false,
        toolPanelSuppressValues: true,
        rowGroupPanelShow: 'always',
        onGridReady: function(params) {
          self.ready = true;
          params.api.sizeColumnsToFit();
        },
        onAfterFilterChanged: function(params) {
          if (self.onFilterChanged !== undefined) {
            self.onFilterChangedCallBack();
          }
        },
        onSelectionChanged: MonitorGrid.prototype.rowSelectionChanged,
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>',
        getRowClass: function(params) {
          if (params.data && params.data.timeCode) {
            return params.data.timeCode;
          }
        }
      };
      // this.gridOptions.overlayLoadingTemplate = '<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>';
      if (this.gridOptionsExtra !== undefined) {
        let keys = Object.keys(this.gridOptionsExtra);
        for (let i = 0; i < keys.length; i++)
          this.gridOptions[keys[i]] = this.gridOptionsExtra[keys[i]];
      }
    };
    MonitorGrid.prototype.showHours = function(params) {
      new ShowHours(params.data);
      console.log("Opening Hours [Unit " + params.data.unitId + "]: " + JSON.stringify(params.data.hours));
    };
    MonitorGrid.prototype.setDataReady = function(dataReady) {
      this.dataReady = dataReady;
      if (this.onDataReadyCallBack !== undefined) {
        this.onDataReadyCallBack();
      }
      this.gridOptions.onAfterFilterChanged();
    };

    MonitorGrid.prototype.onFilterChanged = function(filterValue) {
      this.gridOptions.api.setQuickFilter(filterValue);
      return this.gridOptions.api.inMemoryRowController.rowsAfterFilter.length;
    };

    MonitorGrid.prototype.setEndpointError = function(err) {
      this.endpointError = err;
      this.emptyUpdate = err;
      if (err) {
        // let tabCss = document.querySelector(`#${this.id} h2`).style;
        // this.tabColor = '#FA8092';
        console.log(`no updates in ${this.name}`);
      } else {
        console.log(`${this.name} updated normally`);
      }
    }
    MonitorGrid.prototype.setEmptyUpdate = function(empty) {
      this.emptyUpdate = empty;
    }
    MonitorGrid.prototype.prepareGrid = function() {
      this.createGridoptions();
      this.addExtraColumns();
      this.addCheckboxColumn();

      function copyText(params) {
        MonitorGrid.prototype.copyFieldText(params);
      }

      this.columnDefs.forEach(function(colDef, idx, array) {
        colDef.filterParams = {
          newRowsAction: 'keep'
        };

        if (colDef.onCellClicked === undefined) {
          colDef.onCellClicked = copyText;
        }
      });
      this.gridOptions.columnDefs = this.columnDefs;
    }
    MonitorGrid.prototype.copyFieldText = function(params) {
      clipboard.copyText(params.value);
    };
    MonitorGrid.prototype.copyText = function(string) {
      clipboard.copyText(string);
    };

    function getTimeoutName(request) {
      return `timeout_${request.name}`;
    }
    
    function functionName(fun) {
      var ret = fun.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    }

    function repeatRequest(request, timeout) {
      var timeoutName = request.name;
      $timeout.cancel(this[timeoutName]);
      var self = this;
      this[timeoutName] = $timeout(function() {
        console.log('repeatRequest_' + request.name);
        request.call(self);
        repeatRequest.call(self, request, timeout);
      }, timeout);
    }

    

    MonitorGrid.prototype.start = function() {
      console.log('start');
      callVolatiles.call(this);
      MonitorGrid.prototype.stop.call(this, callVolatiles);
      repeatRequest.call(this, callVolatiles, 180000);
      if(this['callPoc'] === undefined) {
        console.log('starting repetition for callPOC');
        repeatRequest.call(this, callPoc, 60000);
      }
    };

    MonitorGrid.prototype.stop = function(request) {
      if(request === undefined) {
        $timeout.cancel(this['callVolatiles']);
      }
      else $timeout.cancel(this[request.name]);
    };

    callPoc = function() {
      if (this.gridOptions && this.gridOptions.rowData !== null && this.gridOptions.rowData.length > 0) {
        console.log('calling pocs');
        this.lasUpdates['poc']
        new ReadPocs();
      }
    };

    callVolatiles = function() {
      if (this.gridOptions && this.gridOptions.rowData !== null && this.gridOptions.rowData.length > 0) {
        console.log('calling volatiles from ' + this.id);
        var obj = {};
        obj[this.id] = this;
        let newVolObj = {},
          vols = this.endPoints.volatiles,
          keys = Object.keys(this.endPoints.volatiles);
        for (let i = 0; i < keys.length; i++) {
          if (this.lastUpdates[vols[keys[i]]]) {
            newVolObj[keys[i]] = vols[keys[i]] + "/" + this.lastUpdates[vols[keys[i]]];
          } else newVolObj[keys[i]] = vols[keys[i]];
        }
        this.volatiles = true;
        this.requesting = true;
        new ReadData(newVolObj, obj);
      }
    };

    MonitorGrid.prototype.setLastUpdates = function(lastUpdateObj) {
      let vols = Object.keys(lastUpdateObj);
      for (let i = 0; i < vols.length; i++) {
        this.lastUpdates[vols[i]] = lastUpdateObj[vols[i]];
      }
    };

    MonitorGrid.prototype.showHideClosed = function(hideClosed, gridOptions) {
      if (this.specialColumns.hoursPresent) {
        if (hideClosed.value === true) {
          var nodes;
          for (var i = gridOptions.rowData.length; i--;) {
            nodes = gridOptions.rowData;
            if (nodes[i].isOpen !== 'open') {
              this.closedUnits.set(nodes[i].unitId, nodes[i]);
              nodes.splice(i, 1);
            }
          }
        } else {
          this.closedUnits.forEach(
            function(value) {
              gridOptions.rowData.push(value);
            }
          );
          this.closedUnits.clear();
        }
        this.gridOptions.api.setRowData(this.gridOptions.rowData);
      }
    };

    MonitorGrid.prototype.rowSelectionChanged = function rowSelectionChanged() {
      var selectedRows = this.api.getSelectedRows(),
        selectedRowsString = '',
        headerObj = {};
      var displayedColumns = this.api.grid.gridOptions.columnApi.getState();
      // var displayedColumns = this.columnApi.getAllDisplayedColumns();
      var visibleCols = [];
      displayedColumns.forEach(function(v) {
        !v.hide && visibleCols.push(v.colId);
      });
      //headers
      var headers = [];
      this.columnDefs.forEach(function(val) {
        let idx = visibleCols.indexOf(val.field);
        if (idx !== -1) {
          headerObj = {};
          headerObj.headerName = val.headerName;
          headerObj.field = val.field;
          headers.splice(idx, 0, headerObj);
        }
      });
      headers.map(function(h) {
        selectedRowsString += h.headerName + '\t';
      });
      selectedRowsString += '\n';
      var cols = [];
      selectedRows.forEach(function(row) {
        headers.forEach(function(vCol) {
          let data = row[vCol.field];
          selectedRowsString += data + '\t';
        });
        selectedRowsString += '\n';
      });
      MonitorGrid.prototype.copyText(selectedRowsString);
    };

    MonitorGrid.prototype.export = function() {
      var params = {
        skipHeader: false, //$scope.skipHeader === false,
        skipFooters: true, //$scope.skipFooters === true,
        skipGroups: true, //$scope.skipGroups === true,
        fileName: 'export.csv' //$scope.fileName
      };
      this.gridOptions.api.exportDataAsCsv(params);
    };
    MonitorGrid.prototype.togglePanel = function() {
      var showing = this.gridOptions.api.isToolPanelShowing();
      this.gridOptions.api.showToolPanel(!showing);
      this.gridOptions.api.sizeColumnsToFit();
    };


    return MonitorGrid;
  }
]);