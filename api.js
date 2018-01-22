/*
*网易云 api 主文件入口
*/

var app = require('express')();
var request = require('superagent');
var cheerio = require('cheerio');

function checkId(id){
    return /^[0-9]+$/.test(id)
}

app.get('/recommendLst', function(req,res){

    var requestUrl = 'http://music.163.com/discover';
    var resObj = {
        code: 200,
        message: "加载成功",
        data: []
    }

    request.get(requestUrl)
        .end(function(err, _response){
            if(!err) {
                var dom = _response.text;
                var $ = cheerio.load(dom);
                var recommendLst = [];
                $('.m-cvrlst').eq(0).find('li').each(function(index, element){
                    var cvrLink = $(element).find('.u-cover').find('a')
                    var cover = $(element).find('.u-cover').find('imd').attr('src')
                    var recommendItem = {
                        id: cvrLink.attr('data-res-id'),
                        title: cvrLink.attr('title'),
                        href: 'http://music.163.com' + cvrLink.attr('href'),
                        type: cvrLink.attr('data-res-type'),
                        cover: cover
                    }
                    recommendLst.push(recommendItem);
                })
                resObj.data = recommendLst;
            } else {
                resObj.code = 404;
                resObj.message = "获取API出现问题";
                console.error('Get data error !');
            }
            res.send(resObj)
        })
})

app.get('/play_list/:playlistId', function(req, res) {
    // 获得歌单ID
    var playlistId = res.params.playlistId;
    // 定义请求 url
    var requestUrl = 'http://music.163.com/playlist?id=' + playlistId;
    var resObj = {
        code: 200,
        message: "加载成功",
        data: {}
    }

    if(checkId(playlistId)) {
        request.get(requestUrl)
            .end(function(err, _response){
                if(!err){
                    var playlist = {
                        id: playlistId
                    };
                    // 成功返回 HTML, decodeEntities 指定不把中文字符转为 unicode 字符
                    // 如果不指定 decodeEntities 为 false , 例如 " 会解析为 &quot;
                    var $ = cherrio.load(_response.text, {decodeEntities: false});
                    // 获得歌单 dom
                    var dom = $('#m-playlist');
                    // 歌单标题
                    playlist.title = dom.find('.tit').text();
                    // 歌单拥有者
                    playlist.owner = dom.find('.user').find('.name').text();
                    // 创建时间
                    playlist.create_time = dom.find('.user').find('.time').text();
                    // 歌单被收藏数量
                    playlist.collection_count = dom.find('#content-operation').find('.u-btni-fav').attr('data-count');
                    // 分享数量
                    playlist.share_count = dom.find('#content-operation').find('.u-btni-share').attr('data-count');
                    // 评论数量
                    playlist.comment_count = dom.find('#content-operation').find('#cnt_comment_count').html();
                    // 标签
                    playlist.tags = [];
                    dom.find('.tags').eq(0).find('.u-tag').each(function (index, element) {
                        playlist.tags.push($(element).text());
                    });
                    // 歌单描述
                    playlist.desc = dom.find('#album-desc-more').html();
                    // 歌曲总数量
                    playlist.song_count = dom.find('#playlist-track-count').text();
                    // 播放总数量
                    playlist.play_count = dom.find('#play-count').text();

                    resObj.data = playlist;
                }else{
                    resObj.code = 404;
                    resObj.message = "获取API出现问题";
                    console.log('Get data error!');
                }
                res.send(resObj)
            })
    }else{
        resObj.code = 404;
        resObj.message = "参数异常";
        res.send(resObj)
    }
})
