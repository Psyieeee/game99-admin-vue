import {url} from "@/utils/url";
import request from "@/utils/request";

/** 查询列表 list data*/
export function memberReferralListData(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/summary",
        method:'post',
        data:data
    })
}

export function memberReferralReport(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberReferral/listReport",
        method:'post',
        data:data
    })
}
