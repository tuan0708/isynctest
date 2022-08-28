import { combineReducers } from 'redux';
import { AccountManager, AccountSummary, Transaction, Header, AdminManager } from '../model';
import { accountManagerReducer } from './accountManager';
import { accountSummaryReducer } from './accountSummary';
import { transactionReducer } from './transaction';
import { adminManagerReducer } from './adminManager';

export interface State {
    accountManager: AccountManager,
    accountSummary: AccountSummary,
    transaction: Transaction,
    adminManager : AdminManager
};

export const state = combineReducers<State>({
    accountManager: accountManagerReducer,
    accountSummary: accountSummaryReducer,
    transaction: transactionReducer,
    adminManager : adminManagerReducer
});
