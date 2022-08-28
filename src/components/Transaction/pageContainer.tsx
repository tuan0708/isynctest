import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { Transaction } from './page';
import { orderSortChangeAction, updateListOrdersAction } from './actions/transaction';
import { refreshAccountSummaryAction } from '../AccountSummary/actions/accountSummary';

const mapStateToProps = (state: State, ownProps: any) => ({
  excessEquity: state.accountSummary.excessEquity,
  orders: state.accountSummary.orders,
  orderBasketTableSort: state.transaction.orderBasketTableSort,
  orderTableSort: state.transaction.orderTableSort,
  accountSummary: state.accountSummary.accountSummary
});

const mapDispatchToProps = (dispatch) => ({
  orderSortChange: (table, field) => dispatch(orderSortChangeAction(table, field)),
  updateListOrders: (userId, custody, subAcc, refreshClick) => dispatch(updateListOrdersAction(userId, custody, subAcc, refreshClick)),
  refreshAccountSummary: (userId, showLoading) => dispatch(refreshAccountSummaryAction(userId, showLoading))
});

export const TransactionContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Transaction);
