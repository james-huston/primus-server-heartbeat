#primus-server-heartbeat

[![Build Status](https://travis-ci.org/primus/primus.png?branch=master)](https://travis-ci.org/james-huston/primus-server-heartbeat)

primus-server-heartbeat is a [Primus](https://github.com/primus/primus) plugin that acts as a server heartbeat for monitoring connection status. This plugin was created to help in mobile/polling environments to allow the server to have a pre connection timeout heads up that there might be some issues. Something like an iPhone user hitting the lock button while they are viewing your site and the long polling connection stops responding but you don't know till your timeout fires (default is about 60 seconds later).

##Usage

    var http = require('http');
    var Primus = require('primus');
    var pingpong = require('primus-pingpong');

    httpServer = http.createServer();
    primus = new Primus(httpServer, {
      transformer: 'Engine.IO',
      shb: {
        timeout: 5000
      }
    });
    primus.use('pingpong', pingpong);
    
    primus.on('shb::mia', function (spark, data) {
      // deal with a missing heartbeat.
    });

##Configuration
Currently you just need to specify how long you want to wait for a ping before you call mia on your client. The default is 35000ms. This should be slightly larger than your client ping setting.

    server = new Primus(httpServer, {
      transformer: 'Engine.IO',
      shb: {
        timeout: 5000
      }
    });
