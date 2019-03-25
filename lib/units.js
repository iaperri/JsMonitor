(function() {
  "use strict";
  var async = require("async"),
    request = require("request"),
    // openinghours = require('./openinghours'),
    URL = require('../config/config.js'),
    logger = require('./logger'),
    units = [];

  function fetchFromUrl(url, cb) {
    request.get(url, function(err, response, body) {
      if (err) {
        cb({ err: err, url: url });
      } else {
        cb(null, body); // First param indicates error, null=> no error
      }
    });
  }

  function addTimestamp(urlStr) {
    let url;
    if (urlStr.indexOf('/') > -1) {
      var us = urlStr.split('/');
      url = URL.get(us[0]).replace(/\/0$/, '/' + us[1]);
    } else {
      url = URL.get(urlStr);
    }
    return url;
  }

  function resolveAndFetchFromUrl(url, key, cb) {
    request.get(url, function(err, response, body) {
      if (err) {
        logger.error('error calling ' + url + ' ' + err);
        cb(null, {});
      } else {
        logger.info(`[${url}] response ${response && response.statusCode}`);
        if (response && response.statusCode >= 400)
          logger.error(`Error when requesting from ${url} response: ${response.statusCode}`);
        var res;
        try {
          res = JSON.parse(body);
          //if it begins with the list character, parse it
          if (res.hasOwnProperty('data') && typeof res.data === 'string') {
            res.data = res.data.replace(/\[/g, '{').replace(/]/g, '}');
            var d = JSON.parse(res.data);
            res.data = d;
          }
        } catch (err) {
          logger.error(`error in units.js[resolveAndFetchFromUrl] - URL:${url}-KEY:${key}-${err} -trying to parse response ${body.substring(0, 500)}  ...`);
          res = {};
          //  cb(err, {});
        }
        cb(null, res); // First param indicates error, null=> no error
      }
    });
  }

  function resolveAndFetchWithTsFromUrl(urlStr, key, cb) {
    var url;
    url = addTimestamp(urlStr);
    resolveAndFetchFromUrl(url, key, cb);
  }

  function directMultiFetch(endPointObj, callback) {
    logger.info(new Date().toJSON() + ' requesting ' + JSON.stringify(endPointObj));
    async.mapValues(endPointObj, resolveAndFetchWithTsFromUrl, function(err, result) {
      if (err) {
        logger.error(`error ${err}`);
        callback(err, null);
      } else {
        logger.debug('finish the async requests ');
        callback(null, result);
      }
    });
  }

  function directMultiFetchNoTs(endPointObj, callback) {
    logger.info(new Date().toJSON() + ' requestrequesting ' + JSON.stringify(endPointObj));
    async.mapValues(endPointObj, resolveAndFetchFromUrl,
      function(err, result) {
        if (err) {
          logger.error('error ' + err);
          callback(err, null);
        } else {
          logger.debug('finish the async requests ');
          callback(null, result);
        }
      });
  }
  module.exports = {
    directMultiFetch: function(endPointObj, callback) {
      directMultiFetchNoTs(endPointObj, callback);
    },
    multiFetch: function(req, res) {
      var endPointObj = req.query.endPoints;
      endPointObj = JSON.parse(endPointObj);
      directMultiFetch(endPointObj, function(err, result) {
        if (err) {
          logger.error(`error while multifetch ${err}`);
          res.end();
        }
        res.send(result);
      })
    },
    fetchData: function(req, res) {
      var where = req.query.where,
        url = URL.get(where);
      fetchFromUrl(url, function(err, results) {
        if (err) {
          logger.error('error when fetching data ' + err.err);
          res.end();
        }
        res.send(results);
      });
    }
    // getHoursDataFromDb: function(req, res) {
    //   openinghours.getOpeningHoursFromDb(function(hErr, hDataObj) {
    //     if (hErr) {
    //       console.log('error while reading hours');
    //       res.end();
    //     }
    //     res.send(hDataObj);
    //   });
    // }
  }
})();


// ping: function(req, res) {
//     var ip = req.body.ip,
//         alive;
//     pingSession.pingHost('123.2.1.1', function(error, target) {
//         if (error) {
//             if (error instanceof ping.RequestTimedOutError) {
//                 console.log(target + ": " + error.toString());
//                 alive = false;
//             } else {
//                 alive = true;
//                 console.log(target + ": Alive");
//             }
//             res.json({
//                 'alive': alive
//             });
//         }
//     });
// },
// readFile: function(req, res) {
//     console.log("reading file " + currentFileName);
//     var errorCount = 0;
//     fs.readFile(currentFileName, 'utf8', function(err, data) {
//         try {
//             // console.log("err " + JSON.stringify(err));
//             // console.log("data " + data);
//             if (data) {
//                 units = JSON.parse(data);
//                 res.send(units);
//             } else {
//                 console.log("no data available");
//                 errorCount++;
//             }
//         } catch (error) {
//             console.log("error reading a file" + error);
//             errorCount++;
//         }
//          if (errorCount > 0) {
//           res.end();
//            console.log({
//               errors: errorCount
//           });
//         }
//       });
// },