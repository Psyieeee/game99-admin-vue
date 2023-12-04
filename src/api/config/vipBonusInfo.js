import request from "@/utils/request";
import {url} from "@/utils/url";

export function getVipBonusInfoList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/list",
        method:'get',
        params:query
    })
}

export function vipBonusInfoExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

export function vipBonusInfoFindById(id){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/"+id,
        method:'get',
    })
}

export function vipBonusInfoAdd(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo",
        method:'post',
        data:data
    })
}

export function vipBonusInfoUpdate(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo",
        method:'put',
        data:data
    })
}

export function vipBonusInfoDelete(id){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/"+id,
        method:'delete',
    })
}

export function vipBonusInfoUpdateStatus(id, status){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/changeStatus/"+id+"/"+ status,
        method:'put',
    })
}

export function getAllVipBonusLogo(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/getAllVipBonusLogo",
        method:'post',
        data: data
    })
}

export function uploadVipBonusLogo(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/uploadVipBonusLogo",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}
export function removeVipBonusLogo(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/removeVipBonusLogo",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

export function getAllVipBonusBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/getAllVipBonusBanner",
        method:'post',
        data: data
    })
}

export function uploadVipBonusBanner(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/uploadVipBonusBanner",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

export function removeVipBonusBanner(imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/removeVipBonusBanner",
        method:'post',
        data: {
            url: imageUrl
        }
    })
}

//TODO: Modify back-end logic, make this filterable by typeId
export function getRewardIcons(){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/getAllRewardIcon",
        method:'post',
    })
}
















