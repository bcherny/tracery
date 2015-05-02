(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.traceryDiff = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var is = require('./is')

function diff(Interface, doc) {

  var d = {}
  var same = true

  for (var prop in Interface) {
    var actual = doc[prop]
    var expected = Interface[prop]

    var test = is(actual)
    if (!test) {
      // it's an object, recurse
      var dd = diff(expected, actual)
      if (dd) {
        d[prop] = dd
      }
    } else if (!is(expected)(actual)) {
      same = false
      d[prop] = {actual: toString(actual), expected: toString(expected), actualValue: actual}
    }
  }

  return same ? false : d

}

function toString(type) {
  var t = typeof type;

  // builtin functions and custom pattern predicates
  if (t === 'function') {
    return type.name || 'Custom Function'
  }

  // value types
  if (t !== 'object') return t[0].toUpperCase() + t.substring(1)

  // typed arrays
  if (Array.isArray(type)) {
    var t0 = toString(type[0])
    if (type.every(function(ele) { return toString(ele) === t0 })) {
      return 'Array<' + t0 + '>'
    } else {
      return 'Array'
    }

  }

  // otherwise
  return Object.prototype.toString(type).replace(/[\[\]]/g,'')
}

module.exports = diff
},{"./is":2}],2:[function(require,module,exports){
(function (global){
var connective = require('connective')
var K = require('ski/k')



function all(predicate) {
  return function (arr) {
    return arr.every(predicate)
  }
}

is.TypeOf = function (type) {
  type = type.toLowerCase()
  return function (subject) {
    return typeof subject === type
  }
}

is.ObjectOf = function (constructorName) {
  var signature = '[object ' + constructorName + ']'
  return function (subject) {
    return Object.prototype.toString.call(subject) === signature;
  }
}

is.RegExMatch = function (regex) {
  return function (str) {
    return is.String(str) && regex.test(str)
  }
}

is.Null = function(x) { return x === null }
is.Number = connective.and(is.TypeOf('number'), connective.not(Number.isNaN))

var types = [
  'Function',
  'Boolean',
  'Object',
  'Undefined',
  'String'
]
types.forEach(function (type) {
  is[type] = is.TypeOf(type)
})

var builtins = [
  'Date',
  'RegExp',
  'DataView',
  'ArrayBuffer',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint16Array',
  'Uint32Array'
]
builtins.forEach(function(cons) {
  is[cons] = is.ObjectOf(cons)
})

function is (predicate) {
  if (predicate === Function) return is.Function
  if (predicate === Boolean) return is.Boolean
  if (predicate === Object) return is.Object
  if (predicate === Number) return is.Number
  if (predicate === String) return is.String
  if (predicate === Array) return Array.isArray

  if (predicate && predicate.name && predicate.name in global) return is[predicate.name]

  if (predicate instanceof RegExp) return is.RegExMatch(predicate)
  if (is.Function(predicate)) return predicate
  if (is.Null(predicate)) return K(false)
  if (Array.isArray(predicate)) return all(is(predicate[0]))

  // object literal, fallback to tracery
  if (is.Object(predicate)) return false;

  return K(false)
}


module.exports = is
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"connective":3,"ski/k":4}],3:[function(require,module,exports){
var each = Array.prototype.forEach
var every = Array.prototype.every
var some = Array.prototype.some

function or () {
  var terms = arguments
  return function () {
    var ctx = this;
    var args = arguments;
    return some.call(terms, function (term) {
      return !!term.apply(ctx, args)
    })
  }
}

function and () {
  var terms = arguments
  return function () {
    var ctx = this;
    var args = arguments;
    return every.call(terms, function (term) {
      return !!term.apply(ctx, args)
    })
  }
}

function not (term) {
  return function () {
    return !term.apply(this, arguments)
  }
}

module.exports.or = or
module.exports.and = and
module.exports.not = not
},{}],4:[function(require,module,exports){
module.exports = function K(x) {
  return function () {
    return x
  }
}
},{}]},{},[1])(1)
});