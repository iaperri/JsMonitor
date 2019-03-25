"use strict";
(function() {
  var NODE_SERVER_URL = 'http://localhost:9191/ScalaMonitor', //'http://172.24.173.253:8080/ScalaMonitor/', //'http://localhost:9191',
    NIAGARA_URL = 'http://172.24.78.219:8080/ExtraColumnsMonitor';
  module.exports = {
    mongoUrl:'mongodb://172.24.72.201:27017,172.24.72.201:27018,172.24.78.33:27017/?replicaSet=MONITOR_MONGODB_SET&w=0&readPreference=secondaryPreferred',
    oasis: NODE_SERVER_URL + '/units/11/0',
    hours: { url: NODE_SERVER_URL + '/openingHours/', products: [11, 16] }, 
    extraColumns: NIAGARA_URL + '/columns',
    mainAdshel: NODE_SERVER_URL + '/states/23/0',
    mainD48: NODE_SERVER_URL + '/states/22/0',
    mainRetail: NODE_SERVER_URL + '/states/24,25,28/0',
    mainSocialiteAndTest: NODE_SERVER_URL + '/units/11,18/0',
    mainSocialite: NODE_SERVER_URL + '/units/11/0',
    mainMall: NODE_SERVER_URL + '/units/16/0',
    mainMallXl: NODE_SERVER_URL + '/states/16/0',
    logPath: '/data/application.log'
  };
})();
