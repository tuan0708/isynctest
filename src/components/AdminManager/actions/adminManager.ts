import { actionTypes } from '../../../common/constants/actionTypes';
import { getAllAccounts,addAccount, editAccount, deleteAccount, resetPassAccount } from '../../../api/isync';

export const initAdminManagerAction = (userId) => (dispatch) => {
    getAllAccounts(userId).then(groups => {
        if(groups.s === 'ok'){
            if(groups.d.length){
                dispatch(initAdminManagerCompleted(groups.d));
            } else {
            }
        }
    });
}

const initAdminManagerCompleted = (accounts) => {
    return ({
        type: actionTypes.ADMINMANAGER_DATA_INIT,
        accounts : accounts
    })
};

export const addAccountAction = (userId, name, phone, email,pass) => (dispatch) => {
    addAccount(userId, name, phone, email,pass).then(account => {
        if(account.s === 'ok'){
                $('#addAccountModal button.close').click();
                dispatch(addAccountCompleted({ id: account.d, name: name, phone:phone, email:email, password: ''}));
        }
    });
}

const addAccountCompleted = (accountOjb) => {
    // console.log(accountOjb)
    return ({
        type: actionTypes.ADMINMANAGER_ADD_ACCOUNT,
        accountObj: accountOjb
    })
};

export const editAccountAction = (userId, id, name, phone, email) => (dispatch) => {
    editAccount(userId, id, name, phone, email).then(groups => {
        if(groups.s === 'ok'){
                $('#addAccountModal button.close').click();
                dispatch(editAccountCompleted(id,name, phone, email));
        }
    });
}

const editAccountCompleted = (id,name, phone, email) => {
    return ({
        type: actionTypes.ADMINMANAGER_EDIT_ACCOUNT,
        id:id,
        name: name,
        email: email,
        phone:phone
    })
};

export const deleteAccountAction = (userId, id) => (dispatch) => {
    deleteAccount(userId, id).then(groups => {
        if(groups.s === 'ok'){
                $('#addAccountModal button.close').click();
                dispatch(deleteAccountCompleted(id));
        }
    });
}

const deleteAccountCompleted = (id) => {
    return ({
        type: actionTypes.ADMINMANAGER_DELETE_ACCOUNT,
        id:id
    })
};

export const resetPassAccountAction = (userId, id, phone) => (dispatch) => {
    resetPassAccount(userId, id, phone).then(groups => {
        if(groups.s === 'ok'){
                dispatch(resetPassAccountCompleted(id, phone));
        }
    });
}

const resetPassAccountCompleted = (id, phone) => {
    return ({
        type: actionTypes.ADMINMANAGER_RESETPASS_ACCOUNT,
        id:id,
        phone: phone
    })
};