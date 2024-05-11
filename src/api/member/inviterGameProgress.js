import request from "@/utils/request";
import {url} from "@/utils/url";

export function getInviterGameProgressList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/inviterGameProgress/list",
        method:'get',
        params:query
    })
}
