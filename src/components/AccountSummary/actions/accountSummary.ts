import { actionTypes } from '../../../common/constants/actionTypes';
import { getPositions, getState, getInstruments, getOrders, getOrdersCancelled, getPP0, getAccountSummary, getAccountSummaryFull, getLastPrice, getState1, getRate } from '../../../api/accounts';
import { fetchLastPriceStock } from '../../../api/others';
import { postSubAccountChecked, postSubAccountUnchecked, getPositionsIntraday, resetPassAccount } from '../../../api/isync';
import { showToast } from '../../../common/constants/app';
import { symbolName } from 'typescript';
import { stocksDataPSInit } from './stocksData';

var subAccCheckedStorage = [];
var lastPriceStock = [], isLoadedLastPriceStock = false;

export var groupType = '';
export var instruments = {};

export const subAccountCheckedAction = (userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked) => (dispatch) => {
    if (!isLoadedLastPriceStock) {
        isLoadedLastPriceStock = true;
        fetchLastPriceStock().then(res => {
            if (res.s === 'ok') {
                lastPriceStock = res.d;
            }
        });
    }

    getState1(userId, custody, subAcc).then(res1 => {
        // console.log(res)
    });

    if (subAccCheckedStorage.findIndex(s => s === subAcc) < 0) {
        if (checkedQtty > 0)
            $('#AccountSummaryLoading').show();
        subAccCheckedStorage.push(subAcc);

        getAccountSummaryFull(userId, subAcc, custody).then(res => {
            // debugger
            if (res.s === 'ok') {
                getState(userId, custody, subAcc).then(state => {
                    if (state.s === 'ok') {
                        localStorage.setItem('vcashonhand', res.d.vcashonhand);
                        getPositions(userId, custody, subAcc).then(positions => {
                            if (positions.s === 'ok') {
                                getOrders(userId, custody, subAcc).then(orders => {
                                    if (orders.s === 'ok') {
                                        getOrdersCancelled(userId).then(orderCancel => {
                                            if (orderCancel.s === 'ok') {
                                                getPositionsIntraday(userId).then(positionsIntraday => {
                                                    if (positionsIntraday.s === 'ok') {
                                                        //Hide loading
                                                        $('#AccountSummaryLoading').hide();
                                                        orders.d.filter(o => o.side === 'sell' && (o.status === 'placing' || o.status === 'working'
                                                            || (o.status === 'filled' && o.filledQty < o.qty))).forEach(orderItm => {
                                                                if (!orderCancel.d.includes(orderItm.id)) {
                                                                    var positionObj = positions.d.find(el => el.instrument === orderItm.instrument);
                                                                    if (positionObj !== undefined) {
                                                                        if (orderItm.status !== 'filled') {
                                                                            positionObj.qty += orderItm.qty;
                                                                        } else if (orders.d.find(fo => fo.parentId === orderItm.id) === undefined) {
                                                                            positionObj.qty += (orderItm.qty - orderItm.filledQty);
                                                                        }
                                                                        if (positionObj.id.length == 13 || positionObj.id.length == 12) {
                                                                            positionObj.qty = positionObj.qty - orderItm.qty;
                                                                        }
                                                                    }
                                                                }
                                                            });

                                                        if (positionsIntraday.d[subAcc] !== undefined) {
                                                            positionsIntraday.d[subAcc].forEach(positionItm => {
                                                                if (positions.d.findIndex(el => el.instrument === positionItm.instrument) < 0) {
                                                                    var totalFilledQty = 0;
                                                                    orders.d.filter(el => el.side === 'sell' && el.instrument === positionItm.instrument).forEach(orderItm => {
                                                                        totalFilledQty += orderItm.filledQty;
                                                                    });
                                                                    if (positionItm.qty > totalFilledQty) {
                                                                        positionItm.qty -= totalFilledQty;
                                                                        positions.d.push(positionItm);
                                                                    }
                                                                }
                                                            });
                                                        }

                                                        positions.d = positions.d.map(el => {
                                                            var upcomingQty = el.customFields.find(f => f.id === '1000');
                                                            el['totalQty'] = el.qty;
                                                            if (upcomingQty !== undefined) {
                                                                el['totalQty'] += upcomingQty.value;
                                                            }
                                                            el['lastPrice'] = 0;
                                                            el['unit'] = 1;
                                                            if (el.instrument.indexOf('VN30F') === 0) el['unit'] = 100000;
                                                            else if (el.instrument.indexOf('GB05F') === 0) el['unit'] = 10000;

                                                            el['tyTrong'] = 0;
                                                            el['imrate'] = 13;
                                                            el['rsafe'] = 70;
                                                            if (subAcc.includes('FDS')) {
                                                                if (el.id.includes('sell'))
                                                                    el['totalQty'] = Math.abs(Number(el['totalQty'])) * -1;

                                                                getRate(userId, custody, el.instrument).then(resRate => {
                                                                    if (resRate.s === 'ok') {
                                                                        el['imrate'] = resRate.d[0].imrate;
                                                                        el['rsafe'] = resRate.d[0].rsafe / 100;
                                                                    }
                                                                });
                                                            }

                                                            return el;
                                                        });

                                                        var kqYeuCau = 0;
                                                        var tyTrong = 0;
                                                        // var date = new Date(), now = date.getTime(), time1 = date.setHours(15, 0, 0);
                                                        // var date1 = new Date(time1);
                                                        // date1.setHours(date1.getHours() + 18);
                                                        // var time2 = date1.getTime();
                                                        // if (time1 < now && now < time2) {
                                                        //     positions.d.forEach(itm => {
                                                        //         var stockPriceObj = stocksDataPSInit.find(el => el.symbol === itm.instrument
                                                        //             || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
                                                        //         if (stockPriceObj !== undefined) {
                                                        //             itm['lastPrice'] = stockPriceObj.match_price.val;
                                                        //             var kqYeuCau1 = Number((stockPriceObj.match_price.val * itm['qty'] * (itm['imrate'] / itm['rsafe'] / 100) * 100000).toFixed(0));
                                                        //             var tyTrong1 = itm['tyTrong'] = (kqYeuCau1 / state.d.balance) * 100;
                                                        //             kqYeuCau += kqYeuCau1;
                                                        //             tyTrong += tyTrong1;
                                                        //         }
                                                        //     });
                                                        // }
                                                        // else {
                                                        //     if (lastPriceStock.length) {
                                                        //         positions.d.forEach(itm => {
                                                        //             var stockPriceObj = lastPriceStock.find(el => el.symbol === itm.instrument
                                                        //                 || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
                                                        //             if (stockPriceObj !== undefined) {
                                                        //                 itm['lastPrice'] = stockPriceObj['price'];
                                                        //                 var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (itm['imrate'] / itm['rsafe'] / 100) * 100000).toFixed(0));
                                                        //                 var tyTrong1 = itm['tyTrong'] = (kqYeuCau1 / state.d.balance) * 100;
                                                        //                 kqYeuCau += kqYeuCau1;
                                                        //                 tyTrong += tyTrong1;
                                                        //             }
                                                        //         });
                                                        //     }
                                                        // }

                                                        if (lastPriceStock.length) {
                                                            positions.d.forEach(itm => {
                                                                var stockPriceObj = lastPriceStock.find(el => el.symbol === itm.instrument
                                                                    || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
                                                                if (stockPriceObj !== undefined) {
                                                                    itm['lastPrice'] = stockPriceObj['price'];
                                                                    var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (itm['imrate'] / itm['rsafe'] / 100) * 100000).toFixed(0));
                                                                    var tyTrong1 = itm['tyTrong'] = (kqYeuCau1 / state.d.balance) * 100;
                                                                    kqYeuCau += kqYeuCau1;
                                                                    tyTrong += tyTrong1;
                                                                }
                                                            });
                                                        }

                                                        if (!isInit) {
                                                            postSubAccountChecked(userId, groupId, subAcc, custody, subAccName);
                                                        }


                                                        getPP0(userId, custody, subAcc).then(resPP0 => {
                                                            if (resPP0.s === 'ok') {
                                                                var excessEquity = Number(resPP0.d.pp0) + Number(resPP0.d.bankBalance);
                                                                var liability = state.d.amData[1].length ? state.d.amData[1][0][0] : 0;
                                                                var upcomingCash = state.d.amData[2].length ? state.d.amData[2][0][0] : 0;
                                                                dispatch(subAccountCheckedCompleted(custody, subAcc, subAccName,
                                                                    positions.d, orders.d, (state.d.balance + upcomingCash), state.d.balance, res.d.vcashonhand, state.d.equity,
                                                                    excessEquity, liability, lastPriceStock, kqYeuCau, tyTrong, res.d.pp, isChecked));
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else if (state.s === 'error' && state.d.statusCode === 401) {
                        $('#AccountSummaryLoading').hide();
                        $('input[type="checkbox"][subaccount-id="' + subAcc + '"]').prop('checked', false);
                        showToast('Thông báo', "Lỗi liên kết tài khoản [" + custody + "]. Vui lòng liên kết lại", 'error');
                        subAccCheckedStorage.splice(subAccCheckedStorage.findIndex(s => s === subAcc), 1);
                    }
                });
            }
        });

        getInstruments(userId, custody, subAcc).then(res => {
            if (res.s === 'ok') {
                instruments[subAcc] = res.d;
            }
        });
    } else {
        if (!isInit)
            postSubAccountChecked(userId, groupId, subAcc, custody, subAccName);
        dispatch(subAccountRecheckedCompleted(subAcc, isChecked));
    }
}

const subAccountCheckedCompleted = (custody, subAcc, subAccName, positions, orders, balance, balancePS, vcashonhand, equity,
    excessEquity, liability, stocksPriceInit, kqYeuCau, tyTrong, pp, isChecked) => {
    return ({
        type: actionTypes.ACCOUNTSUMMARY_SUBACC_CHECKED,
        custody: custody,
        subAccount: subAcc,
        subAccountName: subAccName,
        positions: positions,
        orders: orders,
        balance: balance,
        balancePS: balancePS,
        vcashonhand: vcashonhand,
        equity: equity,
        excessEquity: excessEquity,
        liability: liability,
        stocksPriceInit: stocksPriceInit,
        kqYeuCau: kqYeuCau,
        tyTrong: tyTrong,
        pp: pp,
        isChecked: isChecked
    })
};

const subAccountRecheckedCompleted = (subAcc, isChecked) => {
    return ({
        type: actionTypes.ACCOUNTSUMMARY_SUBACC_RECHECKED,
        subAccount: subAcc,
        isChecked: isChecked
    })
};

export const refreshAccountSummaryAction = (userId, showLoading) => (dispatch) => {
    var cbAccountArr = $('#accountPanel .tab-pane.active input.cbAccount:checked');
    if (cbAccountArr.length) {
        if (showLoading)
            $('#AccountSummaryLoading').show();

        getOrdersCancelled(userId).then(orderCancel => {
            getPositionsIntraday(userId).then(positionsIntraday => {
                $.each(cbAccountArr, index => {
                    var custody = $(cbAccountArr[index]).attr('custody-id');
                    var subAcc = $(cbAccountArr[index]).attr('subaccount-id');
                    getAccountSummaryFull(userId, subAcc, custody).then(res => {
                        if (res.s === 'ok') {
                            getState(userId, custody, subAcc).then(state => {
                                if (state.s === 'ok') {
                                    getPositions(userId, custody, subAcc).then(positions => {
                                        if (positions.s === 'ok') {
                                            getOrders(userId, custody, subAcc).then(orders => {
                                                if (orders.s === 'ok') {
                                                    //Hide loading
                                                    $('#AccountSummaryLoading').hide();
                                                    orders.d.filter(o => o.side === 'sell' && (o.status === 'placing' || o.status === 'working'
                                                        || (o.status === 'filled' && o.filledQty < o.qty))).forEach(orderItm => {
                                                            if (!orderCancel.d.includes(orderItm.id)) {
                                                                var positionObj = positions.d.find(el => el.instrument === orderItm.instrument);
                                                                if (positionObj !== undefined) {
                                                                    if (orderItm.status !== 'filled') {
                                                                        positionObj.qty += orderItm.qty;
                                                                    } else if (orders.d.find(fo => fo.parentId === orderItm.id) === undefined) {
                                                                        positionObj.qty += (orderItm.qty - orderItm.filledQty);
                                                                    }

                                                                    if (positionObj.id.length == 13 || positionObj.id.length == 12) {
                                                                        positionObj.qty = positionObj.qty - orderItm.qty;
                                                                    }
                                                                }
                                                            }
                                                        });

                                                    if (positionsIntraday.d[subAcc] !== undefined) {
                                                        positionsIntraday.d[subAcc].forEach(positionItm => {
                                                            if (positions.d.findIndex(el => el.instrument === positionItm.instrument) < 0) {
                                                                var totalFilledQty = 0;
                                                                orders.d.filter(el => el.side === 'sell' && el.instrument === positionItm.instrument).forEach(orderItm => {
                                                                    totalFilledQty += orderItm.filledQty;
                                                                });
                                                                if (positionItm.qty > totalFilledQty) {
                                                                    positionItm.qty -= totalFilledQty;
                                                                    positions.d.push(positionItm);
                                                                }
                                                            }
                                                        });
                                                    }
                                                    positions.d = positions.d.map(el => {
                                                        var upcomingQty = el.customFields.find(f => f.id === '1000');
                                                        el['totalQty'] = el.qty;
                                                        if (upcomingQty !== undefined) {
                                                            el['totalQty'] += upcomingQty.value;
                                                        }
                                                        el['lastPrice'] = 0;
                                                        el['unit'] = 1;
                                                        if (el.instrument.indexOf('VN30F') === 0) el['unit'] = 100000;
                                                        else if (el.instrument.indexOf('GB05F') === 0) el['unit'] = 10000;
                                                        el['tyTrong'] = 0;
                                                        el['laiLo1'] = 0;
                                                        el['percentlaiLo1'] = 0;

                                                        el['imrate'] = 13;
                                                        el['rsafe'] = 70;
                                                        // debugger
                                                        if (subAcc.includes('FDS')) {
                                                            if (el.id.includes('sell'))
                                                                el['totalQty'] = Math.abs(Number(el['totalQty'])) * -1;

                                                            getRate(userId, custody, el.instrument).then(resRate => {
                                                                if (resRate.s === 'ok') {
                                                                    el['imrate'] = resRate.d[0].imrate;
                                                                    el['rsafe'] = resRate.d[0].rsafe / 100;
                                                                }
                                                            });
                                                        }
                                                        return el;
                                                    });

                                                    var kqYeuCau = 0;
                                                    var tyTrong = 0;
                                                    if (lastPriceStock.length) {
                                                        positions.d.forEach(itm => {
                                                            var stockPriceObj = lastPriceStock.find(el => el.symbol === itm.instrument
                                                                || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
                                                            if (stockPriceObj !== undefined) {
                                                                itm['lastPrice'] = stockPriceObj['price'];
                                                                var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (itm['imrate'] / itm['rsafe'] / 100) * 100000).toFixed(0));
                                                                var tyTrong1 = (kqYeuCau1 / state.d.balance) * 100;
                                                                kqYeuCau += kqYeuCau1;
                                                                tyTrong += tyTrong1;
                                                            }
                                                        });
                                                    }
                                                    getPP0(userId, custody, subAcc).then(resPP0 => {
                                                        if (resPP0.s === 'ok') {
                                                            var excessEquity = Number(resPP0.d.pp0) + Number(resPP0.d.bankBalance);
                                                            var liability = state.d.amData[1].length ? state.d.amData[1][0][0] : 0;
                                                            var upcomingCash = state.d.amData[2].length ? state.d.amData[2][0][0] : 0;
                                                            dispatch(refreshAccountSummaryCompleted(subAcc,
                                                                positions.d, (state.d.balance + upcomingCash), state.d.balance, res.d.vcashonhand, state.d.equity,
                                                                excessEquity, liability, kqYeuCau, tyTrong, stocksDataPSInit, res.d.pp));
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else if (state.s === 'error' && state.d.statusCode === 401) {
                                    showToast('Thông báo', "Lỗi liên kết tài khoản [" + custody + "]. Vui lòng liên kết lại", 'error');
                                }
                            })
                        }
                    });
                });
            });
        });
    }
}

const refreshAccountSummaryCompleted = (subAcc, positions, balance, balancePS, vcashonhand, equity, excessEquity, liability, kqYeuCau, tyTrong, stocksDataPSInit, pp) => {
    return ({
        type: actionTypes.ACCOUNTSUMMARY_REFRESH,
        subAccount: subAcc,
        positions: positions,
        balance: balance,
        balancePS: balancePS,
        vcashonhand: vcashonhand,
        equity: equity,
        excessEquity: excessEquity,
        liability: liability,
        kqYeuCau: kqYeuCau,
        tyTrong: tyTrong,
        stocksDataPSInit: stocksDataPSInit,
        pp: pp
    })
};

export const subAccountUncheckedAction = (userId, groupId, subAcc, isSave) => (dispatch) => {
    $('#AccountSummaryLoading').hide();
    if (isSave) {
        postSubAccountUnchecked(userId, groupId, subAcc);
    }
    dispatch(subAccountUncheckedCompleted(subAcc));
}

const subAccountUncheckedCompleted = (subAcc) => {
    return ({
        type: actionTypes.ACCOUNTSUMMARY_SUBACC_UNCHECKED,
        subAccount: subAcc
    })
};

export const theadSortChangeAction = (table, field) => (dispatch) => {
    dispatch(theadSortChangeCompleted(table, field));
}

const theadSortChangeCompleted = (table, field) => {
    return ({
        type: actionTypes.ACCOUNTSUMMARY_THEAD_SORT,
        table: table,
        fieldSort: field
    })
};

