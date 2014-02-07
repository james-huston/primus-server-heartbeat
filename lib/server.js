
var checkForTimeout = module.exports.checkForTimeout =
  function checkForTimeout(spark, options) {
    var currentTime = Date.now();

    spark.pingpong.pings.forEach(function (ping) {
      if ((currentTime - options.ping.timeout) > ping) {
        spark.primus.emit(
          'missingpong',
          spark,
          {
            pong: ping
          }
        );
      }
    });
  };

var runInterval = module.exports.runInterval =
  function runInterval(spark, options) {
    checkForTimeout(spark, options);

    var pingTime = Date.now();
    spark.pingpong.pings.push(pingTime);
    spark.write({
      ping: pingTime
    });
  };

module.exports.server = function (primus, options) {

  options.ping = options.ping || {};
  options.ping.time = options.ping.time || 5000;
  options.ping.timeout = options.ping.timeout || 12000;

  var pingpongInterval;

  primus.on('connection', function (spark) {
    spark.pingpong = {
      pings: []
    };

    pingpongInterval = setInterval(
      function () {
        runInterval(spark, options);
      },
      options.ping.time
    );

    spark.on('end', function () {
      clearInterval(pingpongInterval);
    });

    spark.on('error', function () {
      clearInterval(pingpongInterval);
    });

    spark.on('data', function (data) {
      if (typeof data !== 'object') return;

      if (data.pong) {
        var pingdex = spark.pingpong.pings.indexOf(data.pong);
        if (pingdex >= 0) {
          spark.pingpong.pings.splice(pingdex, 1);
        }
      }
    });
  });
};
