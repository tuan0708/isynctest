import { SSO_SERVER, CLIENT_ID } from "../../config/app";
import Cookies from 'js-cookie';
import toastr from 'toastr';

export const SYMBOL_DEFAULT = 'BSI';
export const ORDER_LOTSIZE = 100;

//Cac kich thuoc man hinh
export const LARGE_SCREEN = 992;
export const MEDIUM_SCREEN = 768;
export const SMALL_SCREEN = 576;
export const XSMALL_SCREEN = 100;

export function showToast(title, msg, type, timeout = 1000) {
    type = (typeof type === 'undefined') ? 'info' : type;
    toastr.options.timeOut = timeout;
    toastr[type](msg, title);
}

var ssoLoginWindow = null;

export function openSSOLoginPopup() {
    var clientAuthorized = Cookies.get('authorized');
    if (clientAuthorized === undefined) {
        ssoLoginWindow = window.open(SSO_SERVER + '/oauth/authorize?client_id=' + CLIENT_ID + '&response_type=code&redirect_uri=' + location.origin + '/isync/callback&scope=general', 'name', 'height=500,width=600');
    } else {
        ssoLoginWindow = window.open(SSO_SERVER + '/oauth/logout', 'name', 'height=500,width=600');
        setTimeout(() => {
            ssoLoginWindow = window.open(SSO_SERVER + '/oauth/authorize?client_id=' + CLIENT_ID + '&response_type=code&redirect_uri=' + location.origin + '/isync/callback&scope=general', 'name', 'height=500,width=600');
        }, 500);
    }
    if (window.focus) {
        ssoLoginWindow.focus();
    }
}

export function closeSSOLoginPopup() {
    if (ssoLoginWindow !== null) {
        ssoLoginWindow.close();
    }
}

export function genNotificationLog(symbol, qtty, side, type, limitPrice, stopPrice, takeProfitPrice = 0, stopLossPrice = 0) {
    var tmpSide = 'Bán ';
    if (side === 'buy') {
        tmpSide = 'Mua ';
    }
    var takeProfitNotify = '', stopLossNotify = '';
    if (takeProfitPrice > 0) takeProfitNotify = ', giá TakeProfit ' + takeProfitPrice;
    if (stopLossPrice > 0) stopLossNotify = ', giá StopLoss ' + stopLossPrice;
    if (type === 'market') {
        return tmpSide + qtty.toLocaleString('en') + ' ' + symbol + ' (Lệnh thị trường)' + takeProfitNotify + stopLossNotify;
    } else if (type === 'limit') {
        return tmpSide + qtty.toLocaleString('en') + ' ' + symbol + ' giá ' + limitPrice.toLocaleString('en') + ' (Lệnh giới hạn)' + takeProfitNotify + stopLossNotify;
    } else if (type === 'stop') {
        return tmpSide + qtty.toLocaleString('en') + ' ' + symbol + ' giá stop ' + stopPrice.toLocaleString('en') + ' (Lệnh điều kiện thị trường)' + takeProfitNotify + stopLossNotify;
    } else if (type === 'stoplimit') {
        return tmpSide + qtty.toLocaleString('en') + ' ' + symbol + ' giá stop ' + stopPrice.toLocaleString('en') + ', giá limit ' + limitPrice.toLocaleString('en') + ' (Lệnh điều kiện giới hạn)' + takeProfitNotify + stopLossNotify;
    }
}

export function checkAuthorized(statusCode) {
    if (statusCode === 401) {
        alert("Kết thúc phiên đăng nhập!");
        window.location.assign(SSO_SERVER + '/oauth/logout');
    }
}

var timeout = null;
// session expire
export function sessionExpire() {
    clearTimeout(timeout);
    if (Cookies.get('xsrf_token') !== undefined) {
        Cookies.set('xsrf_token', Cookies.get('xsrf_token'), { expires: 1 / 24 });
    }
    timeout = setTimeout(() => {
        alert("Kết thúc phiên đăng nhập!");
        window.location.assign(SSO_SERVER + '/oauth/logout');
    }, 3600000);
}