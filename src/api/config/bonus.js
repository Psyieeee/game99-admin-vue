import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询【请填写功能名称】列表
export function listConfigBonus(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus/list',
        method: 'get',
        params: query
    })
}

export function listConfigBonusPic(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus/listRecommendPic',
        method: 'get',
        params: query
    })
}

// 查询【请填写功能名称】详细
export function getConfigBonus(bonusCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus/' + bonusCode,
        method: 'get'
    })
}

// 新增【请填写功能名称】
export function addConfigBonus(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateConfigBonusApi(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus',
        method: 'put',
        data: data
    })
}

// 修改状态
export function changeStatus(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus/changeStatus',
        method: 'put',
        data: data
    })
}

// 删除【请填写功能名称】
export function delConfigBonus(bonusCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/bonus/' + bonusCode,
        method: 'delete'
    })
}
