
var serverPlugin = require('../').server;
var http = require('http');
var Primus = require('primus');

describe('When figuring out how to test this stuff', function () {
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
    server.end({}, done);
  });

  describe('our server plugin', function () {
    it('should in fact be a function', function () {
      serverPlugin.should.be.an.instanceOf(Function);
    });
  });

  describe('the primus server and client', function () {
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
});
