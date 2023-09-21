import request from '@/utils/request'
import {url} from "@/utils/url";

export function listLogInterest(queryParams) {
    return request({
        url: url.game99PayAdminWeb + '/log/interest/list',
        method: 'post',
        data: queryParams
    })
}

export function exportLogInterest(queryParams){
    return request({
        url: url.game99PayAdminWeb + '/log/interest/export',
        method: 'get',
        params: queryParams,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}