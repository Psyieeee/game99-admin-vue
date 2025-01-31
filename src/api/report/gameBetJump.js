import request from '@/utils/request'
import {url} from '@/utils/url'


/** 查询【请填写功能名称】列表 */
export function listGameChildBet(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/plamGamesChilds/list',
        method: 'get',
        params: query
    })
}

export function listByGamePepole(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/plamGamesChilds/plamGameListData',
        method: 'get',
        params: query,
        timeout: 60000
    })
}

export function exportReportChildPlamGames(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/plamGamesChilds/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}
