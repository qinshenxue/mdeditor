// 将最新文件同步到项目主页中
var Client = require('ftp');
var syncConfig=require('./sync-config');

var c = new Client();
c.on('ready', function() {
    console.log('start sync');
    c.put('dist/mdeditor.min.css','/demo/mdeditor/css/mdeditor.min.css',function(err){
        if(err) throw err;
        c.end();
        console.log('css sync success');
    })
    c.put('dist/mdeditor.min.js','/demo/mdeditor/js/mdeditor.min.js',function(err){
        if(err) throw err;
        c.end();
        console.log('js sync success');
    })
    c.put('demo/index.html','/demo/mdeditor/index.html',function(err){
        if(err) throw err;
        c.end();
        console.log('html sync success');
    })

});
c.connect(syncConfig);