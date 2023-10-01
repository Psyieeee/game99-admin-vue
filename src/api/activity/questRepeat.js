import {url} from "@/utils/url";
import request from "@/utils/request";

export function questRepeatList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/list",
        method:'get',
        params:query
    })
}

export function getQuestRepeatList(id){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/" + id,
        method:'get'
    })
}

export function deleteQuestRepeat(id){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/"+id,
        method:'delete',
    })
}

export function addQuestRepeat(data){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/add",
        method:'post',
        data : data
    })
}

export function updateQuestRepeat(data){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/edit",
        method:'post',
        data : data
    })
}

export function changeQuestRepeatStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + '/questRepeat/changeStatus/'+ id + "/" + status,
        method: 'put',
    })
}


export function getPlatformList(data){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/platformList",
        method:'post',
        data:data
    })
}

export function gameInfoList(data){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/gameInfoList",
        method:'post',
        data:data
    })
}
