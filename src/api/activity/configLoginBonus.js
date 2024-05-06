import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/configLoginBonus/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(id){
    return request({
        url:url.game99PlatformAdminWeb+"/configLoginBonus/"+id,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configLoginBonus/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configLoginBonus/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/configLoginBonus/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/configLoginBonus/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}

export function changeLimitYun163(id, limitYun163) {
    return request({
        url: url.game99PlatformAdminWeb + "/configLoginBonus/changeLimitYun163/" + id + "/" + limitYun163,
        method: 'put'
    })
}