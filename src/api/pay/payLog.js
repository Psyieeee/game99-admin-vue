import request from '@/utils/request'
import {url} from '@/utils/url'

/** list all Pay Log data */
export function listPayLog(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payLog/list',
        method: 'get',
        params: query
    })
}

/** 导出支付下单日志 Export payment order log*/
export function exportPayLog(query){
    return request({
        url: url.game99PayAdminWeb + '/pay/payLog/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

 /** 查询支付下单日志详细 Query payment order log details*/
export function getPayLog(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payLog/' + id,
        method: 'get'
    })
}