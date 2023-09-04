import request from '@/utils/request'
import {url} from '@/utils/url'

// 查询会员任务列表
export function listMemberFeedback(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberFeedback/list',
        method: 'get',
        params: query
    })
}

export function updateFeedbackState( states, id ) {
    const data = {
        states,
        id
    }
    return request({
        url: url.game99PlatformAdminWeb + '/member/memberFeedback',
        method: 'put',
        data: data
    })
}

