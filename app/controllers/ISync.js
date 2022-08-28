let express = require('express');
let router = express.Router();
let redis = require('../database/redis');
let md5 = require('md5');
let randtoken = require('rand-token');
require('dotenv').config();
let rp = require('request-promise').defaults({ json: true });
let svgCaptcha = require("svg-captcha");


const logger = require('../configs/logger');
const commonLogger = logger.commonLogger;
const errorLogger = logger.errorLogger;
let appConfig = require('../configs/app');
var cookieOption = { maxAge: process.env.SESSION_TIMEOUT, httpOnly: true, secure: true };
if (process.env.PORT !== '443') {
    cookieOption = { maxAge: process.env.SESSION_TIMEOUT, httpOnly: true };
}
const axios = require('axios');

let accountController = require('./Account');
const { response } = require('express');

var otpStorage = {};
var tokenStorage = [];
var CustodyLinkCount = {};
var CustodyLinkStorage = {};
var SubAccountChecked = {};
var positionsIntraday = {};



redis.client.get("SyncTrading:PositionsIntraday", function(err, reply) {
    if (err) {
        errorLogger.info('read [PositionsIntraday] error: ' + ex.message);
        return;
    }
    if (reply !== null) {
        positionsIntraday = JSON.parse(reply);
    }
});

redis.client.get("SyncTrading:CustodyLinkStorage", function(err, reply) {
    if (err) {
        errorLogger.info('read [CustodyLinkStorage] error: ' + ex.message);
        return;
    }
    if (reply !== null) {
        var custodyLink = JSON.parse(reply);
        Object.keys(custodyLink).forEach(userId => {
            custodyLink[userId].forEach((el, index1) => {
                setTimeout(() => {
                    if (positionsIntraday[userId] === undefined)
                        positionsIntraday[userId] = {};
                    el.subAccounts.forEach((subacc, index2) => {
                        setTimeout(() => {
                            rp({
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer " + el.token,
                                },
                                url: process.env.TRADING_SERVER + '/accounts/' + subacc.id + '/positions'
                            }).then(positionsData => {
                                if (positionsData.s === 'ok')
                                    positionsIntraday[userId][subacc.id] = positionsData.d;
                            }).catch(err => {
                                errorLogger.info('[Get Positions] ' + JSON.stringify({
                                    custody: el.custody,
                                    subAccount: subacc,
                                    errmsg: err.message
                                }));
                            });
                        }, 1000 * index2);
                    });
                }, 5000 * index1);
                redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
            });
        });
        setTimeout(() => {
            commonLogger.info("[Refresh PositionsIntraday] successful");
            // redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
        }, 1000000);
    }
});

