import Promise from './index.js'

new Promise(resolve => setTimeout(() => resolve(100), 1000))
  .then(value => console.log(value))
  .catch(reason => console.log(reason))

