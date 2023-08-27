import request from '@/utils/request'
import {url} from '@/utils/url'

/**
 * 查询USDT充值信息列表 Query USDT recharge information list
 */
export function memberRechargeUsdtList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/list",
        method:'get',
        params:query
    })
}

/**
 * 查询USDT充值信息列表统计 Query USDT  statistics information
 */
export function memberRechargeUsdtListCount(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/listCount",
        method:'get',
        params:query
    })
}

/** 导出USDT充值信息列表 Export USDT deposit information*/
export function memberRechargeUsdtExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取USDT充值信息详细信息 Get USDT by Id
 */
export function memberRechargeUsdtGetbyId(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/"+id,
        method:'get'
    })
}

/**
 * 锁定USDT充值信息 Lock USDT information By ID
 */
export function memberRechargeUsdtLockById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/lock/"+id,
        method:'get'
    })
}

/**
 * 解锁USDT充值信息 Unlock USDT information
 */
export function memberRechargeUstdUnlockById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/unLock/"+id,
        method:'get'
    })
}

/**
 * 拒绝USDT充值信息  Refuse USDT  information
 */
export function memberRechargeUsdtRefuseById(id,data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt/refused/"+id,
        method:'put',
        data:data
    })
}

/**
 * 通过USDT充值信息  update  USDT information
 */
export function memberRechargeUsdtEdit(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeUsdt",
        method:'put',
        data:data
    })
}










