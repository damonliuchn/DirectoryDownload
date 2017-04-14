var express = require('express');
var app = express();
var fs = require("fs");
var path = require("path");
var fileList = [];
var qr = require('qr-image');
var url = require('url');

function walk(path){  
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item){
        if(fs.statSync(path + '\\' + item).isDirectory()){
            walk(path + '\\' + item);
        }else{
            fileList.push(path + '\\' + item);
        }
    });
}


var port = process.env.PORT || 10003;
var router = express.Router();

router.get('/', function (req, res) {
	fileList = [];
	var fileDir = path.resolve()+'\\file'
	walk(fileDir);
	//sort
	fileList.sort(function(val1, val2){
  		//读取文件信息
  		var stat1 = fs.statSync(val1);
  		var stat2 = fs.statSync(val2);
  		//根据时间从最新到最旧排序
  		return stat2.mtime - stat1.mtime;
 	});

	var host = req.protocol + '://' + req.get('host');
	var html='';
	for(var i = 0,  l = fileList.length; i < l; i++) {
		var fileName = fileList[i].replace(fileDir+'\\','')
    	html = html + '<br><br><a href="'+ host  + '\\file\\' +fileName +'">'+ fileName +' 电脑下载</a>  '
    			 + '<a target=\'view_window\'href="'+ host  + '\\qrImg?fileName=' +fileName +'">二维码下载</a>'
	}
    res.send(html);
});


router.get('/qrImg', function(req, res) {
	var host = req.protocol + '://' + req.get('host');
    var params = url.parse(req.url,true);
    var detailLink = host  + '\\file\\' +params.query.fileName;
    try {
        var img = qr.image(detailLink,{size :10});
        res.writeHead(200, {'Content-Type': 'image/png'});
        img.pipe(res);
    } catch (e) {
        res.writeHead(414, {'Content-Type': 'text/html'});
        res.end('<h1>414 Request-URI Too Large</h1>');
    }
});

app.use(express.static(__dirname,'/file'));
app.use('/', router);

app.listen(port);
console.log('Magic happens on port ' + port);
