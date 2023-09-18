import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function memberReferralListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/list/",
        method:'get',
        params:query
    })
}

export function getMemberReferralData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/" + id,
        method:'get'
    })
}

/** 导出列表 export data*/
export function exportMemberReferral(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addMemberReferral(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateMemberReferral(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteMemberReferral(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/"+mobile,
        method:'delete',
    })
}

export function changeMemberReferralStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberReferral/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function getScheduledCommissionTime() {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberReferral/getCommissionTime/',
        method: 'post',
    })
}

export function updateScheduledCommissionTime(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberReferral/updateCommissionTime/',
        method: 'put',
        data : data
    })
}
