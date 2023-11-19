import request from "@/utils/request";
import {url} from "@/utils/url";

export function customerSupportList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/customerSupportAdmin/list",
        method:'get',
        params:query
    })
}

export function customerSupportVipLevels(){
    return request({
        url:url.game99PlatformAdminWeb+"/customerSupportAdmin/vipLevels",
        method:'get'
    })
}

export function deleteCustomerSupport(ids){
    return request({
        url:url.game99PlatformAdminWeb+"/customerSupportAdmin/"+ids,
        method:'delete',
    })
}

export function addCustomerSupport(data){
    return request({
        url:url.game99PlatformAdminWeb+"/customerSupportAdmin/add",
        method:'post',
        data : data
    })
}

export function updateCustomerSupport(data){
    return request({
        url:url.game99PlatformAdminWeb+"/customerSupportAdmin/edit",
        method:'put',
        data : data
    })
}

export function getCustomerSupport(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/customerSupportAdmin/" + id,
        method: 'get'
    })
}