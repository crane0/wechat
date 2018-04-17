const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js').parseString

const filename = path.join(__dirname,'./accessToken.txt');

module.exports = {
    writeFileAsync : (data) => {
        data = JSON.stringify(data);
        return new Promise((resolve,reject) => {
            fs.writeFile(filename,data,(err) =>{
                if(!err){
                    resolve();
                }else{
                    reject();
                }
            })
        })
    },
    readFileAsync : () => {
        return new Promise((resolve,reject) => {
            fs.readFile(filename,(err,data) =>{
                if(!err){
                    data = data.toString();
                    resolve(data);
                }else{
                    reject();
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