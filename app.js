var express = require('express');
var router = require('./router/router.js');
var session = require("express-session");

var app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
//模板引擎
app.set("view engine","ejs");
app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));

app.get('/',router.showIndex)
app.get('/regist',router.showRegist)
app.get('/login',router.showLogin)
app.post('/doregist',router.doRegist)
app.post('/dologin',router.doLogin)

app.get('/upavatar',router.showupavatar)
app.post('/setavatar',router.setavatar)
app.get('/cut',router.cutavatar)
app.get('/docut',router.docut)
app.post('/doposts',router.doposts)

app.get('/getshuoshuo',router.getallshuoshuo)
app.get('/getcontent',router.getcontent)
app.get('/getamount',router.getamount)
app.get('/user/:user',router.otheruser)
app.get('/userlist',router.userlist)

app.get('/exit',router.exit)

app.listen(3000)
