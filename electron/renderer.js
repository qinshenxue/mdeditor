const fs = require('fs');
const mdeditor = require('./mdeditor.js');

const {
  Menu, MenuItem, dialog
} = require('electron').remote;

const template = [{
  label: "文件",
  submenu: [{
    label: "保存",
    accelerator: "Ctrl+S",
    click() {
      dialog.showSaveDialog({
        title: "测试",
        filters: [{
          name: 'markdown',
          extensions: ['md']
        }]
      }, function(path) {
        if (path) {
          var md = editor.getMarkdown();
          fs.writeFile(path, md);

        }
      })
    }
  }]
}];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);


var editor = mdeditor({
  id: 'editor-wrap',
  placeholder: '请输入markdown语法文本，右边同步预览html'
});
