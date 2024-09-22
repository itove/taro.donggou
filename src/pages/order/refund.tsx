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
  const [checked, setChecked] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [order, setOrder] = useState({node:{}})
  const instance = Taro.getCurrentInstance()
  const oid = instance.router.params.oid

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
    Taro.request({
      url: Env.apiUrl + 'orders/' + oid
    })
    .then(res => {
      const o = res.data
      setOrder(o)
      console.log(o)
      if (o.status === 3) {
        setChecked(true)
      }
    })
  }, [])

  const back = () => {
    Taro.switchTab({url: '/pages/me/index'})
  }

  const refund = () => {
    setDisabled(true)
    Taro.request({
      method: 'POST',
      data: { oid: oid, reason: 0 },
      url: Env.apiUrl + 'orders/refund'
    }).then((res) =>{
      if (res.statusCode === 200) {
        Taro.showToast({
          title: '退款已提交',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(
              () => {
                Taro.reLaunch({url: '/pages/me/index'})
              }, 500
            )
          }
        })
      } else {
        setDisabled(false)
        Taro.showToast({
          title: '系统错误',
          icon: 'error',
          duration: 2000
        })
      }
    })
  }

  return (
    <View className="order order-refund">
      { order.status === 2 &&
        <>
        <View className='msg'>
        <View> 产品：{order.node.title}</View>
        <View> 单价：¥{order.price / 100} </View>
        <View> 数量：{order.quantity} </View>
        <View> 合计：¥{order.amount / 100} </View>
        <View> 退款金额：¥{order.amount / 100} </View>
        </View>
        <Button className='btn-danger' onClick={refund} disabled={disabled}>确定退款</Button>
        </>
      }
    </View>
  )
}

export default Index
