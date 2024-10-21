import React, { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import { Button, Cell, Avatar } from "@nutui/nutui-react-taro"
import './index.scss'
import Taro from '@tarojs/taro'
import { Env } from '../../env'

function Right() {
  return (
    <img src={Env.iconUrl + 'arrow-right.png'} className="ms-1 icon" />
  )
}

function Index() {
  const [user, setUser] = useState({})
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    Taro.getStorage({
      key: Env.storageKey
    })
    .then(res => {
      // fetch data
      Taro.request({
        url: Env.apiUrl + 'users/' + res.data.id
      })
      .then(res => {
        console.log(res)
        let user = res.data
        if (user.phone === undefined) {
          setPhone('填写手机号')
        } else {
          setPhone(user.phone)
        }
        if (user.name === undefined) {
          user.name = '填写姓名'
        }
        setUser(user)
        if (user.avatar !== undefined && user.avatar !== null) {
          setAvatarUrl(Env.baseUrl + user.avatar)
        }
      })
    })
  }, [])

  const onChooseAvatar = (e) => {
    const f = e.detail.avatarUrl
    console.log(f)
    Taro.uploadFile({
      url: Env.apiUrl + 'media_objects',
      filePath: f,
      name: 'upload',
      formData: {
        'uid': user.id
      }
    })
    .then(res => {
      setAvatarUrl(f)
    })
  }

  const onGetphonenumber = (e) => {
    const d = e.detail
    console.log(d);
    if (d.code !== undefined) {
      Taro.request({
        method: 'POST',
        url: Env.apiUrl + 'wx/getphone',
        data: {code: d.code}
      }).then((res) => {
        if (res.statusCode === 200) {
          console.log(res)
          setPhone(res.data.phone_info.purePhoneNumber)
          Taro.request({
            method: 'PATCH',
            data: { phone: res.data.phone_info.purePhoneNumber },
            url: Env.apiUrl + 'users/' + user.id,
            header: {
              'content-type': 'application/merge-patch+json'
            }
          }).then((res) =>{
            if (res.statusCode === 200) {
              Taro.showToast({
                title: '修改成功',
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
            }
          })
        } else {
          Taro.showToast({
            title: '系统错误',
            icon: 'error',
            duration: 2000
          })
        }
        // Taro.hideLoading()
      })
    }
  }

  const editName = () => {
    console.log('go')
    Taro.navigateTo({ url: "/pages/me/name" })
  }

  const logout = () => {
    console.log('out')
    Taro.showModal({
      title: '提示',
      content: '确定要退出当前账号？',
      success: function (res) {
        if (res.confirm) {
          Taro.removeStorage({
            key: Env.storageKey,
            success: res => {
              console.log('storeage removed: ' + Env.storageKey);
            },
            fail: res => {
              console.log('storeage removed failed');
            }
          })
          Taro.reLaunch({ url: '/pages/me/login'})
        } else if (res.cancel) {
        }
      }
    })
  }

  return (
    <View className="info">
      <Cell.Group>
        <Cell
        className='nutui-cell--clickable'
        title='头像'
        align='center'
        extra={<><Button className="notbtn" icon={<Avatar size="22" src={avatarUrl}/>} openType="chooseAvatar" onChooseAvatar={onChooseAvatar}></Button><Right /></>}
        />
        <Cell
        className='nutui-cell--clickable'
        title='姓名'
        align='center'
        extra={<><span>{user.name}</span><Right /></>}
        onClick={editName}
        />
        <Cell
        className='nutui-cell--clickable'
        title='手机'
        align='center'
        extra={<><Button className="notbtn" openType="getPhoneNumber" onGetphonenumber={onGetphonenumber}>{phone}</Button><Right /></>}
        />
      </Cell.Group>
    <View className="p-1 fixed">
      <Button className="btn-primary w-100" onClick={logout}>退出登录</Button>
    </View>
    </View>
  )
}

export default Index
