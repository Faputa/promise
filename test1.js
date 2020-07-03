const Promise = require(".")

new Promise(resolve => setTimeout(() => resolve(100), 1000))
  .then(value => console.log(value))
  .then(value => console.log(value))