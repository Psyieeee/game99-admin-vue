import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询操作日志列表
export function list(query) {
    return request({
        url: url.game99AdminWeb + '/monitor/operlog/list',
        method: 'get',
        params: query
    })
}
