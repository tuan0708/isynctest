let express = require('express');
let router = express.Router();
let redis = require('../database/redis');
let appConfig = require('../configs/app');
let rp = require('request-promise').defaults({ json: true });
require('dotenv').config();

const logger = require('../configs/logger');
const errorLogger = logger.errorLogger;

router.post('/accounts/GetFavoriteSymbols', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/GetFavoriteSymbols',
        form: {
            userid: req.body.userId
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/accounts/AddFavoriteGroup', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/AddFavoriteGroup',
        form: {
            userid: req.body.userId,
            favgroupname: req.body.name
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/accounts/EditNameFavoriteGroup', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/EditNameFavoriteGroup',
        form: {
            newname: req.body.name,
            id: req.body.favorId
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/accounts/DeleteFavoriteGroup', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/DeleteFavoriteGroup',
        form: {
            id: req.body.favorId
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/accounts/AddSymbolToFavoriteGroup', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/AddSymbolToFavoriteGroup',
        form: {
            id: req.body.id,
            symbol: req.body.symbol
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/accounts/DeleteSymbolFromFavoriteGroup', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/accounts/DeleteSymbolFromFavoriteGroup',
        form: {
            id: req.body.id,
            symbol: req.body.symbol
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err.message);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.post('/News/GetEventsAndNewsBySymbol', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/News/GetEventsAndNewsBySymbol',
        form: {
            symbol: req.body.symbol
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

router.get('/market/lastPriceStock', async (req, res) => {
    redis.client.get("StockBoard:LastPriceStock", function (err, reply) {
        if (err) {
            errorLogger.info('read [LastPriceStock] error: ' + err);
            return;
        }
        if (reply !== null) {
            res.send({s: 'ok', d: Object.values(JSON.parse(reply))});
        }
        
    });
});

router.get('/market/stockex', async (req, res) => {
    res.send(logger.syncStockEx());
});

router.post('/accounts/GetVrimamtTInfo', async (req, res) => {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/BPS/GetVrimamtTInfo',
        form: {
            dmaacctno: req.body.dmaacctno,
            dtaacctno: req.body.dtaacctno,
            instrument: req.body.symbol,
            tlid: 6868
        }
    }).then(data => {
        res.send(data);
    }).catch(err => {
        errorLogger.info(err);
        res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    });
});

module.exports = router;