var builder = require('@john-yuan/dev-browserify-builder');

builder.build('index.js', 'dist/querystring.min.js', {
    debug: false,
    standalone: 'QS',
    detectGlobals: false,
    plugin: [ 'bundle-collapser/plugin' ],
});
