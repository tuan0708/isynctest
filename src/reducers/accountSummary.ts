import { AccountSummary } from "../model";
import { actionTypes } from "../common/constants/actionTypes";
import { getLastPrice } from "../api/accounts";

const createEmptyAccountSummary = (): AccountSummary => ({
    accountSummary: [],
    excessEquity: [],
    orders: [],
    stocksData: [],
    theadAccSort: { field: 'name', isUp: true },
    theadAccSummarySort: { field: 'symbol', isUp: true }
});

export var lastStocksPrice = [];

export const accountSummaryReducer = (state = createEmptyAccountSummary(), action) => {
    switch (action.type) {
        case actionTypes.ACCOUNTSUMMARY_SUBACC_CHECKED:
            return handleSubAccountCheckedAction(state, action.custody, action.subAccount,
                action.subAccountName, action.positions, action.orders,
                action.balance, action.balancePS, action.vcashonhand, action.equity, action.excessEquity, action.liability,
                action.stocksPriceInit, action.kqYeuCau, action.tyTrong, action.pp, action.isChecked);
        case actionTypes.ACCOUNTSUMMARY_SUBACC_UNCHECKED:
            return handleSubAccountUncheckedAction(state, action.subAccount, false);
        case actionTypes.ACCOUNTSUMMARY_SUBACC_RECHECKED:
            return handleSubAccountUncheckedAction(state, action.subAccount, action.isChecked);
        case actionTypes.ACCOUNTSUMMARY_STOCKS_DATA_ONCHANGE:
            return handleOnChangeStocksDataCompleted(state, action.stocksOnChange);
        case actionTypes.ACCOUNTSUMMARY_THEAD_SORT:
            return handleTheadSortAction(state, action.table, action.fieldSort);
        case actionTypes.ACCOUNTSUMMARY_REFRESH:
            return handleRefreshAccountSummaryAction(state, action.subAccount,
                action.positions, action.balance, action.equity, action.excessEquity, action.liability, action.kqYeuCau, action.tyTrong, action.stocksDataPSInit, action.pp);
        case actionTypes.TRANSACTION_UPDATE_LIST_ORDERS:
            return handleUpdateListOrdersAction(state, action.subAccount, action.orders);
    }
    return state;
}

const handleSubAccountCheckedAction = (state: AccountSummary = createEmptyAccountSummary(), custody,
    subAccount, subAccountName, positions, orders, balance, balancePS, vcashonhand, equity, excessEquity, liability,
    stocksPriceInit, kqYeuCau, tyTrong, pp, isChecked): AccountSummary => {
    lastStocksPrice = stocksPriceInit;
    var tmpAccountSummary = [...state.accountSummary];
    var tmpExcessEquity = [...state.excessEquity];
    var tmpOrders = [...state.orders];
    var positionsMarketValue = 0;
    var nav = 0;
    positions.forEach(el => {
        var tmpPositionMarketValue = (el.totalQty * el.lastPrice);
        positionsMarketValue += tmpPositionMarketValue;
        nav += tmpPositionMarketValue;
    });

    balance = Math.round(balance);
    balancePS = Math.round(balancePS);
    equity = Math.round(equity);
    excessEquity = Math.round(excessEquity);
    liability = Math.round(liability);
    nav += balance - liability;
    tmpAccountSummary.push({
        custody: custody,
        subAccount: subAccount,
        subAccountName: subAccountName,
        positions: positions,
        positionsMarketValue: positionsMarketValue,
        balance: balance,
        balancePS: balancePS,
        vcashonhand: vcashonhand,
        equity: equity,
        excessEquity: excessEquity,
        liability: liability,
        nav: nav,
        kqYeuCau: kqYeuCau,
        tyTrong: tyTrong,
        pp: pp,
        isChecked: isChecked
    });
    tmpExcessEquity.push({
        custody: custody,
        subAccount: subAccount,
        subAccountName: subAccountName,
        positions: positions,
        excessEquity: excessEquity,
        equity: equity,
        nav: nav,
        isChecked: isChecked
    });
    tmpOrders.push({
        custody: custody,
        subAccount: subAccount,
        orders: orders,
        isChecked: isChecked
    });
    return {
        ...state,
        accountSummary: tmpAccountSummary,
        excessEquity: tmpExcessEquity,
        orders: tmpOrders
    };
};

