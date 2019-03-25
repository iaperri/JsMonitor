var monitor = angular.module("monitor");
monitor.factory('ExtraColumns', ['AddNotes', 'AddDates', function(AddNotes, AddDates) {
  const SOCIALITE_EXTRAS = [{
    time: {
      headerName: 'Note',
      field: 'note',
      volatile: true,
      width: 120,
      onCellClicked: AddNotes,
      onCellDoubleClicked: (params) => {}
    }
  }, {
    note: {
      headerName: 'Mark',
      field: 'mark',
      volatile: true,
      width: 70
    }
  }, {
    mark: {
      headerName: 'Modem',
      field: 'modem',
      volatile: true,
      width: 150
    }
  }, {
    hours: {
      headerName: 'Err',
      field: 'tomcat',
      volatile: true,
      width: 240
    }
  }];
  let SOCIALITE_AND_TEST_EXTRAS = SOCIALITE_EXTRAS.slice(0);
  SOCIALITE_AND_TEST_EXTRAS.push({
    time: {
      headerName: 'Prod.Type',
      field: 'product',
      volatile: true,
      width: 120,
    }
  });
  const MALLS = [{
        lastTime: {
          headerName: 'ProdType',
          field: 'product',
          volatile: true,
          width: 120,
        }
      }, {
        product: {
          headerName: 'Notes',
          field: 'tabNote',
          volatile: true,
          onCellClicked: AddNotes,
          // hide: true,
          width: 100,
        }
      },
      {
        tabNote: {
          headerName: 'C.Playing',
          field: 'playing',
          volatile: true,
          onCellClicked: AddNotes,
          // hide: true,
          width: 100,
        }
      },
      {
        playing: {
          headerName: 'Comp.Date',
          field: 'compDate',
          volatile: true,
          onCellClicked: AddDates,
          // hide: true,
          width: 100,
        }
      }
    ],
    D48 = [{
      state: {
        headerName: 'Brightness',
        field: 'brightness',
        volatile: true,
        width: 120,
      }
    }];
  var columns = {
    //each col obj key will be the col name after which it will go
    socialite: SOCIALITE_EXTRAS,
    socialiteAndTest: SOCIALITE_AND_TEST_EXTRAS,
    mall: MALLS,
    d48: D48
  };
  var ExtraColumns = function(id) {
    return columns[id] || [];
  }
  return ExtraColumns;
}]);