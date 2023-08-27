import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询站内信列表 get all list
 */
export function listHomeNotice(query){
    return request({
        url:url.game88PlatformAdminWeb+"/message/messageHomeNotice/list",
        method:'get',
        params:query
    })
}

/**
 * 删除首页公告 delete data
 */
export function deleteHomeNotice(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/messageHomeNotice/' + id,
        method: 'delete'
    })
}


/**
 * 导出首页公告列表 export data
 */
export function exportHomeNotice(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/messageHomeNotice/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 新增首页公告 add new data
 */
export function addHomeNotice(data) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/messageHomeNotice',
        method: 'post',
        data: data
    })
}

/**
 * 修改首页公告 update data
 */
export function updateHomeNotice(data) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/messageHomeNotice',
        method: 'put',
        data: data
    })
}

/**
 * 获取首页公告详细信息 get data by id
 */
export function getHomeNotice(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/messageHomeNotice/' + id,
        method: 'get'
    })
}

/**
 * 修改首页公告激活状态 change status
 */
export function messageHomeNoticeStatus(id,status){
    return request({
        url:url.game88PlatformAdminWeb+"/message/messageHomeNotice/changeStatus/"+id+"/"+ status,
        method:'put',
    })
}
