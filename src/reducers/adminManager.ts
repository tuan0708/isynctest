import { AdminManager } from "../model";
import { actionTypes } from "../common/constants/actionTypes";

const createEmptyAdminManager = (): AdminManager => ({
    accounts : []
});

export const adminManagerReducer = (state = createEmptyAdminManager(), action) => {
    switch (action.type) {
        case actionTypes.ADMINMANAGER_DATA_INIT:
            return handleInitAdminManagerAction(state, action.accounts);
        case actionTypes.ADMINMANAGER_ADD_ACCOUNT:
            return handleAddAccountAction(state, action.accountObj);
        case actionTypes.ADMINMANAGER_EDIT_ACCOUNT:
            return handleEditAccountAction(state, action.id, action.name, action.email, action.phone);
        case actionTypes.ADMINMANAGER_DELETE_ACCOUNT:
            return handleDeleteAccountAction(state, action.id);
        case actionTypes.ADMINMANAGER_RESETPASS_ACCOUNT:
            return handleResetPassAccountAction(state);
    }
    return state;
}

const handleInitAdminManagerAction = (state: AdminManager = createEmptyAdminManager(), accounts): AdminManager => {
    return {
        ...state,
        accounts : accounts
    };
};

const handleAddAccountAction = (state: AdminManager = createEmptyAdminManager(), accountObj): AdminManager => {
    var tmp = [...state.accounts];
    tmp.push(accountObj)
    return {
        ...state,
        accounts: tmp
    };
};

const handleEditAccountAction = (state: AdminManager = createEmptyAdminManager(),id, name, email,phone): AdminManager => {
    var tmp = [...state.accounts];
    tmp.find(g => g.id === id).name = name;
    tmp.find(g => g.id === id).email = email;
    tmp.find(g => g.id === id).phone = phone;
    return {
        ...state,
        accounts: tmp
    };
};

const handleDeleteAccountAction = (state: AdminManager = createEmptyAdminManager(),id): AdminManager => {
    var tmp = [...state.accounts];
    tmp.splice(tmp.findIndex(g => g.id === id), 1);
    return {
        ...state,
        accounts: tmp,
    };
};

const handleResetPassAccountAction = (state: AdminManager = createEmptyAdminManager()): AdminManager => {
    return {
        ...state,
    };
};