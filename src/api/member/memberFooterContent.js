import {url} from "@/utils/url";
import request from "@/utils/request";

export function footerListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/footerContent/list",
        method:'get',
        params:query
    })
}

export function deleteFooter(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/footerContent/"+mobile,
        method:'delete',
    })
}

export function addFooter(data){
    return request({
        url:url.game99PlatformAdminWeb+"/footerContent/add",
        method:'post',
        data : data
    })
}

export function updateFooter(data){
    return request({
        url:url.game99PlatformAdminWeb+"/footerContent/edit",
        method:'put',
        data : data
    })
}