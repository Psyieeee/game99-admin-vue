import request from "@/utils/request";
import {url} from "@/utils/url";

export function announcementList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/announcementType/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(ids){
    return request({
        url:url.game99PlatformAdminWeb+"/announcementType/"+ids,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/announcementType/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/announcementType/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcementType/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcementType/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}

export function changeHomePrompt(id, homePrompt) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcementType/changeHomePrompt/" + id + "/" + homePrompt,
        method: 'put'
    })
}
