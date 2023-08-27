import {url} from "@/utils/url";
import request from "@/utils/request";


/**
 * 查询代付通道列表 Query the list of payment channels
 */
export function payAgentChannelListData(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/list",
        method:'get',
        params:query
    })
}
/**
 * 激活中的代付通道选择列表 Active payment channel selection list
 */
export function payAgentChannelEffectList(){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/effectList",
        method:'get',
    })
}

/**
 * 导出代付通道列表 export data
 */
export function  payAgentChannelExport(query){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/export",
        method:'get',
        params:query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}


/**
 * 获取代付通道详细信息 select by id
 */
export function payAgentChannelById(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/"+id,
        method:'get',
    })
}

/**
 * 新增代付通道 add new data
 */
export function addPayAgentChannel(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel",
        method:'post',
        data:data
    })
}


/**
 * 修改代付通道 update pay agent channel data
 */
export function updatePayAgentChannel(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel",
        method:'put',
        data:data
    })
}

/**
 * 删除代付通道 delete pay agent channel data
 */
export function removePayAgentChannel(id){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/"+id,
        method:'delete',
    })
}

/**
 * 代付通道状态修改 change status pay agent channel
 */
export function changeStatusPayAgentChannel(id,effect){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/changeStatus/" +id + "/" + effect,
        method:'put',
    })
}

/**
 * 代付下单 pre order data
 */
export function preOrderPayAgentChannel(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/payAgentOrder",
        method:'post',
        data:data
    })
}

/**
 * 批量代付下单 pre orders data
 */
export function preOrdersPayAgentChannel(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payAgentChannel/payAgentOrders",
        method:'post',
        data:data
    })
}








