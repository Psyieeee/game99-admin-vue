import request from '@/utils/request'
import {url} from "@/utils/url";

// 获取服务信息
export function getServer() {
    return request({
        url: url.game99AdminWeb + '/monitor/server',
        method: 'get'
    })
}