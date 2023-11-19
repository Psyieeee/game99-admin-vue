import request from "@/utils/request";
import {url} from "@/utils/url";

export function collectTestMoneyList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/collectTestMoney/list",
        method:'get',
        params:query
    })
}
