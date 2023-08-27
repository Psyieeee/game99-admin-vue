import request from "@/utils/request";
import {url} from "@/utils/url";

/**
 * 查询彩票会员下注详情列表 get all data
 */
export function listLotteryHistory(query){
    return request({
        url:url.game99LotteryAdminWeb+"/lottery/lotteryHistory/list",
        method:'get',
        params:query
    })
}
