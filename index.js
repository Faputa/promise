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

  const resolve = value => {
    this.status = FULFILLED
    this.value = value
    this.onFulfilledCallbacks.forEach(callback => callback())
  }

  const reject = reason => {
    this.status = REJECTED
    this.reason = reason
    this.onRejectedCallbacks.forEach(callback => callback())
    // 如果失败之后没有设置失败回调则打印错误信息
    // 放到setTimeout中执行是为了让Promise在立即失败之后和立即设置失败回调之前不会打印错误信息
    setTimeout(() => {
      if (this.onRejectedCallbacks.length === 0) {
        console.error(reason)
      }
    })
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : x => x
  onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
  if (this.status === FULFILLED) {
    return new Promise((resolve, reject) => {
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
    })
  }
  if (this.status === REJECTED) {
    // 标记存在失败回调
    // 如果在Promise立即失败后立即设置失败回调将不会打印错误信息
    this.onRejectedCallbacks.length === 0 && this.onRejectedCallbacks.push(() => { })
    return new Promise((resolve, reject) => {
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
    })
  }
  if (this.status === PENDING) {
    return new Promise((resolve, reject) => {
      this.onFulfilledCallbacks.push(() => {
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
      })
      this.onRejectedCallbacks.push(() => {
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
      })
    })
  }
}

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

Promise.resolve = function (value) {
  return value instanceof Promise ? value : new Promise((resolve, _) => resolve(value))
}

Promise.reject = function (reason) {
  return new Promise((_, reject) => reject(reason))
}

export default Promise;
