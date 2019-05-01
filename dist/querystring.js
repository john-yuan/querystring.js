(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.QS = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var util = require('./util');
var isArray = util.isArray;

/**
 * Decode the URI Component encoded query string to object
 *
 * @param {string} The URI Component encoded query string
 * @returns {Object.<string, string>} Returns the decoded object
 */
var decode = function (string) {
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
};

/**
 * Decode the specefied key
 *
 * @param {Object.<string, string>} object The object to hold the decoded data
 * @param {Object.<string, *>} cache The object to hold cache data
 * @param {string} key The key name to decode
 * @param {any} value The value to decode
 */
var decodeKey = function (object, cache, key, value) {
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
};

exports.decode = decode;

},{"./util":4}],2:[function(require,module,exports){
var util = require('./util');
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
var encode = function (object, keepArrayIndex) {
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
};


/**
 * Encode the speceifed key in the object
 *
 * @param {string} key The key name
 * @param {any} data The data of the key
 * @param {string[]} keyValueArray The array to store the key value string
 * @param {boolean} keepArrayIndex Whether to keep array index
 */
var encodeKey = function (key, data, keyValueArray, keepArrayIndex) {
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
};

exports.encode = encode;

},{"./util":4}],3:[function(require,module,exports){
var encode = require('./encode').encode;
var decode = require('./decode').decode;

exports.encode = encode;
exports.decode = decode;

},{"./decode":1,"./encode":2}],4:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi9kZWNvZGUuanMiLCJsaWIvZW5jb2RlLmpzIiwibGliL3F1ZXJ5c3RyaW5nLmpzIiwibGliL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIGlzQXJyYXkgPSB1dGlsLmlzQXJyYXk7XG5cbi8qKlxuICogRGVjb2RlIHRoZSBVUkkgQ29tcG9uZW50IGVuY29kZWQgcXVlcnkgc3RyaW5nIHRvIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBUaGUgVVJJIENvbXBvbmVudCBlbmNvZGVkIHF1ZXJ5IHN0cmluZ1xuICogQHJldHVybnMge09iamVjdC48c3RyaW5nLCBzdHJpbmc+fSBSZXR1cm5zIHRoZSBkZWNvZGVkIG9iamVjdFxuICovXG52YXIgZGVjb2RlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgIHZhciBvYmplY3QgPSB7fTtcbiAgICB2YXIgY2FjaGUgPSB7fTtcbiAgICB2YXIga2V5VmFsdWVBcnJheTtcbiAgICB2YXIgaW5kZXg7XG4gICAgdmFyIGxlbmd0aDtcbiAgICB2YXIga2V5VmFsdWU7XG4gICAgdmFyIGtleTtcbiAgICB2YXIgdmFsdWU7XG5cbiAgICAvLyBkbyBub3QgZGVjb2RlIGVtcHR5IHN0cmluZyBvciBzb21ldGhpbmcgdGhhdCBpcyBub3Qgc3RyaW5nXG4gICAgaWYgKHN0cmluZyAmJiB0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJykge1xuICAgICAgICBrZXlWYWx1ZUFycmF5ID0gc3RyaW5nLnNwbGl0KCcmJyk7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgbGVuZ3RoID0ga2V5VmFsdWVBcnJheS5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBrZXlWYWx1ZSA9IGtleVZhbHVlQXJyYXlbaW5kZXhdLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsdWVbMF0pO1xuICAgICAgICAgICAgdmFsdWUgPSBrZXlWYWx1ZVsxXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVjb2RlS2V5KG9iamVjdCwgY2FjaGUsIGtleSwgdmFsdWUpO1xuXG4gICAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbn07XG5cbi8qKlxuICogRGVjb2RlIHRoZSBzcGVjZWZpZWQga2V5XG4gKlxuICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgc3RyaW5nPn0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaG9sZCB0aGUgZGVjb2RlZCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCAqPn0gY2FjaGUgVGhlIG9iamVjdCB0byBob2xkIGNhY2hlIGRhdGFcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBuYW1lIHRvIGRlY29kZVxuICogQHBhcmFtIHthbnl9IHZhbHVlIFRoZSB2YWx1ZSB0byBkZWNvZGVcbiAqL1xudmFyIGRlY29kZUtleSA9IGZ1bmN0aW9uIChvYmplY3QsIGNhY2hlLCBrZXksIHZhbHVlKSB7XG4gICAgdmFyIHJCcmFja2V0ID0gL1xcWyhbXlxcW10qPyk/XFxdJC87XG4gICAgdmFyIHJJbmRleCA9IC8oXjAkKXwoXlsxLTldXFxkKiQpLztcbiAgICB2YXIgaW5kZXhPcktleU9yRW1wdHk7XG4gICAgdmFyIHBhcmVudEtleTtcbiAgICB2YXIgYXJyYXlPck9iamVjdDtcbiAgICB2YXIga2V5SXNJbmRleDtcbiAgICB2YXIga2V5SXNFbXB0eTtcbiAgICB2YXIgdmFsdWVJc0luQXJyYXk7XG4gICAgdmFyIGRhdGFBcnJheTtcbiAgICB2YXIgbGVuZ3RoO1xuXG4gICAgLy8gY2hlY2sgd2V0aGVyIGtleSBpcyBzb21ldGhpbmcgbGlrZSBgcGVyc29uW25hbWVdYCBvciBgY29sb3JzW11gIG9yXG4gICAgLy8gYGNvbG9yc1sxXWBcbiAgICBpZiAoIHJCcmFja2V0LnRlc3Qoa2V5KSApIHtcbiAgICAgICAgaW5kZXhPcktleU9yRW1wdHkgPSBSZWdFeHAuJDE7XG4gICAgICAgIHBhcmVudEtleSA9IGtleS5yZXBsYWNlKHJCcmFja2V0LCAnJyk7XG4gICAgICAgIGFycmF5T3JPYmplY3QgPSBjYWNoZVtwYXJlbnRLZXldO1xuXG4gICAgICAgIGtleUlzSW5kZXggPSBySW5kZXgudGVzdChpbmRleE9yS2V5T3JFbXB0eSk7XG4gICAgICAgIGtleUlzRW1wdHkgPSBpbmRleE9yS2V5T3JFbXB0eSA9PT0gJyc7XG4gICAgICAgIHZhbHVlSXNJbkFycmF5ID0ga2V5SXNJbmRleCB8fCBrZXlJc0VtcHR5O1xuXG4gICAgICAgIGlmIChhcnJheU9yT2JqZWN0KSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRoZSBhcnJheSB0byBvYmplY3RcbiAgICAgICAgICAgIGlmICggKCEgdmFsdWVJc0luQXJyYXkpICYmIGlzQXJyYXkoYXJyYXlPck9iamVjdCkgKSB7XG4gICAgICAgICAgICAgICAgZGF0YUFycmF5ID0gYXJyYXlPck9iamVjdDtcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBkYXRhQXJyYXkubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGFycmF5T3JPYmplY3QgPSB7fTtcblxuICAgICAgICAgICAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyYXlPck9iamVjdFtsZW5ndGhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T3JPYmplY3RbbGVuZ3RoXSA9IGRhdGFBcnJheVtsZW5ndGhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJyYXlPck9iamVjdCA9IHZhbHVlSXNJbkFycmF5ID8gW10gOiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgga2V5SXNFbXB0eSAmJiBpc0FycmF5KGFycmF5T3JPYmplY3QpICkge1xuICAgICAgICAgICAgYXJyYXlPck9iamVjdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFycmF5T3JPYmplY3QgaXMgYXJyYXkgb3Igb2JqZWN0IGhlcmVcbiAgICAgICAgICAgIGFycmF5T3JPYmplY3RbaW5kZXhPcktleU9yRW1wdHldID0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBjYWNoZVtwYXJlbnRLZXldID0gYXJyYXlPck9iamVjdDtcblxuICAgICAgICBkZWNvZGVLZXkob2JqZWN0LCBjYWNoZSwgcGFyZW50S2V5LCBhcnJheU9yT2JqZWN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuZGVjb2RlID0gZGVjb2RlO1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBpc0FycmF5ID0gdXRpbC5pc0FycmF5O1xudmFyIGlzT2JqZWN0ID0gdXRpbC5pc09iamVjdDtcbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEVuY29kZSB0aGUgZ2l2ZW4gb2JqZWN0IHRvIFVSSSBDb21wb25lbnQgZW5jb2RlZCBxdWVyeSBzdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCAqPn0gb2JqZWN0IFRoZSBvYmplY3QgdG8gZW5jb2RlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtrZWVwQXJyYXlJbmRleF0gV2V0aGVyIHRvIGtlZXAgYXJyYXkgaW5kZXhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIFVSSSBDb21wb25lbnQgZW5jb2RlZCBxdWVyeSBzdHJpbmdcbiAqL1xudmFyIGVuY29kZSA9IGZ1bmN0aW9uIChvYmplY3QsIGtlZXBBcnJheUluZGV4KSB7XG4gICAgdmFyIGtleTtcbiAgICB2YXIga2V5VmFsdWVBcnJheSA9IFtdO1xuXG4gICAga2VlcEFycmF5SW5kZXggPSAhIWtlZXBBcnJheUluZGV4O1xuXG4gICAgaWYgKCBpc09iamVjdChvYmplY3QpICkge1xuICAgICAgICBmb3IgKCBrZXkgaW4gb2JqZWN0ICkge1xuICAgICAgICAgICAgaWYgKCBoYXNPd24uY2FsbChvYmplY3QsIGtleSkgKSB7XG4gICAgICAgICAgICAgICAgZW5jb2RlS2V5KGtleSwgb2JqZWN0W2tleV0sIGtleVZhbHVlQXJyYXksIGtlZXBBcnJheUluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBrZXlWYWx1ZUFycmF5LmpvaW4oJyYnKTtcbn07XG5cblxuLyoqXG4gKiBFbmNvZGUgdGhlIHNwZWNlaWZlZCBrZXkgaW4gdGhlIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBuYW1lXG4gKiBAcGFyYW0ge2FueX0gZGF0YSBUaGUgZGF0YSBvZiB0aGUga2V5XG4gKiBAcGFyYW0ge3N0cmluZ1tdfSBrZXlWYWx1ZUFycmF5IFRoZSBhcnJheSB0byBzdG9yZSB0aGUga2V5IHZhbHVlIHN0cmluZ1xuICogQHBhcmFtIHtib29sZWFufSBrZWVwQXJyYXlJbmRleCBXZXRoZXIgdG8ga2VlcCBhcnJheSBpbmRleFxuICovXG52YXIgZW5jb2RlS2V5ID0gZnVuY3Rpb24gKGtleSwgZGF0YSwga2V5VmFsdWVBcnJheSwga2VlcEFycmF5SW5kZXgpIHtcbiAgICB2YXIgcHJvcDtcbiAgICB2YXIgaW5kZXg7XG4gICAgdmFyIGxlbmd0aDtcbiAgICB2YXIgdmFsdWU7XG4gICAgdmFyIHN1YktleTtcblxuICAgIGlmICggaXNPYmplY3QoZGF0YSkgKSB7XG4gICAgICAgIGZvciAoIHByb3AgaW4gZGF0YSApIHtcbiAgICAgICAgICAgIGlmICggaGFzT3duLmNhbGwoZGF0YSwgcHJvcCkgKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBkYXRhW3Byb3BdO1xuICAgICAgICAgICAgICAgIHN1YktleSA9IGtleSArICdbJyArIHByb3AgKyAnXSc7XG4gICAgICAgICAgICAgICAgZW5jb2RlS2V5KHN1YktleSwgdmFsdWUsIGtleVZhbHVlQXJyYXksIGtlZXBBcnJheUluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIGlzQXJyYXkoZGF0YSkgKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGRhdGFbaW5kZXhdO1xuXG4gICAgICAgICAgICBpZiAoIGtlZXBBcnJheUluZGV4IHx8IGlzQXJyYXkodmFsdWUpIHx8IGlzT2JqZWN0KHZhbHVlKSApIHtcbiAgICAgICAgICAgICAgICBzdWJLZXkgPSBrZXkgKyAnWycgKyBpbmRleCArICddJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3ViS2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZW5jb2RlS2V5KHN1YktleSwgdmFsdWUsIGtleVZhbHVlQXJyYXksIGtlZXBBcnJheUluZGV4KTtcblxuICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpO1xuICAgICAgICAvLyBpZiBkYXRhIGlzIG51bGwsIG5vIGA9YCBpcyBhcHBlbmRlZFxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWUgPSBrZXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiBkYXRhIGlzIHVuZGVmaW5lZCwgdHJlYXQgaXQgYXMgZW1wdHkgc3RyaW5nXG4gICAgICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9ICcnO1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgZGF0YSBpcyBzdHJpbmdcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0ga2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAga2V5VmFsdWVBcnJheS5wdXNoKHZhbHVlKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLmVuY29kZSA9IGVuY29kZTtcbiIsInZhciBlbmNvZGUgPSByZXF1aXJlKCcuL2VuY29kZScpLmVuY29kZTtcbnZhciBkZWNvZGUgPSByZXF1aXJlKCcuL2RlY29kZScpLmRlY29kZTtcblxuZXhwb3J0cy5lbmNvZGUgPSBlbmNvZGU7XG5leHBvcnRzLmRlY29kZSA9IGRlY29kZTtcbiIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2sgd2V0aGVyIHRoZSB2YXJpYWJsZSBpcyBhbiBhcnJheVxuICpcbiAqIEBwYXJhbSB7YW55fSBpdCBUaGUgdmFyaWFibGUgdG8gY2hlY2tcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhbiBhcnJheVxuICovXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiAnW29iamVjdCBBcnJheV0nID09PSB0b1N0cmluZy5jYWxsKGl0KTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2V0aGVyIHRoZSB2YXJpYWJsZSBpcyBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge2FueX0gaXQgVGhlIHZhcmlhYmxlIHRvIGNoZWNrXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgYW4gb2JqZWN0XG4gKi9cbnZhciBpc09iamVjdCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiAnW29iamVjdCBPYmplY3RdJyA9PT0gdG9TdHJpbmcuY2FsbChpdCk7XG59O1xuXG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuIl19
