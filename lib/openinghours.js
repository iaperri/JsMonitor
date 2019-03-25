(
  function() {
    "use strict";
    var request = require("request"),
      URL = require('../config/config.js'),
      units = require('./units.js'),
      mongodb = require('./mongo.js'),
      logger = require('./logger'),
      COLLECTION = 'openinghours';

    function fetchOpeningHours(callback) {
      let _env = require('../config/env.js').getEnv();
      logger.debug(`in opening hours. env from config: ${_env}`);
      let url = URL.get('hours').url,
        urlObj = {};
      let hours = {};
      URL.get('hours').products.forEach(function(product) {
        urlObj[product] = url + product;
      });
      let result = units.directMultiFetch(urlObj,
        function(err, result) {
          if (result !== undefined) {

            Object.keys(result).forEach(function(urlObj) {
              hours = Object.assign(hours, result[urlObj]);
            });
            callback(null, hours);
          } else {
            logger.error("error when calling the opening hours");
            callback(err, null);
          }
        });
    }

    /**
     * check if the units object provided in the parameter, are open or not.
     * first tries to find an effective date if later than today, getting the hours of the corresponding date of week.
     * @param  {[type]}  units [description]
     * @return {Boolean}       [an object with isOpen {boolean}, hours {sessions}, hoursAndDate [hours{sessions}]]
     */
    function isOpen(units) {
      var nowTime, unitId, effectiveArray, hoursAndDate, hours, date, effDateNoTimeMs, hoursDate, i, j, z, open,
        openHours = {},
        todaysHours = {},
        foundApplicableEffective = false,
        now = new Date(),
        nowNoTimeMs = new Date().setHours(0, 0, 0, 0),
        unitIds = [],
        unitDayOpenHours = [],
        unitWeekOpenHours = [];

      nowTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
      if (!units) {
        logger.info('there are no units');
        return;
      }
      unitIds = Object.keys(units);
      for (z = 0; z < unitIds.length; z++) {
        unitId = unitIds[z];
        foundApplicableEffective = false;
        effectiveArray = units[unitId].effective;
        if (effectiveArray !== undefined) {
          for (i = 0; i < effectiveArray.length && !foundApplicableEffective; i++) {
            hoursAndDate = effectiveArray[i];
            date = Object.keys(hoursAndDate);
            effDateNoTimeMs = new Date(date).setHours(0, 0, 0, 0);
            if (nowNoTimeMs < effDateNoTimeMs) {
              logger.error('date in the future');
              continue;
            }
            todaysHours = hoursAndDate[date][now.getDay() + 1];
            foundApplicableEffective = true;
          }
          if (!foundApplicableEffective) {
            logger.error('all effectiveFrom dates are in the future for unit ' + unitId);
          } else {
            open = (compareTimes(nowTime, todaysHours[0].open) >= 0 && compareTimes(nowTime, todaysHours[0].close) <= 0) ||
              ((Object.keys(todaysHours).length === 2) && compareTimes(nowTime, todaysHours[1].open) >= 0 && compareTimes(nowTime, todaysHours[1].close) <= 0);

            unitWeekOpenHours = formatWeeklyHours(hoursAndDate[date]);
            unitDayOpenHours = makeHoursString(todaysHours);
            // console.log('unitId ' + unitId + ' ' + JSON.stringify(unitDayOpenHours));
            openHours[unitId] = {
              'isOpen': open ? 'open' : 'closed',
              'hours': unitDayOpenHours,
              'openCloseHours': unitWeekOpenHours
            };
          }
        } else {
          logger.error('key ' + unitId + ' doesnt exist');
        }
      }
      return openHours;
    }

    function formatWeeklyHours(weekHoursDates) {
      var i, dow,
        weekOpenHours = [],
        days = Object.keys(weekHoursDates);

      for (i = 0; i < days.length; i++) {
        dow = days[i];
        weekOpenHours.push({
          dow: dow,
          hours: makeHoursString(weekHoursDates[dow])
        });
      }
      return weekOpenHours;
    }

    function makeHoursString(hoursDate) {
      var sessions = Object.keys(hoursDate);

      if (sessions[0] === 1) {
        logger.error('error ' + JSON.stringify(hoursDate));
      }
      if (sessions.length == 1) {
        // console.log(hoursDate);
        if (hoursDate[0].open === '05:00:00' && hoursDate[0].close === '05:00:00') {
          return 'CLOSED ALL DAY';
        }
        return '[' + hoursDate[0].open + ' - ' + hoursDate[sessions[0]].close + ']';
      }
      if (hoursDate[0].open === '00:00:00' && hoursDate[1].close === '23:59:59') {
        return '[' + hoursDate[1].open + ' - ' + hoursDate[0].close + ']';
      }
      return '[' + hoursDate[0].open + ' - ' + hoursDate[0].close + ']' + ' - ' +
        '[' + hoursDate[1].open + ' - ' + hoursDate[1].close + ']';
    }
    /**
     * depending on the effective date object returns an array with the opening closing times oa a unit id
     * @param  {[type]} now             [now]
     * @param  {[type]} effectiveArray    [the effective date obj]
     * @param  {[type]} date            [description]
     * @param  {[type]} effDateNoTimeMs [description]
     * @param  {[type]} openHours       [description]
     * @return {[type]}                 [description]
     */
    function getOpenCloseDateTimes(now, effectiveObj, date) {
      var hoursDate = effectiveObj[date][now.getDay() + 1];
      return makeHoursArray(hoursDate);
    }


    /**
     * converts a string of hh:mm:ss into ms
     * @param  {[type]} time [a string separated by :]
     * @return {[type]}      [the ms]
     */
    function timeToMs(time) {
      var timeArray = time.split(':');
      return (parseInt(timeArray[0], 10) * 3600 + parseInt(timeArray[1], 10) * 60 + parseInt(timeArray[2], 10)) * 1000;
    }
    /**
     * returns the time1 in ms - time2 in ms
     * @param  {[type]} time1 [description]
     * @param  {[type]} time2 [description]
     * @return {[type]}       [description]
     */
    function compareTimes(time1, time2) {
      // console.log('compareTimes ' + time1 + ' ' + time2);
      var result = timeToMs(time1) - timeToMs(time2) || 1;
      return result;
    }

    function getOpeningHoursFromDb(callback) {
      mongodb.findAllNoIds(COLLECTION, function(err, docs) {
        if (err) {
          logger.error('error recovering data from mongodb');
          callback(err, {});
        }
        var obj = isOpen(docs[0].data);
        // console.log(obj);
        callback(null, obj);
      });
    }
    module.exports = {
      getOpeningHoursFromDb: getOpeningHoursFromDb,
      getHoursDataFromDb: function(req, res) {
        getOpeningHoursFromDb(function(hErr, hDataObj) {
          if (hErr) {
            logger.error('error while reading hours');
            res.end();
          }
          res.send(hDataObj);
        });
      },
      storeNewOpeningHours: function() {
        var n = 1;
        fetchOpeningHours(
          function repeatFetchIfError(err, data) {
            if (err) {
              logger.error('error when accessing opening hours in oasis ' + err);
            } else {
              logger.info('inserting opening hours');
              // data = JSON.parse(data);
              require('./mongo.js').storeOneObject(data, COLLECTION, function() {
                logger.info('stored opening hours');
              });
            }
          }
        );
      }
    };
  })()