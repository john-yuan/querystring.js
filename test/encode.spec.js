var assert = require('assert');
var encode = require('../lib/querystring').encode;

describe('encode', function () {
    it('encode basic types', function () {
        var expected = 'a=1&b=B&c=true&d=false';
        var data = {
            a: 1,
            b: 'B',
            c: true,
            d: false
        };

        assert.strictEqual(encode(data), expected);
    });

    it('null is encoded without equal sign', function () {
        var expected = 'a';
        var data = { a: null };

        assert.strictEqual(encode(data), expected);
    });

    it('undefined is treated as empty string', function () {
        var expected = 'a=';
        var data = { a: undefined };

        assert.strictEqual(encode(data), expected);
    });

    it('encode special char', function () {
        var expected = 'str=a%5B0%5D%3D1';
        var data = { str: 'a[0]=1' };

        assert.strictEqual(encode(data), expected);
    });

    it('encode multi-byte string', function () {
        // str=你好
        var expected = 'str=%E4%BD%A0%E5%A5%BD';
        var data = { str: '你好' };

        assert.strictEqual(encode(data), expected);
    });

    it('encode emoji', function () {
        var expected = 'emoji=%E2%9C%8C%EF%B8%8F';
        var data = { emoji: '✌️' };

        assert.strictEqual(encode(data), expected);
    });

    it('encode array', function () {
        var expected = 'a%5B%5D=1&a%5B%5D=2';
        var data = { a: [1, 2] };

        assert.strictEqual(encode(data), expected);
    });

    it('encode array with index', function () {
        var expected = 'a%5B0%5D=1&a%5B1%5D=2';
        var data = { a: [1, 2] };

        assert.strictEqual(encode(data, true), expected);
    });

    it('encode object', function () {
        // a[b][c]=3
        var expected = 'a%5Bb%5D%5Bc%5D=3';
        var data = { a: { b: { c: 3 } } };

        assert.strictEqual(encode(data), expected);
    });

    it('encode array of object', function () {
        // a[0][b]=2&a[1][c]=3
        var expected = 'a%5B0%5D%5Bb%5D=2&a%5B1%5D%5Bc%5D=3';
        var data = { a: [ { b: 2 }, { c: 3 } ] };

        assert.strictEqual(encode(data), expected);
    });

    it('encode complex object', function () {
        var expected = 'a=1&b=B&c=true&d=false&e&f%5B%5D=1&f%5B%5D=2&f%5B%5D=3&g%5Ba%5D=1&h%5B0%5D%5Ba%5D=1&h%5B1%5D%5Bb%5D=2&i%5B0%5D%5Ba%5D%5B%5D=1&i%5B0%5D%5Ba%5D%5B%5D=2&i%5B0%5D%5Ba%5D%5B%5D=3&i%5B1%5D%5Bb%5D%5Ba%5D=1&i%5B1%5D%5Bb%5D%5Bb%5D=2&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=3&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=4&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=5&str=%F0%9F%8D%8E%20is%20%E8%8B%B9%E6%9E%9C%20in%20Chinese.%20%E2%9C%8C%EF%B8%8F';
        var data = {
            a: 1,
            b: 'B',
            c: true,
            d: false,
            e: null,
            f: [1, 2, 3],
            g: { a: 1 },
            h: [ { a: 1 }, { b: 2 } ],
            i: [ { a: [1, 2, 3] }, { b: { a: 1, b: 2, c: [3, 4, 5] } } ],
            str: '🍎 is 苹果 in Chinese. ✌️'
        };

        assert.strictEqual(encode(data), expected);
    });
});
