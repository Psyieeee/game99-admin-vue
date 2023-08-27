import {url} from "@/utils/url";
import request from "@/utils/request";

/**
 * 查询下注列表 list all data
 */
export function listLotteryGameData(query){
    return request({
        url:url.game99LotteryAdminWeb + "/lottery/game/list",
        method: 'get',
        params:query
    })
}

/**
 * 获取下注详细信息 get data by id
 */
export function lotteryGameByIdData(id){
    return request({
        url:url.game99LotteryAdminWeb + "/lottery/game/"+id,
        method: 'get',
    })
}

/**
 * 修改下注 update data
 */
export function editLotteryGame(data){
    return request({
        url:url.game99LotteryAdminWeb + "/lottery/game",
        method: 'put',
        data:data
    })
}