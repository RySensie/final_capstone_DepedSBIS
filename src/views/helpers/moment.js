var momentjs = require("moment");

var moment;

moment = function (date, format) {
  if(date==null) return ''
  return momentjs(date).format(format);
};

module.exports = moment;
