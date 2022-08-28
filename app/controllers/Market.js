let express = require('express');
let router = express.Router();
let rp = require('request-promise').defaults({ json: true });
let statusCode = require('../configs/statusCode');
let appConfig = require('../configs/app');
require('dotenv').config();

const logger = require('../configs/logger');
const errorLogger = logger.errorLogger;

// Thong tin gia chung khoan
router.get('/quotes', appConfig.sessionChecker, async (req, res) => {
    rp({
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + req.cookies.app_session,
        },
        url: process.env.TRADING_SERVER + '/quotes?symbols=' + req.query.symbols
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({s: 'error', d: { statusCode: err.statusCode, message: err.message }});
    });
});

// Gia cho mua cho ban tot nhat
router.get('/depth', appConfig.sessionChecker, async (req, res) => {
    rp({
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + req.cookies.app_session,
        },
        url: process.env.TRADING_SERVER + '/depth?symbol=' + req.params.symbol
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({s: 'error', d: { statusCode: err.statusCode, message: err.message }});
    });
});

module.exports = router;