const express = require('express');
//config中是配置信息
const config = require('./config/config');
const confirm = require('./wechat/confirm');
const router = require('./router/index')

const app = express();

app.set('view engine', 'ejs')
app.set('views', './views')
app.use(express.static('public'))

/*
* 这和下面的中间件都是路由，只要匹配到这个路由，下面的中间件就不会执行
* 而现在只是想访问这个movie页面，和公众号的逻辑没什么关系。
* */
app.use(router);


//使用中间件，为了处理所有请求
app.use(confirm(config));

app.listen(3000, () => {
    console.log('服务器启动成功了')
})