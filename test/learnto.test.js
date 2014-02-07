
var serverPlugin = require('../').server;
var http = require('http');
var Primus = require('primus');

describe('The server plugin function', function () {
  var server;
  // var client;
  var httpServer;

  beforeEach(function (done) {
    httpServer = http.createServer();
    server = new Primus(httpServer, {
      transformer: 'Engine.IO'
    });

    httpServer.listen(18000, done);
  });

  afterEach(function (done) {
    httpServer.close(function () {
      // console.log('closing server 1');
      done();
    });
  });

  it('should in fact be a function', function () {
    serverPlugin.should.be.an.instanceOf(Function);
  });

  it('should be able to connect to itself', function (done) {
    server.on('connection', function (spark) {
      spark.should.be.an.instanceOf(Object);
      done();
    });

    var client = new server.Socket('http://localhost:18000', {
      strategy: false  // disable reconnects. i feel like we shouldn't
                       // need to do this.
    });
    client.end();
  });
});
