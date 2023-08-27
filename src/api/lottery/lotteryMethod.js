import {url} from "@/utils/url";
import request from "@/utils/request";

/**
 * 查询彩票种类列表 lottery method list
 */
export function listLotteryMethodData(query){
    return request({
        url: url.game99LotteryAdminWeb + "/lottery/method/list",
        method: 'get',
        params:query
    })
}