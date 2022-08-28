import { actionTypes } from '../../../common/constants/actionTypes';
import { getAllGroups, createGroup, editGroup, deleteGroup, getAllSubAccByGroupId, getAllSubAccByUserId, addSubAccount, deleteSubAccount } from '../../../api/isync';

export const initAccountManagerAction = (userId, custodyLink) => (dispatch) => {
    getAllGroups(userId).then(groups => {
        if(groups.s === 'ok'){
            if(groups.d.length){
                getAllSubAccByUserId(userId).then(allSubAccs => {
                    if(allSubAccs.s === 'ok')
                        dispatch(initAccountManagerCompleted(custodyLink, groups.d, allSubAccs.d));
                });
            } else {
                dispatch(initAccountManagerCompleted(custodyLink, [], []));
            }
        }
    });
}

const initAccountManagerCompleted = (custodyLink, groups, allSubAccs) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_DATA_INIT,
        custodyLink: custodyLink,
        groups: groups,
        allSubAccs: allSubAccs
    })
};

export const changeGroupAction = (groupId) => (dispatch) => {
    dispatch(changeGroupCompleted(groupId));
}

const changeGroupCompleted = (groupId) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_CHANGE_GROUP,
        groupSelected: groupId
    })
};

export const addGroupAction = (userId, groupName) => (dispatch) => {
    createGroup(userId, groupName).then(res => {
        if(res.s === 'ok'){
            $('#addGroupModal button.close').click();
            dispatch(addGroupCompleted({id: res.d, name: groupName, userid: userId}));
        }
    });
}

const addGroupCompleted = (groupObj) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_ADD_GROUP,
        groupObj: groupObj
    })
};

export const editGroupAction = (userId, groupId, groupName) => (dispatch) => {
    editGroup(userId, groupId, groupName).then(res => {
        if(res.s === 'ok'){
            $('#addGroupModal button.close').click();
            dispatch(editGroupCompleted(groupId, groupName));
        }
    });
}

const editGroupCompleted = (groupId, groupName) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_EDIT_GROUP,
        groupId: groupId,
        groupName: groupName
    })
};

export const deleteGroupAction = (userId, groupId) => (dispatch) => {
    deleteGroup(userId, groupId).then(res => {
        if(res.s === 'ok'){
            dispatch(deleteGroupCompleted(groupId));
        }
    });
}

const deleteGroupCompleted = (groupId) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_DELETE_GROUP,
        groupId: groupId
    })
};

export const addSubAccountAction = (userId, subAccObj) => (dispatch) => {
    addSubAccount(userId, subAccObj).then(res => {
        if(res.s === 'ok'){
            $('#addSubAccountModal button.close').click();
            dispatch(addSubAccountCompleted(subAccObj));
        }
    });
}

const addSubAccountCompleted = (subAccObj) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_ADD_SUBACCOUNT,
        subAccObj: subAccObj
    })
};

export const deleteSubAccountAction = (userId, subAccount) => (dispatch) => {
    deleteSubAccount(userId, subAccount).then(res => {
        if(res.s === 'ok'){
            dispatch(deleteSubAccountCompleted(subAccount));
        }
    });
}

const deleteSubAccountCompleted = (subAccount) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_DELETE_SUBACCOUNT,
        subAccount: subAccount
    })
};
//
export const changeGroupActionX = (groupId) => (dispatch) => {
    dispatch(changeGroupCompletedX(groupId));
}

const changeGroupCompletedX = (groupId) => {
    return ({
        type: actionTypes.ACCOUNTMANAGER_CHANGE_GROUP,
        groupSelected: groupId
    })
};