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
  const [disabled, setDisabled] = useState(false)

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

  const deleteOrder = () => {
    console.log('delete')
    Taro.showModal({
      title: '提示',
      content: '确定删除订单？',
      success: function (res) {
        if (res.confirm) {
          Taro.request({
            method: 'POST',
            data: { oid: oid },
            url: Env.apiUrl + 'orders/delete'
          }).then((res) =>{
            if (res.statusCode === 200) {
              Taro.showToast({
                title: '订单已删除',
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

  const pay = () => {
    console.log('pay')
    setDisabled(true)
    if (logged) {
      Taro.request({
        url: Env.apiUrl + 'wx/pay/' + oid,
        method: 'POST',
      })
      .then(res => {
        if (res.statusCode === 200) {
          const data = res.data.data
          console.log(data)
          Taro.requestPayment({
            ...data,
            success (res) {
              console.log('pay success', res)
              console.log(data.oid)
              Taro.navigateTo({ url: '/pages/order/complete?oid=' + data.oid})
            },
            fail (err) {
              console.error('pay fail', err)
            },
            complete (res) {
              setDisabled(true)
              console.error('pay complete', res)
            }
          })
        } else {
          Taro.showToast({
            title: '系统错误',
            icon: 'error',
            duration: 2000
          })
          setDisabled(false)
          console.log('server error！' + res.errMsg)
        }
      })
    } else {
      Taro.navigateTo({ url: '/pages/me/login'})
    }
  }
  const refund = () => {
    console.log('refund')
    Taro.navigateTo({ url: 'refund?oid=' + oid })
  }

  const showQr = (oid) => {
    console.log('showQr')
    Taro.navigateTo({ url: 'qr?oid=' + oid })
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
        { order.createdAt &&
        <View>创建时间: {fmtDate(order.createdAt)} </View>
        }
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
        <Button className="btn btn-success" disabled={disabled} onClick={pay}>付款</Button>
          </>
        }
        { order.status === 2 &&
          <>
        <Button className="btn btn-danger" onClick={refund}>退款</Button>
        <Button className="btn btn-success" onClick={() => showQr(oid)}>核销码</Button>
          </>
        }
        { (order.status === 4 || order.status === 5)&&
          <>
        <Button className="btn btn-danger" onClick={deleteOrder}>删除订单</Button>
          </>
        }
      </View>
    </View>
  )
}

export default Index
