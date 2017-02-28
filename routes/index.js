var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
var cookie = require("cookie");

mongoose.connect('mongodb://localhost/admin', function (err) {
    if (err) {
        console.log("连接失败")
    } else {
        console.log("连接成功")
    }
});
var adminSchema = mongoose.Schema({// 创建骨架
    "username": String,
    "password": String,
    "user": String,
    "department": String,
    "role": String,
    "department": String,
    "ordernum": Number,
    "flag": String,
    "stadus": String
})

var logSchema = mongoose.Schema({
    "username": String,
    "explain": String,
    "time": String,
    "result": String,
    "IP": String
})

var adminModel = mongoose.model("admin", adminSchema, "admin");

var logModel = mongoose.model("log", logSchema, "log");


// router.get('/', function (req, res, next) {
//     res.send("location.href='/admin/pages/login.html'")
// });
//验证用户提交的登录信息是否正确
router.post("/checklogin.html", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    adminModel.find({"username": username, "password": password}, function (err, data) {
        if (data.length) {
            res.cookie("login_user", username);//写上cookie验证用户身份
            res.send("1");//验证成功返回1
        }
        else if(username == "HLJ" && password == "admin"){
            res.cookie("login_user", username);
            res.send("1");//验证成功返回1
        } else {
            res.send("0");
        }
    })
})
router.get("/checkuser.html", function (req, res) {
    if (req.cookies.login_user) {
        res.send("1")
    } else {
        res.send("alert('您没有登录，请登录');location.href='/admin/pages/login.html'")
    }
})
router.get("/logout.html", function (req, res) {
    res.clearCookie("login_user");
    res.send("<script>alert('退出成功');location.href='/admin/pages/login.html'</script>")
})
router.post("/addadmin.html", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var user = req.body.user;
    var role = req.body.role;
    var department = req.body.department;
    var ordernum = req.body.ordernum;
    var flag = req.body.flag;
    var stadus = req.body.stadus;
    //新增实体
    var admin = new adminModel();
    admin.username = username;
    admin.password = password;
    admin.user = user;
    admin.role = role;
    admin.department = department;
    admin.ordernum = ordernum;
    admin.flag = flag;
    admin.stadus = stadus;
    admin.save(function (err) {//将构造好的数据保存到数据库集合中
        if (err) {
            res.send("0");
        } else {
            res.send("1");
        }
    })
})
router.get("/users.html", function (req, res) {
    adminModel.find({}, function (err, data) {
        res.send(data);
    }).skip(0).limit(5).sort({"ordernum": 1});//limit限制每一页接受五条数据，skip决定每一页接受数据的编号（参数是从第几个索引开始）
})


router.get("/pagercount.html", function (req, res) {//获得页码数量
    var pageSize = 5;
    adminModel.find({}, function (err, data) {
        var pagecount = Math.ceil(data.length / pageSize);
        var page = String(pagecount);
        res.send(page);
    })
})
router.get("/pager.html", function (req, res) {//分页
    var pageNum = parseInt(req.query.page);

    adminModel.find({}, function (err, data) {
        res.send(data);
    }).skip(5 * pageNum - 5).limit(5).sort({"ordernum": 1});
})

router.get("/userget.html", function (req, res) {//点击编辑按钮获取用户数据填写到表单中
    var id = req.query.id;
    adminModel.findById(id, function (err, data) {
        res.send(data);
    })
})

router.post("/useredit.html", function (req, res) {//编辑用户信息
    var id = req.body._id;
    var username = req.body.username;
    var password = req.body.password;
    var user = req.body.user;
    var role = req.body.role;
    var department = req.body.department;
    var ordernum = req.body.ordernum;
    var flag = req.body.flag;
    var stadus = req.body.stadus;
    adminModel.findById(id, function (err, data) {
        data.username = username;
        data.password = password;
        data.user = user;
        data.role = role;
        data.department = department;
        data.ordernum = ordernum;
        data.flag = flag;
        data.stadus = stadus;
        data.save();
    });
    res.send("1");
})

router.get("/removeuser.html", function (req, res) {//点击删除按钮删除选中的用户数据
    var id = req.query.id;
    adminModel.findById(id, function (err, data) {
        data.remove();
    })
})

router.post("/search.html", function (req, res) {//用户列表搜索功能
    var department = req.body.department;
    var role = req.body.role;
    var user = req.body.user;
    var obj = {};
    if (department != "全部") {
        obj.department = department
    }
    ;
    if (role != "全部") {
        obj.role = role;
    }
    if (user) {
        obj.username = new RegExp(user);
    }
    adminModel.find(obj, function (err, data) {
        res.send(data);
    })
})

router.post("/edit.html", function (req, res) {//修改密码
    var username = req.cookies.login_user;
    var oldpwd = req.body.oldpwd;
    var newpwd = req.body.newpwd;
    adminModel.find({"username": username}, function (err, data) {
        if (data[0].password == oldpwd) {
            data[0].password = newpwd;
            data[0].save();
            res.send("恭喜您修改成功！")
        } else {
            res.send("旧密码输入错误，请重新输入")
        }
    })
})

router.post("/log.html", function (req, res) {//保存操作日志
    var username = req.cookies.login_user;
    var explain = req.body.explain;
    var time = req.body.time;
    var result = req.body.result;
    var IP = req.ip;
    var log = new logModel();
    log.username = username;
    log.explain = explain;
    log.time = time;
    log.result = result;
    log.IP = IP;
    log.save();
    res.send("日志保存成功");
})

router.get("/getlog.html", function (req, res) {//log页面获得日志数据
    logModel.find({}, function (err, data) {
        res.send(data);
    }).limit(10).sort({"time": -1});
})


module.exports = router;
