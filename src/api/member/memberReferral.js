import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function memberReferralListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/list/",
        method:'get',
        params:query
    })
}

export function memberReferralReport(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/listReport/",
        method:'get',
        params:query
    })
}
