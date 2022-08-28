import { AccountManager } from "../model";
import { actionTypes } from "../common/constants/actionTypes";

const createEmptyAccountManager = (): AccountManager => ({
    custodyLink: [],
    groups: [],
    groupSelected: null,
    allSubAccs: [],
});

export const accountManagerReducer = (state = createEmptyAccountManager(), action) => {
    switch (action.type) {
        case actionTypes.ACCOUNTMANAGER_DATA_INIT:
            return handleInitAccountManagerAction(state, action.custodyLink, action.groups, action.allSubAccs);
        case actionTypes.ACCOUNTMANAGER_CHANGE_GROUP:
            return handleChangeGroupAction(state, action.groupSelected);
        case actionTypes.ACCOUNTMANAGER_ADD_GROUP:
            return handleAddGroupAction(state, action.groupObj);
        case actionTypes.ACCOUNTMANAGER_EDIT_GROUP:
            return handleEditGroupAction(state, action.groupId, action.groupName);
        case actionTypes.ACCOUNTMANAGER_DELETE_GROUP:
            return handleDeleteGroupAction(state, action.groupId);
        case actionTypes.ACCOUNTMANAGER_ADD_SUBACCOUNT:
            return handleAddSubAccountAction(state, action.subAccObj);
        case actionTypes.ACCOUNTMANAGER_DELETE_SUBACCOUNT:
            return handleDeleteSubAccountAction(state, action.subAccount);
    }
    return state;
}

const handleInitAccountManagerAction = (state: AccountManager = createEmptyAccountManager(), custodyLink, groups, allSubAccs): AccountManager => {
    return {
        ...state,
        custodyLink: custodyLink,
        groups: groups,
        groupSelected: groups.length ? groups[0].id : null,
        allSubAccs: allSubAccs
    };
};

const handleChangeGroupAction = (state: AccountManager = createEmptyAccountManager(), groupSelected): AccountManager => {
    return {
        ...state,
        groupSelected: groupSelected
    };
};

const handleAddGroupAction = (state: AccountManager = createEmptyAccountManager(), groupObj): AccountManager => {
    var tmpGroups = [...state.groups];
    tmpGroups.push(groupObj);
    return {
        ...state,
        groupSelected: groupObj.id,
        groups: tmpGroups
    };
};

const handleEditGroupAction = (state: AccountManager = createEmptyAccountManager(), groupId, groupName): AccountManager => {
    var tmpGroups = [...state.groups];
    tmpGroups.find(g => g.id === groupId).name = groupName;
    return {
        ...state,
        groups: tmpGroups
    };
};

const handleDeleteGroupAction = (state: AccountManager = createEmptyAccountManager(), groupId): AccountManager => {
    var tmpGroups = [...state.groups];
    tmpGroups.splice(tmpGroups.findIndex(g => g.id === groupId), 1);
    var tmpAllSubAccs = [...state.allSubAccs];
    state.allSubAccs.forEach((itm, index) => {
        if (itm.groupid === groupId) {
            tmpAllSubAccs.splice(index, 1);
        }
    });
    return {
        ...state,
        groups: tmpGroups,
        groupSelected: tmpGroups.length ? tmpGroups[0].id : null,
        allSubAccs: tmpAllSubAccs
    };
};

const handleAddSubAccountAction = (state: AccountManager = createEmptyAccountManager(), subAccObj): AccountManager => {
    var tmpAllSubAccs = [...state.allSubAccs];
    tmpAllSubAccs.push(subAccObj);
    return {
        ...state,
        allSubAccs: tmpAllSubAccs
    };
};

const handleDeleteSubAccountAction = (state: AccountManager = createEmptyAccountManager(), subAccount): AccountManager => {
    var tmpAllSubAccs = [...state.allSubAccs];
    tmpAllSubAccs.splice(tmpAllSubAccs.findIndex(g => g.subaccount === subAccount), 1);
    return {
        ...state,
        allSubAccs: tmpAllSubAccs
    };
};