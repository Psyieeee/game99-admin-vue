import {url} from "@/utils/url";
import request from "@/utils/request";

export function missionRepeatList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/list",
        method:'get',
        params:query
    })
}

export function getMissionRepeatList(id){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/" + id,
        method:'get'
    })
}

export function deleteMissionRepeat(id){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/"+id,
        method:'delete',
    })
}

export function getMissionTrigger() {
    return request({
        url: url.game99PlatformAdminWeb + "/missionRepeat/missionTrigger/list",
        method: 'get'
    })
}

export function addMissionRepeat(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/add",
        method:'post',
        data : data
    })
}

export function updateMissionRepeat(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/edit",
        method:'post',
        data : data
    })
}

export function changeMissionRepeatStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionRepeat/changeStatus/'+ id + "/" + status,
        method: 'put',
    })
}


export function getPlatformList(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/platformList",
        method:'post',
        data:data
    })
}

export function gameInfoList(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRepeat/gameInfoList",
        method:'post',
        data:data
    })
}

export function getSettings(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionRepeat/getSettings/' + id,
        method: 'get',
    })
}

export function updateSettings(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionRepeat/updateSettings',
        method: 'post',
        data: data
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionNewbie/uploadFile',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })
}

