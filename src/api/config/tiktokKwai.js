import request from "@/utils/request.js";
import {url} from "@/utils/url.js";

export function adjustTiktokKwaiList(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/kwai/list',
        method: 'get',
        params: query
    })
}

export function getTiktokKwaiDetails(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/kwai/' + id,
        method: 'get'
    })
}

export function addTiktokKwai(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/kwai',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateTiktokKwai(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/kwai',
        method: 'put',
        data: data
    })
}

export function deleteTiktokKwai(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/kwai/' + id,
        method: 'delete'
    })
}