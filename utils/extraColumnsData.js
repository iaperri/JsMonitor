(function data(data) {
  let stored = {};

  getData = function getData() {
    return stored;
  };
  setData = function setData(data) {
    stored = data;
  };
  module.exports = { getData: getData, setData: setData };
})()