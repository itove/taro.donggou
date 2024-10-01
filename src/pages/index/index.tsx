import React, { useState, useEffect } from 'react'
import { View, Image } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { Grid, NoticeBar, Swiper, Tabs } from '@nutui/nutui-react-taro'


function gotoNode(id, type = 3) {
  Taro.navigateTo({url: '/pages/node/show?type=' + type + '&id=' + id})
}

function gotoNodeIndex(region, type) {
  Taro.navigateTo({url: '/pages/node/index?region=' + region + '&type=' + type})
}

function gotoUrl(url) {
  Taro.navigateTo({url: '/pages/' + url})
}

function gridGoto(node) {
  if (node.isTab) {
    Taro.switchTab({url: '/pages/' + node.url})
    .then(
      res => {
        Taro.pageScrollTo({
          selector: node.target,
          duration: 300
        })
      }
    )
  } else {
    Taro.navigateTo({url: '/pages/' + node.url})
  }
}

function More({region, type}) {
  return (
    <View
      className="more" 
      onClick={() => Taro.navigateTo({url: '/pages/node/index?region=' + region + '&type=' + type})}
    >
    更多 <img width="16px" height="16px" src={Env.iconUrl + 'arrow-right.png'} />
    </View>
  )
}

function TabPane({node, type, index}) {
  return (
    <View key={index} className="list-item" onClick={() => gotoNode(node.id, type)}>
    <View className="img">
    <Image className="w-100 rounded" src={Env.imageUrl + node.image} mode="widthFix" />
    </View>
    <View className="text">
    {node.title}
    <p className="ellipsis-2">{node.summary}</p>
    </View>
    </View>
  )
}

function SwiperItem({node, index}) {
  return (
    <Swiper.Item key={index} className="rounded">
    <Image
    className="w-100 rounded"
    mode="widthFix"
    onClick={() => console.log(index)}
    src={Env.imageUrl + node.image}
    alt=""
    />
    </Swiper.Item>
  )
}

function GridItem({node, index}) {
  return (
    <Grid.Item text={node.t} key={index} onClick={() => gridGoto(node) }>
    <Image className="img" src={node.p} mode="widthFix" />
    </Grid.Item>
  )
}

