import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询登录日志列表
export function list(query) {
    return request({
        url: url.game99AdminWeb + '/monitor/logininfor/list',
        method: 'get',
        params: query
    })
}
