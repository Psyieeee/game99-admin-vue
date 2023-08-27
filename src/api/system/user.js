import request from '@/utils/request'
import {parseStrEmpty} from "@/utils/common";
import {url} from "@/utils/url";

// 查询用户列表
export function listUser(query) {
    return request({
        url: url.game99AdminWeb + '/system/user/list',
        method: 'get',
        params: query
    })
}

// 查询用户详细
export function getUser(userId) {
    return request({
        url: url.game99AdminWeb + '/system/user/' + parseStrEmpty(userId),
        method: 'get'
    })
}

// 新增用户
export function addUser(data) {
    return request({
        url: url.game99AdminWeb + '/system/user',
        method: 'post',
        data: data
    })
}

// 修改用户
export function updateUser(data) {
    return request({
        url: url.game99AdminWeb + '/system/user',
        method: 'put',
        data: data
    })
}

// 删除用户
export function delUser(userId) {
    return request({
        url: url.game99AdminWeb + '/system/user/' + userId,
        method: 'delete'
    })
}

// 用户密码重置
export function resetUserPwd(data) {
    return request({
        url: url.game99AdminWeb + '/system/user/resetPwd',
        method: 'put',
        data: data
    })
}

// 用户状态修改
export function changeUserStatus(userId, status) {
    const data = {
        userId,
        status
    }
    return request({
        url: url.game99AdminWeb + '/system/user/changeStatus',
        method: 'put',
        data: data
    })
}

// 查询用户个人信息
export function getUserProfile() {
    return request({
        url: url.game99AdminWeb + '/system/user/profile',
        method: 'get'
    })
}

// 修改用户个人信息
export function updateUserProfile(data) {
    return request({
        url: url.game99AdminWeb + '/system/user/profile',
        method: 'put',
        data: data
    })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
    const data = {
        oldPassword,
        newPassword
    }
    return request({
        url: url.game99AdminWeb + '/system/user/profile/updatePwd',
        method: 'put',
        params: data
    })
}

// 用户头像上传
export function uploadAvatar(data) {
    return request({
        url: url.game99AdminWeb + '/system/user/profile/avatar',
        method: 'post',
        data: data
    })
}

// 查询授权角色
export function getAuthRole(userId) {
    return request({
        url: url.game99AdminWeb + '/system/user/authRole/' + userId,
        method: 'get'
    })
}

// 保存授权角色
export function updateAuthRole(data) {
    return request({
        url: url.game99AdminWeb + '/system/user/authRole',
        method: 'put',
        params: data
    })
}

export function getOtpSecretQrcode(name) {
    const data = {
        name
    }
    return request({
        url: url.game99AdminWeb + '/system/user/getOtpSecretQrcode',
        method: 'get',
        params: data
    })
}

export function boundOtpSecret(otpAuthName, otpAuthKey, otpAuthCode) {
    const data = {
        otpAuthName,
        otpAuthKey,
        otpAuthCode
    }
    return request({
        url: url.game99AdminWeb + '/system/user/boundOtpSecret',
        method: 'post',
        data: data
    })
}

export function resetUserOtpSecret(userId, otpAuthCode) {
    const data = {
        userId,
        otpAuthCode
    }
    return request({
        url: url.game99AdminWeb + '/system/user/resetUserOtpSecret',
        method: 'delete',
        params: data
    })
}