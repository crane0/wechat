
module.exports = {
  button: [
    {
      type: "click",
      name: "今日歌曲",
      key: "click1"
    },
    {
      name: "菜单",
      sub_button:[  //这是二级菜单
        {
          type: "view",
          name: "\ue04a语音识别",
          url: "http://144bd69d.ngrok.io/movie"
        },
        {
          type:"click",
          name:"赞一下我们",
          key:"click2"
        },
        {
          type: "scancode_waitmsg",  //扫码推事件且弹出“消息接收中”提示框的事件推送
          name: "扫码带提示",
          key: "scancode_waitmsg"
        },
        {
          type: "scancode_push",  //扫码推事件的事件推送
          name: "扫码推事件",
          key: "scancode_push",
        },
        {
          name: "发送位置",
          type: "location_select",
          key: "location_select"
        }
      ]
    },
    {
      name: "发图",
      sub_button: [
        {
          type: "pic_sysphoto",  //弹出系统拍照发图的事件推送
          name: "系统拍照发图",
          key: "pic_sysphoto"
        },
        {
          type: "pic_photo_or_album", //拍照或者相册发图
          name: "拍照或者相册发图",
          key: "pic_photo_or_album",
        },
        {
          type: "pic_weixin",  //弹出微信相册发图器的事件推送
          name: "微信相册发图",
          key: "pic_weixin"
        }
      ]
    }
  ]
}
