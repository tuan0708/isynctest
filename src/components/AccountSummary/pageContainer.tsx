import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { AccountSummary } from './page';
import { subAccountCheckedAction, subAccountUncheckedAction, theadSortChangeAction, refreshAccountSummaryAction } from './actions/accountSummary';
import { onChangeStocksDataAction, initStocksDataAction } from './actions/stocksData';

const mapStateToProps = (state: State, ownProps: any) => ({
  theadAccSort: state.accountSummary.theadAccSort,
  theadAccSummarySort: state.accountSummary.theadAccSummarySort,
  groups: state.accountManager.groups.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)),
  allSubAccs: state.accountManager.allSubAccs,
  accountSummary: state.accountSummary.accountSummary
});

const mapDispatchToProps = (dispatch) => ({
  theadSortChange: (table, field) => dispatch(theadSortChangeAction(table, field)),
  subAccountChecked: (userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked) => dispatch(subAccountCheckedAction(userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked)),
  subAccountUnchecked: (userId, groupId, subAcc, isSave) => dispatch(subAccountUncheckedAction(userId, groupId, subAcc, isSave)),
  onChangeStocksData: (socket) => dispatch(onChangeStocksDataAction(socket)),
  initStockData: (socket) => dispatch(initStocksDataAction(socket)),
  refreshAccountSummary: (userId, showLoading) => dispatch(refreshAccountSummaryAction(userId, showLoading))
});

export const AccountSummaryContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountSummary);
