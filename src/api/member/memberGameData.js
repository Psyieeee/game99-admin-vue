import request from '@/utils/request'
import {url} from "@/utils/url";

/**
 * 查询会员注单数据列表- member game data
 */
export function listMemberGameData(query) {
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/list',
        method: 'get',
        params: query
    })
}

/**
 * 查询会员注单数据统计
 */
export function memberGameDataCount(query){
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/getCount',
        method: 'get',
        params: query
    })
}

/**
 * 导出会员注单数据列表 export member game data
 */
export function memberGameDataExport(query){
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/export',
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 查询对局详情列表  */
export function memberGameDateRecordList(query){
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/recordList',
        method: 'get',
        params: query
    })
}

 /** 查询对局详情列表  */
export function memberGameDateDetailsList(query){
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/detailList',
        method: 'get',
        params: query
    })
}

export function gameRecordList(query) {
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/recordList',
        method: 'get',
        params: query,
        timeout: 60000
    })
}
export function gameDetailList(query) {
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/detailList',
        method: 'get',
        params: query,
        timeout: 60000
    })
}
//查询平台列表
export function gamePlatformList(query) {
    return request({
        url: url.game99GameAdminWeb + '/member/memberGameData/platformList',
        method: 'get',
        params: query
    })
}
