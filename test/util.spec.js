var assert = require('assert');
var util = require('../lib/util');

describe('util', function () {
    it('isArray', function () {
        assert.strictEqual(true, util.isArray([]));
        assert.strictEqual(true, util.isArray(new Array()));
        assert.strictEqual(false, util.isArray(null));
        assert.strictEqual(false, util.isArray(undefined));
        assert.strictEqual(false, util.isArray(1));
        assert.strictEqual(false, util.isArray(false));
        assert.strictEqual(false, util.isArray('string'));
        assert.strictEqual(false, util.isArray(/regexp/));
        assert.strictEqual(false, util.isArray({}));
        assert.strictEqual(false, util.isArray(new Object()));
        assert.strictEqual(false, util.isArray(function () {}));
        assert.strictEqual(false, util.isArray(new Date()));
    });

    it('isObject', function () {
        assert.strictEqual(true, util.isObject({}));
        assert.strictEqual(true, util.isObject(new Object()));
        assert.strictEqual(false, util.isObject(null));
        assert.strictEqual(false, util.isObject(undefined));
        assert.strictEqual(false, util.isObject(1));
        assert.strictEqual(false, util.isObject(false));
        assert.strictEqual(false, util.isObject('string'));
        assert.strictEqual(false, util.isObject(/regexp/));
        assert.strictEqual(false, util.isObject([]));
        assert.strictEqual(false, util.isObject(new Array()));
        assert.strictEqual(false, util.isObject(function () {}));
        assert.strictEqual(false, util.isObject(new Date()));
    });
});
