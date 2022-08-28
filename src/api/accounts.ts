import Cookies from 'js-cookie';
import { checkAuthorized } from '../common/constants/app';

const header = {
    'XSRF-TOKEN': Cookies.get('isync_xsrf_token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

export function fetchAccountInfo(userId) {
    header['UserId'] = userId;
    return fetch(location.origin + '/accounts',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getPositions(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/positions',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getState(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/state',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getState1(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/state1',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getOrders(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/orders',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getOrdersHistory(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/ordersHistory?maxCount=1000',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            // console.log(res);
            return res;
        })
}

export function closePosition(userId, custody, positionID, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/positions/' + positionID,
        {
            method: 'DELETE',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}


export function placeOrder(userId: string, custody: string, requestId: string, subAcc: string,
    instrument: string, qty: number, side: string, type: string, limitPrice: number, stopPrice: number,
    durationType: string, durationDateTime: number, stopLoss: number, takeProfit: number, digitalSignature: string) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    // WriteLogPlaceOrder(userId,'create', custody,instrument, qty, side, type, limitPrice, stopPrice, durationType, 
    // durationDateTime, stopLoss, takeProfit, digitalSignature)
    return fetch(location.origin + '/accounts/' + subAcc + '/orders?requestId=' + requestId,
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                instrument: instrument,
                qty: qty,
                side: side,
                type: type,
                limitPrice: subAcc.includes('FDS') ? limitPrice : Math.round(limitPrice),
                stopPrice: Math.round(stopPrice),
                durationType: durationType,
                durationDateTime: durationDateTime,
                stopLoss: Math.round(stopLoss),
                takeProfit: Math.round(takeProfit),
                digitalSignature: digitalSignature
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })

}

export function cancelOrder(userId, custody, subAcc, orderid) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/orders/' + orderid,
        {
            method: 'DELETE',
            headers: header,

        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function modifyOrder(userId: string, custody: string, subAcc: string, orderid: string,
    _qty: number, _limitPrice: number, _stopPrice: number, _durationType: string,
    _durationDateTime: number, _stopLoss: number, _takeProfit: number, _digitalSignature: string,
    _requestId: string) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/orders/' + orderid,
        {
            method: 'PUT',
            headers: header,
            body: JSON.stringify({
                qty: _qty,
                limitPrice: Math.round(_limitPrice),
                stopPrice: Math.round(_stopPrice),
                durationType: _durationType,
                durationDateTime: _durationDateTime,
                stopLoss: Math.round(_stopLoss),
                takeProfit: Math.round(_takeProfit),
                digitalSignature: _digitalSignature,
                requestId: _requestId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            // console.log(res);
            return res;
        })
}

export function getOrdersCancelled(userId) {
    header['UserId'] = userId;
    return fetch(location.origin + '/accounts/ordersCancelled',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            // console.log(res);
            return res;
        })
}

export function getLogRedis(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/logs',
        {
            method: 'GET',
            headers: header,
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function setLogRedis(userId, custody, subAcc, time, action, description) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/logs',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                time: time,
                action: action,
                description: description
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getInstruments(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/instruments',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getAccountSummary(userId, custody, subAcc, symbol, price) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/GetAccountSummary',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                symbol: symbol,
                price: price
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getAccountSummaryFull(userId, subAcc, custody) {
    header['UserId'] = userId;
    return fetch(location.origin + '/accounts/' + subAcc + '/GetAccountSummaryFull',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                custody: custody
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

export function getPP0(userId, custody, subAcc) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/' + subAcc + '/GetPP0',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}

// GetRate
export function getRate(userId, custody, symbol) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    return fetch(location.origin + '/accounts/getRate?symbol=' + symbol + '&custody=' + custody,
        {
            method: 'GET',
            headers: header,
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}

export function getLastPrice(userId, custody, symbols) {
    header['UserId'] = userId;
    header['Custody'] = custody;
    // debugger;
    return fetch(location.origin + '/accounts/quotes1?symbols=' + symbols,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res;
        })
}
