import request from '@/utils/request'
import {url} from "@/utils/url";

/**
 * 查询列表 get all member game data
 */
export function memberGameMoneyListData(query){
    return request({
        url:url.game99GameAdminWeb + "/game/memberGameMoney/list",
        method:'get',
        params: query
    })
}

export function memberGamePlatformMoneyListData(query){
    return request({
        url:url.game99GameAdminWeb + "/game/memberGameMoney/listWithPlatformMoney",
        method:'get',
        params: query
    })
}