var watcher = require('@john-yuan/dev-browserify-watcher');

exports.watch = function () {
    watcher.watch({
        entry: 'index.js',
        output: 'dist/querystring.js',
        paths: ['util/**/*.js', 'index.js', 'encode.js', 'decode.js'],
        browserifyOptions: {
            debug: true,
            standalone: 'QS',
            detectGlobals: false,
            plugin: [ 'bundle-collapser/plugin' ]
        },
        chokidarOptions: {},
    });
};
