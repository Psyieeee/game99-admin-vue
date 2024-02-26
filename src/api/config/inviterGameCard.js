import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询【请填写功能名称】列表
export function listInviterGameCard(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/list',
        method: 'get',
        params: query
    })
}

export function listInviterGameCardPic(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/listRecommendPic',
        method: 'get',
        params: query
    })
}

// 查询【请填写功能名称】详细
export function getInviterGameCard(bonusCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/' + bonusCode,
        method: 'get'
    })
}

// 新增【请填写功能名称】
export function addInviterGameCard(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateInviterGameCard(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard',
        method: 'put',
        data: data
    })
}

// 修改状态
export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/changeStatus/' + id + "/" + status,
        method: 'put'
    })
}

// 删除【请填写功能名称】
export function delInviterGameCard(bonusCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/' + bonusCode,
        method: 'delete'
    })
}

export function fileUpload(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGameCard/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data
    })

}
