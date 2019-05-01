var fs = require('fs');
var path = require('path');
var assert = require('assert');
var querystring = require('../lib/querystring');

describe('version', function () {
    it('version is ' + querystring.version, function () {
        var addr = path.resolve(__dirname, '../package.json');
        var json = fs.readFileSync(addr).toString();
        var data = JSON.parse(json);

        assert.deepStrictEqual(querystring.version, data.version);
    });
});
