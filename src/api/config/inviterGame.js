import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询【请填写功能名称】列表
export function list() {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame/list',
        method: 'get'
    })
}

export function get(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame/' + id,
        method: 'get'
    })
}

// 新增【请填写功能名称】
export function add(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame',
        method: 'post',
        data: data
    })
}

// 修改【请填写功能名称】
export function update(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame',
        method: 'put',
        data: data
    })
}

// 修改状态
export function changeStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame/changeStatus/' + id + "/" + status,
        method: 'put'
    })
}

// 删除【请填写功能名称】
export function remove(ids) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame/' + ids,
        method: 'delete'
    })
}

export function getSampleList(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/inviterGame/sampleList',
        method: 'post',
        data: data
    })
}
