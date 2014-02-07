
/* jshint unused: false */
module.exports.client = function (primus, options) {
  primus.on('data', function (data) {
    if (typeof data !== 'object') return;

    if (options.ping && options.ping.nopong) {
      /*
       * bail if ponging is turned off. if this is happening outside
       * of testing then you shouldn't be using this plugin.
       */
      return;
    }

    if (data.ping) {
      primus.write({
        pong: data.ping
      });
    }
  });
};
