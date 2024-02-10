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

export function getMemberTierList(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/member/memberTier/list",
        method: 'get'
    })
}

