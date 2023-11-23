import request from "@/utils/request";
import {url} from "@/utils/url";

export function lojaList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/lojaAdmin/list",
        method:'get',
        params:query
    })
}

export function deleteLoja(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/lojaAdmin/"+mobile,
        method:'delete',
    })
}

export function addLoja(data){
    return request({
        url:url.game99PlatformAdminWeb+"/lojaAdmin/add",
        method:'post',
        data : data
    })
}

export function updateLoja(data){
    return request({
        url:url.game99PlatformAdminWeb+"/lojaAdmin/edit",
        method:'put',
        data : data
    })
}

export function getLoja(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/lojaAdmin/" + id,
        method: 'get'
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/lojaAdmin/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}