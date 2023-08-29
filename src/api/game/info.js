import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询游戏信息列表
export function listGameInfo(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/list',
        method: 'get',
        params: query
    })
}

// 查询游戏信息列表
export function listGameInfoAllList(platformId) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/listAll',
        method: 'get',
        params: {
            platformId: platformId
        }
    })
}

// 查询游戏信息详细
export function getGameInfo(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/' + id,
        method: 'get'
    })
}

// 新增游戏信息
export function addGameInfo(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/info',
        method: 'post',
        data: data
    })
}

// 修改游戏信息
export function updateGameInfo(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/info',
        method: 'put',
        data: data
    })
}

// 删除游戏信息
export function delGameInfo(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/' + id,
        method: 'delete'
    })
}

export function changeEffectStatusInfo(id, effect) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/changeEffect/' + id + '/' + effect,
        method: 'put'
    })
}

export function changeMaintainStatusInfo(id, maintain) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/changeMaintain/' + id + '/' + maintain,
        method: 'put'
    })
}

export function changeRecommendStatusInfo(id, recommend) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/changeRecommend/' + id + '/' + recommend,
        method: 'put'
    })
}
export function changeFreeToPlayStatus(id, freeToPlay) {
    return request({
        url: url.game99GameAdminWeb + '/game/info/changeFreeToPlay/' + id + '/' + freeToPlay,
        method: 'put'
    })
}