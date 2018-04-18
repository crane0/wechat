const express = require('express');
//config中是配置信息
const config = require('./config/config');
const confirm = require('./wechat/confirm');

const WeChat = require('./wechat/wechat')
const sha1 = require('sha1')
const ejs = require('ejs')

const app = express();

app.set('view engine', 'ejs')
app.set('views', './views')

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


/*
* 这和下面的中间件都是路由，只要匹配到这个路由，下面的中间件就不会执行
* 而现在只是想访问这个movie页面，和公众号的逻辑没什么关系。
* 所以，暂时写在上面。
* */
app.get('/movie',async (req, res) => {

    // 下面这些都要处理 签名算法的逻辑，最终要生成拼接好的字符串

    // noncestr（随机字符串）
    // 有效的 jsapi_ticket
    // timestamp（时间戳）
    // url
    const noncestr = Math.random().toString().substr(2, 15)  //将0和 .截取掉，后面的保留15位
    const jsapi_ticket = (await getTicket.fetchTicket()).ticket
    const timestamp = parseInt(Date.now() / 1000) + ''
    // 接口配置信息，注意还要加 路由路径
    const url = 'http://144bd69d.ngrok.io/movie'


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

    res.render('movie', {
        signature,
        noncestr,
        timestamp
    })
})



//使用中间件，为了处理所有请求
app.use(confirm(config));

app.listen(3000, () => {
    console.log('服务器启动成功了')
})