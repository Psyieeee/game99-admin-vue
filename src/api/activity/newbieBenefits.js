import {url} from "@/utils/url";
import request from "@/utils/request";

export function newbieListData(query){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/list",
        method:'get',
        params:query
    })
}

export function deleteNewbie(mobile){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/"+mobile,
        method:'delete',
    })
}

export function addNewbieBenefits(data){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/add",
        method:'post',
        data : data
    })
}

export function updateNewbieBenefits(data){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/edit",
        method:'post',
        data : data
    })
}

export function changeNewbieStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/newbieBenefits/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}