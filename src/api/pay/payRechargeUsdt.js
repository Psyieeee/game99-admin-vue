import request from '@/utils/request'
import {url} from '@/utils/url'

/**  list all pay recharge usdt data*/
export function listPayRechargeUsdt(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt/list',
        method: 'get',
        params: query
    })
}

/**  list all pay recharge usdt data*/
export function listPayRechargeUsdtAll() {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt/listAll',
        method: 'get',
    })
}

/**  export usdt data*/
export function exportRechargeUsdt(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payRechargeUsdt/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**  usdt data by id*/
export function payRechargeUsdtById(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt/'+id,
        method: 'get'
    })
}

/**  add new usdt data*/
export function addPayRechargeUsdt(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt',
        method: 'post',
        data:data
    })
}

/** update usdt data*/
export function updatePayRechargeUsdt(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt',
        method: 'put',
        data:data
    })
}

/** delete usdt data*/
export function deletePayRechargeUsdt(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt/'+id,
        method: 'delete',
    })
}


/** 支付类型状态修改 change  status */
export function changePayRechargeUsdtStatus(id, effect) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeUsdt/changeStatus/'+id+ "/"+effect,
        method: 'put',
    })
}
