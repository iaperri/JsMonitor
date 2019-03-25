"use strict";
agGrid.initialiseAgGridWithAngular1(angular);

var monitor = angular.module("monitor");
monitor.factory('SocialiteTabGrid', ['SocialiteGrid', 'MonitorGrid', function(MonitorGrid, SocialiteGrid) {
  var SocialiteTabGrid = function(id) {
    this.id = id;
    this.name = this.id.charAt(0).toUpperCase() + this.id.slice(1);
    let endPoints = createEndPoints(this.name);
    let columnDefs = socialiteColumnDefs.slice(0);
    SocialiteGrid.call(this, this.id, endPoints, specialColumns, {}, columnDefs);
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

  function timeComparator(tm1, tm2) {
    var t1 = tm1.split(" "),
      t2 = tm2.split(" "),
      n1 = Number(t1[0]) * 24 * 60 + Number(t1[2]) * 60 + Number(t1[4]),
      n2 = Number(t2[0]) * 24 * 60 + Number(t2[2]) * 60 + Number(t2[4]),
      result;

    if (isNaN(n1)) {
      if (!isNaN(n2)) {
        return -1;
      } else return 0;
    }
    if (isNaN(n2)) {
      if (!isNaN(n1)) {
        return 1;
      } else return 0;
    }
    if (n1 > n2) {
      return 1;
    } else if (n2 > n1) {
      return -1;
    }
    console.log(n1 + " <<>> " + n2 + " == " + result);
    return 0;
  }
  SocialiteTabGrid.prototype = Object.create(SocialiteGrid.prototype);
  SocialiteTabGrid.prototype.constructor = SocialiteGrid;

  var specialColumns = {
    hoursPresent: true,
    notesPresent: true
  };

  function zeroing(time) {
    if (time.toString().length > 1) {
      return time;
    }
    if (time.toString().length < 2) {
      return "0" + time;
    }
  }

  var socialiteColumnDefs = [{
      headerName: 'P.Id',
      width: 60,
      field: 'panelId',
    }, {
      headerName: 'U.Id',
      field: 'unitId',
      width: 60,
    }, {
      headerName: 'Venue',
      field: 'venue',
      width: 90,
    }, {
      headerName: 'IP',
      field: 'ipAddress',
      width: 100,
      // valueGetter: function(params) {
      //   if (params.data.ip) {
      //     return params.data.ip.replace(/-/g, '.');
      //   }
      // },
      // onCellClicked: MonitorGrid.prototype.copyFieldText
    }, {
      headerName: 'Dist',
      field: 'district',
      width: 50
    }, {
      headerName: 'Site',
      field: 'site',
      width: 50
    }, {
      headerName: 'P.No',
      field: 'panelNo',
      width: 40,
    }, {
      headerName: 'Depot',
      field: 'branch',
      width: 150
    }, {
      headerName: 'Address',
      field: 'address',
      width: 190,
    }, {
      headerName: 'P.Code',
      field: 'postCode',
      width: 50,
    }, {
      headerName: 'Access Time',
      field: 'time',
      volatile: true,
    },
    // {
    //   headerName: 'Last Connected',
    //   // field: 'lastTime',
    //   valueGetter: calculateTime,
    //   // comparator: timeComparator,
    //   volatile: true,
    //   width: 170,
    //   sort: 'desc'
    // },
    {
      headerName: 'Last Connected',
      field: 'lastTime',
      volatile: true,
      width: 170,
      sort: 'desc'
    },
    // {
    //   headerName: 'Note',
    //   field: 'note',
    //   volatile: true,
    //   width: 120,
    //   onCellClicked: AddNote
    // }, 
    // {
    //   headerName: 'Mark',
    //   field: 'mark',
    //   volatile: true,
    //   width: 70
    // }, {
    //   headerName: 'Modem',
    //   field: 'modem',
    //   volatile: true,
    //   width: 150
    // }
    {
      headerName: 'Hours',
      field: 'hours',
      volatile: true,
      cellStyle: function(params) {
        if (params.data) {
          if (params.data.isOpen === 'open') {
            return { 'font-size': '7.5pt', 'background-color': '#14C895' };
          } else {
            return { 'font-size': '7.5pt', 'background-color': '#FA8092' };
          }
        }
      },
      onCellClicked: MonitorGrid.prototype.showHours,
      width: 123,
    },
    // {
    //   headerName: 'Err',
    //   field: 'tomcat',
    //   volatile: true,
    //   width: 240
    // }
  ];
  return SocialiteTabGrid;
}]);