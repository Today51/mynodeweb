const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser")
const cors = require("cors");


// app.all("*", function (req, res, next) {
// 	//设置允许跨域的域名，*代表允许任意域名跨域
// 	res.header("Access-Control-Allow-Origin", "*");
// 	//允许的header类型
// 	res.header("Access-Contro1-Allow-Headers", "content-type");
// 	//跨域允许的请求方式
// 	res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
// 	if (req.method.toLowerCase() == 'options ')
// 		res.send(200);//让options尝试请求快速结束else
// 	next();
// })

// 跨域解决
app.use(cors());

// 用于解析提交的内容req参数
app.use(bodyParser.urlencoded({extended:true}));
// 目录
const directory = require("./util/nameconfig");


// 引入路由
const users = require("./routes/user");


// 使用路由
app.use("/",users);


// 设置端口
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`监听端口${port}`);
})

// var connection = mysql.createConnection({
//   host: '127.0.0.1',
//   port: 3306,
//   user: 'root',
//   password: '5115wuyi',
//   database: 'scenicnumber'
// });
// connection.connect();

// for(let key in nameconfig){
//   var  sql = `select id,name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') as time from ${nameconfig[key]}  where num!=0 and state not like '%闭园%'`;
// connection.query(sql,function (err, data) {
//     if(err){
//         console.log('[SELECT ERROR] - ',err.message);
//         return;
//     }

//     if(data)
//     {
//       let long,name,lastData;
//       long = data.length;
//       name = key;
//       lastData = data[long-1];
//       let sum={name:name,long:long,lastData:lastData};
//       console.log(sum);
//     }
// });
// }
// connection.end();


