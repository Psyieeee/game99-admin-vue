import request from "@/utils/request";
import {url} from "@/utils/url";

export function listRecord(query){
    return request({
        url:url.game99PlatformAdminWeb+"/mission/history/list",
        method:'get',
        params:query
    })
}
export function clearMonthOld(){
    return request({
        url:url.game99PlatformAdminWeb+"/mission/history/clearMonthOld",
        method:'delete'
    })
}