// Refresh Token
// setInterval(() => {
//     var date = new Date(),
//         now = date.getTime(),
//         time1 = date.setHours(15, 0, 0),
//         time2 = date.setHours(15, 10, 0),
//         time3 = date.setHours(15, 20, 0);
//     if (time1 < now && now < time2) {
//         if (process.env.MODE === 'prod') {
//             redis.client.del("SyncTrading:OrderCancelled");
//             accountController.initOrderCancelled([]);
//             redis.client.del("SyncTrading:PositionsIntraday");
//             positionsIntraday = {};
//         }
//         //commonLogger.info('Begin refresh');
//         var totalCustody = 0;
//         var custodyCount = 0;
//         var countSuccess = 0;
//         Object.keys(CustodyLinkStorage).forEach(userId => {
//             totalCustody += CustodyLinkStorage[userId].length;
//             CustodyLinkStorage[userId].forEach((el, index1) => {
//                 setTimeout(() => {
//                     commonLogger.info('Begin refresh');
//                     rp({
//                         method: 'POST',
//                         url: process.env.SSO_SERVER + '/oauth/token',
//                         form: {
//                             client_id: process.env.CLIENT_ID,
//                             client_secret: process.env.CLIENT_SECRET,
//                             grant_type: 'refresh_token',
//                             refresh_token: el.rf_token
//                         }
//                     }).then(data => {
//                         custodyCount++;
//                         if (data.access_token !== undefined) {
//                             countSuccess++;
//                             var custodyLinkObj = CustodyLinkStorage[userId].find(c => c.custody === el.custody);
//                             custodyLinkObj.token = data.access_token;
//                             custodyLinkObj.rf_token = data.refresh_token;
//                             commonLogger.info('--------------------------------------Refresh------------------------------------------------------------' + "\n" +
//                                 ' [TK] : ' + custodyLinkObj.custody + ' - ' + "\n" +
//                                 ' [req_refresh_token] : ' + el.rf_token + ' - ' + "\n" +
//                                 ' [res_access_token] : ' + data.access_token + "\n" +
//                                 '---------------------------------------------------------------------------------------------------------' + "\n");
//                             if (positionsIntraday[userId] === undefined)
//                                 positionsIntraday[userId] = {};
//                             el.subAccounts.forEach((subacc, index2) => {
//                                 setTimeout(() => {
//                                     rp({
//                                         method: 'GET',
//                                         headers: {
//                                             'Authorization': "Bearer " + data.access_token,
//                                         },
//                                         url: process.env.TRADING_SERVER + '/accounts/' + subacc.id + '/positions'
//                                     }).then(positionsData => {
//                                         if (positionsData.s === 'ok')
//                                             positionsIntraday[userId][subacc.id] = positionsData.d;
//                                     }).catch(err => {
//                                         errorLogger.info('[Get Positions] ' + JSON.stringify({
//                                             custody: el.custody,
//                                             subAccount: subacc,
//                                             errmsg: err.message
//                                         }));
//                                     });
//                                 }, 1000 * index2);
//                             });
//                             redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
//                             accountController.initCustodyToken(CustodyLinkStorage);
//                             redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
//                         } else {
//                             commonLogger.info('[TK]: ' + custodyLinkObj.custody + ' - [req_refresh_token]: ' + el.rf_token + ' : access_token == undefined');
//                         }
//                         if (custodyCount === totalCustody) {
//                             commonLogger.info("[Refresh Token] successful " + countSuccess + "/" + totalCustody);
//                             // accountController.initCustodyToken(CustodyLinkStorage);
//                             // redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
//                         }
//                     }).catch(err => {
//                         custodyCount++;
//                         // if (custodyCount === totalCustody) {
//                         //     accountController.initCustodyToken(CustodyLinkStorage);
//                         //     redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
//                         // }
//                         errorLogger.info('[Refresh Token] ' + JSON.stringify({
//                             custody: el.custody,
//                             errmsg: err.message
//                         }));
//                     })
//                 }, 1000 * index1);
//             });
//         });
//     }
//     // else if (redis.client.connected && time2 < now && now < time3) {
//     //  redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
//     //accountController.initCustodyToken(CustodyLinkStorage);
//     //redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
//     //}
// }, 600000);

/* Auth */
router.get('/checkSession', appConfig.sessionChecker, async(req, res) => {
    if (redis.client.connected) {
        redis.client.get("SyncTrading:SyncTradingToken", function(err, reply) {
            if (err) {
                errorLogger.info('read [SyncTradingToken] error: ' + ex.message);
                return;
            }

            if (reply !== null) {
                tokenStorage = JSON.parse(reply);
                var userObj = tokenStorage.find(t => t.token === req.cookies.isync_session);
                if (userObj !== undefined) {
                    var resUserObj = {...userObj };
                    delete resUserObj.token;
                    res.send({ s: 'ok', d: resUserObj });
                } else
                    res.send({ s: 'error', msg: 'Unauthorize' });
            } else
                res.send({ s: 'error', msg: 'Unauthorize' });
            accountController.initUserToken(tokenStorage);
        });
        redis.client.get("SyncTrading:CustodyLinkStorage", function(err, reply) {
            if (err) {
                errorLogger.info('read [CustodyLinkStorage] error: ' + ex.message);
                return;
            }
            if (reply !== null) {
                CustodyLinkStorage = JSON.parse(reply);
            }
            Object.keys(CustodyLinkStorage).forEach(key => {
                CustodyLinkCount[key] = CustodyLinkStorage[key].length;
            });
            accountController.initCustodyToken(CustodyLinkStorage);
        });
        redis.client.get("SyncTrading:SubAccountChecked", function(err, reply) {
            if (err) {
                errorLogger.info('read [SubAccountChecked] error: ' + ex.message);
                return;
            }
            if (reply !== null) {
                SubAccountChecked = JSON.parse(reply);
            }
        });
        redis.client.get("SyncTrading:OrderCancelled", function(err, reply) {
            if (err) {
                errorLogger.info('read [OrderCancelled] error: ' + ex.message);
                return;
            }
            var OrderCancelled = [];
            if (reply !== null) {
                OrderCancelled = JSON.parse(reply);
            }
            accountController.initOrderCancelled(OrderCancelled);
        });
    } else {
        errorLogger.info('redis disconnect');
    }
});

router.get('/refreshCaptcha', appConfig.sessionChecker, async(req, res) => {
    var captcha = svgCaptcha.create({ size: 5, ignoreChars: '0o1ijlABCDEFGHIJKLMNOPQRSTUVWXYZ', color: true });
    req.session.captcha = captcha.text;
    res.send({ s: 'ok', d: captcha.data });
});

