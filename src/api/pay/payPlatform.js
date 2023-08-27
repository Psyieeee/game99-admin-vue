import request from '@/utils/request'
import {url} from '@/utils/url'

export function listPayPlatform(query){
   return request({
       url : url.game99PayAdminWeb +"/pay/payPlatform/list",
       method:'get',
       params :query
   })
}

export function getAllPayPlatform(){
    return request({
        url : url.game99PayAdminWeb+"/pay/payPlatform/listAll",
        method:'get',
    })
}

export function exportPayPlatform(query){
    return request({
        url: url.game99PayAdminWeb + '/pay/payPlatform/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}


export function getPayPlatformById(id){
    return request({
        url : url.game99PayAdminWeb+"/pay/payPlatform/"+id,
        method:'get'
    })
}

export function addPayPlatform(data){
    return request({
        url : url.game99PayAdminWeb+"/pay/payPlatform",
        method:'post',
        data:data
    })
}

export function editPayPlatform(data){
    return request({
        url:url.game99PayAdminWeb+"/pay/payPlatform",
        method:'put',
        data:data
    })
}

export function deletePayPlatform(id){
    return request({
        url :url.game99PayAdminWeb+"/pay/payPlatform/"+id,
        method:'delete'
    })
}