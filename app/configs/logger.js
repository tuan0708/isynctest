const winston = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment-timezone');
let rp = require('request-promise').defaults({ json: true });

const { combine, printf } = winston.format;
const myFormat = printf(info => `${info.timestamp} ${info.level}: ${info.message}`);

const appendTimestamp = winston.format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment().tz(opts.tz).format();
  return info;
});

// Common logger
var commonTransport = new (winston.transports.DailyRotateFile)({
  filename: '_LOG/common-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '100m',
  maxFiles: '14d'
});

var commonLogger = winston.createLogger({
  format: combine(
    appendTimestamp({ tz: 'Asia/Ho_Chi_Minh' }),
    myFormat
  ),
  transports: [
    commonTransport
  ]
});

// Error logger
var errTransport = new (winston.transports.DailyRotateFile)({
  filename: '_LOG/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '100m',
  maxFiles: '14d'
});

var errorLogger = winston.createLogger({
  format: combine(
    appendTimestamp({ tz: 'Asia/Ho_Chi_Minh' }),
    myFormat
  ),
  transports: [
    errTransport
  ]
});

var processTime = new Date(0, 0, 0).getTime();
var stockEx = [];
function syncStockEx(symbol = null, side = null, price = null) {
  var now = new Date(0, 0, 0).getTime();
  if (now > processTime) {
    stockEx = [];
    processTime = now;
  }
  if (symbol !== null && stockEx.findIndex(el => el.symbol === symbol && el.side === side && el.price === price) < 0) {
    var stockExObj = { symbol: symbol, side: side, price: price };
    stockEx.push(stockExObj);
  }
  return stockEx;
}

module.exports = {
  errorLogger,
  commonLogger,
  syncStockEx
};