import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function mobileLimitListData(query){
    return request({
        url:url.game88PlatformAdminWeb+"/member/mobileLimit/list",
        method:'get',
        params:query
    })
}

/** 导出列表 export data*/
export function mobileLimitListDataExport(query){
    return request({
        url:url.game88PlatformAdminWeb+"/member/mobileLimit/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addMobileLimit(data){
    return request({
        url:url.game88PlatformAdminWeb+"/member/mobileLimit",
        method:'post',
        data : data
    })
}

/** 删除 delete*/
export function deleteMobileLimit(mobile){
    return request({
        url:url.game88PlatformAdminWeb+"/member/mobileLimit/"+mobile,
        method:'delete',
    })
}

