import Taro from '@tarojs/taro'

let baseUrl
let envVer = Taro.getAccountInfoSync().miniProgram.envVersion
console.log(envVer)

switch (envVer) {
  case 'develop':
    // baseUrl = 'https://127.0.0.1:8000/'
    // baseUrl = 'http://localhost:8000/'
    baseUrl = 'https://192.168.122.1:8000/'
    // baseUrl = 'https://donggou.dev.itove.com/'
    // baseUrl = 'https://www.donggou.net.cn/'
    break
  case 'trial':
    baseUrl = 'https://donggou.dev.itove.com/'
    break
  case 'release':
    baseUrl = 'https://www.donggou.net.cn/';
    break
}

export const Env = {
  ver: envVer, // "0.1.0" WTF
  baseUrl: baseUrl,
  apiUrl: baseUrl + 'api/',
  imageUrl: baseUrl + 'images/',
  iconUrl: baseUrl + 'icons/',
  filesUrl: baseUrl + 'files/',
  uploadUrl: baseUrl + 'api/media_objects',
  wxqrUrl: baseUrl + 'wxqr',
  storageKey: 'user',
  ver: '0.1.0'
}
