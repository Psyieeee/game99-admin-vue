import request from "@/utils/request";
import {url} from '@/utils/url'


/**
 * 查询在线用户列表
 */
export function listCom(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/report-plam-com/list',
        method: 'get',
        params: query
    })
}

export function exportReportPlamCom(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/report-plam-com/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}
