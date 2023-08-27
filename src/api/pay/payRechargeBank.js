import request from '@/utils/request'
import {url} from '@/utils/url'

/**  查询【公司入款银行】列表 list all config bank data*/
export function listPayRechargeBank(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/list',
        method: 'get',
        params: query
    })
}

export function listAllPayRechargeBank() {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/listAll',
        method: 'get'
    })
}

/**  新增【公司入款银行】 add api */
export function addPayRechargeBank(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank',
        method: 'post',
        data: data
    })
}

/**  查询【公司入款银行】详细 get data by id */
export function getPayRechargeBank(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/' + id,
        method: 'get'
    })
}

export function changeConfigBankText(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/changeText',
        method: 'put',
        data: data
    })
}


/** 修改【公司入款银行】 update api */
export function updatePayRechargeBank(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank',
        method: 'put',
        data: data
    })
}

/** change config bank status */
export function changePayRechargeBankStatus(id, effect) {
    // const data = {
    //     id,
    //     status
    // }
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/changeStatus/'+id+ "/"+effect,
        method: 'put',
        // data: data
    })
}

/**  删除【公司入款银行】 delete config bank */
export function delPayRechargeBank(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/' + id,
        method: 'delete'
    })
}

/** 导出【公司入款银行】 export data*/
export function exportPayRechargeBank(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payRechargeBank/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}
