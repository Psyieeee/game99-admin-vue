import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询任务信息列表
 */
export function activityQuestInfoListData(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/list",
        method: 'get',
        params: query
    })
}

/**
 * 导出任务信息列表 export data
 */
export function activityQuestInfoExport(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取任务信息详细信息 get data by id
 */
export function activityQuestInfoDataById(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/" + id,
        method: 'get',
    })
}

/**
 * 新增任务信息 add new activity type
 */
export function addActivityQuestInfoData(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/",
        method: 'post',
        data: data
    })
}

/**
 * 修改任务信息 update activity type
 */
export function updateActivityQuestInfo(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/",
        method: 'put',
        data: data
    })
}

/**
 * 删除任务信息 delete data
 */
export function deleteActivityQuestInfo(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/" + id,
        method: 'delete',
    })
}


/**
 * 修改任务信息激活状态 update status
 */
export function activityQuestInfoChangeStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + "/activity/activityQuestInfo/changeStatus/" + id + "/" + effect,
        method: 'put',
    })
}























