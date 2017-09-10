import 'core-js-shim';
import 'zone';
import 'reflect';

if (!Array.prototype.reduce) {
    Array.prototype.reduce = function<T>(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T) :T {
      'use strict';
      if (this == null) {
        throw new TypeError('Array.prototype.reduce called on null or undefined');
      }
      if (typeof callbackfn !== 'function') {
        throw new TypeError(callbackfn + ' is not a function');
      }
      var t = Object(this), len = t.length >>> 0, k = 0, value;
      if (arguments.length == 2) {
        value = arguments[1];
      } else {
        while (k < len && !(k in t)) {
          k++; 
        }
        if (k >= len) {
          throw new TypeError('Reduce of empty array with no initial value');
        }
        value = t[k++];
      }
      for (; k < len; k++) {
        if (k in t) {
          value = callbackfn(value, t[k], k, t);
        }
      }
      return value;
    };
  }