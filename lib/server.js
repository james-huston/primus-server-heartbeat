
module.exports.server = function (primus, options) {

  options.shb = options.shb || {};
  options.shb.timeout = options.shb.timeout || 35000;

  primus.on('connection', function (spark) {
    var pingpongInterval;

    spark.shb = {
      lastPing: Date.now(),
      mia: false
    };

    var lastPing = Date.now();

    spark.on('incoming::data', function (raw) {
      primus.decoder(raw, function decoding(err, data) {
        if ('string' === typeof data && data.indexOf('primus::ping::') === 0) {
          // console.log(raw);
          var currentTime = Date.now();

          if (spark.shb.mia) {
            spark.shb.mia = false;
            spark.emit('shb::return', {
              last: lastPing,
              current: currentTime
            });
          }

          spark.shb.lastPing = currentTime;
          spark.emit('shb::ping');
        }
      });
    });

    spark.on('outgoing::data', function (raw) {
      primus.decoder(raw, function decoding(err, data) {
        if ('string' === typeof data && data.indexOf('primus::pong::') === 0) {
          // console.log(raw);
          spark.emit('shb::pong');
        }
      });
    });

    pingpongInterval = setInterval(
      function () {
        var timeSinceLast = Date.now() - spark.shb.lastPing;
        if (timeSinceLast > options.shb.timeout) {
          spark.shb.mia = true;
          spark.emit('shb::mia', {
            last: lastPing,
            time: timeSinceLast
          });
        }
      },
      options.shb.timeout
    );

    spark.on('end', function () {
      clearInterval(pingpongInterval);
    });

    spark.on('error', function () {
      clearInterval(pingpongInterval);
    });

  });
};
