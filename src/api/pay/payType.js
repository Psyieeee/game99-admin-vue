import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询【支付类型】列表
export function listPayType(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/list',
        method: 'get',
        params: query
    })
}

export function payTypeListAll() {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/listAll',
        method: 'get',
    })
}

// 查询【支付类型】详细
export function getPayType(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/' + id,
        method: 'get'
    })
}


// 新增【支付类型】
export function addPayType(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType',
        method: 'post',
        data: data
    })
}

// 修改【支付类型】
export function updatePayType(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType',
        method: 'put',
        data: data
    })
}

export function updatePayTypeText(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/editText',
        method: 'put',
        data: data
    })
}


// 支付类型状态修改
export function changePayTypeEffect(id, effect) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/changeStatus/' + id + "/" + effect,
        method: 'put',
    })
}

// 支付类型是否推荐修改
export function changeRecommendStatus(id, recommend) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/changeRecommend/' + id + "/" + recommend,
        method: 'put',
    })
}


// 导出【支付类型】
export function exportPayType(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

// 删除【支付类型】
export function delPayType(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/payType/' + id,
        method: 'delete'
    })
}

