const Promise = require('./index')

Promise.all([
  new Promise(function (resolve) { setTimeout(function () { resolve(100) }, 1001) }),
  new Promise(function (resolve) { setTimeout(function () { resolve(200) }, 1002) }),
  new Promise(function (resolve) { setTimeout(function () { resolve(300) }, 1003) })
]).then(function (values) {
  console.log(values)
})
