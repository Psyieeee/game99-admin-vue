import request from '@/utils/request'
import {url} from '@/utils/url'


/**
 * 查询平台资金报，记录平台每日收入及支出总额，预估当前会员的积分余额列表
 */
export function listReportMoneyInfo(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/moneyInfo/list',
        method: 'get',
        params: query
    })
}


/**
 * count
 */
export function reportMoneyInfoCount(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/moneyInfo/count',
        method: 'get',
        params: query
    })
}


/**
 * 平台资金报表导出 - export data
 */
export function reportMoneyInfoExport(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/moneyInfo/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}