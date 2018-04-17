const express = require('express');
//config中是配置信息
const config = require('./config/config');
const confirm = require('./wechat/confirm');

const app = express();

//使用中间件，为了处理所有请求
app.use(confirm(config));

app.listen(3000, () => {
    console.log('服务器启动成功了')
})