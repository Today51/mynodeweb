const express = require("express");
const app = express();
const mysql = require("mysql");

// 目录
const directory = {
  '上海世纪公园': 'century',
  '上海长风公园': 'changfeng_park',
  '上海佘山国家森林公园·东佘山园': 'dong_she_shan_park',
  '上海共青森林公园': 'forest_park',
  '上海大观园': 'grand_view_garden',
  '上海顾村公园景区': 'gu_cun_park',
  '上海古猗园': 'guyi_garden',
  '黄兴公园': 'huang_xing_park',
  '上海鲁迅公园': 'lu_xun_park',
  '上海闵行体育公园': 'minhang_sports_park',
  '上海影视乐园': 'movie_park',
  '上海南翔景区': 'nan_xiang_scenic',
  '上海海洋水族馆': 'oceanarium',
  '周浦花海': 'sea_of_flowers',
  '上海方塔园': 'shanghai_fangta_park',
  '上海田子坊景区': 'tianzifang_scenic_area',
  '东方明珠广播电视塔': 'tvtower',
  '上海醉白池公园': 'white_pool_park',
  '上海佘山国家森林公园·西佘山园': 'xi_sheshan_park',
  '上海召稼楼景区': 'zhaojialou_scenic',
  '朱家角古镇': 'zhu_jia_jiao',
  '上海野生动物园': 'zoo',
}


// 设置路由 
app.get("/", (req, res) => {
  res.send("hello world");
})

// 设置端口
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("xx");
})

// 连接数据库
let connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '5115wuyi',
  database: 'scenicnumber',
  connectionLimit: 20
});
connection.connect(function (err) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("数据库连接成功" + Date());
  }
})
 function getMysqlDataByName(connection, name) {
   return new Promise((resolve,reject)=>{
    connection.query(`select name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') 
    as time from ${directory[name]} where num!=0 and state not like '%闭园%'`,
      function (err, results) {
        if(err){
          reject(err);
        }
        if(results){
          resolve(results[0].num);
        }
      });
      connection.end();
   })
  }
async function run(){
  let data = await getMysqlDataByName(connection,"上海世纪公园");
  console.log(data);
}  

run();


