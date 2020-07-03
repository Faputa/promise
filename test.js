const Promise = require(".")

new Promise(resolve => setTimeout(() => resolve(100), 1000))
  .then(value => undefinedNameError)
  .catch(reason => console.log(reason))