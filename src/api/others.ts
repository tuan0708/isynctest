import Cookies from 'js-cookie';

const header = {
    'XSRF-TOKEN': Cookies.get('isync_xsrf_token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

export function fetchFavorStocks(userId) {
    return fetch(location.origin + '/accounts/GetFavoriteSymbols',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function postAddFavorStocks(userId, name) {
    return fetch(location.origin + '/accounts/AddFavoriteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                name: name
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function postEditFavorStocks(name, favorId) {
    return fetch(location.origin + '/accounts/EditNameFavoriteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                name: name,
                favorId: favorId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function postDeleteFavorStocks(favorId) {
    return fetch(location.origin + '/accounts/DeleteFavoriteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                favorId: favorId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function postAddSymbolToFavorStocks(id, symbol) {
    return fetch(location.origin + '/accounts/AddSymbolToFavoriteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                id: id,
                symbol: symbol
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function postDeleteSymbolFromFavorStocks(id, symbol) {
    return fetch(location.origin + '/accounts/DeleteSymbolFromFavoriteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                id: id,
                symbol: symbol
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function fetchNewsEvents(symbol) {
    return fetch(location.origin + '/News/GetEventsAndNewsBySymbol',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                symbol: symbol
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        });
}

export function fetchLastPriceStock() {
    return fetch(location.origin + '/market/lastPriceStock',
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

export function fetchGetVrimamtTInfo(dmaacctno, dtaacctno, instrument) {
    return fetch(location.origin + '/News/GetEventsAndNewsBySymbol',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                dmaacctno: dmaacctno,
                dtaacctno: dtaacctno,
                instrument: instrument,
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        });
}

export function getQuotes() {
    return fetch(location.origin + '/quotes',
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