var crypto = require('crypto');//自带
exports.md5 = function(before){
	var md5 = crypto.createHash('md5');
	var password = md5.update(before).digest('base64');
	return password;
}
