
var pingpong = require('../../');
var http = require('http');
var Primus = require('primus');

describe('The server plugin function', function () {
  var server;
  // var client;
  var httpServer;

  describe('using some testing settings', function () {
    beforeEach(function (done) {
      httpServer = http.createServer();
      server = new Primus(httpServer, {
        transformer: 'Engine.IO'
      });
      server.use('server-heartbeat', pingpong);

      httpServer.listen(18000, done);
    });

    afterEach(function (done) {
      server.end({}, done);
    });

    it('should throw server events on client pings', function (done) {
      server.on('connection', function (spark) {
        spark.on('shb::ping', function () {
          spark.end();
          done();
        });
      });

      var client = new server.Socket('http://localhost:18000', {
        ping: 30
      });
      client.write('testping');
    });

    it('should throw server events on server pong', function (done) {
      server.on('connection', function (spark) {
        spark.on('shb::pong', function () {
          spark.end();
          done();
        });
      });

      var client = new server.Socket('http://localhost:18000', {
        ping: 30
      });
      client.write('testpong');
    });

    it('should store the lastPing correctly', function (done) {
      server.on('connection', function (spark) {
        var pingCount = 0;
        spark.on('shb::ping', function () {
          pingCount++;
        });

        /*
         * we are dealing with small times and setTimeout is not exactly
         * accurate so there is a fair amount of empty time and space baked
         * in to these tests so we can makes sure something is happening
         * but not create false positives.
         */
        setTimeout(function () {
          (Date.now() - spark.shb.lastPing).should.be.lessThan(40);
        }, 120);

        setTimeout(function () {
          (Date.now() - spark.shb.lastPing).should.be.lessThan(40);
          pingCount.should.be.greaterThan(4);
          pingCount.should.be.lessThan(8);
          done();
        }, 300);
      });

      var client = new server.Socket('http://localhost:18000', {
        ping: 30
      });
      client.write('testLastPing');
    });
  });

  describe('using low timeout server settings', function ()  {
    var client;

    beforeEach(function (done) {
      httpServer = http.createServer();
      server = new Primus(httpServer, {
        transformer: 'Engine.IO',
        shb: {
          timeout: 100
        }
      });
      server.use('server-heartbeat', pingpong);

      httpServer.listen(18000, done);

      client = new server.Socket('http://localhost:18000', {
        ping: 10000
      });
    });

    afterEach(function (done) {
      server.end({}, done);
    });

    it('should throw an mia event when it misses a ping', function (done) {
      /*
       * we are running a high ping with a low timeout so this should throw
       * and mia event because the client won't have fired a ping before we
       * hit our timeout timer.
       */
      server.on('connection', function (spark) {
        spark.on('shb::mia', function () {
          spark.shb.mia = false;
          done();
        });
      });
    });
  });
});
