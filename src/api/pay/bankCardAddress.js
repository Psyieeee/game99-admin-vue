import {url} from "@/utils/url";
import request from "@/utils/request";

export function bankCardAddressListData(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/bankCardAddress/list",
        method:'get',
        params:query
    })
}

/** 新增【请填写功能名称】 */
export function addBankCardAddress(data) {
    return request({
        url: url.game99PayAdminWeb+"/pay/bankCardAddress",
        method: 'post',
        data: data
    })
}

/** 修改【请填写功能名称】  */
export function updateBankCardAddress(data) {
    return request({
        url: url.game99PayAdminWeb + '/pay/bankCardAddress',
        method: 'put',
        data: data
    })
}

export function changeBankAddressStatus(id, status) {
    return request({
        url: url.game99PayAdminWeb + '/pay/bankCardAddress/changeBankAddressStatus',
        method: 'put',
        data: {id, status}
    })
}

export function changeBankAddressStatusDelete(id) {
    return request({
        url: url.game99PayAdminWeb + '/pay/bankCardAddress/'+id,
        method: 'delete',
    })
}