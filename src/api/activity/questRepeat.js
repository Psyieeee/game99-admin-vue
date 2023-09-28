import {url} from "@/utils/url";
import request from "@/utils/request";

export function questRepeatList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/list",
        method:'get',
        params:query
    })
}

export function deleteQuestRepeat(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/"+mobile,
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

export function changeNewbieStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/newbieBenefits/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}

export function newbiePlatformList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/platformList",
        method:'get',
        params:query
    })
}