import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询会员任务列表
export function listMemberQuest(query) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest/list',
    method: 'get',
    params: query
  })
}

// 增加会员积分
export function addMemberScore(id,status,curNum) {
  const data = {
    id,
    status,
    curNum
  }
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest/addScore',
    method: 'post',
    data: data
  })
}

// 查询会员任务详详情
export function getMemberQuest(id) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest/' + id,
    method: 'get'
  })
}

// 新增会员任务
export function addMemberQuest(data) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest',
    method: 'post',
    data: data
  })
}

// 修改会员任务
export function updateMemberQuest(data) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest',
    method: 'put',
    data: data
  })
}

// 删除会员任务
export function delMemberQuest(id) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest/' + id,
    method: 'delete'
  })
}

// 导出会员任务列表
export function exportMemberQuest(query) {
  return request({
    url: url.game88PlatformAdminWeb + '/member/memberQuest/export',
    method: 'get',
    params: query,
    responseType: 'arraybuffer',
    timeout: 60000
  })
}
