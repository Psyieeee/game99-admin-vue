import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询游戏类型列表
export function listConfigWashCode(query) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/list',
        method: 'get',
        params: query
    })
}

// 查询游戏类型详细
export function getConfigWashCodeInfo(id) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/' + id,
        method: 'get'
    })
}

// 新增游戏类型
export function addConfigWashCode(data) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/',
        method: 'post',
        data: data
    })
}

// 修改游戏类型
export function updateConfigWashCode(data) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/',
        method: 'put',
        data: data
    })
}

// 删除游戏类型
export function deleteConfigWashCode(id) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/' + id,
        method: 'delete'
    })
}

export function changeConfigWashCodeEffect(id, effect) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/changeEffect/' + id + '/' + effect,
        method: 'put'
    })


}
export function exportConfigWashCode(query) {
    return request({
        url: url.game88GameAdminWeb + '/game/configWashCode/export',
        method: 'get',
        params: query,
        responseType: "arraybuffer",
        timeout: 60000,
    })
}
