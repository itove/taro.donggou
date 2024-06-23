import React, { useState, useEffect } from 'react'
import { useDidHide } from '@tarojs/taro'
import { View, Map, CoverView } from '@tarojs/components'
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'
import { fmtSeconds } from '../../utils/fmtSeconds'

function Rad(d) { 
  //根据经纬度判断距离
  return d * Math.PI / 180.0;
}

/**
 * lat1/lng1 user's
 * lat2/lng2 target's
 */
function getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  s = s.toFixed(1)
  return Number(s)
}


function Index() {
  const [display, setDisplay] = useState('none')
  const [progress, setProgress] = useState('语音讲解')
  const [distance, setDistance] = useState(0)
  const [nodes, setNodes] = useState([])
  const [node, setNode] = useState({title: '', summary: '', audio: ''})
  const innerAudioContext = Taro.createInnerAudioContext()
  const [audio, setAudio] = useState(innerAudioContext)
  const [playIcon, setPlayIcon] = useState(Env.iconUrl + 'hotline.png')
  const [userLocation, setUserLocation] = useState({})
  const [markers, setMarkers] = useState([])
  const [prevMarkerId, setPrevMarkerId] = useState(0)
  const envVer = Taro.getAccountInfoSync().miniProgram.envVersion

  const onShareAppMessage = (res) => {}
  const onShareTimeline = (res) => {}

  // set map width/height depend on environment
  // cause its fucking slow in devtools if set map width: 100%/height: 100vh
  let mapClass = 'w-h-100'
  if (envVer === 'develop') {
    // mapClass = ''
  }

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

  // const center = { lat: 32.497362991555164, long: 110.84169432860472 }
  // const ne = { lat: 32.50916729, long: 110.86286523 }
  // const sw = { lat: 32.48679658, long: 110.82360543 }

  const center = { lat: 32.631533, long: 110.788021 }
  const ne = { lat: 32.642654, long: 110.796282 }
  const sw = { lat: 32.621354, long: 110.778333 }

  const opacity = 1
  const col = 6
  const row = 8
  const latPer = (ne.lat - sw.lat) / row
  const longPer = (ne.long - sw.long) / col
  const markerWidth = 28
  const markerHeight = 35

  const mapContext = Taro.createMapContext('map')

  useDidHide(() => {
    audio.pause()
    console.log('leave nav')
  })

  useEffect(() => {
    Taro.getLocation({
      // type: 'wgs84',
      type: 'gcj02',
      }).then((res) => {
        console.log(res)
        setUserLocation({lat: res.latitude, long: res.longitude})
      })
  }, []);

  useEffect(() => {
    const markers = []
    Taro.request({
      url: Env.apiUrl + 'map/markers'
    })
    .then(res => {
      const nodes = res.data
      console.log(nodes)
      setNodes(nodes)
      nodes.map((n, index) => {
        let  path = Env.iconUrl + 'marker-pavilion.png'
        if (n.region === 29) {
          path = Env.iconUrl + 'marker-house.png'
        }
        markers.push({
          id: index,
          zIndex: index,
          latitude: n.latitude,
          longitude: n.longitude,
          width: markerWidth,
          height: markerHeight,
          iconPath: path,
          collision: 'poi, marker',
          collisionRelation: 'together', // 'alone' or 'together'
          // title: n.title,
          // callout: {
          //   content: n.title,
          //   color: '#000000',
          //   fontSize: '12',
          //   bgColor: '#ffffff',
          //   anchorX: 0,
          //   anchorY: 0,
          //   // borderWidth: 0,
          //   borderRadius: 4,
          //   padding: 6,
          //   display: 'BYCLICK',
          //   textAlign: 'center',
          //   // collision: '',
          // },
          // customCallout: {
          //   display: 'BYCLICK', // 'ALWAYS' or 'BYCLICK'
          //   // anchorX: 0,
          //   // anchorY: 0,
          // },
          label: {
            content: n.title,
            fontSize: '12',
            color: '#000000',
            bgColor: '#ffffff',
            textAlign: 'center',
            // anchorX: -((n.title.length * 12 + 8) / 2),
            // anchorY: 2,
            // borderWidth: 0,
            borderRadius: 4,
            padding: 4,
            // collision: '',
          }
        })
      })

      console.log(markers)
      setMarkers(markers)

      // mapContext.addMarkers({
      //   markers: markers,
      // }) 
      // .then(res => {
      //   console.log('markers added')
      // })
      // .catch(err => {
      //   console.log(err)
      // })
    })

    // groundLayers
    // small ones
    for (let i = 0; i < row; i++) {
      const neLat = ne.lat - latPer * i
      const swLat = ne.lat - latPer * (i + 1)
      let neLong
      let swLong
      for (let j = 0; j < col; j++) {
        neLong = sw.long + longPer * (j + 1)
        swLong = sw.long + longPer * j
        const northeast = {
          latitude: neLat,
          longitude: neLong
        }
        const southwest = {
          latitude: swLat,
          longitude: swLong
        }
        const bounds = {
          northeast,
          southwest,
        }

        const index = col * i + j

        const src = Env.imageUrl + 'deb/' + index + '.png'
        const o = {
          id: index,
          src,
          opacity,
          // zIndex: 1,
          bounds,
        }
        // console.log(o)
        // console.log(index)

        mapContext.addGroundOverlay(o)
        .then(res => {
          console.log('groundOverlay added')
        })
        .catch(err => {
          console.log(err)
        })
      }
    }
  // small ones end

    return () => {
      audio.destroy()
      // innerAudioContext.destroy()
    }
  }, [])

  const resetPrevMarker = () => {
    const newMarkers = markers.map((m, i) => {
      if (i === prevMarkerId) {
        m.width = markerWidth
        m.height = markerHeight
        m.zIndex = prevMarkerId
        return m
      } else {
        return m
      }
    })
    setMarkers(newMarkers)
  }

  const enlargeMarker = (id) => {
    const newMarkers = markers.map((m, i) => {
      if (i === id) {
        m.width = 48
        m.height = 61
        m.zIndex = 999
        return m
      } else {
        return m
      }
    })
    setMarkers(newMarkers)
  }

  const onTap = (e) => {
    console.log(e.detail.latitude)
    console.log(e.detail.longitude)
    audio.destroy()
    setPlayIcon(Env.iconUrl + 'hotline.png')
    setDisplay('none')
    setProgress('语音讲解')
    resetPrevMarker()
  }

  const onMarkerTap = (e) => {
    console.log(e.detail.markerId)
    const index = e.detail.markerId
    console.log(markers[index])
    setPrevMarkerId(index)
    resetPrevMarker()
    enlargeMarker(index)
    mapContext.moveToLocation({latitude: markers[index].latitude, longitude: markers[index].longitude})
    setNode(nodes[index])
    setDistance(getDistance(userLocation.lat, userLocation.long, nodes[index].latitude, nodes[index].longitude))
    setDisplay('block')
    audio.destroy()
    setPlayIcon(Env.iconUrl + 'hotline.png')
    innerAudioContext.src = Env.imageUrl + nodes[index].audio
    setAudio(innerAudioContext)
    setProgress('语音讲解')
  }

  const openLocation = (latitude, longitude) => {
    Taro.openLocation({
      latitude,
      longitude,
      scale: 15
    })
  }

  const playAudio = (src) => {
    console.log(innerAudioContext.src)
    console.log(audio.src)
    console.log(audio)
    if (audio.paused) {
      audio.play()
      console.log('playing...')
    } else {
      audio.pause()
      console.log('paused...')
    }
  }

  const showNode = (node) => {
    let type
    switch (node.region) {
      case 27:
        type = 0
        break;
      case 29:
        type = 1
        break;
      default:
        type = 1
    }
    Taro.navigateTo({ url: '/pages/node/show?id=' + node.id + '&type=' + type})
  }

  return (
    <View className="">
      <Map
        id="map"
        className={mapClass}
        latitude={center.lat}
        longitude={center.long}
        // showLocation={true}
        // markers={markers}
        onMarkerTap={onMarkerTap}
        scale={15} // 3-20
        max-scale={17}
        min-scale={11}
        onTap={onTap}
      >
        <CoverView className="call-out" slot="callout">
          <CoverView marker-id="2"> this is customCallout </CoverView>
        </CoverView>
      </Map>

      <View className="pop">
      <View
        className="wrapper"
        style={{display: display}}
      >
        <View className="card rounded p-1">

          <View className="body">
            <View className="left">
            <View className="title pb-8" onClick={() => showNode(node)}>{node.title}</View>
              <View className="pb-8">距您{distance}公里 </View>
              <View className="ellipsis-2" onClick={() => showNode(node)}>{node.summary}</View>
            </View>
            { node.audio &&
            <View className="right" onClick={() => playAudio(Env.imageUrl + node.audio)}>
              <View>
                <img className="icon" src={playIcon} />
                <View className="text">{ progress }</View>
              </View>
              <View className="small" onClick={() => openLocation(node.latitude, node.longitude) }>
                <img className="icon" src={Env.iconUrl + 'nav.png'} /> 前往
              </View>
            </View>
            }
          </View>

            { false &&
          <View className="footer pt-16">
            <View className="small">
              <img className="icon" src={Env.iconUrl + 'share.png'} /> 分享
            </View>
            <View className="small">
              <img className="icon" src={Env.iconUrl + 'star.png'} /> 收藏
            </View>
            <View className="small" onClick={() => openLocation(node.latitude, node.longitude) }>
              <img className="icon" src={Env.iconUrl + 'nav.png'} /> 前往
            </View>
          </View>
            }
        </View>

      </View>
      </View>
    </View>
  )
}

export default Index
