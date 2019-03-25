  "use strict";
  var fs = require("fs"),
    units = require('../lib/units.js'),
    columns = require('../lib/extracolumns.js'),
    hours = require('../lib/openinghours.js'),
    tabs = require('../lib/tabs.js'),
    logger = require('../lib/logger');
  /**
   * functions that require access via http requests
   * @return {[type]}
   */
  (function() {
    module.exports = {
      // userCheck: function(req, res) {
      //     if (req.user) {
      //         res.send(req.user);
      //     }
      //     res.send(undefined);
      // },
      addCol: function(req, res) {
        columns.addCol(req.body, req.user.username);
        res.end();
      },
      removeCol: function(req, res) {
        columns.delCol(req.body, req.user.username);
        res.end();
      },
      externalStoreOneObj: function(req, res) {
        var obj = Object.keys(req.body);
        obj = JSON.parse(obj);
        columns.externalStoreOneObj(obj, req.user.username);
        res.send('200');
      },
      getColumns: function(req, res) {
        columns.getColumnsFromDb(function(err, docs) {
          if (err) {
            logger.error('error in getColumns');
            return err;
          }
          if (docs) {
            var cols = columns.createColumns(docs);
            res.send(cols);
          }
        });
      },
      // getExtraColumns: function(req, res) {
      //   columns.getExtraColumnsFromDb(function(err, docs) {
      //     if (err) {
      //       console.log('error in getExtraColumns');
      //       return err;
      //     }
      //     if (docs) {
      //       res.send(cols);
      //     }
      //   })
      // },
      getExtraColumns: function(req, res) {
        let data = require('../utils/extraColumnsData').getData();
        res.send(data);
      },
      isOpen: function(req, res) {
        hours.getOpeningHoursFromDb(function(err, isOpenObj) {
          if (err) {
            logger.error('error in addOpeningHours ' + err);
            res.end();
          }
          res.send(isOpenObj);
        });
      },
      getTabs: function(req, res) {
        tabs.getTabs(req.user.username, function(err, tabs) {
          if (err) {
            logger.error('error in getTabs ' + err);
            res.end();
          }
          res.send(tabs);
        });
      }
    };
  }());