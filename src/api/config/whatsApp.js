import request from "@/utils/request.js";
import {url} from "@/utils/url.js";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/configWhatsApp/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(id){
    return request({
        url:url.game99PlatformAdminWeb+"/configWhatsApp/"+id,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configWhatsApp/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configWhatsApp/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/configWhatsApp/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/configWhatsApp/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}