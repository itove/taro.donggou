import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import { Avatar } from "@nutui/nutui-react-taro"
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'

function Index() {
  const [logged, setLogged] = useState(false)
  const [user, setUser] = useState({})
  const [uid, setUid] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      setLogged(true)
      // fetch data
      Taro.request({
        url: Env.apiUrl + 'users/' + res.data.id
      })
      .then(res => {
        console.log(res)
        let u = res.data
        setUser(u)
        setUid(u.id)
        if (u.avatar !== undefined) {
          setAvatarUrl(Env.baseUrl + u.avatar)
        }
      })
    })
    .catch(err => {
      console.log(err)
      // Taro.redirectTo({url: '/pages/me/login'})
    })
  }, [])

  const goto = (region) => {
    if (logged) {
      Taro.navigateTo({ url: '/pages/node/index?region=' + region + '&uid=' + uid})
    } else {
      Taro.navigateTo({ url: 'login'})
    }
  }

  return (
    <View className="">
      <View className="p-1 align-items-center d-flex">
        <View onClick={() => Taro.navigateTo({url: 'info'})}>
          <Avatar
            size="50"
            src={avatarUrl}
          />
        </View>
        <View className="ms-1">
            { logged &&
            <View onClick={() => Taro.navigateTo({url: 'info'})}>{user.name}</View>
            ||
            <View onClick={() => Taro.navigateTo({url: 'login'})}>请点击登录</View>
            }
        </View> 
      </View>

      <View className="block">
        <View className="header">
          我的收藏
        </View>
        <View className="info-2">
          <View className="item" onClick={() => goto('youzai')}>
            <img
              src={Env.iconUrl + 'grid_1.png'}
            />
            <View> 游在东沟 </View>
          </View>
          <View className="item" onClick={() => goto('zhuzai')} >
            <img
              src={Env.iconUrl + 'grid_2.png'}
            />
            <View> 住在东沟 </View>
          </View>
          <View className="item" onClick={() => goto('chizai')} >
            <img
              src={Env.iconUrl + 'grid_3.png'}
            />
            <View> 吃在东沟 </View>
          </View>
          <View className="item" onClick={() => goto('gouzai')} >
            <img
              src={Env.iconUrl + 'grid_4.png'}
            />
            <View> 购在东沟 </View>
          </View>
        </View>
      </View>

      <View className="block">
        <View className="header">
          我的订单
        </View>
        <View className="info-2">
          <View className="item" onClick={() => goto('youzai')}>
            <img
              src={Env.iconUrl + 'grid_1.png'}
            />
            <View> 待付款 </View>
          </View>
          <View className="item" onClick={() => goto('zhuzai')} >
            <img
              src={Env.iconUrl + 'grid_2.png'}
            />
            <View> 已付款 </View>
          </View>
          <View className="item" onClick={() => goto('chizai')} >
            <img
              src={Env.iconUrl + 'grid_3.png'}
            />
            <View> 已完成 </View>
          </View>
          <View className="item" onClick={() => goto('gouzai')} >
            <img
              src={Env.iconUrl + 'grid_4.png'}
            />
            <View> 退款 </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default Index
