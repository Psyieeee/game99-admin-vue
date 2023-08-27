import request from "@/utils/request";
import {url} from "@/utils/url";

/**
 * 查询彩票会员下注详情列表 get all data
 */
export function listLotteryBet(query){
    return request({
        url:url.game88LotteryAdminWeb+"/lottery/lotteryBet/list",
        method:'get',
        params:query
    })
}

/**
 * 导出彩票会员下注详情列表  export data
 */
export function exportLotteryBet(query){
    return request({
        url:url.game88LotteryAdminWeb+"/lottery/lotteryBet/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取彩票会员下注详情详细信息 get data by id
 */
export function LotteryBetById(id){
    return request({
        url:url.game88LotteryAdminWeb+"/lottery/lotteryBet/" + id,
        method:'get',
    })
}
