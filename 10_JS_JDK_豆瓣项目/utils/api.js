
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
//豆瓣连接的前缀
const dbPrefix = 'https://api.douban.com/v2/movie/'

module.exports = {
  //豆瓣榜单(豆瓣提供 API)
  douban: {
      //正在热映
      theaters: dbPrefix + 'in_theaters',
      //即将上映
      coming: dbPrefix + 'coming_soon',
      //Top250
      top250: dbPrefix + 'top250',
      //电影条目
      subject: dbPrefix + 'subject/'
  },


  //获取 access_token
  accessToken: prefix + 'token?grant_type=client_credential',

  //获取 jsapi_ticket
  ticket: prefix + 'ticket/getticket?',

  //素材
  temporary: {
    //新增临时素材
    upload: prefix + 'media/upload?',
    //获取临时素材
    get: prefix + 'media/get?'
  },
  permanent: {
    //新增永久图文素材
    addNews: prefix + 'material/add_news?',
    //上传图文消息内的图片获取URL
    uploadImg: prefix + 'media/uploadimg?',
    //新增其他类型永久素材
    addMaterial: prefix + 'material/add_material?',
    //获取永久素材
    get: prefix + 'material/get_material?'
  },


  //菜单的操作
  menu: {
      create: prefix + 'menu/create?',
      delete: prefix + 'menu/delete?'
  }
}