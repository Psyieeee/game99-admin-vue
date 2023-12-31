import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function otherOssFileListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/config/otherOssFile/list",
        method:'get',
        params:query
    })
}

export function getOtherOssFileData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/config/otherOssFile/" + id,
        method:'get'
    })
}

/** 新增 edit */
export function updateOtherOssFile(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/otherOssFile/edit",
        method:'put',
        data : data
    })
}

export function changeOtherOssFileStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/otherOssFile/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/otherOssFile/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

export function addOtherOssFile(data){
    return request({
        url:url.game99PlatformAdminWeb+"/config/otherOssFile/add",
        method:'post',
        data : data
    })
}

export function deleteOtherOssFile(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/config/otherOssFile/"+mobile,
        method:'delete',
    })
}


