import {url} from "@/utils/url";
import request from "@/utils/request";

export function activityQuestList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/list",
        method:'get',
        params:query
    })
}

export function getActivityQuestList(id){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/" + id,
        method:'get'
    })
}

export function deleteActivityQuest(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/"+mobile,
        method:'delete',
    })
}

export function addActivityQuest(data){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/add",
        method:'post',
        data : data
    })
}

export function updateActivityQuest(data){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/update",
        method:'post',
        data : data
    })
}

export function changeQuestActivityStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/quest/activity/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function getQuestActivitySettings(){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/getSettings",
        method:'get'
    })
}

export function updateQuestActivitySettings( data ){
    return request({
        url:url.game99PlatformAdminWeb+"/quest/activity/updateSettings",
        method:'post',
        data : data
    })
}
