import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询活动信息列表 activity info list api
 */
export function getActivityInfoList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/list",
        method:'get',
        params:query
    })
}

/**
 * 导出活动信息列表 export api
 */
export function activityInfoExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取活动信息详细信息 get activity information by id
 */
export function activityInfoFindById(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/"+id,
        method:'get',
    })
}

/**
 * 新增活动信息 add new activity information
 */
export function activityInfoAdd(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo",
        method:'post',
        data:data
    })
}


/**
 * 修改活动信息 update activity information
 */
export function activityInfoUpdate(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo",
        method:'put',
        data:data
    })
}

/**
 * 删除活动信息 Delete activity information by ids
 */
export function activityInfoDelete(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/"+id,
        method:'delete',
    })
}


/**
 * 修改活动信息激活状态 change status by id and status
 */
export function activityInfoUpdateStatus(id,status){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/changeStatus/"+id+"/"+ status,
        method:'put',
    })
}

export function getAllEventsIcon(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/getAllEventsIcon",
        method:'post',
        data: data
    })
}

export function uploadEventsIcon(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/uploadEventsIcon",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}
export function removeEventsIcon(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/removeEventsIcon",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

export function getAllEventsBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/getAllEventsBanner",
        method:'post',
        data: data
    })
}

export function uploadEventsBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/uploadEventsBanner",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

export function removeEventsBanner(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/removeEventsBanner",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

export function getAllRewardIcon(){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/getAllRewardIcon",
        method:'post',
    })
}

export function getUploadedImages(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/getUploadedImages",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

export function listImages(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/listImages",
        method:'post',
        data: data
    })
}

export function removeAndListImages(type,field, imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/activityInfo/getImagesAfterRemoved",
        method:'post',
        data: {
            url: imageUrl,
            type: type,
            field: field
        }
    })
}
















