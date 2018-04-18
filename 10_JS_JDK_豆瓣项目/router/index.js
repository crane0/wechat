
const WeChat = require('../wechat/wechat')
const sha1 = require('sha1')
const ejs = require('ejs')
const config = require('../config/config')
//解构赋值，只获取douban对象
const {douban} = require('../utils/api')
const rp = require('request-promise')
const express = require('express')
const router = express.Router()

const getTicket = new WeChat(config)

/*
  JS-SDK
  1. 设置JS接口安全域名 （将协议干掉）
  2. 获取jsapi_ticket，临时票据。获取票据和凭据类似，它和凭据有类似的特点
    - 请求接口次数极少，建议开发者缓存起来
    - 7200秒刷新一次
  3. 下面的先实现了，签名算法
  4. 将signature,noncestr,timestamp渲染到页面上
 */


//电影主页，各个榜单
router.get('/movie',async (req, res) => {

    /*
    * movie是主页面，会显示下面 3种页面
    * data.subjects是获取数据的主体内容
    * */

    //正在热映
    //https://api.douban.com/v2/movie/in_theaters
    let data = await rp({method:'GET',url:douban.theaters,json:true})
    const theatersData = data.subjects

    //即将上映
    //https://api.douban.com/v2/movie/coming_soon
    data = await rp({method: 'GET', url: douban.coming, json: true})
    const comingData = data.subjects

    //Top250
    //https://api.douban.com/v2/movie/top250
    data = await rp({method: 'GET', url: douban.top250, json: true})
    const top250Data = data.subjects
    /*
    * 这是对象的简写形式。
    * data又被重新赋值，之前的操作只是为了获取这 3个属性
    * */
    data = {
        theatersData,
        comingData,
        top250Data
    }

    //将数据渲染到 movie模板
    res.render('movie', {
        data,
        //http://371004b5.ngrok.io
        commentUrl: config.url
    })
})

//电影条目信息，条目 id作为标识
router.get('/details',async (req, res) => {
    const id = req.query.id
    //https://api.douban.com/v2/movie/subject/123456
    const url = douban.subject + id
    const data = await rp({method: 'GET', url: url, json: true})

    res.render('details', {
        data,
        //http://371004b5.ngrok.io
        commentUrl: config.url
    })
})

//在微信公众号内，语音识别功能，连接了豆瓣的电影搜索
router.get('/search', async (req, res) => {

    // 下面这些都要处理 签名算法的逻辑，最终要生成拼接好的字符串

    // noncestr（随机字符串）
    // 有效的 jsapi_ticket
    // timestamp（时间戳）
    // url
    const noncestr = Math.random().toString().substr(2, 15)  //将0和 .截取掉，后面的保留15位
    const jsapi_ticket = (await getTicket.fetchTicket()).ticket
    const timestamp = parseInt(Date.now() / 1000) + ''
    // 接口配置信息，注意还要加 路由路径
    const url = config.url+'/search'


    //将 4个参数按url方法组合在一起
    const param = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + jsapi_ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    console.log(param)

    //按ascii表排序，排序后再拼接在一起
    const str = param.sort().join('&')
    console.log(str)

    //将拼接好的字符串加密，返回签名
    const signature = sha1(str)
    console.log(signature)
    //以上都是处理签名算法

    res.render('search', {
        timestamp,
        signature,
        noncestr,
        //http://371004b5.ngrok.io
        commentUrl: config.url
    })
})

//一定记得要暴露！！
module.exports = router