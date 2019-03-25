(() => {
  "use strict"
  let env;
  module.exports = {
    getEnv() {
      return env;
    },
    setEnv(_env) {
      env = _env;
    }
  }
})()