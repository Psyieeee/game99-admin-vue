import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/layoutConfig/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(id){
    return request({
        url:url.game99PlatformAdminWeb+"/layoutConfig/"+id,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/layoutConfig/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/layoutConfig/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/layoutConfig/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/layoutConfig/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/layoutConfig/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}