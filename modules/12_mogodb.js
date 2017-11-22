var MongoClient = require('mongodb').MongoClient;

function _connect(callback){
	var url = 'mongodb://localhost:27017/qiqi';
	MongoClient.connect(url,function(err,db){
		if(err){
			callback(err,null);
			return;
		}
		callback(err,db)
	})
}

function init(){
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}
		db.collection('users').createIndex(
			{'name':1},
			null,
			function(err,results){
				console.log('索引建立成功');
			}
		)
	})
}
exports.insertOne = function(clloctionname,json,callback){
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}
		db.collection(clloctionname).insertOne(json,function(err,result){
			callback(err,result);
			db.close();
		})
	})
}
//查找
exports.find = function(clloctionname,json,args,callback){
	var result=[];
	if(arguments.length==4){
		//应该省略的条数
		var skipnumber = args.pagenum*args.page||0;
		//每页显示数量
		var limit = args.pagenum||0;
		//排序方式
		var sort = args.sort||0
		
	}else{
		//那么参数C就是callback，参数D没有传。
    	var callback = args;
		//应该省略的条数
		var skipnumber = 0;
		//每页显示数量
		var limit =0
	}
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}	
			
		var cursor = db.collection(clloctionname).find(json).limit(limit).skip(skipnumber).sort(sort);
		
		cursor.each(function(err,doc){
			if(err){
				console.log('出错');
				return;
			}
			if(doc != null){
				result.push(doc)
			}else{
				callback(null,result);
				db.close();
			}
		})
	})
}
//删除
exports.deleteMany = function(clloctionname,json,callback){
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}
		db.collection(clloctionname).deleteMany(
			json,
			function(err,results){
				callback(err,results);
				db.close();
			}
		)
	})
}
//修改
exports.updateMany = function(clloctionname,json1,json2,callback){
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}
		db.collection(clloctionname).updateMany(
			json1,
			json2,
			function(err,results){
				callback(err,results);
				db.close();
			}
		)
	})
}
//计算数量
exports.getcount= function(clloctionname,callback){
	_connect(function(err,db){
		if(err){
			console.log('连接失败')			
		}
		db.collection(clloctionname).count({}).then(
			function(count){
				callback(count);
				db.close();
			}
		)
	})
}

