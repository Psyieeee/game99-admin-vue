import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function advertisementListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement/list",
        method:'get',
        params:query
    })
}

export function getAdvertisementData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement/" + id,
        method:'get'
    })
}

/** 导出列表 export data*/
export function exportMemberAdvertisement(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addAdvertisement(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateAdvertisement(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteAdvertisement(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/member/advertisement/"+mobile,
        method:'delete',
    })
}

export function changeAdvertisementStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/advertisement/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/advertisement/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}


