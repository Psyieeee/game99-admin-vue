import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function gamePlatformCashBackListData(query){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack/list",
        method:'get',
        params:query
    })
}

export function getGamePlatformCashBackData(id){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack/" + id,
        method:'get'
    })
}

/** 导出列表 export data*/
export function exportMemberGamePlatformCashBack(query){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addGamePlatformCashBack(data){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateGamePlatformCashBack(data){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteGamePlatformCashBack(mobile){
    return request({
        url:url.game99GameAdminWeb+"/game/gamePlatformCashBack/"+mobile,
        method:'delete',
    })
}

export function changeGamePlatformCashBackStatus(id, effect) {
    return request({
        url: url.game99GameAdminWeb + '/game/gamePlatformCashBack/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}