const handleSubAccountUncheckedAction = (state: AccountSummary = createEmptyAccountSummary(), subAccount, isChecked): AccountSummary => {
    var tmpAccountSummary = [...state.accountSummary];
    var tmpExcessEquity = [...state.excessEquity];
    var tmpOrders = [...state.orders];
    var tmpAccountSummaryIndex = tmpAccountSummary.findIndex(as => as.subAccount === subAccount);
    if (tmpAccountSummaryIndex >= 0) {
        tmpAccountSummary[tmpAccountSummaryIndex].isChecked = isChecked;
        tmpExcessEquity[tmpAccountSummaryIndex].isChecked = isChecked;
        tmpOrders[tmpAccountSummaryIndex].isChecked = isChecked;
    }
    return {
        ...state,
        accountSummary: tmpAccountSummary,
        excessEquity: tmpExcessEquity,
        orders: tmpOrders
    };
};

const handleOnChangeStocksDataCompleted = (state: AccountSummary = createEmptyAccountSummary(), stocksOnChange: any): AccountSummary => {
    var stockPriceObj, positionObj, lastPrice, isNeedUpdate = false;
    var tmpAccountSummary = [...state.accountSummary];
    var tmpExcessEquity = [...state.excessEquity];
    tmpAccountSummary.forEach((accSum, index) => {
        lastPrice = 0;
        stocksOnChange.forEach(itm => {
            if (itm.match_price.val !== '' && itm.match_price.val !== 0) {
                positionObj = accSum.positions.find(el => el.instrument === itm.symbol
                    || (el.instrument.includes("_WFT") && itm.symbol === el.instrument.substr(0, el.instrument.length - 4)));
                lastPrice = itm.market === 'deri' ? itm.match_price.val : (itm.match_price.val * 1000);
                if (positionObj !== undefined && positionObj.lastPrice !== lastPrice) {
                    isNeedUpdate = true;
                    positionObj.lastPrice = lastPrice;
                }
                stockPriceObj = lastStocksPrice.find(el => el.symbol === itm.symbol);
                if (stockPriceObj !== undefined) {
                    stockPriceObj['price'] = lastPrice;
                }
            }
        });
        accSum.nav = 0;
        accSum.positionsMarketValue = 0;
        accSum.positions.forEach(el => {
            var tmpPositionMarketValue = (el.totalQty * el.lastPrice);
            accSum.nav += tmpPositionMarketValue;
            accSum.positionsMarketValue += tmpPositionMarketValue;
        });
        accSum.nav += accSum.balance - accSum.liability;
        tmpExcessEquity[index].nav = accSum.nav;
    });

    if (isNeedUpdate) {
        return {
            ...state,
            accountSummary: tmpAccountSummary,
            excessEquity: tmpExcessEquity
        }
    } else {
        return state;
    }
};

const handleTheadSortAction = (state: AccountSummary = createEmptyAccountSummary(), table, fieldSort): AccountSummary => {
    if (table === 'account') {
        var tmpTheadSort = { ...state.theadAccSort }
        if (tmpTheadSort.field === fieldSort) {
            tmpTheadSort.isUp = !tmpTheadSort.isUp;
        } else {
            tmpTheadSort.field = fieldSort;
            tmpTheadSort.isUp = true;
        }
        return {
            ...state,
            theadAccSort: tmpTheadSort
        };
    } else {
        var tmpTheadSort = { ...state.theadAccSummarySort }
        if (tmpTheadSort.field === fieldSort) {
            tmpTheadSort.isUp = !tmpTheadSort.isUp;
        } else {
            tmpTheadSort.field = fieldSort;
            tmpTheadSort.isUp = true;
        }
        return {
            ...state,
            theadAccSummarySort: tmpTheadSort
        };
    }
};

