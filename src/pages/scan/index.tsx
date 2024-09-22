import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import { Button } from "@nutui/nutui-react-taro"
import './index.scss'

function Index() {

  useEffect((query) => {
    let q = decodeURIComponent(query.q)
    q = q.replace(Env.wxqrUrl + '?', '')
    console.log(q);
    let arr = q.split('&')
    for (let i of arr) {
      let arri = i.split('=')
      this.scan[arri[0]] = arri[1]
    }

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
          Taro.switchTab({url: '/pages/index/index'})
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
