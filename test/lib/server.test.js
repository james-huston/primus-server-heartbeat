
var pingpong = require('../../');
var http = require('http');
var Primus = require('primus');

describe('The server plugin function', function () {
  var server;
  // var client;
  var httpServer;

  beforeEach(function (done) {
    httpServer = http.createServer();
    server = new Primus(httpServer, {
      transformer: 'Engine.IO',
      ping: {
        time: 10,
        timeout: 12
      }
    });
    server.use('pingpong', pingpong);

    httpServer.listen(18000, done);
  });

  afterEach(function (done) {
    httpServer.close(done);
  });

  it('should send a ping and get a pong after connection',
    function (done) {
      server.on('connection', function (spark) {
        spark.on('data', function (data) {
          data.pong.should.be.lessThan(Date.now());
          spark.pingpong.pings.length.should.equal(0);
          spark.end();
          done();
        });
      });

      var client = new server.Socket('http://localhost:18000', {
        strategy: false  // disable reconnects. i feel like we shouldn't
                         // need to do this.
      });

      client.on('data', function (data) {
        data.ping.should.be.lessThan(Date.now());
      });
    });

  it('should throw an event when a pong fails', function (done) {
    server.on('missingpong', function (spark, data) {
      data.pong.should.be.lessThan(Date.now());
      spark.end();
      done();
    });

    var client = new server.Socket('http://localhost:18000', {
      strategy: false,  // disable reconnects. i feel like we shouldn't
                        // need to do this.
      ping: {
        nopong: true  // this means the client won't pong back.
                      // don't do this outside of testing.
      }
    });

    client.on('data', function (data) {
      data.ping.should.be.lessThan(Date.now());
    });
  });
});
