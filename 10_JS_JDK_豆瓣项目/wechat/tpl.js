
//回复用户数据的代码格式，必须是 xml 格式
module.exports = (options) => {
    //数据以该变量接收
    let replyMessage = '';
    //上面这些是公共的代码，所以提出来。
    replyMessage += '<xml> ' +
        '<ToUserName><![CDATA[' + options.toUserName + ']]></ToUserName> ' +
        '<FromUserName><![CDATA[' + options.fromUserName + ']]></FromUserName> ' +
        '<CreateTime>' + options.createTime + '</CreateTime> ' +
        '<MsgType><![CDATA[' + options.msgType + ']]></MsgType> '

    //回复文本消息
    if(options.msgType === 'text'){
        replyMessage += '<Content><![CDATA[' + options.content + ']]></Content>'
    }
    //回复图片消息
    else if (options.msgType === 'image'){
        replyMessage += '<Image><MediaId><![CDATA[' + options.mediaId + ']]></MediaId></Image>'
    }
    //回复语音消息
    else if (options.msgType === 'voice'){
        replyMessage += '<Voice><MediaId><![' + options.mediaId + ']]></MediaId></Voice>'

    }
    //回复视频消息
    else if (options.msgType === 'video'){
        replyMessage += '<Video>' +
            '<MediaId><![CDATA[' + options.mediaId + ']]></MediaId>' +
            '<Title><![CDATA[' + options.title + ']]></Title>' +
            '<Description><![CDATA[' + options.description + ']]></Description>' +
            '</Video>'

    }
    //回复音乐消息
    else if (options.msgType === 'music'){
        replyMessage += '<Music>' +
            '<Title><![CDATA[' + options.title + ']]></Title>' +
            '<Description><![CDATA[' + options.description + ']]></Description>' +
            '<MusicUrl><![CDATA[' + options.musicUrl + ']]></MusicUrl>' +
            '<HQMusicUrl><![CDATA[' + options.hqMusicUrl +']]></HQMusicUrl>' +
            '<ThumbMediaId><![CDATA[' + options.thumbMediaId + ']]></ThumbMediaId>' +
            '</Music>'
    }
    //回复图文消息
    else if (options.msgType === 'news'){
        //这里改为了 options.content.length，以此来确定图文消息的个数
        replyMessage += '<ArticleCount>' + options.content.length + '</ArticleCount>' + '<Articles>'
            options.content.forEach(item => {
                replyMessage += '<item>' +
                    '<Title><![CDATA[' + item.title + ']]></Title> ' +
                    '<Description><![CDATA[' + item.description + ']]></Description>' +
                    '<PicUrl><![CDATA[' + item.picUrl + ']]></PicUrl>' +
                    '<Url><![CDATA[' + item.url + ']]></Url>' +
                    '</item>'
            })
        replyMessage += '</Articles>'
    }

    replyMessage += '</xml>'
    return replyMessage
}