var builder = require('@john-yuan/dev-browserify-builder');

builder.build('lib/querystring.js', 'dist/querystring.min.js', {
    debug: false,
    standalone: 'QS',
    detectGlobals: false
});
