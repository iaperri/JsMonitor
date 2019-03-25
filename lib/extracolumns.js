(function extracolumns() {
  "use strict";
  var columns = {},
    mongodb = require('./mongo'),
    axios = require('axios'),
    URL = require('../config/config'),
    logger = require('./logger'),
    storeColumn = function(type, data) {
      logger.info('data added ' + JSON.stringify(data));
      mongodb.storeColumn(type, data);
    },
    externalStoreOneObj = function(data) {
      mongodb.storeOneObject(data, 'ips', function() {
        logger.info('ips stored');
      });
    },
    addCol = function(obj, username) {
      logger.debug(' addCol username ' + username);
      var unitId = Object.keys(obj)[0],
        type = Object.keys(obj[unitId])[0];
      // userColumns = columns[username];
      var data = {};
      data.data = obj[unitId][type];
      data.username = username;
      data.unitId = unitId;
      logger.info(new Date().toJSON() + ' added note:##' + JSON.stringify(obj) + '##');
      storeColumn(type, data);
    },
    delCol = function(obj, username) {
      addCol(obj, username);
    },
    createColumns = function(data) {
      columns = {};
      let i = data.length,
        uid = {};
      while (--i >= 0) {
        uid = columns[data[i].unitId];
        if (uid === undefined)
          uid = columns[data[i].unitId] = {};
        for (let prop in data[i]) {
          if (['note', 'playing', 'tabNote', 'compDate'].indexOf(prop) > -1) {
            uid[prop] = data[i][prop];
          }
        }
      }
      return columns;
    },
    fetchExtraColumns = function(callback) {
      axios.get(URL.get('extraColumns'))
        .then(function(data) {
          if (data !== undefined)
            callback(null, data.data);
        })
        .catch(function(error) {
          logger.error(error);
          callback(error, null);
        });
    },
    storeExtraColumns = function() {
      fetchExtraColumns(function(err, data) {
        if (err != null)
          logger.error(err);
        else {
          require('../utils/extraColumnsData').setData(data);
          mongodb.storeOneObject(data, 'extracolumns', function() {
            logger.info('stored extra columns');
          });
        }
      });
    },
    getExtraColumnsFromDb = function(callback) {
      mongodb.findAllNoIds('extracolumns', function(err, docs) {
        if (err) {
          logger.error('error recovering data from mongodb');
          callback(err, {});
        }
        var obj = isOpen(docs[0].data);
        // console.log(obj);
        callback(null, obj);
      });
    },
    getColumnsFromDb = function(callback) {
      let results = [];
      mongodb.findAllNoIds('notes', function(err, notes) {
        if (err) {
          logger.error('error in getColumnsFromDb');
          callback(null, notes);
          return;
        } else {
          Array.prototype.push.apply(results, notes);
          mongodb.findAllNoIds('tabNotes', function(err, tabNotes) {
            if (err) {
              logger.error('error in getColumnsFromDb');
              callback(null, results);
              return;
            } else {
              Array.prototype.push.apply(results, tabNotes);
              mongodb.findAllNoIds('compDates', function(err, compDates) {
                if (err) {
                  logger.error('error in getColumnsFromDb');
                  callback(null, results);
                  return;
                } else {
                  Array.prototype.push.apply(results, compDates);
                  mongodb.findAllNoIds('playings', function(err, playings) {
                    if (err) {
                      logger.error('error in getColumnsFromDb');
                      callback(null, notes);
                      return;
                    } else {
                      Array.prototype.push.apply(results, playings);
                      callback(null, results);
                    }
                  });
                }

              });
            }
          });
        }
      });
      // , username);
    };


  module.exports = {
    addCol: addCol,
    delCol: delCol,
    getColumnsFromDb: getColumnsFromDb,
    storeExtraColumns: storeExtraColumns,
    getExtraColumnsFromDb: getExtraColumnsFromDb,
    // getColumns: getColumns,
    externalStoreOneObj: externalStoreOneObj,
    createColumns: createColumns
  }
}());
// /**
//  * receives external json data, calls a function to store it and put it in memoryh
//  * @param  {json} externalObj [{<unit id>:{<data>}}]
//  * @return {[type]}             [description]
//  */
// processExternalJson: function(externalObj/*, toMemory*/) {
//     var keys, unitId, extObj,
//         obj = {},
//         toStore = {},
//         types = Object.keys(externalObj),
//         unitIds = Object.keys(externalObj),
//         userColumns = columns[getUsername()];
//         // console.log('storing');
//         unitId = unitIds[i];
//         extObj = externalObj[unitId];
//         keys = Object.keys(extObj);
//         if(toMemory && !userColumns)
//             userColumns = columns[getUsername()] = {};
//         for (var i = 0; i < unitIds.length; i++) {
//             for (var j = 0; j < keys.length; j++) {
//                 var value = extObj[keys[j]];
//                 obj[unitId].col[keys[j]] = value;
//                 toStore = {
//                     'data': value,
//                     'unitId': unitId,
//                     'username': 'EXTERNAL'
//                 };
//                 storeBulkColumn(keys[i], toStore);
//             }
//             // console.log('i::' + i);
//     }
// },
//
// removeRedundantKeys = function(obj) {
//        delete obj.username;
//        delete obj.token;
//        return obj;
//    },
//     return function() {

// };