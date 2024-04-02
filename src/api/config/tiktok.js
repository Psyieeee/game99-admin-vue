import request from "@/utils/request.js";
import {url} from "@/utils/url.js";

export function adjustTiktokList(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/tiktok/list',
        method: 'get',
        params: query
    })
}

export function getTiktokDetails(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/tiktok/' + id,
        method: 'get'
    })
}

export function addTiktok(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/tiktok',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateTiktok(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/tiktok',
        method: 'put',
        data: data
    })
}

export function deleteTiktok(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/tiktok/' + id,
        method: 'delete'
    })
}