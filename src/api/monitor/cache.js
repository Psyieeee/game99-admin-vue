import request from '@/utils/request'
import {url} from "@/utils/url";

// 查询缓存详细
export function getCache() {
    return request({
        url: url.game99AdminWeb + '/monitor/cache',
        method: 'get'
    })
}

// 查询缓存名称列表
export function listCacheName() {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/getNames',
        method: 'get'
    })
}

// 查询缓存键名列表
export function listCacheKey(cacheName) {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/getKeys/' + cacheName,
        method: 'get'
    })
}

// 查询缓存内容
export function getCacheValue(cacheName, cacheKey) {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/getValue/' + cacheName + '/' + cacheKey,
        method: 'get'
    })
}

// 清理指定名称缓存
export function clearCacheName(cacheName) {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/clearCacheName/' + cacheName,
        method: 'delete'
    })
}

// 清理指定键名缓存
export function clearCacheKey(cacheKey) {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/clearCacheKey/' + cacheKey,
        method: 'delete'
    })
}

// 清理全部缓存
export function clearCacheAll() {
    return request({
        url: url.game99AdminWeb + '/monitor/cache/clearCacheAll',
        method: 'delete'
    })
}
