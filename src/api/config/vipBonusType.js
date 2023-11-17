import request from "@/utils/request";
import {url} from "@/utils/url";

export function getVipBonusTypeList(){
    return request({
        url:url.game99PlatformAdminWeb+"/vipBonus/type/listAll",
        method:'get',
    })
}
















