import React, { useState, useEffect } from 'react'
import { View, Image } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { Grid, NoticeBar, Swiper, Tabs } from '@nutui/nutui-react-taro'

function TabPane({order, index}) {
  return (
    <View key={index} className="list-item" onClick={() => showOrder(order.id)}>
    <View className="img">
    <Image className="w-100 rounded" src={Env.imageUrl + order.node.image} mode="widthFix" />
    </View>
    <View className="text">
    {order.node.title}
    <p className="ellipsis-2">{order.node.summary}</p>
    </View>
    </View>
  )
}

function Index() {
  const [tab1value, setTab1value] = useState<string | number>('0')
  const [all, setAll] = useState([])
  const [pending, setPending] = useState([])
  const [paid, setPaid] = useState([])
  const [refund, setRefund] = useState([])
  const [uid, setUid] = useState(0)
  const [logged, setLogged] = useState(false)

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      setLogged(true)
      setUid(res.data.id)
      Taro.request({
        url: Env.apiUrl + 'api/orders?uid=' + res.data.id
      })
      .then(res => {
        const data = res.data
        console.log(res)

        setAll(data.map((order, index) => <TabPane node={order} index={index} />))
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
        activeType="button"
        className="tabs"
        >
        <Tabs.TabPane className="tabpane" title="全部订单"> {all} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="待付款"> {pending} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="已付款"> {paid} </Tabs.TabPane>
        <Tabs.TabPane className="tabpane" title="退款"> {refund} </Tabs.TabPane>
      </Tabs>
    </View>
  )
}

export default Index
