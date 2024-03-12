import request from "@/utils/request";
import {url} from "@/utils/url";

export function getMemberOnlineList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberOnline/list",
        method:'get',
        params:query
    })
}
