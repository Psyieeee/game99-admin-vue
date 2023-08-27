import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询站内信列表 get all list
 */
export function listMessageOnSite(query){
    return request({
        url:url.game99PlatformAdminWeb+"/message/messageOnSite/list",
        method:'get',
        params:query
    })
}

/**
 * 获取站内信详细信息 get data by id
 */
export function getMessageOnSite(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite/' + id,
        method: 'get'
    })
}

/**
 * 新增站内信 add data
 */
export function addMessageOnSite(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite',
        method: 'post',
        data: data
    })
}

/**
 * 修改站内信 update data
 */
export function updateMessageOnSite(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite',
        method: 'put',
        data: data
    })
}


/**
 * 删除站内信 delete data
 */
export function deleteMessageOnSite(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite/' + id,
        method: 'delete'
    })
}

 /**
 * 导出站内信列表 export data
 */
export function exportMessageOnSite(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增站内信息 */
export function addUserMessage(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/message/messageOnSite/sendUserMessage',
        method: 'post',
        data: data
    })
}