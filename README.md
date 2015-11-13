#mdeditor（7.16k）
## 演示地址
[http://www.qinshenxue.com/demo/mdeditor/index.html](http://www.qinshenxue.com/demo/mdeditor/index.html)
## API

### 初始化实例（传入参数id）
```
<div id="wrap">

</div>
<script>
    var mdeditor = mdeditor({
        id: 'wrap'
    });
</script>
```
#### 带参数完整配置项

```
<script>
    var mdeditor = mdeditor({
        id: 'textarea的id', // 必须的
        name:'输入框name属性值',
        placeholder: '与html5中的placeholder同义，兼容性也相同'
    });
</script>
```

### 初始化实例（不传参数）
用于一些只想单独用mdeditor的api的场景
比如要把一些markdown语法文本转义html内容

```
<div id="wrap">

</div>
<script>
    var mdeditor = mdeditor();
    mdeditor.markdownToHtml('#要转义的markdown语法文本');
</script>
```


### getHTML
获取markdown转义后的HTML代码
```
<script>
    var mdeditor = mdeditor({
        id: 'wrap'
    });
    mdeditor.getHTML();
</script>
```

### getMarkdown
获取markdown内容
```
<script>
    var mdeditor = mdeditor({
        id: 'wrap'
    });
    mdeditor.getMarkdown();
</script>
```
### setMarkdown
设置markdown内容
```
<script>
    var mdeditor = mdeditor({
        id: 'wrap'
    });
    mdeditor.setMarkdown('#markdown内容');
</script>
```





##更新日志

### 2015-11-13
1. 增加设置输入框placeholder属性的配置项
2. 增加设置输入框name属性的配置项
3. 优化css代码
4. 修复删除目录语法后，预览还显示目录的bug

### 2015-11-12
1. 优化标题的匹配正则
2. 新增TOC目录语法

### 2015-11-11
1. 优化css样式代码

### 2015-11-10
1. 增加获取HTML接口`getHTML`
2. 增加获取markdown内容接口`getMarkdown`
3. 增加设置markdown内容接口`setMarkdown`
4. 解决行内代码中带html标签无法正常显示的bug
5. 增加初始化实例的两种场景（传参和不传参数）
6. 优化部分css样式代码

### 2015-11-09
1. 增加a链接新窗口打开语法，见下方gif图演示




## 已支持语法
### 目录
![](readme/toc.gif)

### 标题
![](readme/h16.gif)
### 段落
![](readme/p.gif)
### 链接
![](readme/a.gif)
*****
![](readme/a_blank.gif)
### 列表（无序列表，有序列表）
![](readme/ul.gif)
*****
![](readme/ol.gif)
### 图片
![](readme/img.gif)
### 行内代码
![](readme/inlinecode.gif)
### 代码块
![](readme/code.gif)