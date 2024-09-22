import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'

function Index() {
  const instance = Taro.getCurrentInstance()
  const query = instance.router.params.q
  const [logged, setLogged] = useState(false)
  const q = decodeURIComponent(query).replace(Env.wxqrUrl + '?', '')

  useEffect(() => {
    console.log(q)

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
        const u = res.data
        if (u.roles.includes('ROLE_CASHIER')) {
          Taro.redirectTo({url: '/pages/order/check?' + q})
        } else {
          // Taro.switchTab({url: '/pages/index/index'})
        }
      })
    })
    .catch(err => {
      console.log(err)
      // Taro.redirectTo({url: '/pages/me/login'})
    })
  }, [])

  return (
    <View className="scan">
    </View>
  )
}

export default Index
