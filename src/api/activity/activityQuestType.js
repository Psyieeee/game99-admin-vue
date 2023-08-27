import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询任务信息列表
 */
export function activityQuestTypeListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/list",
        method:'get',
        params:query
    })
}


/**
 * Activity Type List All
 */
export function activityQuestTypeListDataAll(){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/listAll",
        method:'get',
    })
}

/**
 * 导出活动类型列表
 */
export function activityQuestTypeExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取活动类型详细信息
 */
export function activityQuestTypeByID(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/"+id,
        method:'get',
    })
}

/**
 * 新增活动类型 add
 */
export function addActivityQuestType(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/",
        method:'post',
        data:data
    })
}

/**
 * 新增活动类型 update
 */
export function updateActivityQuestType(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/",
        method:'put',
        data:data
    })
}

/**
 * 删除活动类型 delete
 */
export function activityQuestTypeDelete(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityQuestType/"+id,
        method:'delete',
    })
}
