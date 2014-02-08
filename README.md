#primus-pingpong


primus-pingpong is a [Primus](https://github.com/primus/primus) plugin that acts as a server heartbeat for monitoring connection status. This plugin was created to help in mobile/polling environments to allow the server to have a pre connection timeout heads up that there might be some issues. Something like an iPhone user hitting the lock button while they are viewing your site and the long polling connection stops responding but you don't know till your timeout fires (default is about 60 seconds later).

##Usage

    var http = require('http');
    var Primus = require('primus');
    var pingpong = require('primus-pingpong');

    httpServer = http.createServer();
    primus = new Primus(httpServer, {
      transformer: 'Engine.IO',
      ping: {
        time: 10,
        timeout: 12
      }
    });
    primus.use('pingpong', pingpong);
    
    primus.on('missingpong', function (spark, data) {
      // deal with a missing heartbeat.
    });    

##Configuration
When you create your connection you can specify some options that might be helpful. This example shows the ones you really need to know about.

    server = new Primus(httpServer, {
      transformer: 'Engine.IO',
      ping: {
        time: 10,
        timeout: 12
      }
    });

###time
Time specifies how much time in ms passes between each ping from the server to the client. Simplified this is the time specified for setInterval to fire off a ping to the client.

###timeout
Timeout specifies how long a pong from the client can be "missing" before we assume the client is gone. This should be some multiple of time plus a little bit of leeway for the fact that setInterval isn't exact. If time is something like 5000ms then timeout should probably be something like 11000ms to allow for some latency and 1 dropped pong.

###nopong
Yeah, don't use this. When creating unit tests I needed an easy way to tell the client not to respond to pings with a pong. This was my bad ass self coming up with an easy way to do that.
