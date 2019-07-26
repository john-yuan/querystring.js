var assert = require('assert');
var decode = require('../index').decode;
var standaloneDecode = require('../decode');

describe('decode', function () {
    it('x-query-string/decode is available', function () {
        assert.deepStrictEqual(standaloneDecode, decode);
    });

    it('decode basic types', function () {
        var str = 'a=1&b=B&c=true&d=false';
        var result = decode(str);
        var expected = {
            a: '1',
            b: 'B',
            c: 'true',
            d: 'false'
        };

        assert.deepStrictEqual(expected, result);
    });

    it('decode null', function () {
        var str = 'a';
        var expected = { a: null };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode emptry string', function () {
        var str = 'a=';
        var expected = { a: '' };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode special char', function () {
        var str = 'str=a%5B0%5D%3D1';
        var expected = { str: 'a[0]=1' };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode multi-byte string', function () {
        // str=你好
        var str = 'str=%E4%BD%A0%E5%A5%BD';
        var expected = { str: '你好' };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode emoji', function () {
        var str = 'emoji=%E2%9C%8C%EF%B8%8F';
        var expected = { emoji: '✌️' };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode array', function () {
        var str = 'a%5B%5D=1&a%5B%5D=2';
        var expected = { a: ['1', '2'] };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode array with index', function () {
        var str = 'a%5B0%5D=1&a%5B1%5D=2';
        var expected = { a: ['1', '2'] };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode object', function () {
        // a[b][c]=3
        var str = 'a%5Bb%5D%5Bc%5D=3';
        var expected = { a: { b: { c: '3' } } };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode array of object', function () {
        // a[0][b]=2&a[1][c]=3
        var str = 'a%5B0%5D%5Bb%5D=2&a%5B1%5D%5Bc%5D=3';
        var expected = { a: [ { b: '2' }, { c: '3' } ] };

        assert.deepStrictEqual(decode(str), expected);
    });

    it('decode complex object', function () {
        var str = 'a=1&b=B&c=true&d=false&e&f%5B%5D=1&f%5B%5D=2&f%5B%5D=3&g%5Ba%5D=1&h%5B0%5D%5Ba%5D=1&h%5B1%5D%5Bb%5D=2&i%5B0%5D%5Ba%5D%5B%5D=1&i%5B0%5D%5Ba%5D%5B%5D=2&i%5B0%5D%5Ba%5D%5B%5D=3&i%5B1%5D%5Bb%5D%5Ba%5D=1&i%5B1%5D%5Bb%5D%5Bb%5D=2&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=3&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=4&i%5B1%5D%5Bb%5D%5Bc%5D%5B%5D=5&str=%F0%9F%8D%8E%20is%20%E8%8B%B9%E6%9E%9C%20in%20Chinese.%20%E2%9C%8C%EF%B8%8F';
        var expected = {
            a: '1',
            b: 'B',
            c: 'true',
            d: 'false',
            e: null,
            f: ['1', '2', '3'],
            g: { a: '1' },
            h: [ { a: '1' }, { b: '2' } ],
            i: [ { a: ['1', '2', '3'] }, { b: { a: '1', b: '2', c: ['3', '4', '5'] } } ],
            str: '🍎 is 苹果 in Chinese. ✌️'
        };

        assert.deepStrictEqual(decode(str), expected);
    });
});
