import request from "@/utils/request";
import {url} from "@/utils/url";

export function gameDownloadInfoList(query){
    return request({
        url:url.game99GameAdminWeb+"/game/download/list",
        method:'get',
        params:query
    })
}

export function deleteGameDownloadInfo(id){
    return request({
        url:url.game99GameAdminWeb+"/game/download/"+id,
        method:'delete',
    })
}

export function addGameDownloadInfo(data){
    return request({
        url:url.game99GameAdminWeb+"/game/download/add",
        method:'post',
        data : data
    })
}

export function updateGameDownloadInfo(data){
    return request({
        url:url.game99GameAdminWeb+"/game/download/edit",
        method:'put',
        data : data
    })
}

export function getGameDownloadInfo(id) {
    return request({
        url: url.game99GameAdminWeb + "/game/download/" + id,
        method: 'get'
    })
}

export function changeStatus(id, status) {
    return request({
        url: url.game99GameAdminWeb + "/game/download/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}