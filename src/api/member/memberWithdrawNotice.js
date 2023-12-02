import {url} from "@/utils/url";
import request from "@/utils/request";

export function list(data){
    return request({
        url: url.game99PayAdminWeb+"/pay/memberWithdrawNotice/list",
        method: 'post',
        data: data
    })
}

export function add(data){
    return request({
        url: url.game99PayAdminWeb+"/pay/memberWithdrawNotice/add",
        method: 'post',
        data: data
    })
}

export function edit(data){
    return request({
        url: url.game99PayAdminWeb+"/pay/memberWithdrawNotice/edit",
        method: 'patch',
        data: data
    })
}

export function enableConfig(id) {
    return request({
        url: url.game99PayAdminWeb+"/pay/memberWithdrawNotice/enableConfig/" + id,
        method: 'patch'
    })
}

export function deleteConfig(id) {
    return request({
        url: url.game99PayAdminWeb+"/pay/memberWithdrawNotice/delete/"+id,
        method: 'delete'
    })
}