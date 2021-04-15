const Promise = require('./index')

new Promise(function (resolve) { setTimeout(function () { resolve(100) }, 1000) })
  .then(function (value) { console.log(value) })
  .catch(function (reason) { console.log(reason) })
