import request from '@/utils/request'
import {url} from '@/utils/url'

/**
 * 查询彩票信息列表 list all of data
 */
export function listLotteryInfo(query) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo/list',
        method: 'get',
        params: query
    })
}

export function listAllLotteryInfo() {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo/listAll',
        method: 'get',
    })
}

/**
 * 获取彩票信息详细信息 get data by id
 */
export function getLotteryInfo(id) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo/' + id,
        method: 'get'
    })
}

/**
 * 新增彩票信息 add lottery
 */
export function addLotteryInfo(data) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo',
        method: 'post',
        data: data
    })
}

/**
 * 修改彩票信息 update lottery
 */
export function updateLotteryInfo(data) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo',
        method: 'put',
        data: data
    })
}

// 修改主播禁播状态- Lottery Status Handler Url
export function lotteryInfoUpdateStatus(id,effect) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo/changeStatus/'+ id + "/"+ effect,
        method: 'put',
    })
}


/**
 * 导出彩票信息列表 export lottery data
 */
export function LotteryInfoExport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/lottery/lotteryInfo/export",
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 删除彩票信息 delete lottery
 */
export function deleteLotteryInfo(id) {
    return request({
        url: url.game99LotteryAdminWeb + '/lottery/lotteryInfo/' + id,
        method: 'delete'
    })
}
