let express = require('express');
let router = express.Router();
let redis = require('../database/redis');
let rp = require('request-promise').defaults({ json: true });
let statusCode = require('../configs/statusCode');
let appConfig = require('../configs/app');
var app = express();
require('dotenv').config();

const logger = require('../configs/logger');
const errorLogger = logger.errorLogger;
const commonLogger = logger.commonLogger;

const isyncController = require('./ISync');

const axios = require('axios');

var custodyToken = {},
    userToken = [],
    OrderCancelled = [];

function initUserToken(_userToken) {
    userToken = _userToken;
}

function initCustodyToken(_custodyToken) {
    custodyToken = _custodyToken;
}

function initOrderCancelled(_orderPartMatchCancelled) {
    OrderCancelled = _orderPartMatchCancelled;
}

// So du tien
router.get('/:accountId/balances', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/balances'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetBalances] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }

});

// So du chung khoan
router.get('/:accountId/state', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetState] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// So du ngan hang
router.get('/:accountId/bankBalance', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/bankBalance'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetBankBalance] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// So lenh
router.get('/:accountId/orders', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/orders'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetOrders] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Dat lenh
router.post('/:accountId/orders', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
                'client-ip' : appConfig.getClient_Ip(req)
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/orders?requestId=' + req.query.requestId,
            body: {
                instrument: req.body.instrument,
                qty: req.body.qty,
                side: req.body.side,
                type: req.body.type,
                limitPrice: req.body.limitPrice,
                stopPrice: req.body.stopPrice,
                durationType: req.body.durationType,
                durationDateTime: req.body.durationDateTime,
                stopLoss: req.body.stopLoss,
                takeProfit: req.body.takeProfit,
                digitalSignature: req.body.digitalSignature
            },
            json: true
        }).then(data => {
            res.send(data);
            if (data.s === 'ok') {
                commonLogger.info('[PlaceOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    orderId: data.d.orderid,
                    instrument: req.body.instrument,
                    qty: req.body.qty,
                    side: req.body.side,
                    type: req.body.type,
                    limitPrice: req.body.limitPrice,
                    stopPrice: req.body.stopPrice,
                    stopLoss: req.body.stopLoss,
                    takeProfit: req.body.takeProfit
                }) + ' by ' + appConfig.getClientIp(req, userToken));
                WriteLogPlaceOrder(req.header('UserId'), 'Create', req.header('Custody'), req.body.instrument, req.body.qty, req.body.side,
                    req.body.type, req.body.limitPrice, req.params.accountId);
                logger.syncStockEx(req.body.instrument, req.body.side, req.body.limitPrice);
            } else {
                errorLogger.info('[PlaceOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    errmsg: data
                }) + ' by ' + appConfig.getClientIp(req, userToken));
            }
        }).catch(err => {
            errorLogger.info('[PlaceOrder] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// So lenh lich su
router.get('/:accountId/ordersHistory', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/ordersHistory?maxCount=' + req.query.maxCount
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetOrderHistory] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Thong tin lenh
router.get('/:accountId/orders/:orderId', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/orders/' + req.params.orderId
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetOrderInfo] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Sua lenh
router.put('/:accountId/orders/:orderId', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'PUT',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/orders/' + req.params.orderId,
            body: {
                qty: req.body.qty,
                limitPrice: req.body.limitPrice,
                stopPrice: req.body.stopPrice,
                digitalSignature: req.body.digitalSignature
            },
            json: true
        }).then(data => {
            res.send(data);
            if (data.s === 'ok') {
                commonLogger.info('[ModifyOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    orderId: req.params.orderId,
                    qty: req.body.qty,
                    limitPrice: req.body.limitPrice,
                    stopPrice: req.body.stopPrice
                }) + ' by ' + appConfig.getClientIp(req, userToken));
                WriteLogEditOrder(req.header('UserId'), 'Edit', req.header('Custody'), req.body.qty, req.body.limitPrice, req.params.orderId, req.params.accountId)
            } else {
                errorLogger.info('[ModifyOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    errmsg: data
                }) + ' by ' + appConfig.getClientIp(req, userToken));
            }
        }).catch(err => {
            errorLogger.info('[ModifyOrder] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Huy lenh
router.delete('/:accountId/orders/:orderId', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/orders/' + req.params.orderId
        }).then(data => {
            res.send(data);
            if (data.s === 'ok') {
                OrderCancelled.push(req.params.orderId);
                redis.client.set('SyncTrading:OrderCancelled', JSON.stringify(OrderCancelled));
                commonLogger.info('[CancelOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    orderId: req.params.orderId
                }) + ' by ' + appConfig.getClientIp(req, userToken));
                WriteLogCancelOrder(req.header('UserId'), 'Delete', req.params.orderId, req.params.accountId, req.header('Custody'))
            } else {
                errorLogger.info('[CancelOrder] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    errmsg: data
                }) + ' by ' + appConfig.getClientIp(req, userToken));
            }
        }).catch(err => {
            errorLogger.info('[CancelOrder] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Vi the mo
router.get('/:accountId/positions', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/positions'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetPostions] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Chi tiet vi the
router.get('/:accountId/positions/:positionId', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/positions/' + req.params.positionId
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetPositionInfo] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Sua gia chot loi, cat lo vi the mo
router.put('/:accountId/positions/:positionId', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'PUT',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/positions/' + req.params.positionId,
            body: {
                stopLoss: req.body.stopLoss,
                takeProfit: req.body.takeProfit
            },
            json: true
        }).then(data => {
            res.send(data);
            if (data.s === 'ok') {
                commonLogger.info('[ModifyPosition] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    positionId: req.params.positionId,
                    stopLoss: req.body.stopLoss,
                    takeProfit: req.body.takeProfit
                }) + ' by ' + appConfig.getClientIp(req, userToken));
            }
        }).catch(err => {
            errorLogger.info('[ModifyPosition] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Dong vi the
router.delete('/:accountId/positions/:positionId', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/positions/' + req.params.positionId
        }).then(data => {
            res.send(data);
            if (data.s === 'ok') {
                commonLogger.info('[ClosePosition] ' + JSON.stringify({
                    custody: req.header('Custody'),
                    subAccount: req.params.accountId,
                    positionId: req.params.positionId
                }) + ' by ' + appConfig.getClientIp(req, userToken));
            }
        }).catch(err => {
            errorLogger.info('[ClosePosition] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Danh sach lenh khop theo ma
router.get('/:accountId/executions', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/executions?instrument=' + req.query.instrument + '&maxCount=' + req.query.maxCount
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetExecutions] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Danh sach ma duoc phep giao dich
router.get('/:accountId/instruments', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/instruments'
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetInstruments] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Danh sach orderId da huy
router.get('/ordersCancelled', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        res.send({ s: 'ok', d: OrderCancelled });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Suc Mua cua tieu khoan
router.post('/:accountId/GetAccountSummary', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/BPS/GetAccountSummary',
            form: {
                custid: req.params.accountId,
                symbol: req.body.symbol,
                price: req.body.price
            }
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetAccountSummary] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Tong hop tai khoan
router.post('/:accountId/GetAccountSummaryFull', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'POST',
            // url: process.env.API_SERVER + '/BPS/GetAccountSummaryFull',
            url: process.env.API_UAT_SERVER + '/BPS/GetAccountSummaryFull',

            form: {
                custid: req.params.accountId,
                custodycd: req.body.custody,
            }
        }).then(data => {
            res.send(data);
        }).catch(err => {
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Thang du cua tieu khoan
router.get('/:accountId/GetPP0', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/BPS/GetPP0',
            form: {
                custid: req.params.accountId,
                custodycd: req.header('Custody')
            }
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetPP0] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Get rate
router.get('/getRate', async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/MarketData/GetMarketData?symbol=' + req.query.symbol + '&grname=' + req.query.custody,
        }).then(data => {
            if (data.s === 'ok') {
                res.send(data);
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[GetMarketData]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

// Thong tin gia chung khoan
router.get('/quotes1', appConfig.sessionChecker, async (req, res) => {
    if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
            },
            url: process.env.TRADING_SERVER + '/quotes?symbols=' + req.query.symbols
        }).then(data => {
            res.send(data);
        }).catch(err => {
            errorLogger.info('[GetQuotes] ' + JSON.stringify({
                custody: req.header('Custody'),
                subAccount: req.params.accountId,
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, userToken));
            res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

function WriteLogPlaceOrder(userid, action, custody, instrument, qty, side, type, limitprice, accountId) {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/WriteLogPlaceOrder',
        form: {
            userid: userid,
            action: action,
            custody: custody,
            instrument: instrument,
            qty: qty,
            side: side,
            type: type,
            limitprice: limitprice,
            accountId: accountId
        }
    }).then(data => {
        if (data.s === 'ok') { } else { }
    }).catch(err => {
        errorLogger.info(err.message);
    });
}

function WriteLogEditOrder(userid, action, custody, qty, limitprice, orderid, accountId) {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/WriteLogEditOrder',
        form: {
            userid: userid,
            action: action,
            custody: custody,
            qty: qty,
            limitPrice: limitprice,
            orderid: orderid,
            accountId: accountId
        }
    }).then(data => {
        if (data.s === 'ok') { } else { }
    }).catch(err => {
        errorLogger.info(err.message);
    });
}

function WriteLogCancelOrder(userId, action, orderid, accountId, custody) {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/WriteLogCancelOrder',
        form: {
            userId: userId,
            action: action,
            orderid: orderid,
            accountId: accountId,
            custody: custody
        }
    }).then(data => {
        if (data.s === 'ok') { } else { }
    }).catch(err => {
        errorLogger.info(err.message);
    });
}

router.get('/:accountId/state1', appConfig.sessionChecker, async (req, res) => {
    // console.log(715, custodyToken)
    var url = process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state'
    custodyToken
    var token = '';
    if (custodyToken !== []) {
        token = custodyToken[req.headers.userid].find(t => t.custody === req.headers.custody).token
    }
    // isyncController.testAxios
    // isyncController.testAxios()
    var headers = {
        'Authorization': "Bearer " + token,
        // 'Content-Type': 'application/json; charset=utf-8'
    }
    // axios.get(process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state', {
    //         headers: headers
    //     }).then(response => {
    //         console.log(1037, response.data)
    //         res.send(response.data)
    //     }).catch(err => {
    //         console.log(1040, err)
    //         res.send(err);
    //     })
    // isyncController.testAxios
    axios({
        method: 'GET',
        headers: headers,
        url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state',
    }).then(function (response) {
        // console.log(1037, response)
        res.send(response)
    }).catch(function (err) {
        // console.log(1040, err.response.data)
        res.send(err.response.data);
    })

});

module.exports = {
    router,
    initUserToken,
    initCustodyToken,
    initOrderCancelled
};