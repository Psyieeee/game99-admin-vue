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

export function configVpiDataList(){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/vip/listAll",
        method:'get',
    })
}

export function uploadImages(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/uploadImages",
        method:'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}
export function listImages(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/listImages",
        method:'post',
        data: data
    })
}

export function removeImages(type,platform,field, imageUrl){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/removeImages",
        method:'post',
        data: {
            url: imageUrl,
            platform: platform,
            type: type,
            field: field
        }
    })
}

export function deleteImagesByType(types){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/deleteImagesByType",
        method:'post',
        data: {
            types: types
        }
    })
}

export function saveImageUrl(imageUrlList, param){
    return request({
        url:url.game99PlatformAdminWeb+"/config/vipBonusInfo/saveImageUrl",
        method:'post',
        data: {
            imageUrlList: imageUrlList,
            param: param
        }
    })
}














