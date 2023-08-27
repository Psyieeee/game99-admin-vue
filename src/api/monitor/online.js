import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询在线用户列表
export function list(query) {
    return request({
        url: url.game99AdminWeb + '/monitor/online/list',
        method: 'get',
        params: query
    })
}

// 强退用户
export function forceLogout(userId) {
    return request({
        url: url.game99AdminWeb + '/monitor/online/' + userId,
        method: 'delete'
    })
}
