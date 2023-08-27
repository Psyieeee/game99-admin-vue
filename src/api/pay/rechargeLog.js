import request from '@/utils/request'
import {url} from '@/utils/url'

/** list all recharge Log data */
export function listPayLog(query) {
    return request({
        url:  url.game99PayAdminWeb +'/pay/rechargeLog/list',
        method: 'get',
        params: query
    })
}

/** 导出支付下单日志 Export recharge order log*/
export function exportPayLog(query){
    return request({
        url: url.game99PayAdminWeb + '/pay/rechargeLog/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}