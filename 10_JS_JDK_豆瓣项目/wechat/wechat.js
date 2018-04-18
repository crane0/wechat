
/*
  创建Wechat构造函数，用来生成access_token，全局唯一凭据
    我们调用微信的接口，必须携带上access_token参数

  access_token:(jsapi_ticket类似)
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
//url路径，都通过这个api获取
const api = require('../utils/api')
const fs = require('fs')


function WeChat(options) {
    this.appID = options.appID;
    this.appsecret = options.appsecret;

    this.fetchAccessToken()
    this.fetchTicket()
}

//---jsapi_ticket操作开始---

//取得并确保可以使用 jsapi_ticket
WeChat.prototype.fetchTicket = function () {
    //少去调用readFile方法，如果本地有，直接读到就可以返回
    if (this.ticket && this.ticket_expires_in) {
        if (this.isValidTicket(this)) {
            return Promise.resolve(this)
        }
    }

    //最终会获取到一个Promise对象，包含 ticket
    return this.getAccessToken()
        .then(res =>{
            //验证本地有效性，有效则返回一个Promise对象，继续传递 res
            if(this.isValidTicket(res)){
                return Promise.resolve(res);
            }else{
                //凭据过期，重新获取（从微信官方）
                return this.updateTicket()
            }
        },err =>{
            //出错，本地没有文件
            return this.updateTicket()
        })
        //将传递的 res中的内容挂载 this
        .then(res =>{
            //将凭据和过期时间挂载到this上
            this.ticket = res.ticket
            this.ticket_expires_in = res.ticket_expires_in
            /*
            * 将凭据和过期时间保存在本地
            * 因为上一个then中，凭据过期或出错时，都会重新获取，放在这里只写一次，
            *   即便没有过期，也重新保存一下，虽然多余，大无伤雅。
            *
            * */
            return this.saveTicket(res)
        })
}

//检查 jsapi_ticket有效性
WeChat.prototype.isValidTicket = function(data){
    if(!data || !data.ticket || !data.ticket_expires_in){
        return false;
    }
    //以现在的时间，和凭据的时间做判断
    const now = Date.now();
    const ticket_expires_in = data.ticket_expires_in;
    //现在的时间，还没有超过凭据的时间，说明没有过期。
    return now < ticket_expires_in;
}

//读取本地保存的 jsapi_ticket（getAccessToken()也做了对应改变，传递了参数）
WeChat.prototype.getTicket = function(){
    return tools.readFileAsync('ticket.txt');
}

//保存 jsapi_ticket到本地（saveAccessToken()也做了对应改变）
WeChat.prototype.saveTicket = function(data){
    return tools.writeFileAsync('ticket.txt', data);
}

//获取 jsapi_ticket
WeChat.prototype.updateTicket = function () {

    // const url = api.accessToken + '&appid='
    //     + this.appID + '&secret=' + this.appsecret
    /*
    * 相比于 access_token，
    * jsapi_ticket通过 access_token来获取，所以url要写在获取 access_token之后
    * */
    return new Promise((resolve,reject) => {

        //获取 access_token
        this.fetchAccessToken()
            .then(res => {
                const url = api.ticket + 'access_token=' + res.access_token + '&type=jsapi'
                rp({method:'GET', url:url, json:true})
                    .then(res => {
                        /*
                        * 因为ticket最后也是要往 this对象上绑定，
                        * 为了避免和凭据的过期时间冲突，重新定义一个对象保存票据和过期时间.
                        * */
                        const data = {
                            ticket: res.ticket,
                            ticket_expires_in: Date.now() + (res.expires_in - 5 * 60) * 1000
                        }

                        resolve(data);
                    },err => {
                        reject(err);
                    })
            })


    })
}

//---jsapi_ticket操作结束---



//---access_token操作开始---

