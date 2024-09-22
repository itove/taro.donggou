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

  const cancelOrder = () => {
    console.log('cancel')
    Taro.request({
      method: 'PATCH',
      data: { status: 4 },
      url: Env.apiUrl + 'orders/' + oid,
      header: {
        'content-type': 'application/merge-patch+json'
      }
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
  }
  const buy = () => {
    console.log('buy')
  }
  const refund = () => {
    console.log('refund')
  }

  const showQr = (oid) => {
    console.log('showQr')
    Taro.navigateTo({ url: 'qr?oid=' + oid })
  }

  return (
    <View className="order order-show">
      <View className="">
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
          <View className="total">总价 <span className="small">¥ </span>{order.amount / 100}</View>
        </View>
        </View>
      </View>
      <View className="date">
        <View>创建时间: {fmtDate(order.createdAt)} </View>
        { order.paidAt &&
        <View>支付时间: {fmtDate(order.paidAt)} </View>
        }
        { order.status === 3 &&
        <View>核销时间: {fmtDate(order.usedAt)} </View>
        }
        { order.status === 4 &&
        <View>取消时间: {fmtDate(order.cancelledAt)} </View>
        }
        { order.status === 5 &&
        <View>退款时间: {fmtDate(order.refundedAt)} </View>
        }
        { order.status === 6 &&
        <View>删除时间: {fmtDate(order.deletedAt)} </View>
        }
      </View>
      <View className="btns">
        { order.status === 1 &&
          <>
        <Button className="btn" onClick={cancelOrder}>取消订单</Button>
        <Button className="btn btn-success" onClick={buy}>付款</Button>
          </>
        }
        { order.status === 2 &&
          <>
        <Button className="btn btn-danger" onClick={refund}>退款</Button>
        <Button className="btn btn-success" onClick={() => showQr(oid)}>核销码</Button>
          </>
        }
      </View>
    </View>
  )
}

export default Index