router.post('/login', async(req, res) => {
    var clientIpArr = req.connection.remoteAddress.split(':');
    if (req.session.captcha !== undefined && req.body.captcha === req.session.captcha) {
        if (req.body.username === process.env.ADMIN_USERNAME) {
            if (process.env.ADMIN_IP_ADDRESS.split(';').findIndex(el => el === clientIpArr[clientIpArr.length - 1]) >= 0) {
                var token = randtoken.generate(128);
                var xsrfToken = randtoken.generate(128);
                var tmpUserObj = tokenStorage.find(el => el.email === process.env.ADMIN_USERNAME);
                if (md5(req.body.password) === process.env.ADMIN_PASSWORD) {
                    if (tmpUserObj === undefined) {
                        saveToken({ email: process.env.ADMIN_USERNAME, accType: 'admin' }, token);
                        res.cookie('isync_session', token, cookieOption);
                    } else {
                        res.cookie('isync_session', tmpUserObj.token, cookieOption);
                    }
                    res.cookie('isync_xsrf_token', xsrfToken, { maxAge: process.env.SESSION_TIMEOUT });
                    res.send({ s: 'ok', d: { email: process.env.ADMIN_USERNAME, accType: 'admin' } });
                    commonLogger.info("[Admin Login] { username: " + req.body.username + " }" + appConfig.getClientIp(req, tokenStorage));
                } else {
                    var captcha = svgCaptcha.create({ size: 5, ignoreChars: '0o1ijlABCDEFGHIJKLMNOPQRSTUVWXYZ', color: true });
                    req.session.captcha = captcha.text;
                    res.send({ s: 'error', msg: 'Tên đăng nhập hoặc mật khẩu không đúng', newCaptcha: captcha.data });
                }
            } else {
                res.send({ s: 'error', msg: 'Bạn không có quyền truy cập' });
            }
        } else {
            rp({
                method: 'POST',
                url: process.env.API_SERVER + '/iSync/Login',
                form: {
                    email: req.body.username,
                    password: req.body.password
                }
            }).then(data => {
                if (data.s === 'ok') {
                    if (data.d.length) {
                        if (process.env.MODE !== 'dev')
                            sendOTP(data.d[0].phone);
                        res.send({ s: 'ok', d: data.d[0] });
                        commonLogger.info("[Login] " + JSON.stringify({
                            username: req.body.username,
                            data: data
                        }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
                    } else {
                        var captcha = svgCaptcha.create({ size: 5, ignoreChars: '0o1ijlABCDEFGHIJKLMNOPQRSTUVWXYZ', color: true });
                        req.session.captcha = captcha.text;
                        res.send({ s: 'error', msg: 'Tên đăng nhập hoặc mật khẩu không đúng', newCaptcha: captcha.data });
                        errorLogger.info("[Login] " + JSON.stringify({
                                username: req.body.username,
                                errmsg: data
                            }) + ' by ' + appConfig.getClientIp(req, tokenStorage)) +
                            ' - username or password incorrect';
                    }
                } else {
                    res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
                    errorLogger.info("[Login] " + JSON.stringify({
                            username: req.body.username,
                            errmsg: data
                        }) + ' by ' + appConfig.getClientIp(req, tokenStorage)) +
                        ' - ' + JSON.stringify(data);
                }
            }).catch(err => {
                errorLogger.info("[Login] " + JSON.stringify({
                        username: req.body.username,
                        errmsg: err.message
                    }) + ' by ' + appConfig.getClientIp(req, tokenStorage)) +
                    ' - ' + JSON.stringify(err);
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            });
        }
    } else {
        res.send({ s: 'error', msg: 'Lỗi captcha' });
    }

});

router.post('/refreshOTP', async(req, res) => {
    sendOTP(req.body.phone);
});

router.post('/verifyOTP', async(req, res) => {
    var token = randtoken.generate(128);
    var xsrfToken = randtoken.generate(128);
    var tmpUserObj = tokenStorage.find(el => el.email === req.body.userObj.email);
    if ((process.env.MODE === 'dev' && md5(req.body.otp) === process.env.DEV_PIN) ||
        (otpStorage[req.body.userObj.phone].otp === req.body.otp && otpStorage[req.body.userObj.phone].expires > new Date().getTime())) {
        if (tmpUserObj === undefined) {
            saveToken(req.body.userObj, token);
            res.cookie('isync_session', token, cookieOption);
        } else {
            res.cookie('isync_session', tmpUserObj.token, cookieOption);
        }
        res.cookie('isync_xsrf_token', xsrfToken);
        res.send({ s: 'ok' });
    } else {
        res.send({ s: 'error', msg: 'Mã OTP không đúng hoặc hết hạn' });
    }
});

function sendOTP(phone) {
    var otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[phone] = { otp: otp, expires: new Date().getTime() + 180000 };
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/SendOtp',
        form: {
            contain: 'Ma OTP cua ban la ' + otp + '. Hieu luc trong vong 3 phut.',
            phone: phone.charAt(0) === '0' ? ('84' + phone.substring(1, phone.length)) : phone
        }
    });
}

