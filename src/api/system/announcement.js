import request from "@/utils/request";
import {url} from "@/utils/url";

export function recordList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/announcement/list",
        method:'get',
        params:query
    })
}

export function deleteRecord(ids){
    return request({
        url:url.game99PlatformAdminWeb+"/announcement/"+ids,
        method:'delete',
    })
}

export function addRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/announcement/add",
        method:'post',
        data : data
    })
}

export function updateRecord(data){
    return request({
        url:url.game99PlatformAdminWeb+"/announcement/edit",
        method:'put',
        data : data
    })
}

export function getRecord(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcement/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcement/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}

export function changeHomePrompt(id, homePrompt) {
    return request({
        url: url.game99PlatformAdminWeb + "/announcement/changeHomePrompt/" + id + "/" + homePrompt,
        method: 'put'
    })
}