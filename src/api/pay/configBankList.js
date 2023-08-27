import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询银行字典列表列表
export function listConfigBankList(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/list',
        method: 'get',
        params: query
    })
}

// 查询银行字典列表列表
export function listConfigBankListAll() {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/listAll',
        method: 'get'
    })
}

// 查询银行字典列表详细
export function getConfigBankList(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/' + id,
        method: 'get'
    })
}

// 新增银行字典列表
export function addConfigBankList(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList',
        method: 'post',
        data: data
    })
}

// 修改银行字典列表
export function updateConfigBankList(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList',
        method: 'put',
        data: data
    })
}

// 删除银行字典列表
export function delConfigBankList(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/' + id,
        method: 'delete'
    })
}

// 导出银行字典列表
export function exportConfigBankList(query) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

// 银行字典列表状态更改
export function changeStatusConfigBankList(id, effect) {
    return request({
        url: url.game99PayAdminWeb + '/pay/configBankList/changeStatus/' + id + '/' + effect,
        method: 'put'
    })
}