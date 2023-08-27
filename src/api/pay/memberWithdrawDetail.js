import {url} from "@/utils/url";
import request from "@/utils/request";


/**
 * 查询会员提现信息列表  member Withdraw Detail List
 */
export function memberWithdrawDetailList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/list",
        method:'get',
        params:query
    })
}

/**
 * 获取会员提现信息详细信息 member Withdraw Detail Get By Id
 */
export function memberWithdrawDetailGetById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/"+id,
        method:'get',
    })
}

/**
 * 获取会员提现信息统计 member Withdraw Detail Count Total
 */
export function memberWithdrawDetailCountTotal(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/countTotal",
        method:'get',
        params:query
    })
}

/**
 * 获取会员提现信息详细信息 member Withdraw Detail Report ById
 */

export function memberWithdrawDetailReportById(memberId){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/report/"+memberId,
        method:'get',
    })
}

/**
 * 查询资金明细列表  report List
 */
export function memberWithdrawDetailReportList(){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/reportList",
        method:'get',
    })
}


/**
 * count
 */
export function memberWithdrawDetailReportCount(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/count",
        method:'get',
        params:query
    })
}

/**
 * 导出会员提现信息列表 member Withdraw Detail export
 */
export function memberWithdrawDetailExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 顺为代付格式导出会员提现信息列表 member Withdraw Detail Export ShunWei
 */
export function memberWithdrawDetailExportShunWei(ids){
    const data = {
        ids: ids
    }
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/exportShunWei",
        method:'post',
        data:data,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 会员提现批量拒绝 member Withdraw Detail refused
 */
export function memberWithdrawDetailRefused(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/refused",
        method:'put',
        data:data
    })
}

export function memberWithdrawDetailRefuseds(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/refuseds",
        method:'put',
        data:data
    })
}


/**
 * 会员提现批量锁定 member Withdraw Detail locks
 */
export function memberWithdrawDetailLocks(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/locks",
        method:'put',
        data:data
    })
}

/**
 * 会员提现回退 member Withdraw Detail Back
 */
export function memberWithdrawDetailBack(withdrawOrderNo){
    const data = {id:withdrawOrderNo}
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/back",
        method:'put',
        data:data
    })
}

/**
 * 会员提现代付失败回退 member Withdraw Detail failBack
 */
export function memberWithdrawDetailFailBack(withdrawOrderNo){
    const data = {id:withdrawOrderNo}
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/failBack",
        method:'put',
        data:data
    })
}

/**
 * 会员提现查询状态 memberWithdrawDetail query status update
 */
export function memberWithdrawDetailQueryStatus(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/queryStatus",
        method:'put',
        data:data
    })
}

/**
 * 会员提现锁定 member Withdraw Detail lock
 */
export function memberWithdrawDetailLock(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/lock",
        method:'put',
        data:data
    })
}

/**
 * 会员提现解锁 member Withdraw Detail update unlock
 */
export function memberWithdrawDetailUnLock(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/unlock",
        method:'put',
        data:data
    })
}

/**
 * 会员提现人工出款 memberWithdrawDetail update Artificial
 */
export function memberWithdrawDetailArtificial(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/artificial",
        method:'put',
        data:data
    })
}

 /**
 * 修改备注 member Withdraw Detail update remark
 */
export function memberWithdrawDetailUpdateRemark(id,remark){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/updateRemark",
        method:'put',
        data:{id,remark}
    })
}

/**
 * 会员出款异常 member Withdraw Detail update remark
 */
export function memberWithdrawDetailAbnormalWithdrawal(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/abnormalWithdrawal",
        method:'put',
        data:data
    })
}

/**
 * 会员人工代付中 member Withdraw Detail manual Withdrawal
 */
export function memberWithdrawDetailManualWithdrawal(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberWithdrawDetail/manualWithdrawal",
        method:'put',
        data:data
    })
}

export function effectListPayAgentPlatform() {
    return request({
        url: url.game99PayAdminWeb + '/pay/memberWithdrawDetail/effectMemberWithdraw',
        method: 'get'
    })
}