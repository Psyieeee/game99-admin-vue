import request from '@/utils/request'
import {url} from "@/utils/url";

/**
 * 查询 会员资金信息列表 list all data
 */
export function logMoneyListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/logMoney/list",
        method:'get',
        params:query
    })
}

/**
 * 查询资金交易类型列表 list all
 */
export function logMoneyAllList(){
    return request({
        url:url.game99PlatformAdminWeb+"/member/logMoney/tradeTypeAll",
        method:'get'
    })
}

/**
 * 行为类型统计
 */
export function moneyLogListCount(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/logMoney/listCount",
        method:'get',
        params:query
    })
}

/**
 * 查询 会员资金信息统计
 */
export function tradeTypeTotalCount(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/logMoney/totalCount",
        method:'get',
        params:query
    })
}

/**
 * 导出 会员资金信息列表
 */
export function logMoneyExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/logMoney/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}