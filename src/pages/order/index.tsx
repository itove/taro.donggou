import React, { useState, useEffect } from 'react'
import { View, Image } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { STATUS } from '../../orderStatus'
import { Grid, NoticeBar, Swiper, Tabs } from '@nutui/nutui-react-taro'

function TabPane({order, index}) {
  return (
    <View key={index} className="list-item" onClick={() => showOrder(order.id)}>
    <View className="left">
      <View className="img">
      <Image className="w-100 rounded" src={Env.imageUrl + order.node.image} mode="widthFix" />
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
  )
}

function showOrder(oid){
  console.log(oid)
  Taro.navigateTo({url: 'show?oid=' + oid})
}

function Index() {
  const [all, setAll] = useState([])
  const [pending, setPending] = useState([])
  const [paid, setPaid] = useState([])
  const [used, setUsed] = useState([])
  const [refund, setRefund] = useState([])
  const [uid, setUid] = useState(0)
  const [logged, setLogged] = useState(false)
  const instance = Taro.getCurrentInstance();
  const status = instance.router.params.status ? instance.router.params.status : 0
  // const [tab1value, setTab1value] = useState<string | number>('0')
  const [tab1value, setTab1value] = useState(status)

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      setLogged(true)
      setUid(res.data.id)
      Taro.request({
        url: Env.apiUrl + 'orders?uid=' + res.data.id
      })
      .then(res => {
        const data = res.data
        console.log(res)

        // setAll(data.map((order, index) => <TabPane order={order} index={index} />))
        const l0 = []
        const l1 = []
        const l2 = []
        const l3 = []
        const l4 = []
        data.map((order, index) => {
          l0.push(<TabPane order={order} index={index} />)
          if (order.status === 1) {
            l1.push(<TabPane order={order} index={index} />)
          }
          if (order.status === 2) {
            l2.push(<TabPane order={order} index={index} />)
          }
          if (order.status === 3) {
            l3.push(<TabPane order={order} index={index} />)
          }
          if (order.status === 4) {
            l4.push(<TabPane order={order} index={index} />)
          }
        })
        setAll(l0)
        setPending(l1)
        setPaid(l2)
        setUsed(l3)
        setRefund(l4)
      })
    })
    .catch(err => {
      console.log(err)
      // Taro.redirectTo({url: '/pages/me/login'})
    })
  }, [])

  return (
    <View className="order">
      <Tabs
        value={tab1value}
        autoHeight={true}
        onChange={(value) => {
          setTab1value(value)
        }}
        className="tabs"
        >
        <Tabs.TabPane className="tabpane" title="全部"> {all} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="待付款"> {pending} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="已付款"> {paid} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="已完成"> {used} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="退款"> {refund} </Tabs.TabPane>
      </Tabs>
    </View>
  )
}

export default Index
