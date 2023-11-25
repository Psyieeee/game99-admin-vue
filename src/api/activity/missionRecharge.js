import {url} from "@/utils/url";
import request from "@/utils/request";

export function missionRechargeList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRechargeCommission/list",
        method:'get',
        params:query
    })
}

export function getMissionRecharge(id){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRechargeCommission/" + id,
        method:'get'
    })
}

export function deleteMissionRecharge(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRechargeCommission/" + mobile,
        method:'delete',
    })
}

export function addMissionRecharge(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRechargeCommission/add",
        method:'post',
        data : data
    })
}

export function updateMissionRecharge(data){
    return request({
        url:url.game99PlatformAdminWeb+"/missionRechargeCommission/edit",
        method:'put',
        data : data
    })
}

