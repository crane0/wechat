const fs = require('fs');
const path = require('path');
//这是xml2js的使用方式
const xml2js = require('xml2js').parseString

//写到方法里面了，因为不止 accessToken.txt 一个需要保存了
// const filename = path.join(__dirname,'./accessToken.txt');

module.exports = {
    writeFileAsync : (filePath, data) => {
        //保存路径
        filePath = path.join(__dirname, filePath)
        //在写入时，要以字符串的方式，但是因为还要以对象继续传递，所以进行了区分data，dataJson
        const dataJson = JSON.stringify(data);
        return new Promise((resolve,reject) => {
            fs.writeFile(filePath,dataJson,(err) =>{
                if(!err){
                    resolve(data);
                }else{
                    reject(err);
                }
            })
        })
    },
    readFileAsync : (filePath) => {
        filePath = path.join(__dirname, filePath)
        return new Promise((resolve,reject) => {
            fs.readFile(filePath,(err,data) =>{
                if(!err){
                    //读取到的是buffer，要转为string
                    data = data.toString();
                    resolve(data);
                }else{
                    reject(err);
                }
            })
        })
    },
    getXMLAsync : (req) =>{
        return new Promise((resolve, reject) => {
            let xmlData = ''
            req.on('data', data => {
                data = data.toString()
                xmlData += data
            }).on('end', () => {
                resolve(xmlData)
            })
        })
    },
    //用来解析，将 xml格式转为 js
    parseXMLAsync: (xmlData) => {
        return new Promise((resolve, reject) => {
            xml2js(xmlData, {trim: true}, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject(err)
                }
            })
        })
    },
    //实现将对象中的数组去掉
    formatMessage : (jsData) => {
        let message = {}

        if(typeof jsData === 'object'){
            let key, valueArr
            const keys = Object.keys(jsData)
            //这样写可以利用缓存
            for(let i = 0, length = keys.length; i < length; i++){
                key = keys[i]

                valueArr = jsData[key]
                //过滤掉空值 或者 空数组
                if(valueArr instanceof Array && valueArr.length > 0){
                    message[key] = valueArr[0];
                }
            }
        }
        return message;
    }
}