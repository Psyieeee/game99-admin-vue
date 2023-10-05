import request from "@/utils/request";
import {url} from "@/utils/url";

export function rechargeCommissionListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/rechargeCommission/list",
        method:'get',
        params:query
    })
}

export function deleteRecharge(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/rechargeCommission/"+mobile,
        method:'delete',
    })
}

export function addRechargeData(data){
    return request({
        url:url.game99PlatformAdminWeb+"/rechargeCommission/add",
        method:'post',
        data : data
    })
}

export function updateRechargeInfo(data){
    return request({
        url:url.game99PlatformAdminWeb+"/rechargeCommission/edit",
        method:'post',
        data : data
    })
}

export function getRechargeInfo(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/rechargeCommission/" + id,
        method: 'get'
    })
}