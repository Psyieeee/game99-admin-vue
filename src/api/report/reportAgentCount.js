import request from "@/utils/request";
import {url} from '@/utils/url'


/**
 * 首页注册人数
 */
export function ReportRecordPost(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/agentCount/record',
        method: 'post',
        data: data
    })
}

/**
 * 查询代理统计，主要用于代理渠道的统计列表
 */
export function listReportAgentCountData(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/agentCount/list',
        method: 'get',
        params: query
    })
}


/**
 * 查询代理统计，主要用于代理渠道的统计列表
 */
export function reportGenerateData(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/agentCount/generateData',
        method: 'get',
        params: query
    })
}


/**
 * 查询代理统计，主要用于代理渠道的统计列表
 */
export function reportAgentCountExport(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/agentCount/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}
