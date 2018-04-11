/**
 * Created by Ninghai on 2018/4/11.
 */
const http = require('http')
module.exports = url => new Promise(resolve => http.get(url, res => res.on('data', chunk => resolve(chunk.toString().split(',')[2]))))