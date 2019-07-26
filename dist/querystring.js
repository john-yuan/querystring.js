(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QS = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var util = require(4);
var isArray = util.isArray;

/**
 * Decode the URI Component encoded query string to object
 *
 * @param {string} The URI Component encoded query string
 * @returns {Object.<string, string>} Returns the decoded object
 */
function decode(string) {
    var object = {};
    var cache = {};
    var keyValueArray;
    var index;
    var length;
    var keyValue;
    var key;
    var value;

    // do not decode empty string or something that is not string
    if (string && typeof string === 'string') {
        keyValueArray = string.split('&');
        index = 0;
        length = keyValueArray.length;

        while (index < length) {
            keyValue = keyValueArray[index].split('=');
            key = decodeURIComponent(keyValue[0]);
            value = keyValue[1];

            if (typeof value === 'string') {
                value = decodeURIComponent(value);
            } else {
                value = null;
            }

            decodeKey(object, cache, key, value);

            index += 1;
        }
    }

    return object;
}

/**
 * Decode the specefied key
 *
 * @param {Object.<string, string>} object The object to hold the decoded data
 * @param {Object.<string, *>} cache The object to hold cache data
 * @param {string} key The key name to decode
 * @param {any} value The value to decode
 */
function decodeKey(object, cache, key, value) {
    var rBracket = /\[([^\[]*?)?\]$/;
    var rIndex = /(^0$)|(^[1-9]\d*$)/;
    var indexOrKeyOrEmpty;
    var parentKey;
    var arrayOrObject;
    var keyIsIndex;
    var keyIsEmpty;
    var valueIsInArray;
    var dataArray;
    var length;

    // check whether key is something like `person[name]` or `colors[]` or
    // `colors[1]`
    if ( rBracket.test(key) ) {
        indexOrKeyOrEmpty = RegExp.$1;
        parentKey = key.replace(rBracket, '');
        arrayOrObject = cache[parentKey];

        keyIsIndex = rIndex.test(indexOrKeyOrEmpty);
        keyIsEmpty = indexOrKeyOrEmpty === '';
        valueIsInArray = keyIsIndex || keyIsEmpty;

        if (arrayOrObject) {
            // convert the array to object
            if ( (! valueIsInArray) && isArray(arrayOrObject) ) {
                dataArray = arrayOrObject;
                length = dataArray.length;
                arrayOrObject = {};

                while (length--) {
                    if (arrayOrObject[length] !== undefined) {
                        arrayOrObject[length] = dataArray[length];
                    }
                }
            }
        } else {
            arrayOrObject = valueIsInArray ? [] : {};
        }

        if ( keyIsEmpty && isArray(arrayOrObject) ) {
            arrayOrObject.push(value);
        } else {
            // arrayOrObject is array or object here
            arrayOrObject[indexOrKeyOrEmpty] = value;
        }

        cache[parentKey] = arrayOrObject;

        decodeKey(object, cache, parentKey, arrayOrObject);
    } else {
        object[key] = value;
    }
}

module.exports = decode;

},{"4":4}],2:[function(require,module,exports){
var util = require(4);
var isArray = util.isArray;
var isObject = util.isObject;
var hasOwn = Object.prototype.hasOwnProperty;

/**
 * Encode the given object to URI Component encoded query string
 *
 * @param {Object.<string, *>} object The object to encode
 * @param {boolean} [keepArrayIndex] Whether to keep array index
 * @returns {string} Returns the URI Component encoded query string
 */
function encode(object, keepArrayIndex) {
    var key;
    var keyValueArray = [];

    keepArrayIndex = !!keepArrayIndex;

    if ( isObject(object) ) {
        for ( key in object ) {
            if ( hasOwn.call(object, key) ) {
                encodeKey(key, object[key], keyValueArray, keepArrayIndex);
            }
        }
    }

    return keyValueArray.join('&');
}

/**
 * Encode the speceifed key in the object
 *
 * @param {string} key The key name
 * @param {any} data The data of the key
 * @param {string[]} keyValueArray The array to store the key value string
 * @param {boolean} keepArrayIndex Whether to keep array index
 */
function encodeKey(key, data, keyValueArray, keepArrayIndex) {
    var prop;
    var index;
    var length;
    var value;
    var subKey;

    if ( isObject(data) ) {
        for ( prop in data ) {
            if ( hasOwn.call(data, prop) ) {
                value = data[prop];
                subKey = key + '[' + prop + ']';
                encodeKey(subKey, value, keyValueArray, keepArrayIndex);
            }
        }
    } else if ( isArray(data) ) {
        index = 0;
        length = data.length;

        while (index < length) {
            value = data[index];

            if ( keepArrayIndex || isArray(value) || isObject(value) ) {
                subKey = key + '[' + index + ']';
            } else {
                subKey = key + '[]';
            }

            encodeKey(subKey, value, keyValueArray, keepArrayIndex);

            index += 1;
        }
    } else {
        key = encodeURIComponent(key);
        // if data is null, no `=` is appended
        if (data === null) {
            value = key;
        } else {
            // if data is undefined, treat it as empty string
            if (data === undefined) {
                data = '';
            // make sure that data is string
            } else if (typeof data !== 'string') {
                data = '' + data;
            }
            value = key + '=' + encodeURIComponent(data);
        }

        keyValueArray.push(value);
    }
}

module.exports = encode;

},{"4":4}],3:[function(require,module,exports){
var encode = require(2);
var decode = require(1);

exports.encode = encode;
exports.decode = decode;
exports.version = '2.0.0-alpha.1';

},{"1":1,"2":2}],4:[function(require,module,exports){
var toString = Object.prototype.toString;

/**
 * Check whether the variable is an array
 *
 * @param {any} it The variable to check
 * @returns {boolean} Returns `true` if it is an array
 */
var isArray = function (it) {
    return '[object Array]' === toString.call(it);
};

/**
 * Check whether the variable is an object
 *
 * @param {any} it The variable to check
 * @returns {boolean} Returns `true` if it is an object
 */
var isObject = function (it) {
    return '[object Object]' === toString.call(it);
};

exports.isArray = isArray;
exports.isObject = isObject;

},{}]},{},[3])(3)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImRlY29kZS5qcyIsImVuY29kZS5qcyIsImluZGV4LmpzIiwidXRpbC91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwidmFyIHV0aWwgPSByZXF1aXJlKDQpO1xudmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXk7XG5cbi8qKlxuICogRGVjb2RlIHRoZSBVUkkgQ29tcG9uZW50IGVuY29kZWQgcXVlcnkgc3RyaW5nIHRvIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBUaGUgVVJJIENvbXBvbmVudCBlbmNvZGVkIHF1ZXJ5IHN0cmluZ1xuICogQHJldHVybnMge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fSBSZXR1cm5zIHRoZSBkZWNvZGVkIG9iamVjdFxuICovXG5mdW5jdGlvbiBkZWNvZGUoc3RyaW5nKSB7XG4gICAgdmFyIG9iamVjdCA9IHt9O1xuICAgIHZhciBjYWNoZSA9IHt9O1xuICAgIHZhciBrZXlWYWx1ZUFycmF5O1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgbGVuZ3RoO1xuICAgIHZhciBrZXlWYWx1ZTtcbiAgICB2YXIga2V5O1xuICAgIHZhciB2YWx1ZTtcblxuICAgIC8vIGRvIG5vdCBkZWNvZGUgZW1wdHkgc3RyaW5nIG9yIHNvbWV0aGluZyB0aGF0IGlzIG5vdCBzdHJpbmdcbiAgICBpZiAoc3RyaW5nICYmIHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGtleVZhbHVlQXJyYXkgPSBzdHJpbmcuc3BsaXQoJyYnKTtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBsZW5ndGggPSBrZXlWYWx1ZUFycmF5Lmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGtleVZhbHVlID0ga2V5VmFsdWVBcnJheVtpbmRleF0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWx1ZVswXSk7XG4gICAgICAgICAgICB2YWx1ZSA9IGtleVZhbHVlWzFdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkZWNvZGVLZXkob2JqZWN0LCBjYWNoZSwga2V5LCB2YWx1ZSk7XG5cbiAgICAgICAgICAgIGluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xufVxuXG4vKipcbiAqIERlY29kZSB0aGUgc3BlY2VmaWVkIGtleVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIHN0cmluZz59IG9iamVjdCBUaGUgb2JqZWN0IHRvIGhvbGQgdGhlIGRlY29kZWQgZGF0YVxuICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgKj59IGNhY2hlIFRoZSBvYmplY3QgdG8gaG9sZCBjYWNoZSBkYXRhXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgbmFtZSB0byBkZWNvZGVcbiAqIEBwYXJhbSB7YW55fSB2YWx1ZSBUaGUgdmFsdWUgdG8gZGVjb2RlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZUtleShvYmplY3QsIGNhY2hlLCBrZXksIHZhbHVlKSB7XG4gICAgdmFyIHJCcmFja2V0ID0gL1xcWyhbXlxcW10qPyk/XFxdJC87XG4gICAgdmFyIHJJbmRleCA9IC8oXjAkKXwoXlsxLTldXFxkKiQpLztcbiAgICB2YXIgaW5kZXhPcktleU9yRW1wdHk7XG4gICAgdmFyIHBhcmVudEtleTtcbiAgICB2YXIgYXJyYXlPck9iamVjdDtcbiAgICB2YXIga2V5SXNJbmRleDtcbiAgICB2YXIga2V5SXNFbXB0eTtcbiAgICB2YXIgdmFsdWVJc0luQXJyYXk7XG4gICAgdmFyIGRhdGFBcnJheTtcbiAgICB2YXIgbGVuZ3RoO1xuXG4gICAgLy8gY2hlY2sgd2hldGhlciBrZXkgaXMgc29tZXRoaW5nIGxpa2UgYHBlcnNvbltuYW1lXWAgb3IgYGNvbG9yc1tdYCBvclxuICAgIC8vIGBjb2xvcnNbMV1gXG4gICAgaWYgKCByQnJhY2tldC50ZXN0KGtleSkgKSB7XG4gICAgICAgIGluZGV4T3JLZXlPckVtcHR5ID0gUmVnRXhwLiQxO1xuICAgICAgICBwYXJlbnRLZXkgPSBrZXkucmVwbGFjZShyQnJhY2tldCwgJycpO1xuICAgICAgICBhcnJheU9yT2JqZWN0ID0gY2FjaGVbcGFyZW50S2V5XTtcblxuICAgICAgICBrZXlJc0luZGV4ID0gckluZGV4LnRlc3QoaW5kZXhPcktleU9yRW1wdHkpO1xuICAgICAgICBrZXlJc0VtcHR5ID0gaW5kZXhPcktleU9yRW1wdHkgPT09ICcnO1xuICAgICAgICB2YWx1ZUlzSW5BcnJheSA9IGtleUlzSW5kZXggfHwga2V5SXNFbXB0eTtcblxuICAgICAgICBpZiAoYXJyYXlPck9iamVjdCkge1xuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgYXJyYXkgdG8gb2JqZWN0XG4gICAgICAgICAgICBpZiAoICghIHZhbHVlSXNJbkFycmF5KSAmJiBpc0FycmF5KGFycmF5T3JPYmplY3QpICkge1xuICAgICAgICAgICAgICAgIGRhdGFBcnJheSA9IGFycmF5T3JPYmplY3Q7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gZGF0YUFycmF5Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICBhcnJheU9yT2JqZWN0ID0ge307XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFycmF5T3JPYmplY3RbbGVuZ3RoXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheU9yT2JqZWN0W2xlbmd0aF0gPSBkYXRhQXJyYXlbbGVuZ3RoXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFycmF5T3JPYmplY3QgPSB2YWx1ZUlzSW5BcnJheSA/IFtdIDoge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGtleUlzRW1wdHkgJiYgaXNBcnJheShhcnJheU9yT2JqZWN0KSApIHtcbiAgICAgICAgICAgIGFycmF5T3JPYmplY3QucHVzaCh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBhcnJheU9yT2JqZWN0IGlzIGFycmF5IG9yIG9iamVjdCBoZXJlXG4gICAgICAgICAgICBhcnJheU9yT2JqZWN0W2luZGV4T3JLZXlPckVtcHR5XSA9IHZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FjaGVbcGFyZW50S2V5XSA9IGFycmF5T3JPYmplY3Q7XG5cbiAgICAgICAgZGVjb2RlS2V5KG9iamVjdCwgY2FjaGUsIHBhcmVudEtleSwgYXJyYXlPck9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKDQpO1xudmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXk7XG52YXIgaXNPYmplY3QgPSB1dGlsLmlzT2JqZWN0O1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogRW5jb2RlIHRoZSBnaXZlbiBvYmplY3QgdG8gVVJJIENvbXBvbmVudCBlbmNvZGVkIHF1ZXJ5IHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsICo+fSBvYmplY3QgVGhlIG9iamVjdCB0byBlbmNvZGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2tlZXBBcnJheUluZGV4XSBXaGV0aGVyIHRvIGtlZXAgYXJyYXkgaW5kZXhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIFVSSSBDb21wb25lbnQgZW5jb2RlZCBxdWVyeSBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gZW5jb2RlKG9iamVjdCwga2VlcEFycmF5SW5kZXgpIHtcbiAgICB2YXIga2V5O1xuICAgIHZhciBrZXlWYWx1ZUFycmF5ID0gW107XG5cbiAgICBrZWVwQXJyYXlJbmRleCA9ICEha2VlcEFycmF5SW5kZXg7XG5cbiAgICBpZiAoIGlzT2JqZWN0KG9iamVjdCkgKSB7XG4gICAgICAgIGZvciAoIGtleSBpbiBvYmplY3QgKSB7XG4gICAgICAgICAgICBpZiAoIGhhc093bi5jYWxsKG9iamVjdCwga2V5KSApIHtcbiAgICAgICAgICAgICAgICBlbmNvZGVLZXkoa2V5LCBvYmplY3Rba2V5XSwga2V5VmFsdWVBcnJheSwga2VlcEFycmF5SW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGtleVZhbHVlQXJyYXkuam9pbignJicpO1xufVxuXG4vKipcbiAqIEVuY29kZSB0aGUgc3BlY2VpZmVkIGtleSBpbiB0aGUgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG5hbWVcbiAqIEBwYXJhbSB7YW55fSBkYXRhIFRoZSBkYXRhIG9mIHRoZSBrZXlcbiAqIEBwYXJhbSB7c3RyaW5nW119IGtleVZhbHVlQXJyYXkgVGhlIGFycmF5IHRvIHN0b3JlIHRoZSBrZXkgdmFsdWUgc3RyaW5nXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGtlZXBBcnJheUluZGV4IFdoZXRoZXIgdG8ga2VlcCBhcnJheSBpbmRleFxuICovXG5mdW5jdGlvbiBlbmNvZGVLZXkoa2V5LCBkYXRhLCBrZXlWYWx1ZUFycmF5LCBrZWVwQXJyYXlJbmRleCkge1xuICAgIHZhciBwcm9wO1xuICAgIHZhciBpbmRleDtcbiAgICB2YXIgbGVuZ3RoO1xuICAgIHZhciB2YWx1ZTtcbiAgICB2YXIgc3ViS2V5O1xuXG4gICAgaWYgKCBpc09iamVjdChkYXRhKSApIHtcbiAgICAgICAgZm9yICggcHJvcCBpbiBkYXRhICkge1xuICAgICAgICAgICAgaWYgKCBoYXNPd24uY2FsbChkYXRhLCBwcm9wKSApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRhdGFbcHJvcF07XG4gICAgICAgICAgICAgICAgc3ViS2V5ID0ga2V5ICsgJ1snICsgcHJvcCArICddJztcbiAgICAgICAgICAgICAgICBlbmNvZGVLZXkoc3ViS2V5LCB2YWx1ZSwga2V5VmFsdWVBcnJheSwga2VlcEFycmF5SW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICggaXNBcnJheShkYXRhKSApIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBsZW5ndGggPSBkYXRhLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gZGF0YVtpbmRleF07XG5cbiAgICAgICAgICAgIGlmICgga2VlcEFycmF5SW5kZXggfHwgaXNBcnJheSh2YWx1ZSkgfHwgaXNPYmplY3QodmFsdWUpICkge1xuICAgICAgICAgICAgICAgIHN1YktleSA9IGtleSArICdbJyArIGluZGV4ICsgJ10nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdWJLZXkgPSBrZXkgKyAnW10nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbmNvZGVLZXkoc3ViS2V5LCB2YWx1ZSwga2V5VmFsdWVBcnJheSwga2VlcEFycmF5SW5kZXgpO1xuXG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAga2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSk7XG4gICAgICAgIC8vIGlmIGRhdGEgaXMgbnVsbCwgbm8gYD1gIGlzIGFwcGVuZGVkXG4gICAgICAgIGlmIChkYXRhID09PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGtleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIGRhdGEgaXMgdW5kZWZpbmVkLCB0cmVhdCBpdCBhcyBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gJyc7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCBkYXRhIGlzIHN0cmluZ1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsdWUgPSBrZXkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQoZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXlWYWx1ZUFycmF5LnB1c2godmFsdWUpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlbmNvZGU7XG4iLCJ2YXIgZW5jb2RlID0gcmVxdWlyZSgyKTtcbnZhciBkZWNvZGUgPSByZXF1aXJlKDEpO1xuXG5leHBvcnRzLmVuY29kZSA9IGVuY29kZTtcbmV4cG9ydHMuZGVjb2RlID0gZGVjb2RlO1xuZXhwb3J0cy52ZXJzaW9uID0gJzIuMC4wLWFscGhhLjEnO1xuIiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSB2YXJpYWJsZSBpcyBhbiBhcnJheVxuICpcbiAqIEBwYXJhbSB7YW55fSBpdCBUaGUgdmFyaWFibGUgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhbiBhcnJheVxuICovXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiAnW29iamVjdCBBcnJheV0nID09PSB0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgdmFyaWFibGUgaXMgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIHthbnl9IGl0IFRoZSB2YXJpYWJsZSB0byBjaGVja1xuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGl0IGlzIGFuIG9iamVjdFxuICovXG52YXIgaXNPYmplY3QgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gJ1tvYmplY3QgT2JqZWN0XScgPT09IHRvU3RyaW5nLmNhbGwoaXQpO1xufTtcblxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcbiJdfQ==
