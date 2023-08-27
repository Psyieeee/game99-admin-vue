import request from "@/utils/request";
import {url} from "@/utils/url";


/**
 * 查询任务信息列表 list all date
 */
export function configRecommendListData(query){
    return request({
        url:url.game88PlatformAdminWeb+"/config/recommend/list",
        method:'get',
        params:query
    })
}

/**
 * 导出推广设置列表  export data
 */
export function exportConfigRecommend(query) {
    return request({
        url: url.game88PlatformAdminWeb + '/config/recommend/export',
        method: 'get',
        params: query,
        responseType: 'arraybuffer',
        timeout: 60000
    })
}

/**
 * 获取推广设置详细信息 get data by id
 */
export  function  configRecommendById(id){
    return request({
        url: url.game88PlatformAdminWeb + '/config/recommend/'+id,
        method: 'get',
    })
}

/**
 * 新增推广设置  insert data into database
 */
export function addConfigRecommend(values){
    return request({
        url:url.game88PlatformAdminWeb+ "/config/recommend",
        method:'post',
        data:values
    })
}

/**
 * 修改推广设置 update data api
 */
export function updateConfigRecommend(values){
    return request({
        url:url.game88PlatformAdminWeb+ "/config/recommend",
        method:'put',
        data:values
    })
}

/**
 * 删除推广设置 delete data according to id
 */
export function deleteConfigRecommend(id){
    return request({
        url:url.game88PlatformAdminWeb+"/config/recommend/"+id,
        method:'delete'
    })
}















