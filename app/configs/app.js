let path = require('path');
let statusCode = require('../configs/statusCode');

const NOT_FOUND_TEMPLATE = path.resolve(__dirname, '../template/404.html');

let sessionChecker = (req, res, next) => {
    if (req.header('XSRF-TOKEN') === undefined) {
        res.status(statusCode.NOT_FOUND.code).sendFile(NOT_FOUND_TEMPLATE);
    } else {
        next();
    }
}

function checkTokenAlive(tokenStorage, token, userId) {
    var userObj = tokenStorage.find(t => t.token === token);
    if ((userObj !== undefined && userObj.id === Number(userId))
        || (userObj !== undefined && userObj.email === userId)) return true;
    return false;
}

function getClientIp(req, tokenStorage) {
    if (process.env.MODE === 'dev') return null;
    var userObj = tokenStorage.find(t => t.token === req.cookies.isync_session);
    var clientIpArr = req.connection.remoteAddress.split(':');
    if (userObj !== undefined) {
        if (req.connection.remoteAddress === undefined) {
            return '{ Username => ' + userObj.email + ', IP => :::1 }';
        }
        return '{ Username => ' + userObj.email + ', IP => ' + clientIpArr[clientIpArr.length - 1] + ' }';
    }
    return '{ IP => ' + clientIpArr[clientIpArr.length - 1] + ' }';
}

function getClient_Ip(req) {
    return "isync-" + (req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress);
}

module.exports = {
    sessionChecker,
    checkTokenAlive,
    getClientIp,
    getClient_Ip
}