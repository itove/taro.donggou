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

  const cancelOrder = () => {
    console.log('cancel')
    Taro.showModal({
      title: '提示',
      content: '确定取消订单？',
      success: function (res) {
        if (res.confirm) {
          Taro.request({
            method: 'POST',
            data: { oid: oid },
            url: Env.apiUrl + 'orders/cancel'
          }).then((res) =>{
            if (res.statusCode === 200) {
              Taro.showToast({
                title: '订单已取消',
                icon: 'success',
                duration: 2000,
                success: () => {
                  setTimeout(
                    () => {
                      Taro.reLaunch({url: '/pages/order/index'})
                    }, 500
                  )
                }
              })
            }
          })
        } else if (res.cancel) {
        }
      }
    })
  }
  const buy = () => {
    console.log('buy')
  }
  const refund = () => {
    console.log('refund')
    Taro.navigateTo({ url: 'refund?oid=' + oid })
  }

  const showQr = (oid) => {
    console.log('showQr')
    Taro.navigateTo({ url: 'qr?oid=' + oid })
  }

  const showOrder = () => {
    Taro.navigateTo({url: 'show?oid=' + oid})
  }

  return (
    <View className="order order-show">
      <View className="">
        <View className=""> 订单编号：{order.sn} </View>
        <View className="list-item">
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
          <View className="total">合计 <span className="small">¥ </span>{order.amount / 100}</View>
        </View>
        </View>
      </View>
      <View className="date">
        <View>创建时间: {fmtDate(order.createdAt)} </View>
        { order.paidAt &&
        <View>支付时间: {fmtDate(order.paidAt)} </View>
        }
      </View>
      <View className="btns">
        <Button className="btn btn-success" onClick={showOrder}>订单详情</Button>
      </View>
    </View>
  )
}

export default Index
