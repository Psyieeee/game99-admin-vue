import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询游戏信息列表
export function listGameConfigType(query) {
    return request({
        url: url.game88GameAdminWeb + '/game/configGameType/list',
        method: 'get',
        params: query
    })
}


export function GameConfigTypeInfo(id) {
    return request({
        url: url.game88GameAdminWeb + '/game/configGameType/'+id,
        method: 'get',
    })
}


export function addGameConfigType(data) {
    return request({
        url: url.game88GameAdminWeb + '/game/configGameType',
        method: 'post',
        data: data
    })
}

export function updateGameConfigType(data) {
    return request({
        url: url.game88GameAdminWeb + '/game/configGameType',
        method: 'put',
        data: data
    })
}


export function delGameConfigType(id) {
    return request({
        url: url.game88GameAdminWeb + '/game/configGameType/' + id,
        method: 'delete'
    })
}
