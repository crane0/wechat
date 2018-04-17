const fs = require('fs');
const path = require('path');

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
    }
}