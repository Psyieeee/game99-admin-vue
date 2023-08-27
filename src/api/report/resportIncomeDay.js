import request from '@/utils/request'
import {url} from '@/utils/url'

/**
 * 查询平台充值报表列表 list all income day report
 */
export function listReportIncomeDay(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/incomeDay/list',
        method: 'get',
        params: query
    })
}

/**
 * count
 */
export function CountReportIncomeDay(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/incomeDay/count',
        method: 'get',
        params: query
    })
}

/**
 * 导出 export
 */
export function ExportReportIncomeDay(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/incomeDay/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}