
/* jshint unused: false */
module.exports.client = function (spark, options) {
  spark.on('outgoing::data', function (raw) {
    // console.log(raw);
  });
};