function Index() {
  const [sliderList, setSliderList] = useState([])
  const [tongzhi, setTongzhi] = useState([])
  const [gridList, setGridList] = useState([])
  const [youList, setYouList] = useState([])
  const [zhuList, setZhuList] = useState([])
  const [chiList, setChiList] = useState([])
  const [gouList, setGouList] = useState([])
  const [dili, setDili] = useState({})
  const [jianjie, setJianjie] = useState({image: ''})
  const [hongsetext, setHongsetext] = useState({image: ''})
  const [historytext, setHistorytext] = useState({image: ''})
  const [tab1value, setTab1value] = useState<string | number>('0')

  const onShareAppMessage = (res) => {}
  const onShareTimeline = (res) => {}

  const gridItems = [
    { t: '游在东沟', p: Env.iconUrl + 'grid_1.png', target: '.youzai', url: 'leyou/index', isTab: true, },
    { t: '住在东沟', p: Env.iconUrl + 'grid_2.png', target: '.zhuzai', url: 'leyou/index', isTab: true, },
    { t: '吃在东沟', p: Env.iconUrl + 'grid_3.png', target: '.chizai', url: 'leyou/index', isTab: true, },
    { t: '购在东沟', p: Env.iconUrl + 'grid_4.png', target: '.gouzai', url: 'leyou/index', isTab: true, },
    { t: '东沟简介', p: Env.iconUrl + 'grid_5.png', target: '', url: 'node/show?id=39&type=4', isTab: false, },
    { t: '党建文明', p: Env.iconUrl + 'grid_6.png', target: '', url: 'node/index?type=5&region=dangjian', isTab: false, },
    { t: '文旅要闻', p: Env.iconUrl + 'grid_7.png', target: '', url: 'node/index?type=5&region=wenlv', isTab: false, },
    { t: '旅行游记', p: Env.iconUrl + 'grid_8.png', target: '', url: 'node/index?type=5&region=youji', isTab: false, },
  ]

  useEffect(() => {
    Taro.request({
      url: Env.apiUrl + 'wx/home'
    })
    .then(res => {
      const data = res.data
      console.log(res)

      setSliderList(data.slider.map((node, index) => <SwiperItem node={node} index={index} />))
      setTongzhi(data.tongzhi.map((node, index) => <div onClick={() => gotoNode(node.id, 5)}>{node.title}</div> ))
      setYouList(data.youzai.map((node, index) => <TabPane node={node} type={0} index={index} />))
      setZhuList(data.zhuzai.map((node, index) => <TabPane node={node} type={1} index={index} />))
      setChiList(data.chizai.map((node, index) => <TabPane node={node} type={2} index={index} />))
      setGouList(data.gouzai.map((node, index) => <TabPane node={node} type={3} index={index} />))
      setGridList(gridItems.map((node, index) => <GridItem node={node} index={index} />))
      // setDili(data.dili[0])
      setJianjie(data.jianjie[0])
      setHongsetext(data.hongsetext[0])
      setHistorytext(data.historytext[0])
    })
    .catch(err => {
      console.log(err)
    })
  }, [])

  return (
    <View className="p-1 home">
      <View className="hell">
      </View>
      <Swiper defaultValue={0} autoPlay indicator className="rounded" height="160">
        {sliderList}
      </Swiper>
      <Grid columns="4" className="grid">
        {gridList}
      </Grid>

      <NoticeBar
      leftIcon={<img alt="notice" width="16px" height="16px" src={Env.iconUrl + 'speaker.png'} />}
      rightIcon={<More region={'tongzhi'} type={5} />}
      className="rounded-5 overflow-hidden"
      direction="vertical"
      list={tongzhi}
      speed={5}
      duration={1000}
      height={30}
      // closeable
      />

      <View className="daolan block">
        <View className="header">
          智慧导览
          <img
            src={Env.iconUrl + 'hill-river-1.png'}
          />
        </View>
        <Image className="w-100 rounded" src={Env.imageUrl + 'daolan.png'} mode="widthFix" onClick={() => Taro.switchTab({url: '/pages/nav/index'})} />
      </View>

      <View className="zoujin block">
        <View className="header">
          走进东沟
          <img
            src={Env.iconUrl + 'hill-river-1.png'}
          />
        </View>
        <View className="wrapper">
          <View className="" onClick={() => gotoNode(jianjie.id, 4)}>
            <Image className="w-100 rounded" src={Env.imageUrl + jianjie.image} mode="aspectFill" />
            <View class="text">
              东沟简介
              <p>点击查看></p>
            </View>
          </View>
          <View className="col2">
            <View className="" onClick={() => gotoNodeIndex('hongse', 5)}>
              <Image className="w-100 rounded" src={Env.imageUrl + hongsetext.image} mode="aspectFill" />
              <View class="text">
                东沟文化
                <p>爱国主义教育基地</p>
              </View>
            </View>
            <View className="" onClick={() => gotoNodeIndex('history', 5)}>
              <Image className="w-100 rounded" src={Env.imageUrl + historytext.image} mode="aspectFill" />
              <View class="text">
                东沟历史
                <p>瞻仰革命圣迹</p>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="leyou block">
        <View className="header">
          乐游东沟
          <img
            src={Env.iconUrl + 'hill-river-1.png'}
          />
        </View>

        <Tabs
          value={tab1value}
          autoHeight={true}
          onChange={(value) => {
            setTab1value(value)
          }}
          activeType="button"
          className="tabs"
          >
          <Tabs.TabPane className="tabpane" title="游在东沟"> {youList} </Tabs.TabPane>
          <Tabs.TabPane className="tabpane" title="住在东沟"> {zhuList} </Tabs.TabPane>
          <Tabs.TabPane className="tabpane" title="吃在东沟"> {chiList} </Tabs.TabPane>
          <Tabs.TabPane className="tabpane" title="购在东沟"> {gouList} </Tabs.TabPane>
        </Tabs>
      </View>

    </View>
  )
}

export default Index
