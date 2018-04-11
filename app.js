/**
 * Created by Ninghai on 2018/4/11.
 */
/**
 * Created by Ninghai on 2018/4/11.
 */
const fs = require('fs')
const client = require('mongodb').MongoClient
const async = require('async')
const mongoUrl = 'mongodb://localhost:27017'
const queryStockCodeUrl = 'http://suggest3.sinajs.cn/suggest/type=&key='  // 股票名称
const queryMoneyUrl = 'http://money.finance.sina.com.cn/corp/go.php/vFD_ProfitStatement/stockid/'
const years = ['2015', '2016', '2017']

const stocksJson =fs.readFileSync('stock.json')
const stocks = eval('('+ stocksJson +')')

const getStockId  = require('./getStockId')
const getReport = require('./getReport')

var queryStockIdUrls= []
var result
var collection
var db

function saveToMongo(data) {
    client.connect(mongoUrl, (err, res) => {
        if (err) {
            console.log(err)
            return false
        } else {
            db = res.db('finance_sina')
            collection = db.collection('quarterReport')
            collection.insertMany(data, (err, success) => {
                if (err) {
                    console.log(data)
                }
            })
        }
    })
}


// {name: '股票名称', id: '', stockId: '', url: ''}
stocks.forEach(item => item.url = queryStockCodeUrl + encodeURI(item.name) + '&name=suggestdata_1523415547830')

async.mapLimit(stocks, 5, async function (stock) {
    const stockId = await getStockId(stock.url)
    var reportUrls = []
    if (stockId) {
        years.forEach(year => reportUrls.push(queryMoneyUrl + stockId + '/ctrl/' + year + '/displaytype/4.phtml'))
        async.mapLimit(reportUrls, 5, async (reportUrl) => {
            result = await getReport(reportUrl, stock.id, stockId, stock.name)
            if(result.length > 0) saveToMongo(result)
        })
    }
})