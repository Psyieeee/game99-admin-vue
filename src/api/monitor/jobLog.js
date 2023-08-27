import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询调度日志列表
export function listJobLog(query) {
    return request({
        url: url.game99AdminWeb + '/monitor/jobLog/list',
        method: 'get',
        params: query
    })
}

// 删除调度日志
export function delJobLog(jobLogId) {
    return request({
        url: url.game99AdminWeb + '/monitor/jobLog/' + jobLogId,
        method: 'delete'
    })
}

// 清空调度日志
export function cleanJobLog() {
    return request({
        url: url.game99AdminWeb + '/monitor/jobLog/clean',
        method: 'delete'
    })
}
