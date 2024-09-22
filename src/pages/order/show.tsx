import React, { useState, useEffect } from 'react'
import { View, Image, Button } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { STATUS } from '../../orderStatus'
import { Grid, NoticeBar, Swiper, Tabs } from '@nutui/nutui-react-taro'
import { fmtDate } from '../../utils/fmtDate'

function Index() {
  const [uid, setUid] = useState(0)
  const [logged, setLogged] = useState(false)
  const [order, setOrder] = useState({node:{}})
  const instance = Taro.getCurrentInstance();
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
      // Taro.redirectTo({url: '/pages/me/login'})
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
    })
  }, [])

  return (
    <View className="order order-show">
      <View className="">
        <View className="list-item" onClick={() => showOrder(order.id)}>
        <View className="left">
          <View className="img">
          <Image className="w-100 rounded" height="90px" src={Env.imageUrl + order.node.image} mode="widthFix" />
          </View>
          <View className="text">
          {order.node.title}
          <p className="ellipsis-2">{order.node.summary}</p>
          </View>
        </View>
        <View className="right">
          <View className="status">{STATUS[order.status]}</View>
          <View><span className="small">¥ </span>{order.price / 100}</View>
          <View><span className="small">x</span>{order.quantity}</View>
          <View className="total">总价 <span className="small">¥ </span>{order.amount / 100}</View>
        </View>
        </View>
      </View>
      <View className="date">
        <View>创建时间: {fmtDate(order.createdAt)} </View>
        { order.status >= 2 &&
        <View>支付时间: {fmtDate(order.paidAt)} </View>
        }
        { order.status >= 3 &&
        <View>核销时间: {fmtDate(order.usedAt)} </View>
        }
      </View>
      <View className="btns">
        <Button className="btn">取消订单</Button>
        <Button className="btn btn-danger">退款</Button>
      </View>
    </View>
  )
}

export default Index
