(function (global) {
  'use strict';

  const PENDING = 'pending'
  const FULFILLED = 'fulfilled'
  const REJECTED = 'rejected'

  function Promise(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    function resolve(value) {
      this.status = FULFILLED
      this.value = value
      this.onFulfilledCallbacks.forEach(function (callback) { callback() })
    }

    function reject(reason) {
      this.status = REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach(function (callback) { callback() })

      // 如果失败之后没有设置失败回调则打印错误信息
      // 放到setTimeout中执行是为了让Promise在立即失败之后和立即设置失败回调之前不会打印错误信息
      setTimeout(function () {
        if (this.onRejectedCallbacks.length === 0) {
          console.error(reason)
        }
      }.bind(this))
    }

    try {
      executor(resolve.bind(this), reject.bind(this))
    } catch (e) {
      reject(e)
    }
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
      // 标记存在失败回调
      // 如果在Promise立即失败后立即设置失败回调将不会打印错误信息
      this.onRejectedCallbacks.length === 0 && this.onRejectedCallbacks.push(function () { })

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
          if (++count == iterable.length) {
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
