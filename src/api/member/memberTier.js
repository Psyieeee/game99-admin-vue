import request from "@/utils/request";
import {url} from "@/utils/url";

export function memberTierListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberTier/list/",
        method:'get',
        params:query
    })
}

export function getTierMemberData(id){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberTier/" + id,
        method:'get'
    })
}

export function addMemberTier(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberTier/add",
        method:'post',
        data : data
    })
}

export function updateMemberTier(data){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberTier/edit",
        method:'put',
        data : data
    })
}

export function deleteMemberTier(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/member/memberTier/"+mobile,
        method:'delete',
    })
}