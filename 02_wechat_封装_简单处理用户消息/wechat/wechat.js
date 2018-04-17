
/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:
    1. 保证全局唯一凭据，保存为本地文件
    2. 凭据每两个小时必须更新一次

    先去本地读取凭据
      如果有
        检查凭据有没有过期
          如果没过期
            我们就直接使用
          如果过期了
            需要重新请求微信服务器的access_token，并保存在本地
      如果没有
        需要重新请求微信服务器的access_token，并保存在本地
 */


//要使用这个包，还要下载 request包（不需要引入）
const rp = require('request-promise');
const tools = require('../utils/tools');


function WeChat(options) {
    this.appID = options.appID;
    this.appsecret = options.appsecret;

    return this.fetchAccessToken()
}

//确保可以使用 access_token
WeChat.prototype.fetchAccessToken = function () {
    //最终都会获取到 access_token
    return this.getAccessToken()
        .then(res =>{
            //验证本地有效性，有效则返回一个Promise对象，继续传递 res
            if(this.isValidAccessToken(res)){
                return Promise.resolve(res);
            }else{
                //凭据过期，重新获取（从微信官方）
                return this.updateAccessToken()
            }
        },err =>{
            //出错，本地没有文件
            return this.updateAccessToken()
        })
        //将传递的 res中的内容挂载 this
        .then(res =>{
            //将凭据和过期时间挂载到this上
            this.access_token = res.access_token
            this.expires_in = res.expires_in
            /*
            * 将凭据和过期时间保存在本地
            * 因为上一个then中，凭据过期或出错时，都会重新获取，放在这里只写一次，
            *   即便没有过期，也重新保存一下，虽然多余，大无伤雅。
            *
            * */
            return this.saveAccessToken(res)
        })
}

//检查 access_token有效性
WeChat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
        return false;
    }
    //以现在的时间，和凭据的时间做判断
    const now = Date.now();
    const expires_in = data.expires_in;
    //现在的时间，还没有超过凭据的时间，说明没有过期。
    return now < expires_in;
}


//读取本地保存的 access_token
WeChat.prototype.getAccessToken = function(){
    return tools.readFileAsync();
}

//保存 access_token到本地
WeChat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync(data);
}

/*
*获取 access_token（从微信官方）
* 方式：通过调用下面 url所示接口（该接口微信官方提供）获取。
* */
WeChat.prototype.updateAccessToken = function () {
    /*
    * 因为是给构造函数的原型上添加方法，
    * 所以使用的是原本构造函数中，定义的变量 this.appID，而不是直接 appID
    * */
    const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&' +
        'appid='+this.appID+'&secret='+this.appsecret
    /*
    * 为什么要在外层套一个 new Promise()？
    * 因为，虽然 rp()也可以返回 promise对象，但它本身是一个异步函数！
    *   所以，可能当它还没有获取到请求的数据，就已经继续执行下面的代码了，
    *   所以，getAccessToken()就很有可能只是返回一个函数，并没有数据。
    * 所以，要使用 new Promise()这个同步函数，来确保其内的异步函数顺序执行。
    * */
    return new Promise((resolve,reject) => {
        /*
        * request-promise会返回Promise对象，并且自动调用了resolve()方法，并通过then将其传递。
        * 接着，再通过 new Promise中的 resolve方法，传递给其创建的Promise实例，并return出去。
        *
        * json：true，将接受的数据(url)，自动转为 json对象。
        *
        * 正常情况下，res就是 {"access_token":"ACCESS_TOKEN","expires_in":7200}
        * */
        rp({method:'GET',url:url,json:true})
        .then(res => {
        //考虑传递数据的延迟
        const now = Date.now();
        const expires_in = now + (res.expires_in - 5*60)*1000
            res.expires_in = expires_in;
            resolve(res);
        },err => {
                reject(err);
            })
        })
}

module.exports = WeChat