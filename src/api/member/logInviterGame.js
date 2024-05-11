import request from "@/utils/request";
import {url} from "@/utils/url";

export function getLogInviterGameList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/logInviterGame/list",
        method:'get',
        params:query
    })
}
