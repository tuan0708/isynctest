import { actionTypes } from '../../../common/constants/actionTypes';
import { getOrders } from '../../../api/accounts';

export const updateListOrdersAction = (userId, custody, subAcc, refreshClick) => (dispatch) => {
    if(refreshClick)
        $('#orderPanelLoading').show();
    getOrders(userId, custody, subAcc).then(res => {
        $('#orderPanelLoading').hide();
        if(res.s === 'ok' && res.d.length){
            dispatch(updateListOrdersCompleted(subAcc, res.d));
        }
    })
}

const updateListOrdersCompleted = (subAcc, orders) => {
    return ({
        type: actionTypes.TRANSACTION_UPDATE_LIST_ORDERS,
        subAccount: subAcc,
        orders: orders
    })
};

export const orderSortChangeAction = (table, field) => (dispatch) => {
    dispatch(orderSortChangeCompleted(table, field));
}

const orderSortChangeCompleted = (table, field) => {
    return ({
        type: actionTypes.TRANSACTION_ORDER_SORT,
        tableSort: table,
        fieldSort: field
    })
};