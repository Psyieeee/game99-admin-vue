import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询活动类型列表
 */
export function activityTypeListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/list",
        method:'get',
        params:query
    })
}

/**
 * 查询活动信息列表 activity info list api
 */
export function getActivityTypeAllList(){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/listAll",
        method:'get',
    })
}

/**
 * 获取活动类型详细信息 get data by id
 */
export function activityTypeDataById(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/"+id,
        method:'get',
    })
}

/**
 * 新增活动类型 export data
 */
export function activityTypeExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 新增活动类型 add new activity type
 */
export function addActivityTypeData(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/",
        method:'post',
        data:data
    })
}

/**
 * 修改活动类型 update activity type
 */
export function updateActivityType(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/",
        method:'put',
        data:data
    })
}

/**
 * 删除活动类型 delete data
 */
export  function deleteActivityType(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/"+id,
        method:'delete',
    })
}

export function activityTypeUpdateIsUrl( id,isUrl ){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/changeIsUrl/"+id+"/"+ isUrl,
        method:'put',
    })
}

export function activityTypeUpdateStatus( id,status ){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityType/changeStatus/"+id+"/"+ status,
        method:'put',
    })
}












