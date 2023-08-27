import request from "@/utils/request";
import {url} from "@/utils/url";

/**
 * 查询彩票规则说明列表 list of lottery data
 */
export function listLotteryRule(query){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule/list",
        method:'get',
        params:query
    })
}

/**
 * 导出彩票规则说明列表 export all lottery data
 */
export function ExportLotteryRule(query){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取彩票规则说明详细信息 get data by id
 */
export function lotteryRuleById(id){
    console.log(id)
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule/"+id,
        method:'get',
    })
}

/**
 * 新增彩票规则说明 add new lottery rule
 */
export function addLotteryRule(data){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule",
        method:'post',
        data:data
    })
}

/**
 * 修改彩票规则说明 update lottery rules
 */
export function updateLotteryRule(data){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule",
        method:'put',
        data:data
    })
}

/**
 * 删除彩票规则说明 delete lottery rule
 */
export function deleteLotteryRule(id){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryRule/"+ id,
        method:'delete'
    })
}








