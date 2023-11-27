import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询活动信息列表 activity info list api
 */
export function getVipBonusInfoList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/list",
        method:'get',
        params:query
    })
}

/**
 * 导出活动信息列表 export api
 */
export function vipBonusInfoExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取活动信息详细信息 get activity information by id
 */
export function vipBonusInfoFindById(id){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/"+id,
        method:'get',
    })
}

/**
 * 新增活动信息 add new activity information
 */
export function vipBonusInfoAdd(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus",
        method:'post',
        data:data
    })
}


/**
 * 修改活动信息 update activity information
 */
export function vipBonusInfoUpdate(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus",
        method:'put',
        data:data
    })
}

/**
 * 删除活动信息 Delete activity information by ids
 */
export function vipBonusInfoDelete(id){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/"+id,
        method:'delete',
    })
}


/**
 * 修改活动信息激活状态 change status by id and status
 */
export function vipBonusInfoUpdateStatus(id, status){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/changeStatus/"+id+"/"+ status,
        method:'put',
    })
}

export function getAllVipBonusLogo(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/getAllVipBonusLogo",
        method:'post',
        data: data
    })
}

export function uploadVipBonusLogo(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/uploadVipBonusLogo",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}
export function removeVipBonusLogo(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/removeVipBonusLogo",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

export function getAllVipBonusBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/getAllVipBonusBanner",
        method:'post',
        data: data
    })
}

export function uploadVipBonusBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/uploadVipBonusBanner",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

export function removeVipBonusBanner(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/removeVipBonusBanner",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

export function getAllRewardIcon(){
    return request({
        url:url.game99PlatformAdminWeb+"/vip/bonus/getAllRewardIcon",
        method:'post',
    })
}
















