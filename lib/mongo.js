(function() {
  "use strict";
  var client = require('mongodb').MongoClient,
    mongodb,
    ObjectID = require('mongodb').ObjectID,
    log = function(err, result) {
      err === null || logger.error("error inserting - Error " + err + " - Result " + result);
    },
    logger = require('./logger'),
    callbackOrLogError = function(err, callback, docs) {
      // err === null && console.log("mongo done it!");
      if (err === null && callback) {
        if (docs)
          callback(null, docs);
        else callback();
      } else log(err);
    }
  module.exports = {
    connect: function(dburl, dbName, callback) {
      client.connect(dburl, {
        auto_reconnect: true
      }, function(err, db) {
        if (err) {
          throw err;
        }
        // mongodb = db;
        mongodb = db.db(dbName);
        callback && callback();
      });
    },
    db: function() {
      return mongodb;
    },
    objectId: function(objId) {
      return new ObjectID(objId);
    },
    findOne: function(col, obj, callback) {
      var result = mongodb.collection(col).findOne(obj, callback);
      return result;
    },
    findWithQuery: function(col, obj, callback) {
      var result = mongodb.collection(col).find(obj, { _id: 0 }).toArray(function(err, docs) {
        callbackOrLogError(err, callback, docs);
      });
    },
    findAllNoIds: function(col, callback) { //, username) {
      // var q = username && {username: username};
      var q = {};
      mongodb.collection(col).find(q, { _id: 0 }).toArray(function(err, docs) {
        callbackOrLogError(err, callback, docs);
      });
    },
    findAll: function(col, callback) {
      mongodb.collection(col).find({}).toArray(function(err, docs) {
        callbackOrLogError(err, callback, docs);
      });
    },
    export: function(col) {
      mongodb.collection(col).find({}, { _id: 0 }).toArray(function(err, docs) {
        var date = new Date().toJSON();
        if (err) {
          logger.error(err);
        }
        require('fs').writeFile('/downloads/notesBackup' + date + '.json', JSON.stringify(docs), function(error) {
          if (err) {
            return logger.error(error);
          }
          logger.info('backup saved at ' + date + ' ' + docs.length + ' elements');
        });
      });
    },
    storeColumn: function(type, data, callback) {
      var column = type + 's',
        collection = mongodb.collection(column),
        toStore = {},
        q = {
          unitId: data.unitId
        },
        now = new Date().toJSON();
      collection.updateOne(q, {
        $set: { unitId: data.unitId, [type]: data.data, date: now, user: data.username },
        $push: {
          historic: {
            [type]: data.data,
            date: now,
            user: data.username
          }
        }
      }, {
        upsert: true,
        w: 1
      }, function(err) {
        callbackOrLogError(err, callback)
      });
    },
    removeColumn: function(column, data, callback) {
      var collection = mongodb.collection(column);
      var q = {
        unitId: data.unitId
      };
      // if (data.username) {
      //     q.username = data.username;
      // }
      collection.removeOne(q, {
        w: 1
      }, function(err) {
        callbackOrLogError(err, callback)
      });
    },
    /**
     * stores just one collection along with a timestamp, removing the previous one
     * @param  {[type]}   data     [description]
     * @param  {[type]}   col      [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    storeOneObject: function(data, col, callback) {
      var collection = mongodb.collection(col);
      collection.remove({}, { w: 1 }, function(err) {
        callbackOrLogError(err, callback)
      });
      collection.insert({ 'data': data, 'date': new Date() }, function(err) {
        callbackOrLogError(err, callback)
      });
    },
    close: function() {
      mongodb.close();
    }
  };
})();