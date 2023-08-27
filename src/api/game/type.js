import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询游戏类型列表
export function listType(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/type/list',
        method: 'get',
        params: query
    })
}

export function listAllType(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/type/listAll',
        method: 'get',
        params: query
    })
}

// 查询游戏类型详细
export function getType(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/type/' + id,
        method: 'get'
    })
}

// 新增游戏类型
export function addType(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/type',
        method: 'post',
        data: data
    })
}

// 修改游戏类型
export function updateType(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/type',
        method: 'put',
        data: data
    })
}

// 删除游戏类型
export function delType(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/type/' + id,
        method: 'delete'
    })
}

export function changeEffectStatus(id, effect) {
    return request({
        url: url.game99GameAdminWeb + '/game/type/changeEffect/' + id + '/' + effect,
        method: 'put'
    })
}
