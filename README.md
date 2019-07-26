# querystring.js

[![npm version](https://img.shields.io/npm/v/x-query-string.svg)](https://www.npmjs.com/package/x-query-string)
[![Build Status](https://travis-ci.org/john-yuan/querystring.js.svg?branch=master)](https://travis-ci.org/john-yuan/querystring.js)
[![install size](https://packagephobia.now.sh/badge?p=x-query-string)](https://packagephobia.now.sh/result?p=x-query-string)
[![npm downloads](https://img.shields.io/npm/dm/x-query-string.svg)](http://npm-stat.com/charts.html?package=x-query-string)

A query string encoder and decoder. It works like the `$.param(...)` function of jQuery and has the ability to decode the query string. Can be used in Node.js and browser side.

Features:

* Encode & Decode array (nested)
* Encode & Decode object (nested)

API:

* [QS.encode(object, [keepArrayIndex])](#qsencodeobject-keeparrayindex)
* [QS.decode(string)](#qsdecodestring)

## Install

If you are using npm, just install `x-query-string` as a dependency.

```bash
npm i x-query-string
```

Otherwise, you can import the bundle file with `script` tag directly.

```html
<script scr="path/to/querystring.min.js"></script>
```

The bundle file also can be used as an AMD module, which means it can be loaded by [require.js](https://requirejs.org/).

## Example

```js
var QS = require('x-query-string');

// a=1&b=2
QS.encode({ a: 1, b: 2 });

// a%5B%5D=1&a%5B%5D=2&a%5B%5D=3 (a[]=1&a[]=2&a[]=3)
QS.encode({ a: [1, 2, 3] });

// a%5Bb%5D%5Bc%5D=3 (a[b][c]=3)
QS.encode({ a: { b: { c: 3 } } });
```

For npm users, if you just want to include only the `encode` or `decode` function, you can do this as the following example.

```js
// include encode only
var encode = require('x-query-string/encode');
```

Or

```js
// include decode only
var decode = require('x-query-string/decode');
```

This is helpful when you want to reduce the bundle size of your application when you just use `encode` or `decode`.

## API

### QS.encode(object, [keepArrayIndex])

* `object` {Object} The data to be encoded to query string
* `boolean` {keepArrayIndex} Whether to always keep array index in the query string. If the array to be encoded just has one dimension, the index can be omitted. The default value is `false`.
* Returns: {string} Returns the URI component encoded query string

Encode the data to query string.

```js
var QS = require('x-query-string');

// a%5B%5D=1&a%5B%5D=2 (a[]=1&a[]=2)
QS.encode({ a: [1, 2] });

// a%5B0%5D=1&a%5B1%5D=2 (a[0]=1&a[1]=2)
QS.encode({ a: [1, 2] }, true);
```

### QS.decode(string)

* `string` {string} The query string to be decoded
* Returns {Object} Returns the decoded data

Decode the query string to a data object. The values in the result data object is `string` or `null`. This method will **NOT** try to parse `number` or `boolean` values.

```js
var QS = require('x-query-string');

QS.decode('a[]=1&a[]=2&b=false&c[d]=1&e=&f');
// or (The query string below is url-encoded)
QS.decode('a%5B%5D=1&a%5B%5D=2&b=false&c%5Bd%5D=1&e=&f');
```

result:

```js
{
    "a": [
        "1",
        "2"
    ],
    "b": "false",
    "c": {
        "d": "1"
    },
    "e": "",
    "f": null
}
```

## License

[MIT](./LICENSE "MIT")
