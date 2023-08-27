import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询会员打码数据列表 - Query member code data list
export function listMemberBcode(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberBcode/list',
        method: 'get',
        params: query
    })
}

// 查询会员打码数据详细
export function getMemberBcode(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberBcode/' + id,
        method: 'get'
    })
}

// 修改会员打码数据
export function updateMemberBcode(data) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberBcode',
        method: 'put',
        data: data
    })
}

// 查询会员打码总数据
export function totalDataGet(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberBcode/getTotalData',
        method: 'get',
        params: query
    })
}

// 导出会员打码数据
export function exportMemberBcode(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberBcode/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

