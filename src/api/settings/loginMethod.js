import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/loginMethod/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(id){
    return request({
        url:url.game99PlatformAdminWeb+"/loginMethod/"+id,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/loginMethod/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/loginMethod/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/loginMethod/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/loginMethod/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}