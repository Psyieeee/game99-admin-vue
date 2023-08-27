import request from '@/utils/request'
import {url} from "@/utils/url";


// 查询SMS短信服务配置列表
export function listSms(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/list',
        method: 'get',
        params: query
    })
}

// 查询SMS短信服务配置详细
export function getSmsById(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/' + id,
        method: 'get'
    })
}

// 新增SMS短信服务配置
export function addSms(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms',
        method: 'post',
        data: data
    })
}

// 修改SMS短信服务配置
export function updateSms(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms',
        method: 'put',
        data: data
    })
}

// 删除SMS短信服务配置
export function delSms(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/' + id,
        method: 'delete'
    })
}

// 激活SMS短信服务配置
export function effectSms(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/effect/' + id,
        method: 'put'
    })
}

//取消激活SMS短信服务配置
export function noEffectSms(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/noEffect/' + id,
        method: 'put'
    })
}

//测试SMS短信服务配置
export function smsTest(id, mobile) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/sms/smsTest/' + id + '/' + mobile,
        method: 'put'
    })
}
