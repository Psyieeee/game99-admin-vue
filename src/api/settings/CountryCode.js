import request from "@/utils/request";
import {url} from "@/utils/url";

export function countryCodeList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/countryCode/list",
        method:'get',
        params:query
    })
}

export function deleteCountryCode(id){
    return request({
        url:url.game99PlatformAdminWeb+"/countryCode/"+id,
        method:'delete',
    })
}

export function addCountryCode(data){
    return request({
        url:url.game99PlatformAdminWeb+"/countryCode/add",
        method:'post',
        data : data
    })
}

export function updateCountryCode(data){
    return request({
        url:url.game99PlatformAdminWeb+"/countryCode/edit",
        method:'put',
        data : data
    })
}

export function getCountryCode(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/countryCode/" + id,
        method: 'get'
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/countryCode/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}