const handleRefreshAccountSummaryAction = (state: AccountSummary = createEmptyAccountSummary(),
    subAccount, positions, balance, equity, excessEquity, liability, kqYeuCau, tyTrong, stocksDataPSInit, pp): AccountSummary => {
    var tmpAccountSummary = [...state.accountSummary];
    var tmpExcessEquity = [...state.excessEquity];
    var nav = 0;
    kqYeuCau = 0;
    tyTrong = 0;

    // var date = new Date(), now = date.getTime(), time1 = date.setHours(15, 0, 0);
    // var date1 = new Date(time1);
    // date1.setHours(date1.getHours() + 18);
    // var time2 = date1.getTime();
    // if (time1 < now && now < time2) {
    //     positions.forEach(itm => {
    //         // debugger
    //         var stockPriceObj = stocksDataPSInit.find(el => el.symbol === itm.instrument
    //             || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
    //         if (stockPriceObj !== undefined) {
    //             // debugger
    //             itm['lastPrice'] = stockPriceObj.match_price.val;
    //             var kqYeuCau1 = Number((stockPriceObj.match_price.val * itm['qty'] * (13 / 0.7 / 100) * 100000).toFixed(0));
    //             var tyTrong1 = (kqYeuCau1 / balance) * 100;
    //             kqYeuCau += kqYeuCau1;
    //             tyTrong += tyTrong1;
    //         }
    //         else {
    //             var stockPriceObj = lastStocksPrice.find(el => el.symbol === itm.instrument
    //                 || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
    //             if (stockPriceObj !== undefined) {
    //                 // debugger
    //                 itm['lastPrice'] = stockPriceObj['price'];
    //                 var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (13 / 0.7 / 100) * 100000).toFixed(0));
    //                 var tyTrong1 = (kqYeuCau1 / balance) * 100;
    //                 kqYeuCau += kqYeuCau1;
    //                 tyTrong += tyTrong1;
    //             }
    //         }
    //     });
    // }
    // else {
    //     if (lastStocksPrice.length) {
    //         positions.forEach(itm => {
    //             var stockPriceObj = lastStocksPrice.find(el => el.symbol === itm.instrument
    //                 || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
    //             if (stockPriceObj !== undefined) {
    //                 // debugger
    //                 itm['lastPrice'] = stockPriceObj['price'];
    //                 var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (13 / 0.7 / 100) * 100000).toFixed(0));
    //                 var tyTrong1 = (kqYeuCau1 / balance) * 100;
    //                 kqYeuCau += kqYeuCau1;
    //                 tyTrong += tyTrong1;
    //             }
    //         });
    //     }
    // }

    if (lastStocksPrice.length) {
        positions.forEach(itm => {
            var stockPriceObj = lastStocksPrice.find(el => el.symbol === itm.instrument
                || (itm.instrument.includes("_WFT") && el.symbol === itm.instrument.substr(0, itm.instrument.length - 4)));
            if (stockPriceObj !== undefined) {
                itm['lastPrice'] = stockPriceObj['price'];
                var kqYeuCau1 = Number((stockPriceObj['price'] * itm['qty'] * (itm['imrate'] / itm['rsafe'] / 100) * 100000).toFixed(0));
                var tyTrong1 = (kqYeuCau1 / balance) * 100;
                kqYeuCau += kqYeuCau1;
                tyTrong += tyTrong1;
            }
            nav += (itm.totalQty * itm.lastPrice);
        });
    }

    balance = Math.round(balance);
    equity = Math.round(equity);
    excessEquity = Math.round(excessEquity);
    liability = Math.round(liability);
    var tmpAccountSummaryIndex = tmpAccountSummary.findIndex(a => a.subAccount === subAccount);
    if (tmpAccountSummaryIndex >= 0) {
        tmpAccountSummary[tmpAccountSummaryIndex].positions = positions;
        tmpAccountSummary[tmpAccountSummaryIndex].balance = balance;
        tmpAccountSummary[tmpAccountSummaryIndex].kqYeuCau = kqYeuCau;
        tmpAccountSummary[tmpAccountSummaryIndex].tyTrong = tyTrong;
        tmpAccountSummary[tmpAccountSummaryIndex].equity = equity;
        tmpAccountSummary[tmpAccountSummaryIndex].excessEquity = excessEquity;
        tmpAccountSummary[tmpAccountSummaryIndex].liability = liability;
        tmpAccountSummary[tmpAccountSummaryIndex].nav = nav + balance - liability;

        tmpExcessEquity[tmpAccountSummaryIndex].positions = positions;
        tmpExcessEquity[tmpAccountSummaryIndex].excessEquity = excessEquity;
        tmpExcessEquity[tmpAccountSummaryIndex].equity = equity;
        tmpExcessEquity[tmpAccountSummaryIndex].nav = tmpAccountSummary[tmpAccountSummaryIndex].nav;
    }
    return {
        ...state,
        accountSummary: tmpAccountSummary,
        excessEquity: tmpExcessEquity
    };
};

const handleUpdateListOrdersAction = (state: AccountSummary = createEmptyAccountSummary(), subAccount, orders): AccountSummary => {
    var tmpOrders = [...state.orders];
    var orderObj = tmpOrders.find(o => o.subAccount === subAccount);
    if (orderObj !== undefined)
        orderObj.orders = orders;
    return {
        ...state,
        orders: tmpOrders
    };
};