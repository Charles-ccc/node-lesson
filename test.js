//加载模块
let app = require('express')();
let request = require('superagent');
let cheerio = require('cheerio');

//指定访问路由
app.get('/', function(req,res){
    //请求网易云音乐主页
    request.get('http://music.163.com/')
        .end(function(err,_response){
            if(!err) {
                //如果没有发生错误，获得的html就是网页返回的html结构
                let html = _response.text;
                //cheerio初始化完成之后与jQuery用法相差无几
                let $ = cheerio.load(html);
                //打印iframe
                console.log('iframe内部结构;' + $('#g_iframe').html);

                res.send('hello');
            }else{
                return(err)
            }
        })
})

//监听3000端口
app.listen(3000, function(){
    console.log('Server start')
})