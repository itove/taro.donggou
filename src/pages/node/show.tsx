import React, { useState, useEffect } from 'react'
import { View, Image, Button } from '@tarojs/components'
import './show.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { Tabs, ImagePreview, InputNumber } from '@nutui/nutui-react-taro'
import { fmtSeconds } from '../../utils/fmtSeconds'

Taro.options.html.transformElement = (el) => {
  if (el.nodeName === 'image') {
    el.setAttribute('mode', 'widthFix')
    el.setAttribute('src', Env.baseUrl + el.getAttribute('src'))
  }
  return el
}

function Index() {
  const [node, setNode] = useState({})
  const [rooms, setRooms] = useState([])
  const [uid, setUid] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [body, setBody] = useState('')
  const [tags, setTags] = useState([])
  const [isFav, setIsFav] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [logged, setLogged] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const instance = Taro.getCurrentInstance();
  const id = instance.router.params.id
  // 0: you // 1: zhu // 2: chi & normal node // 3: gou // 4: 走进东沟 // 5: index list & show normal
  const type = instance.router.params.type ? instance.router.params.type : 2
  const innerAudioContext = Taro.createInnerAudioContext()
  const [audio, setAudio] = useState(innerAudioContext)
  const [playIcon, setPlayIcon] = useState(Env.iconUrl + 'hotline.png')
  const [progress, setProgress] = useState('语音讲解')

  const onShareAppMessage = (res) => {}
  const onShareTimeline = (res) => {}

  audio.onPlay(() => {
    setPlayIcon(Env.iconUrl + 'hotline-primary.png')
  })
  audio.onStop(() => {
    setPlayIcon(Env.iconUrl + 'hotline.png')
  })
  audio.onPause(() => {
    setPlayIcon(Env.iconUrl + 'hotline.png')
  })
  audio.onEnded(() => {
    setPlayIcon(Env.iconUrl + 'hotline.png')
    setProgress('语音讲解')
  })
  audio.onCanplay(() => {
  })
  audio.onTimeUpdate(() => {
    setProgress(fmtSeconds(audio.duration - audio.currentTime))
  })
  audio.onError((res) => {
    console.log(res.errMsg)
    console.log(res.errCode)
  })

  useEffect(() => {
    Taro.request({
      url: Env.apiUrl + 'nodes/' + id
    })
    .then(res => {
      const n = res.data
      setNode(n)
      console.log(n)
      if (n.body) {
        setBody(n.body.replace(/&nbsp;/g, '<br/>'))
      }

      Taro.setNavigationBarTitle({
        title: n.title
      })

      setTags(n.tags.map((i, index) => <View key={index}>{i}</View> ))

      setRooms(n.children.map((child, index) => <RoomView key={index} room={child} node={n}/>))

      innerAudioContext.src = Env.imageUrl + n.audio
    })
  }, [])

  const playAudio = () => {
      console.log(audio.src)
      if (audio.paused) {
        audio.play()
        console.log('playing...')
      } else {
        audio.pause()
        console.log('paused...')
      }
  }

  useEffect(() => {
    return () => {
      audio.destroy()
    }
  }, []);

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      setLogged(true)
      setUid(res.data.id)
      Taro.request({
        url: Env.apiUrl + 'isfav?uid=' + res.data.id + '&nid=' + id
      })
      .then(res => {
        console.log(res.data)
        setIsFav(res.data.isFav)
      })
    })
    .catch(err => {
      console.log(err)
      // Taro.redirectTo({url: '/pages/me/login'})
    })
  }, [])

  const RoomView = ({room, index, node}) => {
    const previews = []
    room.images.map((i) => previews.push({src: Env.imageUrl + i}))
    return (
      <View key={index} className="list">
        <View className="img">
          <Image className="w-100" mode="scaleToFill" src={Env.imageUrl + room.images[0]} onClick={() => preview(previews)} />
          <View className="count">
            <img src={Env.iconUrl + 'image.png'} />
            {room.images.length}
          </View>
        </View>
        <View className="info">
          <View className="title">
          {room.title}
          </View>
          <View className="summary">
          {room.summary}
          </View>
          <View className="tags">
          {
            room.tags.map((t, ind) => (ind < 3 && <View key={ind}>{t}</View>))
          }
          </View>
        </View>
        <View className="reserve">
        <Button className='btn-primary' size="mini" onClick={() => preview([{src: Env.imageUrl + node.qr}])}>预定</Button>
        </View>
      </View>
    )
  }

  const makeCall = (num = node.phone) => {
    Taro.makePhoneCall({phoneNumber: num})
  }

  const openLocation = () => {
    let latitude = 32.499823
    let longitude = 110.8336
    if (node.latitude && node.longitude) {
      latitude = node.latitude
      longitude = node.longitude
    }
    Taro.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  }

  const toggleFav = () => {
    if (!logged) {
      Taro.navigateTo({ url: '/pages/me/login' })
      return
    }
    let url = 'fav/add'
    const data = {
      uid: uid,
      nid: id,
    }
    if (isFav) {
      url = 'fav/remove'
      setIsFav(false)
    } else {
      setIsFav(true)
    }
    Taro.request({
      method: 'POST',
      url: Env.apiUrl + url,
      data
    }).then((res) => {
      setIsFav(res.data.isFav)
    })
  }

  const preview = (images) => {
    setPreviewImages(images)
    setShowPreview(true)
  }

  const buy = () => {
    setDisabled(true)
    console.log('buy')
    if (logged) {
      Taro.request({
        url: Env.apiUrl + 'wx/pay/prepay',
        method: 'POST',
        data: {
          nid: node.id,
          uid: uid,
          quantity: quantity,
        }
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

  const [tab1value, setTab1value] = useState<string | number>('0')

  const setQ = (v) => {
    console.log(v)
    setQuantity(v)
  }

  return (
    <View className="show">
      <Image className="w-100 hero" src={Env.imageUrl + node.image} mode="aspectFill" />

      <View className="p-1 card">

        <View className="header">
          <View className="">
            <View className="title article-title">{node.title}</View>
            { (type == 0 || type == 1) &&
            <View className="tags">{tags}</View>
            }
          </View>
          { type == 0 &&
          <View className="right" onClick={() => playAudio()}>
            <View className="icon">
              <img src={playIcon} />
              </View>
            <View className="">{progress}</View>
          </View>
          }
          { type == 1 &&
          <View className="right" onClick={() => makeCall(node.phone)}>
            <View className="icon">
              <img
                src={Env.iconUrl + 'call.png'}
              />
              </View>
            <View className="">电话</View>
          </View>
          }
        </View>

        { (type == 0 || type == 1) &&
        <View className="summary">{node.summary}</View>
        }

        { type == 4 &&
          <View className="info-1">
            <View className="item" onClick={openLocation}>
              <img
                src={Env.iconUrl + 'location-1.png'}
              />
              <View> {node.address}</View>
            </View>
            <View className="item" onClick={makeCall}>
              <img
                src={Env.iconUrl + 'call-1.png'}
              />
              <View> {node.phone}</View>
            </View>
          </View>
        }

        <View className="divider"></View>

        { type == 4 &&
          <View className="info-2">
            <View className="item">
              <img
                src={Env.iconUrl + 'bookmark.png' }
              />
              <View> 东沟简介 </View>
            </View>
            <View className="item" onClick={() => Taro.navigateTo({url: '/pages/node/index?region=honor'})}>
              <img
                src={Env.iconUrl + 'honor.png' }
              />
              <View> 东沟荣誉 </View>
            </View>
            <View className="item" onClick={() => Taro.navigateTo({url: '/pages/node/show?id=10'})}>
              <img
                src={Env.iconUrl + 'map.png' }
              />
              <View> 地理交通 </View>
            </View>
            <View className="item" onClick={() => Taro.switchTab({url: '/pages/feedback/index'})}>
              <img
                src={Env.iconUrl + 'letter.png' }
              />
              <View> 投诉建议 </View>
            </View>
          </View>
        }

        { type == 3 &&
        <View className="contact">
          <View className="img">
            <Image mode="aspectFill" className="w-100" src={Env.imageUrl + node.image} />
          </View>
          <View className="">
            <View className="name">
              {node.title}
            </View>
            <View className="phone">
              <img src={Env.iconUrl + 'call.png'} />
              电话：{node.phone}
            </View>
          </View>
        </View>
        }

        { (type != 2 && type != 4 && type != 5) &&
        <View className="address">
          <View className="text">{node.address}</View>
          <View className="right" onClick={openLocation}>
            <View className="icon">
              <img
                src={Env.iconUrl + 'location.png'}
              />
            </View>
            <View className="">地图导航</View>
          </View>
        </View>
        }
      </View>

      { (type == 0 || type == 3) &&
      <View className="p-1 card-1">
        <View className="no-overflow title acive"> { type == 0 && '景点介绍' || '商品详情' }</View>
      </View>
      }

      { type != 1 &&
      <View dangerouslySetInnerHTML={{__html: body}} className='body p-1'></View>
      }

      { type == 1 &&
      <Tabs
        value={tab1value}
        autoHeight={true}
        onChange={(value) => {
          setTab1value(value)
        }}
        align="left"
        className="rooms"
      >
        <Tabs.TabPane title="房间预定">
          <View>
            {rooms}
          </View>
        </Tabs.TabPane>
        <Tabs.TabPane title="酒店详情">
          <View dangerouslySetInnerHTML={{__html: body}} className='body'></View>
        </Tabs.TabPane>
      </Tabs>
      }

      { (node.price > 0) &&
      <View className="footer fixed">
        <View className="left">
          <View className="d-none" onClick={() => Taro.switchTab({url: '/pages/index/index'})}>
            <img src={Env.iconUrl + 'house.png'} />
            <View>主页</View>
          </View>
          <View className="fav d-none" onClick={toggleFav}>
            <img src={Env.iconUrl + (isFav && 'star.png' || 'star.png')} />
            <View>{ isFav && '已收藏' || '收藏'}</View>
          </View>
          <View className="">
            <InputNumber defaultValue={1} onChange={(v) => setQ(v) } allowEmpty />
          </View>
        </View>
        <View className="right">
          <Button className="w-100 btn-primary btn-rounded d-none" onClick={() => preview([{src: Env.imageUrl + node.qr}])}>立即购买</Button>
          <Button className="w-100 btn-primary btn-rounded" disabled={disabled} onClick={() => buy()}>预订</Button>
        </View>
      </View>
      }

      <ImagePreview
        // autoPlay
        // visible={true}
        images={previewImages}
        visible={showPreview}
        showMenuByLongpress={true}
        onClose={() => setShowPreview(false)}
      />

    </View>
  )
}

export default Index
