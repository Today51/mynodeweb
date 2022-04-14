const dbconfig = require("../util/dbconfig");
const nameconfig = require("../util/nameconfig");

// select id,name,level,num,state,DATE_FORMAT(time,'%Y-%m-%d %H:%i:%s') as time from ${nameconfig[name]}  where num!=0 and state not like '%闭园%' order by id limit 10
//获取最开始5日的有效数据 数据不为0且状态不为闭园 这里数据输出是倒叙century

/*-- 实际业务
// SELECT t1.date,ifnull( t2.num, 0 ) AS num  FROM (SELECT @i := @i + 1 AS NO, DATE( DATE_SUB( CURRENT_DATE, INTERVAL @i DAY ) ) AS date FROM mysql.help_topic, (SELECT @i := 0) t WHERE @i < 10 ORDER BY date ) t1 
 LEFT JOIN 
(SELECT DATE( create_time ) AS date, count( 1 ) AS num FROM `XXX_order` WHERE create_time > DATE( DATE_SUB( CURRENT_DATE, INTERVAL 10 DAY ) ) GROUP BY date) t2 ON t1.date = t2.date
*/
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
  sendCode
}





