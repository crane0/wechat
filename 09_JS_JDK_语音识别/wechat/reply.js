const tpl = require('./tpl')
const Wechat = require('./wechat')
const config = require('../config/config')

const materailApi = new Wechat(config)
const menu = require('./menu')

//如果修改了菜单的显示内容，不删除就创建，会出错。
materailApi.deleteMenu()
    .then(() => {
        materailApi.createMenu(menu)
            .then((res) => {
                console.log(res)
            })
    })

//这里改为 async，因为上传临时图片素材是，想使用await
module.exports = async (message) => {
    //数据以该变量接收
    let content = '';

    let options = {}

    //回复文本消息
    if(message.MsgType === 'text'){
        //用户发送内容是 1
        if(message.Content === '1'){
            content = '您输入的是1\n回复2 查看谁在暗恋你'
        } else if (message.Content === '2') {
            content = '你刚刚说啥，没听清\n回复3 就告诉你答案'
        } else if (message.Content.match(3)) {
            content = '没错，就是我'

            //这里新增的 4 是图文消息（只是为了完整版的自动回复，和上传素材无关）
        } else if (message.Content === '4') {
            content = [{
                title: 'Nodejs开发',
                description: '这里有最新nodejs内容',
                picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
                url: 'http://nodejs.cn/'
            }, {
                title: '微信公众号开发',
                description: '这里有最新微信公众号内容',
                picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
                url: 'http://nodejs.cn/'
            }]
            //这里新增的 5，上传临时图片素材
        } else if (message.Content === '5') {
            //这里调用WeChat中 uploadMaterial方法上传临时素材，再回复给用户
            const data = await materailApi.uploadMaterial('image', __dirname + '/1.png')
            // console.log(data)  //得到上传临时图片素材media_id

            //为了回复用户一个图片消息（上传素材之后，才会有 media_id）
            options.mediaId = data.media_id
            options.msgType = 'image'
        }
        else if (message.Content === '6') {
            //这个新增其他类型的素材中的图片素材，image
            //thumb_media_id，图文消息的封面图片素材id（必须是永久mediaID）
            const data = await materailApi.uploadMaterial('image', __dirname + '/1.png', true)
            // console.log(data)
            const newsList = {
                articles: [{
                    title: '微信公众号开发',
                    thumb_media_id: data.media_id,
                    author: '佚名',
                    digest: '微信公众号开发微信公众号开发微信公众号开发',
                    show_cover_pic: 1,
                    content: '一张网页，要经历怎样的过程，才能抵达用户面前？\n' +
                    '一位新人，要经历怎样的成长，才能站在技术之巅？\n' +
                    '探寻这里的秘密；\n' +
                    '体验这里的挑战；\n' +
                    '成为这里的主人；\n' +
                    '加入百度，加入网页搜索，你，可以影响世界。\n' +
                    '\n',
                    content_source_url: 'https://www.baidu.com/s?tn=99006304_7_oem_dg&isource=infinity&wd=%E7%99%BE%E5%BA%A6'
                },{
                    title: 'nodejs开发',
                    thumb_media_id: data.media_id,
                    author: '佚名',
                    digest: '微信公众号开发微信公众号开发微信公众号开发',
                    show_cover_pic: 0,
                    content: '一张网页，要经历怎样的过程，才能抵达用户面前？\n' +
                    '一位新人，要经历怎样的成长，才能站在技术之巅？\n' +
                    '探寻这里的秘密；\n' +
                    '体验这里的挑战；\n' +
                    '成为这里的主人；\n' +
                    '加入百度，加入网页搜索，你，可以影响世界。\n' +
                    '\n',
                    content_source_url: 'https://www.baidu.com/s?tn=99006304_7_oem_dg&isource=infinity&wd=%E7%99%BE%E5%BA%A6'
                }]
            }

            const newsData = await materailApi.uploadMaterial('news', newsList, true)
            console.log(newsData)

            //这里并没有回复图文消息，而是回复用户一个图片消息做测试
            options.mediaId = data.media_id
            options.msgType = 'image'
        }
        else if (message.Content === '7') {
            //可以直接返回一个 a 标签
            content = '<a href="http://144bd69d.ngrok.io/movie">语音识别</a>'
        }

    } else if (message.msgType === 'event'){
        // 用户未关注时，进行关注后的事件推送
        if(message.Event === 'subscribe'){
            //订阅事件
            content = '欢迎您的关注'
            if (message.EventKey) {
                //推广用的
                content = '扫描带参数二维码关注的'
            }
            // 进行取消订阅后的事件推送
        } else if (message.Event === 'unsubscribe') {
            console.log('无情取关~~')
        } else if (message.Event === 'SCAN') {
            content = '用户已关注时的事件推送'
            //这个大写的 LOCATION，是进入公众号界面时，就会弹出的。
        } else if (message.Event === 'LOCATION') {
            content = '纬度:' + message.Latitude + '\n经度:' + message.Longitude + '\n精度：' + message.Precision
        }
        //这个小写的 location，是在对话服务中，获取用户地理位置，要在微信公众平台，开启权限
    } else if (message.MsgType === 'location') {
        content = message.Location_X + '--' + message.Location_Y + '--' + message.Scale + '--' + message.Label
    }



    options.toUserName = message.FromUserName
    options.fromUserName = message.ToUserName
    options.createTime = Date.now()
    options.content = content
    /*
    * 因为在上传临时素材中，设置了 options.msgType
    * 下面这个写法：如果有 options.msgType就使用，因为下面要做判断
    * 没有的话，message.MsgType就是默认值
    * */
    options.msgType = options.msgType || message.MsgType

    //如果是事件和位置，将其类型都改为 text
    if (options.msgType === 'event' || options.msgType === 'location') {
        options.msgType = 'text'
    }

    //因为 news（图文消息）的内容是一个数组格式，所以要做判断
    if (Array.isArray(options.content)) {
        options.msgType = 'news'
    }

    return tpl(options)
}
