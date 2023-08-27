import request from '@/utils/request'
import {encrypt} from "@/utils/jsencrypt";
import {url} from "@/utils/url";
import {getRouters} from "@/api/menu";

// 登录方法
export function login(username, password, code, uuid) {
    const data = {
        username,
        password,
        code,
        uuid
    }
    let encryptData = encrypt(JSON.stringify(data))
    return request({
        url: url.game99AdminWeb + '/login',
        headers: {
            isToken: false
        },
        method: 'post',
        data: encryptData
    })
}

// 获取用户详细信息
export function getInfo() {
    return request({
        url: url.game99AdminWeb + '/getInfo',
        method: 'get'
    })
}

// 退出方法
export function logout() {
    return request({
        url: url.game99AdminWeb + '/logout',
        method: 'post'
    })
}

export function checkPaths(...paths) {
    return getRouters().then((res) => {
        for (const route of res.data.menus) {
            if (route.path === "/money") {
                for (const child of route.children) {
                    for (const p of paths) {
                        if (child.path === p) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    });
}

export function checkPath(path) {
    return getRouters().then((res) => {
        for (const route of res.data.menus) {
            if (route.path === "/money") {
                for (const child of route.children) {
                    if (child.path === path) {
                        return true;
                    }
                }
            }
        }
        return false;
    });
}