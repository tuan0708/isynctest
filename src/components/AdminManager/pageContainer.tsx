import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../reducers';
import { AdminManager } from './page';
import { initAdminManagerAction, addAccountAction, editAccountAction, deleteAccountAction, resetPassAccountAction} from './actions/adminManager';

const mapStateToProps = (state: State, ownProps: any) => ({
  accounts : state.adminManager.accounts
});

const mapDispatchToProps = (dispatch) => ({
  initAdminManager: (userId) => dispatch(initAdminManagerAction(userId)),
  addAccount: ( userId, name, phone, email,pass) => dispatch(addAccountAction(userId, name, phone, email,pass )),
  editAccount: (userId, id, name, phone, email) => dispatch(editAccountAction(userId, id, name, phone, email)),
  deleteAccount: (userId, id) => dispatch(deleteAccountAction(userId, id)),
  resetPassAccount: (userId, id, phone) => dispatch(resetPassAccountAction(userId, id, phone)),
});

export const AdminManagerContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdminManager);
