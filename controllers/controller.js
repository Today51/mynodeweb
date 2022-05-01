const dbconfig = require("../util/dbconfig");
const nameconfig = require("../util/nameconfig");
const dborder = require("../util/dborder");
const predictMethod = require("../model")

// select id,name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') as time from ${nameconfig[name]}  where num!=0 and state not like '%闭园%' order by id limit 10
//获取最开始5日的有效数据 数据不为0且状态不为闭园 这里数据输出是倒叙century

/*-- 实际业务
// SELECT t1.date,ifnull( t2.num, 0 ) AS num  FROM (SELECT @i := @i + 1 AS NO, DATE( DATE_SUB( CURRENT_DATE, INTERVAL @i DAY ) ) AS date FROM mysql.help_topic, (SELECT @i := 0) t WHERE @i < 10 ORDER BY date ) t1 
 LEFT JOIN 
(SELECT DATE( create_time ) AS date, count( 1 ) AS num FROM `XXX_order` WHERE create_time > DATE( DATE_SUB( CURRENT_DATE, INTERVAL 10 DAY ) ) GROUP BY date) t2 ON t1.date = t2.date
*/

// 数据库数据问题，数据只有3.5-3.10,3.11,3.12的数据，
// 其中还存在多爬了一条时间点数据的情况（从数据库中手动删除 ）
// 删除后id不连续 执行
// SET SQL_SAFE_UPDATES = 0;
// SET @auto_id = 0;
// UPDATE scenicnumber.crawler SET id = (@auto_id := @auto_id + 1);
// ALTER TABLE scenicnumber.crawler AUTO_INCREMENT = 1;
// 还有每个园区开园和闭园时间不同的问题
// 因为疫情的原因，每个园区暂时闭园时间不同

// 存在3-6 11.30数据缺失 在客流分析页面 显示整点数据

// 舍弃的景区
// 上海田子坊 数据存在问题，不真实
// 上海方塔园 存在某天闭园问题，数据不连续
//  周浦花海 数据全是0
//  上海醉白池公园 提前因为疫情，暂时闭园,数据过少
//  上海召稼楼景区 存在某天闭园，数据过少
//  舍弃多个景区
const predictData ={
  "上海世纪公园":[],
  "上海长风公园":[],
  "上海共青森林公园":[],
  "上海大观园":[],
  "上海顾村公园景区":[],
  "上海古猗园":[],
  "黄兴公园":[],
  "上海鲁迅公园":[],
  "上海闵行体育公园":[],
  "东方明珠广播电视塔":[],
  "朱家角古镇":[],
}

let AllRes=null;
// 筛选掉闭园和季节性闭园的情况，计算日总人流数，

function getValidDatas(req,res){
  AllRes=res;
  let {name} = req.query;
  let sql = `select id,name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') as time from ${nameconfig[name]}  where state not like '%闭园%' order by id limit ${dborder[name]}`;
  let sqlArr = [name];
  let callBack = (err,data)=>{
    if(err){
      console.log(err);
    }else{
      let long=0;
      long=getLastDataRows(data);
      console.log("成功获取数据");
      console.log("模型训练",name);
      if(predictData[name].length==0){
        new Promise((resolve,reject)=>{
          let myData=predictMethod.getTrainModel(data,long);
          resolve(myData)
        }).then((Myres)=>{
          predictData[name]=Myres;
          console.log("predictData[name]1",predictData[name])
          AllRes.send({data:data,predictData:predictData[name]});    
        })
      }else{
      console.log("predictData[name]2",predictData[name])
      AllRes.send({data:data,predictData:predictData[name]});    
      }   
    }
  };
  dbconfig.sqlConnect(sql,sqlArr,callBack);
}

function getLastDataRows(data){
  let long=0;
  let oneDate = data[data.length - 1].time.split(" ")[0];
  for(let i=data.length-1;i>=0;i--){
    let time = data[i].time.split(" ");
    let TempDate = time[0];
    if(oneDate!=TempDate){
      // 是昨天
      break;
    }
    long++;
  }
  return long;
}


getTenData=(req,res)=>{
  let {name} = req.query;
  let sql = `select id,name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') as time from ${nameconfig[name]}  where num!=0 and state not like '%闭园%' order by id limit 10`;
  // let nameSql = nameconfig[name].replace(/^[\'\"]+|[\'\"]+$/g,"");
  let sqlArr = [name];
  let callBack = (err,data)=>{
    if(err){
      console.log(err);
    }else{
      console.log("成功获取数据");
      res.send(data);
    }
  };
  dbconfig.sqlConnect(sql,sqlArr,callBack);
}
// 带参数获取数据库数据
getById=(req,res)=>{
  let {id} = req.query;
  let sql = `select * from century where id=?`;
  let sqlArr = [id];
  let callBack = (err,data)=>{
    if(err){
      console.log("错误");
    }else{
      res.send(
        data
      )
    }
  };
  dbconfig.sqlConnect(sql,sqlArr,callBack);
}

let validate = [];
function codeValidate(phone){
  for(let i of validate){
    if(phone === i.phone){
      return true;
    }
  }
  return false;
}
// 模拟验证码接口
function rand(){
  return Math.floor(Math.random()*100);
}
sendCode = (req,res)=>{
  let phone = req.query.phone;
  let code = rand();
  validate.push({
    'phone':phone,
    'code':code
  });
    console.log(validate);
    if(codeValidate(phone)){
    res.send({
      'code':400,
      'msg':'已经发送过'
    });
    return;
  }

  res.send({
    'code':200,
    'msg':"发送成功"
  });
  console.log(code);
}


module.exports ={
  getTenData,
  getById,
  sendCode,
  getValidDatas
}





