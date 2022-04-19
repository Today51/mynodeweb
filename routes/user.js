const express = require("express");
const router = express.Router();
const methods = require("../controllers/controller");

// 设置路由 
// router.get("/", (req, res) => {
//   res.send("hello world");
// })
// router.get('/test',(req,res,next)=>{
//   res.json({msg:'login'});
// })
router.get("/getTenData",methods.getTenData);
router.get("/getById",methods.getById);
router.post("/getCode",methods.sendCode);
router.post("/getCode",methods.sendCode);
router.get("/getValidDatas",methods.getValidDatas);
module.exports = router;



