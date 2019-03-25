(function() {
  "use strict"
  module.exports = {
    get: function(val) {
      var env = require('./env.js').getEnv() || 'dev';
      return require('./config.' + env + '.js')[val];
    }
  }
})();