import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/settings/bonus/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(id){
    return request({
        url:url.game99PlatformAdminWeb+"/settings/bonus/"+id,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/settings/bonus/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/settings/bonus/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/settings/bonus/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/settings/bonus/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}