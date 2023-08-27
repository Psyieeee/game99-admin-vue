import request from '@/utils/request'
import {url} from "@/utils/url";

// 获取路由
export const getRouters = () => {
  return request({
    url: url.game99AdminWeb + '/getRouters',
    method: 'get'
  })
}