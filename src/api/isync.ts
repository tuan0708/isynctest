import Cookies from 'js-cookie';

const header = {
    'XSRF-TOKEN': Cookies.get('isync_xsrf_token'),
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8'
}

/* Auth */
export function checkSession() {
    return fetch(location.origin + '/isync/checkSession',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function refreshCaptcha() {
    return fetch(location.origin + '/isync/refreshCaptcha',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function login(username, password, captcha) {
    return fetch(location.origin + '/isync/login',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                username: username,
                password: password,
                captcha: captcha
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function verifyOTP(userObj, otp) {
    return fetch(location.origin + '/isync/verifyOTP',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userObj: userObj,
                otp: otp
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function refreshOTP(phone) {
    return fetch(location.origin + '/isync/refreshOTP',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                phone: phone
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function changePass(userId, oldPass, newPass) {
    return fetch(location.origin + '/isync/changePass',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                oldPass: oldPass,
                newPass: newPass
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
/* End Auth */

/* Custody Link */
export function getCustodyLink(userId, isAddNew = false) {
    return fetch(location.origin + '/isync/custodyLink?userId=' + userId + '&isAddNew=' + isAddNew,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}

export function deleteCustodyLink(userId, custody) {
    return fetch(location.origin + '/isync/deleteCustodyLink',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                custody: custody
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
/* End Custody Link */

/* Group */
export function getAllGroups(userId) {
    return fetch(location.origin + '/isync/getAllGroups?userId=' + userId,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function createGroup(userId, groupName) {
    return fetch(location.origin + '/isync/createGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                groupName: groupName
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function editGroup(userId, groupId, groupName) {
    return fetch(location.origin + '/isync/editGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                groupId: groupId,
                groupName: groupName
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function deleteGroup(userId, groupId) {
    return fetch(location.origin + '/isync/deleteGroup',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                groupId: groupId
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function getAllSubAccByGroupId(userId, groupId) {
    return fetch(location.origin + '/isync/getAllSubAccByGroupId?groupId=' + groupId + '&userId=' + userId,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function getAllSubAccByUserId(userId) {
    return fetch(location.origin + '/isync/getAllSubAccByUserId?userId=' + userId,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function addSubAccount(userId, subAccObj) {
    return fetch(location.origin + '/isync/addSubAccount',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                subAccount: subAccObj.subaccount,
                groupId: subAccObj.groupid,
                custody: subAccObj.custody,
                customerName: subAccObj.customername,
                subAccountName: subAccObj.subaccountname
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
export function deleteSubAccount(userId, subAccount) {
    return fetch(location.origin + '/isync/deleteSubAccount',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                subAccount: subAccount
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            return res
        })
}
/* End Group */

/* SubAccount checked */
export function getSubAccountChecked(userId) {
    return fetch(location.origin + '/isync/subAccountChecked?userId=' + userId,
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
}

export function getAllAccounts(userId) {
    return fetch(location.origin + '/isync/getAllAccounts?userId=' + userId,
        {
            method: 'GET',
            headers: header,
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}
export function postSubAccountChecked(userId, groupId, subAccount, custody, subAccountName) {
    return fetch(location.origin + '/isync/subAccountChecked',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                groupId: groupId,
                subAccount: subAccount,
                custody: custody,
                subAccountName: subAccountName
            })
        })
        .then(function (response) {
            return response.json();
        })
}

export function postSubAccountUnchecked(userId, groupId, subAccount) {
    return fetch(location.origin + '/isync/subAccountUnchecked',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                groupId: groupId,
                subAccount: subAccount
            })
        })
        .then(function (response) {
            return response.json();
        })
}

/* End SubAccount checked */

export function getPositionsIntraday(userId) {
    header['UserId'] = userId;
    return fetch(location.origin + '/isync/positionsIntraday',
        {
            method: 'GET',
            headers: header
        })
        .then(function (response) {
            return response.json();
        })
        .then((res) => {
            // console.log(res);
            return res;
        })
}

/* Admin */
export function addAccount(userId, name, phone, email, pass) {
    return fetch(location.origin + '/isync/CreateUser',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                email: email,
                phone: phone,
                password: pass,
                name: name
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}

export function editAccount(userId, id, name, phone, email) {
    return fetch(location.origin + '/isync/EditUser',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                id: id,
                email: email,
                phone: phone,
                name: name
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}

export function deleteAccount(userId, id) {
    return fetch(location.origin + '/isync/DeleteUser',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                id: id
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}

export function resetPassAccount(userId, id, phone) {
    return fetch(location.origin + '/isync/resetPassUser',
        {
            method: 'POST',
            headers: header,
            body: JSON.stringify({
                userId: userId,
                id: id,
                phone: phone
            })
        })
        .then(function (response) {
            return response.json()
        })
        .then((res) => {
            return res
        })
}
/* End Admin */

