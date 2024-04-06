import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询【请填写功能名称】列表
export function listConfigCommission(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/list',
        method: 'get',
        params: query
    })
}

export function getInviterConfig() {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/getInviterConfig',
        method: 'get'
    })
}

export function listConfigCommissionPic(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/listRecommendPic',
        method: 'get',
        params: query
    })
}

// 查询【请填写功能名称】详细
export function getConfigCommission(bonusCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/' + bonusCode,
        method: 'get'
    })
}

// 新增【请填写功能名称】
export function addConfigCommission(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateConfigCommission(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission',
        method: 'put',
        data: data
    })
}

export function updateConfigInviter(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/updateInviterConfig',
        method: 'put',
        data: data
    })
}

// 修改状态
export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/changeStatus/' + id + "/" + status,
        method: 'put'
    })
}

// 删除【请填写功能名称】
export function delConfigCommission(ids) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/commission/' + ids,
        method: 'delete'
    })
}
