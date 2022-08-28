import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { AccountManager } from './page';
import { initAccountManagerAction, addGroupAction, editGroupAction, deleteGroupAction, changeGroupAction, addSubAccountAction, deleteSubAccountAction } from './actions/accountManager';
import { refreshAccountSummaryAction, subAccountUncheckedAction, subAccountCheckedAction } from '../AccountSummary/actions/accountSummary';

const mapStateToProps = (state: State, ownProps: any) => ({
  custodyLink: state.accountManager.custodyLink,
  groups: state.accountManager.groups,
  groupSelected: state.accountManager.groupSelected,
  allSubAccs: state.accountManager.allSubAccs
});

const mapDispatchToProps = (dispatch) => ({
  initAccountManager: (userId, custodyLink) => dispatch(initAccountManagerAction(userId, custodyLink)),
  changeGroup: (groupId) => dispatch(changeGroupAction(groupId)),
  addGroup: (userId, groupName) => dispatch(addGroupAction(userId, groupName)),
  editGroup: (userId, groupId, groupName) => dispatch(editGroupAction(userId, groupId, groupName)),
  deleteGroup: (userId, groupId) => dispatch(deleteGroupAction(userId, groupId)),
  addSubAccount: (userId, subAccObj) => dispatch(addSubAccountAction(userId, subAccObj)),
  deleteSubAccount: (userId, subAccount) => dispatch(deleteSubAccountAction(userId, subAccount)),
  refreshAccountSummary: (userId, showLoading) => dispatch(refreshAccountSummaryAction(userId, showLoading)),
  subAccountChecked: (userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked) => dispatch(subAccountCheckedAction(userId, custody, subAcc, subAccName, groupId, checkedQtty, isInit, isChecked)),
  subAccountUnchecked: (userId, groupId, subAcc, isSave) => dispatch(subAccountUncheckedAction(userId, groupId, subAcc, isSave)),
});

export const AccountManagerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountManager);
