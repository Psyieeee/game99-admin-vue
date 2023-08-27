import request from '@/utils/request'
import {url} from '@/utils/url'


/**
 * 查询平台资金报，记录平台每日收入及支出总额，预估当前会员的积分余额列表
 */
export function listReportPlamGameChild(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/report/plamGamesChilds/list',
        method: 'get',
        params: query
    })
}
