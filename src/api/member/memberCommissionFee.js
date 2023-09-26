import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function commissionFeeListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee/list",
        method:'get',
        params:query
    })
}

export function getCommissionFeeData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee/" + id,
        method:'get'
    })
}

/** 导出列表 export data*/
export function exportMemberCommissionFee(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addCommissionFee(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateCommissionFee(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteCommissionFee(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/member/commissionFee/"+mobile,
        method:'delete',
    })
}

export function changeCommissionFeeStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/commissionFee/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}


