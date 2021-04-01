import Promise from './index.js'

const p = new Promise(resolve => setTimeout(() => resolve(100), 1000))
p.then(value => console.log(value))
p.then(value => console.log(value))
