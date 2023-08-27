import request from '@/utils/request'
import {url} from '@/utils/url'


/** 查询公司入款信息列表 Query the company's payment information list api*/
export function memberRechargeBankList(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/list",
        method:'get',
        params:query
    })
}

/** 查询公司入款信息列表统计 Query the count of the company's payment api*/
export function memberRechargeBankCount(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/listCount",
        method:'get',
        params:query
    })
}

/**导出公司入款信息列表 export member recharge bank information*/
export function exportMemberRechargeBank(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/** 获取公司入款信息详细信息 get by ID member recharge bank information*/
export function getMemberRechargeBankById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/"+id,
        method:'get'
    })
}

/** 公司入款信息初审 */
export function memberRechargeBankFirstAudit(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/firstAudit",
        method:'put',
        data:data
    })
}

/** 公司入款信息终审 */
export function memberRechargeBankFinalAudit(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/finalAudit",
        method:'put',
        data:data
    })
}

/** 公司入款信息拒绝审核 */
export function memberRechargeBankRefusedAudit(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/refusedAudit",
        method:'put',
        data:data
    })
}

/** 公司入款信息恢复审核 */
export function MemberRechargeBankRecoverAudit(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/recoverAudit",
        method:'put',
        data:data
    })
}


export function MemberRechargeBankUpdateRemark(id,remark){
    console.log(id,remark)
    return request({
        url:url.game99PayAdminWeb+"/pay/memberRechargeBank/updateRemark",
        method:'put',
        data:{id,remark}
    })
}









