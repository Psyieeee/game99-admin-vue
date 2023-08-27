import request from '@/utils/request'
import {url} from '@/utils/url'


/** 查询【请填写功能名称】列表 */
export function listGameBet(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/reportPlamGames/list',
        method: 'get',
        params: query
    })
}

 /** 查询【请填写功能名称】列表 */
export function reportPlamGamesCount(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/reportPlamGames/count',
        method: 'get',
        params: query
    })
}

export function exportReportPlamGames(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/reportPlamGames/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 查询【请填写功能名称】列表 */
export function listMonth(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/reportPlamGames/listMonth',
        method: 'get',
        params: query
    })
}

/**  查询【请填写功能名称】列表 */
export function countBet(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/report/reportPlamGames/countBet',
        method: 'get',
        params: query
    })
}