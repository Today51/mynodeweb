const mysql = require("mysql");

module.exports = {
  // 数据库配置
  config:{
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '5115wuyi',
    database: 'scenicnumber'
    // connectionLimit: 20
  },
  // 使用连接池的方式
  sqlConnect:function(sql,sqlArr,callBack){
    let pool = mysql.createPool(this.config);
    pool.getConnection((err,conn)=>{
      console.log("数据库连接池方式成功");
      if(err){
        console.log(err);
        return;
      }
      // 事件驱动回调
      conn.query(sql,sqlArr,callBack);
      // 释放连接
      conn.release();

    })
  }
}