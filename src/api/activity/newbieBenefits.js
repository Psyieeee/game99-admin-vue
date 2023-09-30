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
        method:'put',
        data : data
    })
}

export function updateNewbieSettings(data){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/editSettings",
        method:'post',
        data : data
    })
}

export function newbieSettingsOtherDataList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/settingsOtherList",
        method:'get',
        params:query
    })
}

export function newbieSettingsDataList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/newbieBenefits/settingsList",
        method:'get',
        params:query
    })
}

export function getGamePlatformGameTypeList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/questRepeat/getAllGameTypeAndPlatform",
        method:'get',
        params:query
    })
}

export function changeNewbieStatus(id, effect) {
    return request({
        url: url.game99PlatformAdminWeb + '/newbieBenefits/changeStatus/'+ id + "/" + effect,
        method: 'put',
    })
}