var server = require('./server');
var watcher = require('./watcher');

server.start(function () {
    console.log('');
    watcher.watch();
});
