(function (global) {
  'use strict';

  const PENDING = 'pending'
  const FULFILLED = 'fulfilled'
  const REJECTED = 'rejected'

  global.queueMicrotask = global.queueMicrotask || global.setImmediate

  function Promise(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    function resolve(value) {
      queueMicrotask(function () {
        this.status = FULFILLED
        this.value = value
        this.onFulfilledCallbacks.forEach(function (callback) { callback() })
      }.bind(this))
    }

    function reject(reason) {
      queueMicrotask(function () {
        this.status = REJECTED
        this.reason = reason
        if (this.onRejectedCallbacks.length === 0) { throw reason }
        this.onRejectedCallbacks.forEach(function (callback) { callback() })
      }.bind(this))
    }

    queueMicrotask(function () {
      try {
        executor(resolve.bind(this), reject.bind(this))
      } catch (e) {
        reject(e)
      }
    }.bind(this))
  }

  Promise.prototype.then = function (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function (x) { return x }
    onRejected = typeof onRejected === 'function' ? onRejected : function (e) { throw e }
    if (this.status === FULFILLED) {
      return new Promise(function (resolve, reject) {
        try {
          let x = onFulfilled(this.value)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (e) {
          reject(e)
        }
      }.bind(this))
    }
    if (this.status === REJECTED) {
      return new Promise(function (resolve, reject) {
        try {
          let x = onRejected(this.reason)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (e) {
          reject(e)
        }
      }.bind(this))
    }
    if (this.status === PENDING) {
      return new Promise(function (resolve, reject) {
        this.onFulfilledCallbacks.push(function () {
          try {
            let x = onFulfilled(this.value)
            if (x instanceof Promise) {
              x.then(resolve, reject)
            } else {
              resolve(x)
            }
          } catch (e) {
            reject(e)
          }
        }.bind(this))
        this.onRejectedCallbacks.push(function () {
          try {
            let x = onRejected(this.reason)
            if (x instanceof Promise) {
              x.then(resolve, reject)
            } else {
              resolve(x)
            }
          } catch (e) {
            reject(e)
          }
        }.bind(this))
      }.bind(this))
    }
  }

  Promise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected)
  }

  Promise.resolve = function (value) {
    return value instanceof Promise ? value : new Promise(function (resolve, _) { return resolve(value) })
  }

  Promise.reject = function (reason) {
    return new Promise(function (_, reject) { return reject(reason) })
  }

  Promise.all = function (iterable) {
    return new Promise(function (resolve, reject) {
      let values = []
      let count = 0
      iterable.forEach(function (p, i) {
        p.then(function (value) {
          values[i] = value
          if (++count === iterable.length) {
            resolve(values)
          }
        }).catch(function (reason) {
          reject(reason)
        })
      })
    })
  }

  if (typeof define === "function" && define.amd) {
    define(function () {
      return Promise;
    });
  } else if (typeof exports === "object") {
    module.exports = Promise;
  } else {
    global.Promise = Promise;
  }
})(this);
