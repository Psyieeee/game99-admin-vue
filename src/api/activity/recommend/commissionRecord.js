import request from "@/utils/request";
import {url} from "@/utils/url";

/**
 * 查询佣金领取日志列表 list all data
 */
export function commissionRecordListData(query){
    return request({
        url:url.game88PlatformAdminWeb+"/member/commissionRecords/list",
        method:'get',
        params:query
    })
}

/**
 * 导出佣金领取日志列表 export data
 */
export function commissionRecordDataExport(query){
    return request({
        url:url.game88PlatformAdminWeb+"/member/commissionRecords/export",
        method:'get',
        params:query,
        responseType:'arrayBuffers',
        timeout:60000
    })
}
