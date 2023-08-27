import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询常见问题列表
export function listCommonProblem(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem/list',
        method: 'get',
        params: query
    })
}

// 查询常见问题详细
export function getCommonProblem(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem/' + id,
        method: 'get'
    })
}

// 新增常见问题
export function addCommonProblem(data) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem',
        method: 'post',
        data: data
    })
}

// 修改常见问题
export function updateCommonProblem(data) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem',
        method: 'put',
        data: data
    })
}

// 删除常见问题
export function delCommonProblem(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem/' + id,
        method: 'delete'
    })
}

// 导出常见问题
export function exportCommonProblem(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

export function changeStatusCommonProblem(id, effect) {
    return request({
        url: url.game88PlatformAdminWeb + '/message/commonProblem/changeStatus/' + id + "/" + effect,
        method: 'put'
    })
}