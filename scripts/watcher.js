var watcher = require('@john-yuan/dev-browserify-watcher');

exports.watch = function () {
    watcher.watch({
        entry: 'lib/querystring.js',
        output: 'dist/querystring.js',
        paths: 'lib/**/*.js',
        browserifyOptions: {
            debug: true,
            standalone: 'QS',
            detectGlobals: false
        },
        chokidarOptions: {},
    });
};
