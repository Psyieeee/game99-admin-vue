import request from '@/utils/request'
import {url} from '@/utils/url'

/**
 * 查询线上充值信息列表
 */
export function memberRechargeOnlineList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/list",
        method:'get',
        params:query
    })
}

/**
 * 导出线上充值信息列表
 */
export function memberRechargeOnlineExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取线上充值信息详细信息
 */
export function memberRechargeOnlineById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/"+id,
        method:'get',
    })
}

/**
 * 线上充值信息统计
 */
export function memberRechargeOnlineCount(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/listCount",
        method:'get',
        params:query
    })
}

/**
 * 线上支付人工补单
 */
export function memberRechargeOnlinePreOrder(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/payPatchOrder",
        method:'put',
        data:data
    })
}

/**  report part */

/**
 * 导出线上充值信息报表 member recharge online report export data
 */
export function memberRechargeOnlineExportReport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/exportReport",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 查询线上充值信息报表 report list
 */
export function memberOnlineReportListData(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/report",
        method:'get',
        params:data
    })
}

/**
 * 报表统计 report count
 */
export function memberOnlineReportListCount(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeOnline/reportListCount",
        method:'get',
        params:data
    })
}



















