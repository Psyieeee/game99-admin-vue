import {url} from "@/utils/url";
import request from "@/utils/request";

export function footerListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/footerConfig/list",
        method:'get',
        params:query
    })
}

export function deleteFooter(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/footerConfig/"+mobile,
        method:'delete',
    })
}

export function addFooter(data){
    return request({
        url:url.game99PlatformAdminWeb+"/footerConfig/add",
        method:'post',
        data : data
    })
}

export function updateFooter(data){
    return request({
        url:url.game99PlatformAdminWeb+"/footerConfig/edit",
        method:'post',
        data : data
    })
}