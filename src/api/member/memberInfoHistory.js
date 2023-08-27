import request from '@/utils/request'
import {url} from "@/utils/url";

/**  查询会员信息列表 Query member information History list */
export function listMemberInfoHistory(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/list',
        method: 'get',
        params: query
    })
}

/**  统计会员余额保险箱 Statistical member balance safe box */
export function listCountApi(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/listCount',
        method: 'get',
        params: query
    })
}


/**  查询会员信息详细 Query member information details by id */
export function getMemberInfoHistory(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/' + id,
        method: 'get'
    })
}

/**  导出会员信息 Export member information */
export function exportMemberInfoHistory(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 会员完整手机号码查看 Member full mobile phone number view */
export function fullMobileHistory(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/fullMobile/' + id,
        method: 'get'
    })
}


/** 查询会员线上充值历史金额 */
export function getHistoryRecharge(id) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/getHistoryRecharge/' + id,
        method: 'get'
    })
}

/**  查询银行卡列表接口 */
export function cardList(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/member/memberInfoHistory/card-list',
        method: 'get',
        params: query
    })
}























