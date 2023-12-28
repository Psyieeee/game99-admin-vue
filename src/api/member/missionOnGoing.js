import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/mission/ongoing/list",
        method:'get',
        params:query
    })
}
