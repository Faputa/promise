const Promise = require('./index')

Promise.reject(100).catch(r => console.log(r))
// 未捕获异常
Promise.reject(200)
