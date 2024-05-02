import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 *  activity info list api
 */
export function getConfigDepositBonusList(query) {
    return request({
        url: url.game99PlatformAdminWeb + "/config/configDepositBonus/list",
        method: 'get',
        params: query
    })
}

/**
 *  ADD new config deposit bonus
 */
export function addConfigDepositBonus(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/config/configDepositBonus/add",
        method: 'post',
        data: data
    })
}

export function getConfigDepositBonusInfo(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/config/configDepositBonus/" + id,
        method: 'get'
    })
}

/**
 *  UPDATE new config deposit bonus
 */
export function updateConfigDepositBonus(data) {
    return request({
        url: url.game99PlatformAdminWeb + "/config/configDepositBonus/edit",
        method: 'put',
        data: data
    })
}

/**
 *  UPDATE new config deposit bonus
 */
export function deleteConfigDepositBonus(ids){
    return request({
        url:url.game99PlatformAdminWeb+"/config/configDepositBonus/delete/"+ids,
        method:'delete'
    })
}

export function changeStatusConfigDepositBonus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/config/configDepositBonus/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}