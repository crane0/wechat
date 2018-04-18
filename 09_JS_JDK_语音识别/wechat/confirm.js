/*
 * 处理验证服务器有效性
 */

const sha1 =require('sha1');
const tools = require('../utils/tools');
const reply = require('./reply')


module.exports = function(config){
    /*
    * 使用了 new，就会调用 WeChat()中 this. 的方法。
    * new Wechat(config)的调用，只是为了保存 access——token
    * 调用放在了reply.js中，也是无所谓的。
    * */
    // new Wechat(config);


    //使用 async，也是为了同步化异步函数，为了避免回调地狱
    //为了在POST请求中，使用await同步化
    return async (req,res)=>{
        /*
        *{ signature: 'aafa8610cb353c4f22901bdb790853b180c4dc45',  //微信加密签名，经过三个参数timestamp、nonce、token的某种算法推出来的
        *timestamp: '1523687157', //微信发送请求时间
        *nonce: '1055096708' }  //微信随机数字
        *echostr: '13459011908045741823', //微信随机字符串
        */

        const echostr = req.query.echostr
        const timestamp = req.query.timestamp
        const nonce = req.query.nonce
        const signature = req.query.signature

        //token通过其他方式获取
        const token = config.token
        /*
       验证服务器的有效性：
         1. 将三个参数timestamp、nonce、token组合起来，进行字典序排序
         2. 将排序完的字符串拼接在一起
         3. 将拼接好字符串进行sha1加密
         4. 将加密的字符串与微信传过来的签名signature对比，验证成功时，返回 echostr给微信服务器
      */

        const arr = [timestamp,nonce,token].sort()
        const arrStr = arr.join('');    //连接为字符串，中间无间隔
        const arrSha = sha1(arrStr);

        if(req.method === 'GET'){
            //确认消息来自微信服务器，来加强安全性
            if(arrSha === signature){
                //给服务器发送，为了双方的确认
                res.send(echostr);
            }else{
                res.send('error');
            }
        }
        else if(req.method === 'POST'){
            /*
            * 这里可以使用post请求，获取req.query中的内容，
            * 是因为微信官方发给本地服务器的，使用的是查询字符串的方式。
            * */
            if(arrSha === signature){
                const xmlData = await tools.getXMLAsync(req);
                // console.log(xmlData)
                /*
                <xml>
                    <ToUserName><![CDATA[gh_a4109ebb6a08]]></ToUserName>
                    <FromUserName><![CDATA[o3DzS1Co2pDf4q4II_QS0J2fMUpc]]></FromUserName>
                    <CreateTime>1523867938</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[xlx]]></Content>
                    <MsgId>6544962957572960148</MsgId>
               </xml>
                * */
                // xml格式 转为 js对象
                const jsData = await tools.parseXMLAsync(xmlData);
                // console.log(jsData)
                /*
                  { xml:
                   { ToUserName: [ 'gh_a4109ebb6a08' ],
                     FromUserName: [ 'o3DzS1Co2pDf4q4II_QS0J2fMUpc' ],
                     CreateTime: [ '1523867938' ],
                     MsgType: [ 'text' ],
                     Content: [ 'xlx' ],
                     MsgId: [ '6544962957572960148' ]
                   }
                  }
               */
                //将其中的数组去掉，方便接收
                const message = tools.formatMessage(jsData.xml);
                console.log(message)
                /*
                  {
                    ToUserName: 'gh_a4109ebb6a08',      //开发者openId
                    FromUserName: 'o3DzS1Co2pDf4q4II_QS0J2fMUpc',   //用户ID，一般称为 openId
                    CreateTime: '1523868431',   //创建时间
                    MsgType: 'text',    //用户发送消息的类型 text/event
                    Content: 'xlx',     //用户发送消息的内容
                    MsgId: '6544965074991837145'   //用户发送的消息，微信服务器会保存3天左右，对应有个id
                  }
                * */

                /*
                * 要先给微信服务器响应一个空串（必须是空串），
                * 如果不，则微信服务器判定本地服务器，没有收到消息，
                * 就会将用户发送给微信服务器的消息，一直响应给本地服务器（可能会有 6次左右）
                * */
                // res.send('');
                //下面开始给服务器响应了，就不用上面这个空串了。


                //根据用户的 openid 和 消息内容 ，我们可以返回指定内容给指定用户
                //返回的内容也必须时xml数据格式
                /*
                注意事项：
                一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号提供的服务出现故障，请稍后再试”
                  1、开发者在5秒内未回复任何内容  *
                  2、xml数据中的 Content字段为空  ***
                  3、开发者回复了异常数据，比如JSON数据、xml数据有多余空格等 *****
                  */

                //回复的内容，都在这个函数中
                //这里 reply()也改为 async函数;
                const replyMessage = await reply(message);


                res.send(replyMessage)
            }
        }
    }
}