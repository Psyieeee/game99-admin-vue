import request from '@/utils/request'
import {url} from '@/utils/url'

/** 查询线下充值信息列表 Query the list of member recharge bank report information*/
export function memberRechargeBankReportList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBankReport/list",
        method:'get',
        params:query
    })
}

/**查询线下充值信息列表 export member recharge bank report information*/
export function exportMemberRechargeBankReport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBankReport/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 列表统计 count api report */
export function memberBankRechargeReportCount(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBankReport/listCounts",
        method:'get',
        params:query
    })
}

