import request from "@/utils/request";
import {url} from "@/utils/url";

export function withdrawalLimitList(query){
    return request({
        url:url.game99PayAdminWeb+"/withdrawalLimitAdmin/list",
        method:'get',
        params:query
    })
}

export function withdrawalLimitVipLevels(){
    return request({
        url:url.game99PayAdminWeb+"/withdrawalLimitAdmin/vipLevels",
        method:'get'
    })
}

export function deleteWithdrawalLimit(ids){
    return request({
        url:url.game99PayAdminWeb+"/withdrawalLimitAdmin/"+ids,
        method:'delete',
    })
}

export function addWithdrawalLimit(data){
    return request({
        url:url.game99PayAdminWeb+"/withdrawalLimitAdmin/add",
        method:'post',
        data : data
    })
}

export function updateWithdrawalLimit(data){
    return request({
        url:url.game99PayAdminWeb+"/withdrawalLimitAdmin/edit",
        method:'put',
        data : data
    })
}

export function getWithdrawalLimit(id) {
    return request({
        url: url.game99PayAdminWeb + "/withdrawalLimitAdmin/" + id,
        method: 'get'
    })
}