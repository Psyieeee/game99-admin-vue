import request from "@/utils/request";
import {url} from "@/utils/url";

export function configTranslationList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/configTranslation/list",
        method:'get',
        params:query
    })
}

export function deleteConfigTranslation(id){
    return request({
        url:url.game99PlatformAdminWeb+"/configTranslation/"+id,
        method:'delete',
    })
}

export function addConfigTranslation(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configTranslation/add",
        method:'post',
        data : data
    })
}

export function updateConfigTranslation(data){
    return request({
        url:url.game99PlatformAdminWeb+"/configTranslation/edit",
        method:'put',
        data : data
    })
}

export function getConfigTranslation(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/configTranslation/" + id,
        method: 'get'
    })
}