import request from "@/utils/request";
import {url} from "@/utils/url";

export function customerSupportList(){
    return request({
        url:url.game99PlatformAdminWeb+"/config/env/customerSupportData",
        method:'get'
    })
}

export function updateCustomerSupport(data) {
    return request({
        url: url.game99PlatformAdminWeb + '/config/env/updateSupportLink',
        method: 'post',
        data: data
    })
}