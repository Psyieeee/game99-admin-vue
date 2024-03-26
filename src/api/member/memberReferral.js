import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function memberReferralListData(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/summary/",
        method:'get',
        params:data
    })
}

export function memberReferralReport(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/listReport/",
        method:'get',
        params:data
    })
}
