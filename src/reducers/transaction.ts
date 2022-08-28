import { Transaction } from "../model";
import { actionTypes } from "../common/constants/actionTypes";

const createEmptyTransaction = (): Transaction => ({
    orderAll: [],
    orderWorking: [],
    orderFilled: [],
    orderCancelled: [],
    orderRejected: [],
    orderBasketTableSort: { field: 'custody', isUp: true },
    orderTableSort: { field: 'custody', isUp: false }
});

export const transactionReducer = (state = createEmptyTransaction(), action) => {
    switch (action.type) {
        case actionTypes.TRANSACTION_ORDER_SORT:
            return handleOrderSortAction(state, action.tableSort, action.fieldSort);
    }
    return state;
}

const handleOrderSortAction = (state: Transaction = createEmptyTransaction(), tableSort, fieldSort): Transaction => {
    var tmpTheadSort;
    if (tableSort === 'orderBasket') {
        tmpTheadSort = { ...state.orderBasketTableSort };
    } else {
        tmpTheadSort = { ...state.orderTableSort };
    }
    if (tmpTheadSort.field === fieldSort) {
        tmpTheadSort.isUp = !tmpTheadSort.isUp;
    } else {
        tmpTheadSort.field = fieldSort;
        tmpTheadSort.isUp = true;
    }
    if (tableSort === 'orderBasket') {
        return {
            ...state,
            orderBasketTableSort: tmpTheadSort
        };
    }
    else {
        return {
            ...state,
            orderTableSort: tmpTheadSort
        };
    }

};