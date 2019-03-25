var request = require("request"),
  OASIS_URL = 'http://172.24.78.214/services/monitor/openingHours/11',
  COLLECTION = 'openinghours';

  function getOpeningHours(callback) {
  request.get(OASIS_URL, function(err, response, body) {
    if (err) {
      callback(err, {});
    } else {
      callback(null, body); // First param indicates error, null=> no error
    }
  });
};

 
var jsonObjectDb = {"501158":{"panelId":"167715","unitId":"501158","ipAddress":"172.24.255.6","district":"2506","site":"0002","panel":"01 ","branch":"SOUTHERN/SAWTRY","address":"Liquid &amp Envy 131 High St Colchester Colchester","time":"Thu Apr 21 12:00:05 BST 2016","lastTime":"56 Days, 09 Hrs, 11 Mins","timeCode":"red","venue":"851-0317-01","active":true},"500048":{"panelId":"156650","unitId":"500048","ipAddress":"172.24.255.6","district":"0404","site":"0009","panel":"01 ","branch":"NORTHERN/LEEDS","address":"Hutton Bar 140-144 West St Sheffield","time":"Sun May 15 00:46:25 BST 2016","lastTime":"32 Days, 20 Hrs, 25 Mins","timeCode":"red","venue":"127-9127-01","active":true},"500973":{"panelId":"166771","unitId":"500973","ipAddress":"172.24.255.6","district":"3503","site":"0007","panel":"01 ","branch":"NORTHERN/LEEDS","address":"Status 13 to 14 Silver Street Lincoln","time":"Tue May 17 19:03:43 BST 2016","lastTime":"30 Days, 02 Hrs, 08 Mins","timeCode":"red","venue":"851-0136-01","active":true}},
    jsonObjectVenus = {"501158":{"panelId":"167715","unitId":"501158","ipAddress":"172.24.255.7","district":"2306","site":"0002","panel":"01 ","branch":"SOUTHERN/SAWTRY","address":"Liquid &amp Envy 131 High St Colchester Colchester","time":"Thu Apr 21 12:00:05 BST 2016","lastTime":"60 Days, 09 Hrs, 11 Mins","timeCode":"red","venue":"851-0317-01","active":false},"500048":{"panelId":"156650","unitId":"500048","ipAddress":"172.24.255.6","district":"0404","site":"0009","panel":"01 ","branch":"NORTHERN/LEEDS","address":"Hutton Bar 140-144 West St Sheffield","time":"Sun May 15 00:46:25 BST 2016","lastTime":"32 Days, 20 Hrs, 25 Mins","timeCode":"red","venue":"127-9127-01","active":true},"500973":{"panelId":"166771","unitId":"500973","ipAddress":"172.24.255.6","district":"3503","site":"0007","panel":"01 ","branch":"NORTHERN/LEEDS","address":"Status 13 to 14 Silver Street Lincoln","time":"Tue May 17 19:03:43 BST 2016","lastTime":"30 Days, 02 Hrs, 08 Mins","timeCode":"red","venue":"851-0136-01","active":true}, "500974":{"panelId":"166771","unitId":"500973","ipAddress":"172.24.255.6","district":"3503","site":"0007","panel":"01 ","branch":"NORTHERN/LEEDS","address":"Status 13 to 14 Silver Street Lincoln","time":"Tue May 17 19:03:43 BST 2016","lastTime":"30 Days, 02 Hrs, 08 Mins","timeCode":"red","venue":"851-0136-01","active":true}},

     dbKeys = Object.keys(jsonObjectDb),//[ '500048', '500973', '501158' ],
    venusKeys = Object.keys(jsonObjectVenus);//[ '500048', '500973', '500974', '501158' ];
function diff(jsonObjectDb, jsonObjectVenus) {
    var visitedKeys = [],
        differences = [],
        tmp, key, v, db;
    for (var i = 0; i < dbKeys.length; i++) {
        key = dbKeys[i];
        tmp = {};
        visitedKeys.push(key);
        if (jsonObjectVenus[key]) {
            var v = jsonObjectVenus[key],
                db = jsonObjectDb[key];
            for (var field in db) {
                if (v.field) {
                    if (v.field !== db.field) {
                        tmp[field] = v[field];
                    }
                }
            }
            differences.push({key: {tmp}});
        } else differences.push({key: {}});
    }
    return differences;
}

console.log(diff(jsonObjectDb, jsonObjectVenus));

