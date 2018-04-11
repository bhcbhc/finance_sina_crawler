/**
 * Created by Ninghai on 2018/4/11.
 */
const cheerio = require('cheerio')
const http = require('http')
const iconv = require('iconv-lite')

var html
var $

module.exports = (url, id, stockId, name)=> new Promise((resolve, reject) => {
    var chunks = []
    var dates = []
    var incomes = []
    var revenues = []
    var result = []

    http.get(url, res => {
        res.on('data', chunk => chunks.push(chunk))
        res.on('end', () => {
            html = iconv.decode(Buffer.concat(chunks), 'gb2312') // 网页转码
            $ = cheerio.load(html, {decodeEntities: false})  // 转为JQuery实现

            Array.prototype.push.apply(dates, $('#ProfitStatementNewTable0 tbody tr:nth-child(1) td'))
            Array.prototype.push.apply(incomes, $('#ProfitStatementNewTable0 tbody tr:nth-child(3) td'))
            Array.prototype.push.apply(revenues, $('#ProfitStatementNewTable0 tbody tr:nth-child(4) td'))
            dates.shift(1)
            incomes.shift(1)
            revenues.shift(1)

            dates.forEach((item, index) => {
                var single = {
                    id: id,
                    stockId: stockId,
                    name: name
                }
                single.date = $(item).text()
                single.income = Number($(incomes[index]).text().replace(/,/g, ''))
                single.revenue = Number($(revenues[index]).text().replace(/,/g, ''))
                result.push(single)
            })
            if (result.length === 0) console.log(name)
            resolve(result)
        })
    })
})