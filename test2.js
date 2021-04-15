const Promise = require('./index')

const p = new Promise(function (resolve) { setTimeout(function () { resolve(100) }, 1000) })
p.then(function (value) { console.log(value) })
p.then(function (value) { console.log(value) })
