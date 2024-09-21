export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/nav/index',
    'pages/me/info',
    'pages/node/index',
    'pages/leyou/index',
    'pages/me/index',
    'pages/me/name',
    'pages/me/setting',
    'pages/order/index',
    'pages/feedback/index',
    'pages/me/login',
    'pages/node/show',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0FB99F',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'white',
    backgroundColor: '#ed7373', // 窗口的背景色 WTF? https://taro-docs.jd.com/docs/app-config#window
  },
  tabBar: {
    // custom: true,
    color: '#808080',
    selectedColor: '#0FB99F',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        "pagePath": "pages/index/index",
        "text": "走进东沟",
        "iconPath": './icons/hill.png',
        "selectedIconPath": './icons/hill-fill.png',
      },
      {
        "pagePath": "pages/leyou/index",
        "text": "乐游东沟",
        "iconPath": './icons/hill-river.png',
        "selectedIconPath": './icons/hill-river-fill.png'
      },
      {
        "pagePath": "pages/nav/index",
        "text": "智慧导览",
        "iconPath": './icons/pavilion.png',
        "selectedIconPath": './icons/pavilion-fill.png'
      },
      {
        "pagePath": "pages/me/index",
        "text": "我的",
        "iconPath": './icons/user.png',
        "selectedIconPath": './icons/user-fill.png'
      },
    ]
  },
 requiredPrivateInfos: [
   "getLocation",
 ],
 permission: {
   'scope.userLocation': {
     desc: "你的位置信息将用于显示景点距离"
   }
 },
 lazyCodeLoading: 'requiredComponents',
})
