import request from "@/utils/request";
import {url} from "@/utils/url";

/** 查询会员推广管理列表 */
export function listActivityMemberInfo(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/activity/memberInfo/list',
        method: 'get',
        params: query
    })
}

 /** 查询会员ip重复 */
export function ipListData(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/activity/memberInfo/ipList',
        method: 'get',
        params: query
    })
}

 /** 查询会员推广管理详细 */
export function getActivityMemberInfo(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/activity/memberInfo/' + id,
        method: 'get'
    })
}


 /** 导出会员推广管理 */
export function exportActivityMemberInfo(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/activity/memberInfo/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 300000
    })
}
