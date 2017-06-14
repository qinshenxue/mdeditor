#mdeditor
## 演示地址&文档地址
[http://mdeditor.qinshenxue.com](http://mdeditor.qinshenxue.com)


##更新日志
版本号（x.y.z）说明
- x 有不兼容的api或语法更新
- y 增加新api、markdown语法、调整代码结构
- z 修复bug，优化代码


### V1.4.1
2016-12-08
- 修复bug[issues#7](https://git.oschina.net/qinshenxue/mdeditor/issues/7)，a链接语法`[A](B)`，A带有`[]()`中的任何一个则不会被解析成功，A如果要输入`[]()`需在前面加反斜杠，比如`\[\]\(\)`
- 优化CSS样式

### V1.4.0
2016-11-24
- 增加分割线语法（三个以上的星号`***`、减号`---`、底线`___`来建立一个分隔线，行内不能有其他东西。你也可以在星号或是减号中间插入空格`* * *`。）
- 优化CSS样式


### V1.3.0
2016-10-30
- 去掉对代码的高亮处理（还是交给专业的插件去做，推荐highlight.js，特此将代码采用pre>code包裹，并在code上加上了代码类型的class）
- 优化CSS样式

### V1.2.0
2016-07-02
- 添加版本号及说明
- 增加引用语法`>引用`，引用内支持ul和ol
- 增加斜体语法`*斜体*`
- 增加自定义语法扩展
- 增加自定义语法扩展实例，私有语法插入iframe`$[iframe高度](iframe的src)`比如$\[200](http://mdeditor.qinshenxue.com)
- 增加对ie8的支持
- 优化markdown解析代码及css样式