var formidable = require("formidable");
var db = require('../modules/12_mogodb.js');
var md5 = require('../modules/16_md5_fun.js');
var path= require('path');
var fs = require("fs");
var gm = require('gm');


exports.showIndex = function(req,res,next){
	if(req.session.login=='1'){
		var ifLogin = true;
		var username = req.session.username;
		db.find('shuoshuo',{"name":username},function(err,result){
			db.find('posts',{},{'sort':{'datetime':-1}},function(err,result2){
				res.render('index.ejs',{
					'ifLogin':ifLogin,
					'username':username,
					'avatar':result[0].avatar||'moren.jpg',
					'posts':result2
				})
			})
			
		})
	}else{
		var ifLogin = false;
		var username = '';
		res.render('index.ejs',{
			'ifLogin':ifLogin,
			'username':username,
			'avatar':'moren.jpg'
		})
	}
}
exports.showRegist = function(req,res,next){
	res.render('regist.ejs',{
		'ifLogin':req.session.login=='1'?true:false,
		'username':req.session.username?req.session.username:'',
		'active':'regist'
	})
}
exports.showLogin = function(req,res,next){
	res.render('login.ejs',{
		'ifLogin':req.session.login=='1'?true:false,
		'username':req.session.username?req.session.username:'',
		'active':'login'
	})
}
exports.doRegist = function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err, fields, files){
		db.find('shuoshuo',{"name":fields.name},function(err,result){
			if(err){
				res.send('-3');
				return;
			}
			if(result.length>0){
				res.send('-1');//用户名已存在
			}else{
				var password = md5.md5(fields.password)+'7'
				db.insertOne('shuoshuo',{
					"name":fields.name,
					"password":password
				},function(err,result){
					if(err){
						res.send('-3');
						return;
					}
					req.session.login = '1';
					req.session.username = fields.name;
					res.send('1');
				})
			}
		})
	})
}
exports.doLogin = function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err, fields, files){
		db.find('shuoshuo',{"name":fields.name},function(err,result){
			if(err){
				res.send('-3');
				return;
			}
			if(result.length==0){
				res.send('-1');//用户名不存在
				return;
			}else{
				
				if(result[0].password==(md5.md5(fields.password)+'7')){
					req.session.login = '1';
					req.session.username = fields.name;
					res.send('1');
				}else{
					res.send('-2');
				}
				
			}
		})
	})
}
exports.showupavatar = function(req,res,next){
	//必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
	res.render('upavatar.ejs',{
		'ifLogin':req.session.login=='1'?true:false,
		'username':req.session.username,
		'active':'upavatar'
	});
}
exports.setavatar = function(req,res,next){
	var form = new formidable.IncomingForm();
	form.uploadDir = path.normalize("./avatar");//设置文件存储路径,格式标准化路径
	form.parse(req,function(err, fields, files){
		//改名
        if(err){
            next();     //这个中间件不受理这个请求了，往下走
            return;
        }
        var oldpath = path.normalize(__dirname+'/../'+files.useravatar.path);
        var newpath = path.normalize(__dirname+'/../avatar/'+req.session.username+'.jpg');
        fs.rename(oldpath,newpath,function(err){
        	console.log(oldpath);
        	console.log(newpath)
        	if(err){
        		console.log(err)
        		console.log('改名失败');
        		return;
        	}
        	
        	req.session.avatar = req.session.username+'.jpg'
        	//跳转到切的业务
            res.redirect("/cut");
        })
	})
}
exports.cutavatar = function(req,res,next){
	//必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
	res.render('cutavatar.ejs',{
		'useravatar':req.session.avatar
	});
}
exports.docut = function(req,res,next){
	var w = parseInt(req.query.wid),
		h = parseInt(req.query.hei),
		ml = parseInt(req.query.mgl),
		mt = parseInt(req.query.mgt);
	gm('./avatar/'+req.session.avatar).resize(w,h).crop(250,170,ml,mt).write('./avatar/'+req.session.avatar,function(err){
		if(err){
			res.send('-1');
			return
		}
		db.updateMany('shuoshuo',{'name':req.session.username},{
			 $set: {'avatar': req.session.avatar}
		},function(err,result){
			if(err){
				console.log(err);return;			
			}
			res.send('1')
		})
	})
	
}
exports.doposts = function(req,res,next){
	var form = new formidable.IncomingForm();
	form.parse(req,function(err, fields, files){
		db.insertOne('posts',{
			'name':req.session.username,
			'datetime':new Date(),
			'content':fields.content,
			'avatar':req.session.username+'.jpg'
		},function(err,result){
			if(err){
				res.send('-3');
				return;
			}
			res.send('1');
			
		})
	})
}
exports.getcontent = function(req,res,next){
	var page = parseInt(req.query.page);
	db.find('posts',{},{'pagenum':3,'page':page,'sort':{'datetime':-1}},function(err,result){

		res.json(result)
	})
}
exports.getallshuoshuo = function(req,res,next){
	var name = req.query.username;
	db.find('shuoshuo',{'name':name},function(err,result){
		console.log(result)
		res.json(result)
	})
	
}
exports.getamount= function(req,res,next){
	db.find('posts',{},function(err,result){
		res.json(result)
	})
}
exports.otheruser = function(req,res,next){
	var user = req.params['user'];
	db.find('posts',{'name':user},function(err,result){
		res.render('othershuoshuo',{
			'ifLogin':req.session.login=='1'?true:false,
			'username':req.session.username,
			'user':user,
			'others':result,
			'active':'myshuoshuo'
		})
	})
	
}
exports.userlist = function(req,res,next){
	db.find('shuoshuo',{},function(err,result){
		res.render('userlist',{
			'ifLogin':req.session.login=='1'?true:false,
			'username':req.session.username,
			'allusers':result,
			'active':'userlist'
		})
	})
}
//退出登录业务
exports.exit = function(req,res,next){
	req.session.login=-1;
	req.session.username='';
	//跳转到某业务
    res.redirect("/");
}
