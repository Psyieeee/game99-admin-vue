import request from '@/utils/request'
import {url} from '@/utils/url'

export function listPayChannel(query) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/list",
        method: 'get',
        params: query
    })
}

export function listAllPayChannel() {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/listAll",
        method: 'get',
    })
}

export function exportPayChannel(query) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

export function getByIdPayChannel(id) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/" + id,
        method: 'get'
    })
}

export function addPayChannel(data) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel",
        method: 'post',
        data: data
    })
}

export function removePayChannel(id) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/" + id,
        method: 'delete',
    })
}

export function updatePayChannel(data) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel",
        method: 'put',
        data: data
    })
}

export function changeEffectStatus(id, effect) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel/changeStatus/" + id + "/" + effect,
        method: 'put'
    })
}

export function changeCallBackPayChannel(id, callback) {
    return request({
        url: url.game99PayAdminWeb + "/pay/payChannel//changeCallback/" + id + "/" + callback,
        method: 'put'
    })
}