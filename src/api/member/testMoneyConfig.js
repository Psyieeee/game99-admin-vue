import request from "@/utils/request";
import {url} from "@/utils/url";

export function testMoneyConfigList(query){
    return request({
        url:url.game99PlatformAdminWeb+"/test/money/list",
        method:'get',
        params:query
    })
}

// export function deleteTestMoneyConfig(ids){
//     return request({
//         url:url.game99PlatformAdminWeb+"/test/money/"+ids,
//         method:'delete',
//     })
// }

export function changeEffectStatus(id, status) {
    return request({
        url: url.game99PlatformAdminWeb + "/test/money/changeStatus/" + id + "/" + status,
        method: 'put'
    })
}


export function addTestMoneyConfig(data){
    return request({
        url:url.game99PlatformAdminWeb+"/test/money",
        method:'post',
        data : data
    })
}

export function updateTestMoneyConfig(data){
    return request({
        url:url.game99PlatformAdminWeb+"/test/money",
        method:'put',
        data : data
    })
}

export function getTestMoneyConfig(id) {
    return request({
        url: url.game99PlatformAdminWeb + "/test/money/" + id,
        method: 'get'
    })
}