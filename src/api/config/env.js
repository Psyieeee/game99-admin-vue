import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询【请填写功能名称】列表
export function listConfigEnvironment(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/list',
        method: 'get',
        params: query
    })
}

export function listConfigEnvironmentPic(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/listRecommendPic',
        method: 'get',
        params: query
    })
}
// 修改【请填写功能名称】
export function updateConfigEnvironmentPic(data) {

    return request({
        url: url.game99PlatformAdminWeb + '/config/env/updateRecommendPic',
        method: 'put',
        data: data
    })
}

// 查询【请填写功能名称】详细
export function getConfigEnvironment(envCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/' + envCode,
        method: 'get'
    })
}

// 新增【请填写功能名称】
export function addConfigEnvironment(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function updateConfigEnvironmentApi(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env',
        method: 'put',
        data: data
    })
}

// 修改状态
export function changeStatus(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/changeStatus',
        method: 'put',
        data: data
    })
}

// 批量修改【请填写功能名称】
export function updateConfigEnvironmentList(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/editList',
        method: 'post',
        data: data
    })
}

// 批量修改【请填写功能名称】
export function getTitleIndex(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/getTitleIndex',
        method: 'get',
        params: data
    })
}

// 删除【请填写功能名称】
export function delConfigEnvironment(envCode) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/' + envCode,
        method: 'delete'
    })
}

// 导出【请填写功能名称】
export function exportConfigEnvironment(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}
