import {url} from "@/utils/url";
import request from "@/utils/request";

export function activityMissionList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/list",
        method:'get',
        params:query
    })
}

export function getActivityMissionList(id){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/" + id,
        method:'get'
    })
}

export function deleteActivityMission(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/"+mobile,
        method:'delete',
    })
}

export function addActivityMission(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/add",
        method:'post',
        data : data
    })
}

export function updateActivityMission(data){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/update",
        method:'post',
        data : data
    })
}

export function changeMissionActivityStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/activity/mission/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function getMissionActivitySettings(){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/getSettings",
        method:'get'
    })
}

export function updateMissionActivitySettings( data ){
    return request({
        url:url.game99PlatformAdminWeb+"/activity/mission/updateSettings",
        method:'post',
        data : data
    })
}
