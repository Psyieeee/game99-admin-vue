import request from '@/utils/request'
import {url} from '@/utils/url'
import {changeEffectStatus} from "@/api/game/type";

// 查询游戏平台列表
export function listPlatform(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/list',
        method: 'get',
        params: query
    })
}

// 查询游戏平台列表
export function listAllPlatform() {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/listAll',
        method: 'get'
    })
}

// 查询游戏平台列表
export function gameCategoryAll() {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/gameCategoryAll',
        method: 'get'
    })
}

// 查询游戏平台详细
export function getPlatform(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/' + id,
        method: 'get'
    })
}

// 新增游戏平台
export function addPlatform(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform',
        method: 'post',
        data: data
    })
}

// 修改游戏平台
export function updatePlatform(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform',
        method: 'put',
        data: data
    })
}

// 删除游戏平台
export function delPlatform(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/' + id,
        method: 'delete'
    })
}

export function changeEffectStatusPlatform(id, effect) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/changeEffect/' + id + '/' + effect,
        method: 'put'
    })
}
export function changeMaintainStatusPlatform(id, maintain) {
    return request({
        url: url.game99GameAdminWeb + '/game/platform/changeMaintain/' + id + '/' + maintain,
        method: 'put'
    })
}