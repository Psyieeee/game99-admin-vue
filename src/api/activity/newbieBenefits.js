import {url} from "@/utils/url";
import request from "@/utils/request";

export function newbieListData(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/questNewbie/list",
        method: 'get',
        params: query
    })
}

export function getQuestNewbie(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/questNewbie/" + id,
        method: 'get'
    })
}

export function deleteNewbie(mobile) {
    return request({
        url: url.game99PlatformAdminWeb + "/questNewbie/" + mobile,
        method: 'delete',
    })
}

export function addQuestNewbie(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/questNewbie/add",
        method: 'post',
        data: data
    })
}

export function updateQuestNewbie(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/questNewbie/edit",
        method: 'put',
        data: data
    })
}



export function changeNewbieStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/questNewbie/changeStatus/' + id + "/" + effect,
        method: 'put',
    })
}

export function changeNewbiesTipBubble(id, tipBubble) {
    return request({
        url: url.game99PlatformAdminWeb + '/questNewbie/changeTipBubble/' + id + "/" + tipBubble,
        method: 'put',
    })
}

export function getSettings(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/questNewbie/getSettings/' + id,
        method: 'get',
    })
}

export function updateSettings(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/questNewbie/updateSettings',
        method: 'post',
        data: data
    })
}