//取得并确保可以使用 access_token
WeChat.prototype.fetchAccessToken = function () {
    //少去调用readFile方法，如果本地有，直接读到就可以返回
    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this)
        }
    }

    //最终会获取到一个Promise对象，包含 access_token
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
    // return tools.readFileAsync();
    return tools.readFileAsync('accessToken.txt');
}

//保存 access_token到本地
WeChat.prototype.saveAccessToken = function(data){
    return tools.writeFileAsync('accessToken.txt',data);
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
    // const url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&' +
    //     'appid='+this.appID+'&secret='+this.appsecret

    const url = api.accessToken + '&appid='
        + this.appID + '&secret=' + this.appsecret

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

//---access_token操作结束---




//上传素材（临时，永久一起实现）
WeChat.prototype.uploadMaterial = function (type, material, permanent) {
    /*
      type: 上传素材的类型
      material: 上传素材的路径/news素材
      permanent: 永久素材接口
     */

    //form对象用来传递内容
    let form ={}

    //初始化：临时上传的素材接口
    let uploadApi = api.temporary.upload

    //如果传了permanent，说明永久上传其他素材接口
    if (permanent) {
        uploadApi = api.permanent.addMaterial
    }

    //说明永久上传图文素材接口
    if (type === 'news') {
        uploadApi = api.permanent.addNews
        form = material
    } else {
        console.log(material)

        //这个是 formData格式的一种实现方式。
        form = {
            media: fs.createReadStream(material)
        }
    }

    //说明永久上传图文url素材接口
    if (type === 'img') {
        uploadApi = api.permanent.uploadImg
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                //http请求方式：POST/FORM
                let url = uploadApi + 'access_token=' + res.access_token

                //新增其他类型的，还需要有参数
                if (type !== 'news' && type !== 'img') {
                    url += '&type=' + type
                }

                //因为 formData不一定有，所以将 options 定义为对象的格式，方便传参
                let options = {method: 'POST', url: url, json: true}

                if (type === 'news') {
                    options.body = form
                } else {
                    options.formData = form
                }

                rp(options)
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
            })
    })

}

/*
* 获取素材
* （相比于 05_上传永久素材，仅仅只是加了这个方法，还有api.js中进行了改变）
*   只是做个例子，并没有实现具体。
* */
WeChat.prototype.getMaterial = function (type, mediaId, permanent) {
    /*
      type: 获取素材的类型
      mediaId: 获取素材media_id
      permanent: 永久素材接口
     */

    //get请求和 post请求，协议是不同的
    let getApi = api.temporary.get
    let method = 'GET'

    if (permanent) {
        method = 'POST'
        getApi = api.permanent.get
    }

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                let url = getApi + 'access_token=' + res.access_token
                let options = {method: method, url: url, json: true}

                //2种方式获取素材时，mediaId都是必须的

                //因为是POST请求，所以放在body中
                if (permanent) {
                    options.body = {
                        media_id: mediaId
                    }
                } else {
                    //临时素材的 video,有特殊规定
                    if (type === 'video') {
                        url.replace('https://', 'http://')
                    }
                    //get请求，直接放在请求字符串中
                    url += '&media_id=' + mediaId
                }

                //下面只是做个测试
                if (type === 'video' || type === 'news') {
                    rp(options)
                        .then(res => {
                            resolve(res)
                        }, err => {
                            reject(err)
                        })
                } else {
                    resolve(url)
                }
            })
    })

}


//创建菜单
WeChat.prototype.createMenu = function (data) {

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                const url = api.menu.create + 'access_token=' + res.access_token
                //菜单接口是 post请求
                rp({method: 'POST', url: url, body: data, json: true})
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
            })
    })
}

//删除菜单
WeChat.prototype.deleteMenu = function () {

    return new Promise((resolve, reject) => {
        this.fetchAccessToken()
            .then(res => {
                const url = api.menu.delete + 'access_token=' + res.access_token

                rp({method: 'GET', url: url, json: true})
                    .then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
            })
    })
}

module.exports = WeChat