import request from "@/utils/request";
import {url} from "@/utils/url";

export function lojaList(query){
    return request({
        url:url.game99PayAdminWeb+"/lojaAdmin/list",
        method:'get',
        params:query
    })
}

export function deleteLoja(mobile){
    return request({
        url:url.game99PayAdminWeb+"/lojaAdmin/"+mobile,
        method:'delete',
    })
}

export function addLoja(data){
    return request({
        url:url.game99PayAdminWeb+"/lojaAdmin/add",
        method:'post',
        data : data
    })
}

export function updateLoja(data){
    return request({
        url:url.game99PayAdminWeb+"/lojaAdmin/edit",
        method:'put',
        data : data
    })
}

export function getLoja(id) {
    return request({
        url: url.game99PayAdminWeb + "/lojaAdmin/" + id,
        method: 'get'
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PayAdminWeb + '/lojaAdmin/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}