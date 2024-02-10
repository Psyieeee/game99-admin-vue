import {url} from "@/utils/url";
import request from "@/utils/request";

/**
 * 查询派送彩金暂存表列表 list all data api
 */
export function listMemberMoneyData(query){
    return request({
        url:url.game99PlatformAdminWeb + "/member/money/list",
        method:'get',
        params:query
    })
}

/**
 * Upload excel file
 */
export function uploadExcelUrl(){
    return url.baseUrl + url.game99PlatformAdminWeb + "/member/memberInfo/batchUploadExcel";
}


export function handleCleanData() {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/handleClean',
        method: 'get'
    })
}

/**  导出派送彩金暂存表  */
export function exportMemberMoney(query) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**  查询派送彩金暂存表详细  */
export function getMemberMoney(memberId) {
    console.log(memberId)
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/' + memberId,
        method: 'get'
    })
}

/**  修改派送彩金暂存表 */
export function updateMemberMoney(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money',
        method: 'put',
        data: data
    })
}

/** 新增派送彩金暂存表 */
export function addMemberMoney(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money',
        method: 'post',
        data: data
    })
}

/** 删除派送彩金暂存表 */
export function delMemberMoney(id) {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/' + id,
        method: 'delete'
    })
}

export function count() {
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/count' ,
        method: 'get'
    })
}

export function starSend(moneydes,googleAuthCode) {
    console.log("Sending: " + moneydes + " - " + googleAuthCode);
    const data = {
        moneydes,
        googleAuthCode
    }
    return request({
        url: url.game99PlatformAdminWeb + '/member/money/starSend',
        method: 'post',
        data: data,
        timeout: 1000000
    })
}
