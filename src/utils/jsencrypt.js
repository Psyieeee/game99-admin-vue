import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDIjxO5V3CouNtqj74WVt3c5yh2' +
    'VjOAr1B5+baTy0YQ4aeU6gmIc9ARUZWi15PfLcyfeGJFf/YGWwAjPDQrFlBVbeC0' +
    'xLldQWgz7e8Ag0uZwQDX3Xm0+6Y/2cSb3RlfoDf9sBpuxeS+4n9tmD2X7gAnsniG' +
    'gsnWJMTCnunL8cy1xQIDAQAB'

// 加密
export function encrypt(txt) {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey) // 设置公钥
    return encryptor.encrypt(txt) // 对数据进行加密
}
