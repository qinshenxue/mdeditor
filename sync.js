// 将最新文件同步到项目主页中
var Client = require('ftp');
// ftp的配置信息，包括host，user，password
var syncConfig = require('./sync-config');

var c = new Client();
c.on('ready', function () {
    console.log('start sync');
    c.put('dist/mdeditor.min.css', '/demo/mdeditor/css/mdeditor.min.css', function (err) {
        if (err) throw err;
        c.end();
        console.log('mdeditor.min.css sync success');
    })
    c.put('dist/mdeditor.min.js', '/demo/mdeditor/js/mdeditor.min.js', function (err) {
        if (err) throw err;
        c.end();
        console.log('mdeditor.min.js sync success');
    });
    c.put('dist/mdeditor.grammer.iframe.min.js', '/demo/mdeditor/js/mdeditor.grammer.iframe.min.js', function (err) {
        if (err) throw err;
        c.end();
        console.log('mdeditor.grammer.iframe.min.js sync success');
    })
    c.put('demo/index.html', '/demo/mdeditor/index.html', function (err) {
        if (err) throw err;
        c.end();
        console.log('index.html sync success');
    })

});
c.connect(syncConfig);