import {url} from "@/utils/url";
import request from "@/utils/request";

/**
 * 查询会员VIP配置列表 list config vip data api
 */
export function configVpiDataList(query){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip/list",
        method:'get',
        params:query
    })
}

/**
 * 导出会员VIP配置列表 export  config vip dara api
 */
export function configVipDataExport(query){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip/export",
        method:'get',
        params:query,
        responseType:'arrayBuffer',
        timeout:60000
    })
}

/**
 * 获取会员VIP配置详细信息 get config vip data according to id
 */
export function configVipDataById(id){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip/"+id,
        method:'get'
    })
}

/**
 * 新增会员VIP配置 insert config vip data api
 */
export function addConfigVipData(values){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip",
        method:'post',
        data:values
    })
}

/**
 * 修改会员VIP配置 update config vip data
 */
export function configVipEdit(data){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip",
        method:'put',
        data:data
    })
}

/**
 * 删除会员VIP配置 delete config vip data
 */
export function configVipDelete(id){
    return request({
        url:url.game88PlatformAdminWeb+"/config/vip/"+id,
        method:'delete',
    })
}



































