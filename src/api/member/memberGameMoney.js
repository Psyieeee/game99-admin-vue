import request from '@/utils/request'
import {url} from "@/utils/url";

/**
 * 查询列表 get all member game data
 */
export function memberGameMoneyListData(query){
    return request({
        url:url.game88GameAdminWeb + "/game/memberGameMoney/list",
        method:'get',
        params: query
    })
}