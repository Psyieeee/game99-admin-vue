import {url} from "@/utils/url";
import request from "@/utils/request";

export function newbieListData(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/missionNewbie/list",
        method: 'get',
        params: query
    })
}

export function getMissionNewbie(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/missionNewbie/" + id,
        method: 'get'
    })
}

export function getMemberTierList(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/member/memberTier/list",
        method: 'get'
    })
}

export function deleteNewbie(mobile) {
    return request({
        url: url.game99PlatformAdminWeb + "/missionNewbie/" + mobile,
        method: 'delete',
    })
}

export function addMissionNewbie(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/missionNewbie/add",
        method: 'post',
        data: data
    })
}

export function updateMissionNewbie(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/missionNewbie/edit",
        method: 'put',
        data: data
    })
}



export function changeNewbieStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionNewbie/changeStatus/' + id + "/" + effect,
        method: 'put',
    })
}

export function changeNewbiesTipBubble(id, tipBubble) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionNewbie/changeTipBubble/' + id + "/" + tipBubble,
        method: 'put',
    })
}

export function getSettings(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionNewbie/getSettings/' + id,
        method: 'get',
    })
}

export function updateSettings(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/missionNewbie/updateSettings',
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

