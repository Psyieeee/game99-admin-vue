import request from '@/utils/request'
import {url} from '@/utils/url'

/**
 * 查询【代付下单日志】列表 list all data api
 */
export function payAgentLogList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentLog/list",
        method:'get',
        params:query
    })
}


/**
 * 导出【代付下单日志】列表 export data
 */
export function payAgentLogExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentLog/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取【代付下单日志】详细信息 find data by id
 */

export function payAgentLogGetByid(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentLog/"+id,
        method:'get',
    })
}