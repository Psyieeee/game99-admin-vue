
import {url} from "@/utils/url";
import request from "@/utils/request";

export function listMemberGameDatafix(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/memberGameDatafix/list',
        method: 'get',
        params: query
    })
}


export function addMemberGameDatafix(data) {
    return request({
        url: url.game99GameAdminWeb + '/game/memberGameDatafix',
        method: 'post',
        data: data
    })
}

export function delMemberGameDatafix(id) {
    return request({
        url: url.game99GameAdminWeb + '/game/memberGameDatafix/' + id,
        method: 'delete'
    })
}

// 导出游戏注单修复
export function exportMemberGameDatafix(query) {
    return request({
        url: url.game99GameAdminWeb + '/game/memberGameDatafix/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}