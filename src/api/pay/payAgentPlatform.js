import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询代付平台列表  list pay agent platform
 */

export function payAgentPlatformLists(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/list",
        method:'get',
        params:query
    })
}

/**
 * 查询代付平台列表 list all data
 */
export function payAgentPlatformListAll(){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/listAll",
        method:'get',
    })
}

/**
 * 导出代付平台列表 export data
 */
export function payAgentPlatformExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/export",
        method:'get',
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取代付平台详细信息 get by ID
 */
export function payAgentPlatformById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/"+id,
        method:'get'
    })
}

/**
 * 新增代付平台 add api
 */
export function addPayAgentPlatform(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/",
        method:'post',
        data:data
    })
}


/**
 * 修改代付平台 update
 */
export function updatePayAgentPlatform(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/",
        method:'put',
        data:data
    })
}

/**
 * 删除代付平台 delete by ids
 */
export function removePayAgentPlatformByIds(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentPlatform/"+id,
        method:'delete',
    })
}