function saveToken(userObj, token) {
    if (redis.client.connected) {
        userObj['token'] = token;
        tokenStorage.push(userObj);
        accountController.initUserToken(tokenStorage);
        redis.client.set('SyncTrading:SyncTradingToken', JSON.stringify(tokenStorage));
    }
}

router.post('/changePass', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(req.body.newPass)) {
            res.send({ s: 'error', msg: 'password invalid!' });
        } else {
            rp({
                method: 'POST',
                url: process.env.API_SERVER + '/iSync/ChangePass',
                form: {
                    id: req.body.userId,
                    oldpass: req.body.oldPass,
                    newPass: req.body.newPass
                }
            }).then(data => {
                if (data.s === 'ok' && data.d === 'success') {
                    var userObj = tokenStorage.find(t => t.token === req.cookies.isync_session);
                    userObj.firstlogin = 'N';
                    accountController.initUserToken(tokenStorage);
                    redis.client.set('SyncTrading:SyncTradingToken', JSON.stringify(tokenStorage));
                    res.send({ s: 'ok', msg: 'Thay đổi mật khẩu thành công' });
                } else if (data.d === 'wrong pass') {
                    res.send({ s: 'wrong', msg: 'Sai mật khẩu' });
                } else {
                    res.send({ s: 'error', msg: 'Hệ thống đang bận. Vui lòng thử lại sau.' });
                }
            }).catch(err => {
                errorLogger.info("[ChangePass]" + JSON.stringify({
                    errmsg: err.message
                }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
                res.send({ statusCode: err.statusCode, message: err.message });
            });
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.get('/logout', async(req, res) => {
    if (redis.client.connected) {
        var tokenIndex = tokenStorage.findIndex(t => t.token === req.cookies.isync_session);
        if (tokenIndex >= 0) {
            tokenStorage.splice(tokenIndex, 1);
            accountController.initUserToken(tokenStorage);
            redis.client.set('SyncTrading:SyncTradingToken', JSON.stringify(tokenStorage));
        }
        res.statusCode = 302;
        res.setHeader('Location', process.env.DOMAIN);
        res.end();
    } else {
        errorLogger.info('read [SyncTradingToken] error: ' + ex.message);
        res.send({ s: 'error', msg: 'error occurs!' });
    }
});
/* End Auth */

/* Custody link */
router.get('/custodyLink', async(req, res) => {
    // testAxios()
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        var tmpListCustodyLink = [];
        if (req.query.isAddNew === 'true') {
            var tmpCount = CustodyLinkCount[req.query.userId] === undefined ? 0 : CustodyLinkCount[req.query.userId];
            var rfCustodyLink = setInterval(() => {
                if (CustodyLinkCount[req.query.userId] > tmpCount) {
                    clearInterval(rfCustodyLink);
                    CustodyLinkStorage[req.query.userId].forEach(itm => {
                        tmpListCustodyLink.push({
                            custody: itm.custody,
                            name: itm.name,
                            subAccounts: itm.subAccounts,
                            token: itm.token
                        });
                    });
                    res.send(tmpListCustodyLink);
                }
            }, 500);
        } else {
            if (CustodyLinkStorage[req.query.userId] === undefined) {
                res.send([]);
            } else {
                CustodyLinkStorage[req.query.userId].forEach(itm => {
                    tmpListCustodyLink.push({
                        custody: itm.custody,
                        name: itm.name,
                        subAccounts: itm.subAccounts,
                        token: itm.token
                    });
                });
                res.send(tmpListCustodyLink);
            }
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.get('/callback', async(req, res) => {
    rp({
        method: 'POST',
        url: process.env.SSO_SERVER + '/oauth/token',
        form: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.URL_CALLBACK,
            code: req.query.code
        }
    }).then(data => {
        if (data.access_token !== undefined) {
            var userObj = tokenStorage.find(t => t.token === req.cookies.isync_session);
            if (userObj !== undefined) {
                saveNewCustodyLink(res, req.cookies.isync_xsrf_token, userObj.id, data.access_token, data.refresh_token);
            }
        }
    }).catch(err => {
        errorLogger.info("[Callback]" + JSON.stringify({
            errmsg: err.message
        }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
        res.send({ statusCode: err.statusCode, message: err.message });
    })
});

function saveNewCustodyLink(response, xsrfToken, userId, token, rf_token) {

    if (redis.client.connected) {
        rp({
            method: 'GET',
            headers: {
                'Authorization': "Bearer " + token,
            },
            url: process.env.SSO_SERVER + '/api/info'
        }).then(res => {
            rp({
                method: 'GET',
                headers: {
                    'Authorization': "Bearer " + token,
                    'Content-Type': 'application/json; charset=utf-8'
                },
                url: process.env.TRADING_SERVER + '/accounts'
            }).then(res2 => {
                response.cookie('authorized', xsrfToken, { maxAge: 86400000 });
                var checkCustodyExist = false;
                Object.values(CustodyLinkStorage).forEach(item => {
                    if (item.findIndex(o => o.custody === res.username) >= 0) checkCustodyExist = true;
                });
                if (CustodyLinkStorage[userId] !== undefined &&
                    CustodyLinkStorage[userId].findIndex(c => c.custody === res.username) >= 0)
                    checkCustodyExist = false;
                if (checkCustodyExist) {
                    response.send('<p>Liên kết không thành công. Tài khoản đã được liên kết bởi người dùng khác.</p><a href="' + process.env.SSO_SERVER + '/oauth/logout">Quay về trang đăng nhập</a>');
                } else {
                    if (CustodyLinkCount[userId] === undefined)
                        CustodyLinkCount[userId] = 1;
                    else
                        CustodyLinkCount[userId] = CustodyLinkCount[userId] + 1;
                    var customerName = res2.d[0].name.split('.')[0];
                    var subAccounts = [];
                    res2.d.forEach(el => {
                        var type = el.name.split('.')[1];
                        // if (type !== 'Phái sinh'){
                        subAccounts.push({ id: el.id, type: type });
                        rp({
                            method: 'GET',
                            headers: {
                                'Authorization': "Bearer " + token,
                            },
                            url: process.env.TRADING_SERVER + '/accounts/' + el.id + '/positions'
                        }).then(positionsData => {
                            if (positionsData.s === 'ok') {
                                positionsIntraday[userId][el.id] = positionsData.d;
                                redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
                            }
                        }).catch(err => {
                            errorLogger.info('[Get Positions] ' + JSON.stringify({
                                custody: el.custody,
                                subAccount: el.id,
                                errmsg: err.message
                            }));
                        });
                        // }
                    })

                    if (CustodyLinkStorage[userId] === undefined) {
                        CustodyLinkStorage[userId] = [{
                            custody: res.username,
                            name: customerName,
                            subAccounts: subAccounts,
                            token: token,
                            rf_token: rf_token
                        }];
                    } else {
                        var tmpIndex = CustodyLinkStorage[userId].findIndex(c => c.custody === res.username);
                        if (tmpIndex >= 0) CustodyLinkStorage[userId].splice(tmpIndex, 1);
                        CustodyLinkStorage[userId].push({
                            custody: res.username,
                            name: customerName,
                            subAccounts: subAccounts,
                            token: token,
                            rf_token: rf_token
                        });
                    }
                    accountController.initCustodyToken(CustodyLinkStorage);
                    redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
                    WriteLog(userId, 'lienketTK', 'Add', 'Tao lien ket ' + res.username);
                    response.send('Liên kết tài khoản thành công.')
                }
            })
        })
    } else {
        errorLogger.info('redis disconnect');
    }
}

router.post('/deleteCustodyLink', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        if (redis.client.connected) {
            CustodyLinkStorage[req.body.userId].splice(CustodyLinkStorage[req.body.userId].findIndex(c => c.custody === req.body.custody), 1);
            accountController.initCustodyToken(CustodyLinkStorage);
            redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
            res.send(CustodyLinkStorage[req.body.userId]);
            WriteLog(req.body.userId, 'lienketTK', 'Remove', 'Huy lien ket ' + req.body.custody)

        } else {
            errorLogger.info('redis disconnect');
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
/* End Custody link */

/* Group */
router.get('/getAllGroups', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/GetAllGroups',
            form: {
                userid: req.query.userId
            }
        }).then(data => {
            if (data.s === 'ok') {
                res.send(data);
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[GetAllGroups]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.post('/createGroup', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/CreateGroup',
            form: {
                name: req.body.groupName,
                userid: req.body.userId
            }
        }).then(data => {
            if (data.s === 'ok') {
                data.d = Number(data.d);
                res.send(data);
                WriteLog(req.body.userId, 'Nhom', 'Add', 'Tao nhom ' + req.body.groupName)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[CreateGroup]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.post('/editGroup', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/ChangeGroupName',
            form: {
                id: req.body.groupId,
                name: req.body.groupName
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                res.send({ s: 'ok' });
                WriteLog(req.body.userId, 'Nhom', 'Edit', 'Sua ten nhom ' + req.body.groupId + ' - ' + req.body.groupName)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[EditGroup]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.post('/deleteGroup', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/DeleteGroup',
            form: {
                groupid: req.body.groupId
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                if (SubAccountChecked[req.body.userId] !== undefined) {
                    SubAccountChecked[req.body.userId] = SubAccountChecked[req.body.userId].filter(el => el.groupId !== req.body.groupId);
                    redis.client.set('SyncTrading:SubAccountChecked', JSON.stringify(SubAccountChecked));
                }
                res.send({ s: 'ok' });
                WriteLog(req.body.userId, 'Nhom', 'Delete', 'Xoa nhom ' + req.body.groupId)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[DeleteGroup]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.get('/getAllSubAccByGroupId', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/GetAllSubAccByGroupId',
            form: {
                groupid: req.query.groupId
            }
        }).then(data => {
            if (data.s === 'ok') {
                res.send(data);
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[GetAllSubAccByGroupId]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.get('/getAllSubAccByUserId', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/GetAllSubAccByUserId',
            form: {
                userid: req.query.userId
            }
        }).then(data => {
            if (data.s === 'ok') {
                res.send(data);
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[GetAllSubAccByUserId]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.post('/addSubAccount', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/AddSubAccount',
            form: {
                subaccount: req.body.subAccount,
                groupid: req.body.groupId,
                custody: req.body.custody,
                customername: req.body.customerName,
                subaccountname: req.body.subAccountName
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                res.send({ s: 'ok' });
                WriteLog('', 'SubAccount', 'Add',
                    'Them subaccount ' + req.body.custody + ' - ' + req.body.subAccount + ' - ' + req.body.groupId)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[AddSubAccount]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
router.post('/deleteSubAccount', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_UAT_SERVER + '/iSync/DeleteSubAcc',
            form: {
                subaccount: req.body.subAccount,
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                if (SubAccountChecked[req.body.userId] !== undefined) {
                    SubAccountChecked[req.body.userId] = SubAccountChecked[req.body.userId].filter(el => el.subAccount !== req.body.subAccount);
                    redis.client.set('SyncTrading:SubAccountChecked', JSON.stringify(SubAccountChecked));
                }
                res.send({ s: 'ok' });
                WriteLog(req.body.userId, 'SubAccount', 'Delete', 'Xoa subaccount ' + req.body.subAccount)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info("[DeleteSubAccount]" + JSON.stringify({
                errmsg: err.message
            }) + ' by ' + appConfig.getClientIp(req, tokenStorage));
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
/* End Group */

/* SubAccount checked */
router.get('/subAccountChecked', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        if (SubAccountChecked[req.query.userId] === undefined) {
            res.send({ s: 'ok', d: [] });
        } else {
            res.send({ s: 'ok', d: SubAccountChecked[req.query.userId] });
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.post('/subAccountChecked', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        if (redis.client.connected) {
            if (SubAccountChecked[req.body.userId] === undefined) {
                SubAccountChecked[req.body.userId] = [{
                    subAccount: req.body.subAccount,
                    groupId: req.body.groupId,
                    groupIndex: req.body.groupIndex,
                    custody: req.body.custody,
                    subAccountName: req.body.subAccountName
                }];
            } else {
                SubAccountChecked[req.body.userId].push({
                    subAccount: req.body.subAccount,
                    groupId: req.body.groupId,
                    groupIndex: req.body.groupIndex,
                    custody: req.body.custody,
                    subAccountName: req.body.subAccountName
                });
            }
            redis.client.set('SyncTrading:SubAccountChecked', JSON.stringify(SubAccountChecked));
            res.send({ s: 'ok' });
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.post('/subAccountUnchecked', async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        if (redis.client.connected) {
            if (SubAccountChecked[req.body.userId] !== undefined) {
                SubAccountChecked[req.body.userId]
                    .splice(SubAccountChecked[req.body.userId].findIndex(sa => sa.subAccount === req.body.subAccount), 1);
            }
            redis.client.set('SyncTrading:SubAccountChecked', JSON.stringify(SubAccountChecked));
            res.send({ s: 'ok' });
        }
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});
/* End SubAccount checked */

// Vi the trong ngay
router.get('/positionsIntraday', appConfig.sessionChecker, async(req, res) => {
    if (appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.header('UserId'))) {
        res.send({ s: 'ok', d: positionsIntraday[req.header('UserId')] == undefined ? {} : positionsIntraday[req.header('UserId')] });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

function WriteLog(userId, module, action, description) {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/WriteLog',
        form: {
            userid: userId,
            module: module,
            action: action,
            description: description
        }
    }).then(data => {

    }).catch(err => {
        errorLogger.info(err.message);
    });
}

/* Admin */
router.get('/getAllAccounts', async(req, res) => {
    if (req.query.userId === process.env.ADMIN_USERNAME &&
        appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.query.userId)) {
        rp({
            method: 'GET',
            url: process.env.API_SERVER + '/iSync/getAllAccounts',
        }).then(data => {
            if (data.s === 'ok') {
                res.send(data);
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info(err.message);
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.post('/CreateUser', async(req, res) => {
    if (req.body.userId === process.env.ADMIN_USERNAME &&
        appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/CreateUser',
            form: {
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                name: req.body.name
            }
        }).then(data => {
            if (data.s === 'ok') {
                data.d = Number(data.d);
                res.send(data);
                WriteLog('', 'AccountAdmin', 'Create', 'Tao account ' + req.body.email)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info(err.message);
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.post('/EditUser', async(req, res) => {
    if (req.body.userId === process.env.ADMIN_USERNAME &&
        appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/EditUser',
            form: {
                id: req.body.id,
                email: req.body.email,
                phone: req.body.phone,
                name: req.body.name
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                res.send({ s: 'ok' });
                WriteLog('', 'AccountAdmin', 'Edit', 'Sua account ' + req.body.email)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info(err.message);
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

router.post('/DeleteUser', async(req, res) => {
    if (req.body.userId === process.env.ADMIN_USERNAME &&
        appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/DeleteUser',
            form: {
                id: req.body.id
            }
        }).then(data => {
            if (data.s === 'ok' && data.d === 'success') {
                res.send({ s: 'ok' });
                WriteLog('', 'AccountAdmin', 'Delete', 'Xoa account ' + req.body.id)
            } else {
                errorLogger.info("[Admin DeleteUser] " + JSON.stringify(data));
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info(err.message);
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send('Unauthorize');
    }
});

router.post('/resetPassUser', async(req, res) => {
    if (req.body.userId === process.env.ADMIN_USERNAME &&
        appConfig.checkTokenAlive(tokenStorage, req.cookies.isync_session, req.body.userId)) {
        rp({
            method: 'POST',
            url: process.env.API_SERVER + '/iSync/resetPassUser',
            form: {
                id: req.body.id
            }
        }).then(data => {
            if (data.s === 'ok') {
                res.send({ s: 'ok' });
                sendNewPass(req.body.phone, data.d);
                WriteLog('', 'AccountAdmin', 'Changepass', 'Doi pass account ' + req.body.id)
            } else {
                res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
            }
        }).catch(err => {
            errorLogger.info(err.message);
            res.send({ s: 'error', msg: 'Hệ thống đang bận, vui lòng thử lại sau!' });
        });
    } else {
        res.send({ s: 'error', msg: 'Unauthorize' });
    }
});

function sendNewPass(phone, newpass) {
    rp({
        method: 'POST',
        url: process.env.API_SERVER + '/iSync/SendOtp',
        form: {
            contain: 'Mat khau moi cua quy khach la ' + newpass,
            phone: phone.charAt(0) === '0' ? ('84' + phone.substring(1, phone.length)) : phone
        }
    });
}
/* End Admin */

router.get('/:accountId/state2', appConfig.sessionChecker, async(req, res) => {
    // if (appConfig.checkTokenAlive(userToken, req.cookies.isync_session, req.header('UserId'))) {
    //     rp({
    //         method: 'GET',
    //         headers: {
    //             'Authorization': "Bearer " + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
    //         },
    //         url: process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state'
    //     }).then(data => {
    //         res.send(data);
    //     }).catch(err => {
    //         errorLogger.info('[GetState] ' + JSON.stringify({
    //             custody: req.header('Custody'),
    //             subAccount: req.params.accountId,
    //             errmsg: err.message
    //         }) + ' by ' + appConfig.getClientIp(req, userToken));
    //         res.send({ s: 'error', d: { statusCode: err.statusCode, message: err.message } });
    //     });
    // } else {
    //     res.send({ s: 'error', msg: 'Unauthorize' });
    // }
    console.log(1065, '/:accountId/state1')
        // isyncController.testAxios
        // isyncController.testAxios()
    var headers = {
        'Authorization': "Bearer ",
        // + custodyToken[req.header('UserId')].find(t => t.custody === req.header('Custody')).token,
        'Content-Type': 'application/json; charset=utf-8'
    }
    axios.get(process.env.TRADING_SERVER + '/accounts/' + req.params.accountId + '/state', {
            headers: headers
        }).then(response => {
            console.log(1037, response.data)
            res.send(response.data)
        }).catch(err => {
            console.log(1040, err)
            res.send(err.response.data);
        })
        // isyncController.testAxios
});

// module.exports = {
function testAxios() {

    // const instance = axios.create({
    //     baseURL: 'http://10.21.188.88/trading/accounts',
    //     timeout: 300000,
    //     headers: {
    //         'Authorization': "Bearer ",
    //         'Content-Type': 'application/json; charset=utf-8'
    //     }
    // })
    var a = 1 + 1
    var headers = {
        'Authorization': "Bearer ",
        'Content-Type': 'application/json; charset=utf-8'
    }
    var aaa;
    axios.get('http://10.21.188.88/trading/accounts', {
        headers: headers
    }).then(response => {
        console.log(1037, response)

    }).catch(err => {
        // console.log(1040, err.response.data.s)
        aaa = err.response.data
        aaa.s
            // instance.interceptors.response
        axios.interceptors.request.use(res => res, error => {
            res
            console.log(aaa)
            refreshToken().then(rs => {
                rs
            })
        })
    })
    console.log(1066, CustodyLinkStorage)
    axios.post(process.env.SSO_SERVER + '/oauth/token', {
            form: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: 'refresh_token',
                // refresh_token: el.rf_token
            }
        }).then(res => {
            res
        }).catch(err => {
            err
        })
        // return a

}

axios.interceptors.response.use((res) => {
    res
    // console.log(676, res.data)
    return res.data;
}, (error) => {
    // Do something with response error
    var err = error.response.data
    if (err.s == 401) {
        CustodyLinkStorage
        var totalCustody = 0;
        var custodyCount = 0;
        var countSuccess = 0;
        Object.keys(CustodyLinkStorage).forEach(userId => {
            totalCustody += CustodyLinkStorage[userId].length;
            // console.log(1097, userId)
            CustodyLinkStorage[userId].forEach((el, index1) => {
                setTimeout(() => {
                    rp({
                        method: 'POST',
                        url: process.env.SSO_SERVER + '/oauth/token',
                        form: {
                            client_id: process.env.CLIENT_ID,
                            client_secret: process.env.CLIENT_SECRET,
                            grant_type: 'refresh_token',
                            refresh_token: el.rf_token
                        }
                    }).then(data => {
                        custodyCount++;
                        if (data.access_token !== undefined) {
                            countSuccess++;
                            var custodyLinkObj = CustodyLinkStorage[userId].find(c => c.custody === el.custody);
                            custodyLinkObj.token = data.access_token;
                            custodyLinkObj.rf_token = data.refresh_token;
                            if (positionsIntraday[userId] === undefined)
                                positionsIntraday[userId] = {};
                            el.subAccounts.forEach((subacc, index2) => {
                                setTimeout(() => {
                                    rp({
                                        method: 'GET',
                                        headers: {
                                            'Authorization': "Bearer " + data.access_token,
                                        },
                                        url: process.env.TRADING_SERVER + '/accounts/' + subacc.id + '/positions'
                                    }).then(positionsData => {
                                        if (positionsData.s === 'ok')
                                        // console.log(1099, index2)
                                            positionsIntraday[userId][subacc.id] = positionsData.d;
                                    }).catch(err => {
                                        errorLogger.info('[Get Positions] ' + JSON.stringify({
                                            custody: el.custody,
                                            subAccount: subacc,
                                            errmsg: err.message
                                        }));
                                    });
                                }, 1000 * index2);
                            });
                            redis.client.set('SyncTrading:PositionsIntraday', JSON.stringify(positionsIntraday));
                            accountController.initCustodyToken(CustodyLinkStorage);
                            redis.client.set('SyncTrading:CustodyLinkStorage', JSON.stringify(CustodyLinkStorage));
                        }
                        if (custodyCount === totalCustody) {
                            commonLogger.info("[Refresh Token] successful " + countSuccess + "/" + totalCustody);
                        }
                    }).catch(err => {
                        errorLogger.info('[Refresh Token] ' + JSON.stringify({
                            custody: el.custody,
                            errmsg: err.message
                        }));
                    })
                }, 5000 * index1);
            });
        });
    }
    return Promise.reject(error)
})

function test() {
    accountController
}


function testAxios1(x, y) {
    var a = x + y
    return a
}

module.exports = router;