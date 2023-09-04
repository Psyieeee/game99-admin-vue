import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function musicListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music/list",
        method:'get',
        params:query
    })
}

export function getMusicData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music/" + id,
        method:'get'
    })
}

/** 导出列表 export data*/
export function exportMemberMusic(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 新增 add */
export function addMusic(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music/add",
        method:'post',
        data : data
    })
}

/** 新增 edit */
export function updateMusic(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music",
        method:'put',
        data : data
    })
}

/** 删除 delete*/
export function deleteMusic(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/member/music/"+mobile,
        method:'delete',
    })
}

export function changeMusicStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/music/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/music/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}


