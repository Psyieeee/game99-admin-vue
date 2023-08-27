import request from '@/utils/request'
import {url} from '@/utils/url'

export function listSpeakIpBlackList(query) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList/list',
    method: 'get',
    params: query
  })
}

export function getSpeakIpBlackList(id) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList/' + id,
    method: 'get'
  })
}

export function addSpeakIpBlackList(data) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function  updateSpeakIpBlackList(data) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList',
    method: 'put',
    data: data
  })
}

export function delSpeakIpBlackList(id) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList/' + id,
    method: 'delete'
  })
}

// 导出【请填写功能名称】
export function exportSpeakIpBlackList(query) {
  return request({
    url: url.game99PlatformAdminWeb + '/admin/speakIpBlackList/export',
    method: 'get',
    params: query,
    responseType: 'arraybuffer',
    timeout: 60000
  })
}
