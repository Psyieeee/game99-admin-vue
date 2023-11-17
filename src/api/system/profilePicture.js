import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function profilePictureListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/system/profilePicture/list",
        method:'get',
        params:query
    })
}

export function getProfilePictureData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/system/profilePicture/" + id,
        method:'get'
    })
}

/** 新增 add */
export function addProfilePicture(data){
    return request({
        url:url.game99PlatformAdminWeb+"/system/profilePicture/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateProfilePicture(data){
    return request({
        url:url.game99PlatformAdminWeb+"/system/profilePicture",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteProfilePicture(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/system/profilePicture/"+mobile,
        method:'delete',
    })
}

export function changeProfilePictureStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/system/profilePicture/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/system/profilePicture/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}


