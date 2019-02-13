var server = require('@john-yuan/dev-server');

exports.start = function (callback) {
    server.start({
        index: 'web/index.html'
    }, callback);
};
