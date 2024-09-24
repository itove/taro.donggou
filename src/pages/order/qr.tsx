import React, { useState, useEffect } from 'react'
import { View, Image, Button } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { STATUS } from '../../orderStatus'
import { Grid, NoticeBar, Swiper, Tabs } from '@nutui/nutui-react-taro'
import { fmtDate } from '../../utils/fmtDate'
import { QRCode } from 'taro-code'

function Index() {
  const [uid, setUid] = useState(0)
  const [logged, setLogged] = useState(false)
  const [order, setOrder] = useState({node:{}})
  const instance = Taro.getCurrentInstance();
  const oid = instance.router.params.oid
  const text = Env.wxqrUrl + '?oid=' + oid

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      setLogged(true)
      setUid(res.data.id)
    })
    .catch(err => {
      console.log(err)
      Taro.redirectTo({url: '/pages/me/login'})
    })
  }, [])

  useEffect(() => {
    Taro.setScreenBrightness({value: 1})
  }, [])

  useDidHide(() => {
    Taro.setScreenBrightness({value: -1})
  })

  return (
    <View className="order order-qr">
      <QRCode
        // onClick={this.qrclicked}
        text={text}
        size={200}
        scale={4}
        errorCorrectLevel='M'
        typeNumber={2}
      />
      <View className="text">请向景区工作人员出示已完成核销</View>
    </View>
  )
}

export default Index
