import request from '@/utils/request'
import {url} from "@/utils/url";

/** 查询会员信息列表 Query member information list */
export function listMemberInfo(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/list',
        method: 'get',
        params: query
    })
}

/**  导出会员信息 Export member information */
export function exportMemberInfo(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**  查询会员信息详细 Query member information details by id */
export function getMemberInfo(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/' + id,
        method: 'get'
    })
}


/** 统计会员余额保险箱 Statistical member balance safe box */
export function listCountApi(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/listCount',
        method: 'get',
        params: query
    })
}

/** 会员完整手机号码查看 Member full mobile phone number view */
export function fullMobileData(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/fullMobile/' + id,
        method: 'get'
    })
}

/** 查询会员线上充值历史金额 Query member online recharge history amount */
export function getHistoryRecharges(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/getHistoryRecharge/' + id,
        method: 'get'
    })
}

 /**  新增会员信息 Add member information */
export function addMemberInfo(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo',
        method: 'post',
        data: data
    })
}

/**  修改用户状态 Modify user status */
export function changeStatus(memberId, status, googleAuthCode, remark) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/changeStatus/' + memberId,
        method: 'put',
        params: {status, googleAuthCode, remark}
    })
}

 /**  禁用用户 Disable user */
export function changeStatusBan(id, status, remark, googleAuthCode) {
    const data = {
        status: status,
        remark: remark,
        googleAuthCode: googleAuthCode
    }
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/changeStatus/' + id,
        method: 'put',
        params: data
    })
}


/** 重置密码接口 reset password interface */
export function resetPassword(memberId, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/resetPasswd/' + memberId,
        method: 'post',
        params: googleAuthCode
    })
}

export function memberResetPassword(memberId, passwd, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/resetPasswd/' + memberId,
        method: 'post',
        params: {passwd, googleAuthCode}
    })
}

/** 加分提交接口 Extra points submission interface */
export function addScore(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/addScore',
        method: 'post',
        data: data
    })
}

/** 会员信息发送 Member information sending */
export function sendMsgs(msg, memberId) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/sendMsg',
        method: 'post',
        data: {msg, memberId}
    })
}

/** 会员邀请码修改 Member invitation code modification */
export function updateInvitationCode(memberId, inviterCode, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/updateInviterCode/' + memberId,
        method: 'post',
        params: {inviterCode, googleAuthCode}
    })
}

/**  会员手机号码修改 Member mobile phone number modification */
export function updateMobileData(memberId,phone,newMobile,googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/updateMobile/' + memberId,
        method: 'post',
        data: {phone,newMobile,googleAuthCode}
    })
}


 /**  查询银行卡列表接口 Query bank card list interface */
export function cardListData({memberId, pageNum, pageSize}) {
    let params = {memberId, pageNum, pageSize}
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/card-list',
        method: 'get',
        params: params
    })
}

 /**  重置体现 reset embodiment */
export function resetBoxPasswd(memberId, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/resetBoxPasswd/' + memberId,
        method: 'post',
        params: googleAuthCode
    })
}


 /**  重置体现 reset embodiment resetTxPass */
export function resetWithdrawal(memberId, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/resetTxPass/' + memberId,
        method: 'post',
        params: googleAuthCode
    })
}

 /** 打码修复 code repair */
export function memberBcodeRepair(memberId, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/memberBcodeRepair/' + memberId,
        method: 'post',
        params: googleAuthCode
    })
}

 /**  打码修复 update vip */
export function updateVipData(memberId, vip) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/updateVip/' + memberId,
        method: 'post',
        params: {vip}
    })
}

export function unbindCard(id, memberId) {
    const data = {
        id: id,
        memberId: memberId
    }
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/unbindCard',
        method: 'put',
        data: data
    })
}

export function changeBankData(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/changeBank',
        method: 'put',
        data: data
    })
}

/**  修改备注 update email */
export function updateRemarks(memberId, remark) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/updateRemark/' + memberId,
        method: 'put',
        params: {remark}
    })
}

/**   personal Report data */
export function getPersonalReport(id, date) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/personal-report/' + id,
        method: 'get',
        params: date,
        timeout: 120000
    })
}

export function requestBoxDish(id, googleAuthCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/boxDish/' + id,
        method: 'post',
        params: googleAuthCode
    })
}

/** 查询禁止成员 By Ip接口 Query ban member By Ip interface */
export function ipBan(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/ban-ip',
        method: 'put',
        params: query
    })
}

 /** 修改会员信息 Modify member information */
export function updateMemberInfo(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo',
        method: 'put',
        data: data
    })
}

export function updateMemberCodeTotal(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/updateCodeTotal',
        method: 'put',
        data: data
    })
}

/** 查询会员登录地址 display address */
export function getMemberLoginAddress(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberInfo/getMemberLoginAddress/' + id,
        method: 'get'
    })
}

export function changeWithdrawStatus(id, withdrawStatus){
    return request({
        url: url.game99PlatformAdminWeb + "/member/memberInfo/changeWithdrawStatus/" + id + "/" + withdrawStatus,
        method: 'put'
    })
}
