var mdeditor = function (options) {
    return new mdeditor.prototype.init(options);
};

mdeditor.prototype.init = function (options) {


    var me = this;
    if (options && options.id) {
        var defaults = {
            id: '',
            placeholder: '',
            name: ''
        };
        me.copy(defaults, options);
        var wrap = this.getDom(options.id);

        var html = '<textarea id="mdeditor" class="mdeditor" name="{name}" placeholder="{placeholder}"></textarea><div id="mdeditor-html" class="mdeditor-html"></div>';

        html = me.formatString(html, defaults);
        wrap.innerHTML = html;

        var editor = this.getDom('mdeditor');
        var editorHtml = this.getDom('mdeditor-html');

        editor.addEventListener('input', function () {
            var txt = this.value;
            me.markdownToHtml(txt);
        });

        me.editor = editor;
        me.editorHtml = editorHtml;
    }
    return me;
};

mdeditor.prototype.init.prototype = mdeditor.prototype;

// 格式化字符串
mdeditor.prototype.formatString = function (format, data) {
    return format.replace(/{\w+}/g, function ($1) {
        var key = $1.substr(1, $1.length - 2);
        return data[key];
    });
};

// js浅拷贝
mdeditor.prototype.copy = function (source, dest) {
    for (var name in dest) {
        source[name] = dest[name];
    }
    return source;
};

// 获取dom元素
mdeditor.prototype.getDom = function (_id) {
    return document.getElementById(_id);
};

// 获取markdown内容
mdeditor.prototype.getMarkdown = function () {
    if (this.editor) {
        return this.editor.value;
    } else {
        return null;
    }
};

// 设置markdown内容
mdeditor.prototype.setMarkdown = function (markdown) {
    if (this.editor) {
        this.editor.value = markdown;
    }
    return this.markdownToHtml(markdown);
};

// 获取markdown转义后的HTML代码
mdeditor.prototype.getHTML = function () {
    if (this.editorHtml) {
        return this.editorHtml.innerHTML;
    } else {
        return '';
    }
};

// markdown语法文本转义为html
mdeditor.prototype.markdownToHtml = function (md) {
    var me = this;
    var flag = '';
    var code = [];

    // 逐行分析
    var html = md.replace(/^.+$/mg, function ($1) {

        if (/^\s*\[TOC\]\s*$/.test($1)) {
            me.toc = [];
            return '';
        }

        // 遇到代码其实标记，标记为代码
        if (/^\`{3}.+$/.test($1)) {
            flag = 'code';
            return ''
        }


        switch (flag) {
            case 'code':
                // 处理代码
                if (/^\`{3}$/.test($1)) {
                    flag = '';
                    var codeHtml = me.handleCode(code);
                    code = [];
                    return '<pre class="md-code">' + codeHtml + '</pre>';
                } else {
                    code.push(me.replaceHtmlTag($1));
                    return '';
                }
            case '':
                // 无序列表
                if (/^\.\s?.+$/.test($1)) {
                    return me.handleUnorderedList($1);
                }

                // 有序列表
                if (/^\d+\.\s?.+$/.test($1)) {
                    return me.handleOrderList($1);
                }

                // 图片处理
                if (/\!\[.*?\]\(.*?\)/g.test($1)) {
                    return me.handleImg($1);
                }

                return me.handleText($1);
        }

    });

    if (me.toc) {
        me.toc.unshift('<div class="mdeditor-toc" id="mdeditor-toc">');
        me.toc.push('</div>');
        html = me.toc.join('') + html;
        me.toc = null;
    } else {
        var $toc = me.getDom('mdeditor-toc');
        if ($toc) {
            $toc.remove();
        }
    }

    if (this.editorHtml) {
        this.editorHtml.innerHTML = html;
    }

    return html;
};

// 格式化
mdeditor.prototype.handleText = function (txt) {

    var me = this;
    /* 超链接处理 */
    txt = this.handleLink(txt);

    /* 行内代码处理 */
    txt = this.handleInlineCode(txt);


    if (/^#{1,6}.+$/.test(txt)) {

        var titleMatches = txt.match(/#{1,6}(?=.+)/);

        var hno = titleMatches[0].length;

        var htxt = txt.substr(hno);

        if (me.toc) {
            me.handleTOC(hno, htxt, htxt);
        }
        return '<h' + hno + ' id="' + htxt + '" >' + htxt + '</h' + hno + '>';

    } else {
        return '<p>' + txt + '</p>';
    }

    return '';
};

// 格式化目录语法
mdeditor.prototype.handleTOC = function (hno, anchor, txt) {
    var me = this;
    me.toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + anchor + '">' + txt + '</a>');
};

mdeditor.prototype.handleImg = function (txt) {
    var alt = txt.substring(txt.indexOf('[') + 1, txt.indexOf(']'));
    var src = txt.substring(txt.indexOf('(') + 1, txt.length - 1);
    return '<img alt="' + alt + '" src="' + src + '">';
};

// 格式化无序列表
mdeditor.prototype.handleUnorderedList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    txt = txt.replace(/^\.\s?/, '');
    return '<div class="md-ul">' + txt + '</div>';
};

// 格式化有序列表
mdeditor.prototype.handleOrderList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    var no = txt.substring(0, txt.indexOf('.'));
    txt = txt.replace(/^\d+\.\s?/, '');
    return '<div class="md-ol"><span class="md-ol-no">' + no + '.</span>' + txt + '</div>';
};

// 格式化链接
mdeditor.prototype.handleLink = function (txt) {
    var targetBlankReg = /.*(?=\,\s*_blank)/;
    return txt.replace(/\[.*?\]\(.*?\)/g, function (txt) {
        var target = '_self';
        var targetBlankMatch = txt.match(targetBlankReg);
        if (targetBlankMatch) {
            target = '_blank';
            txt = targetBlankMatch[0] + ')';
        }
        var linkText = txt.substring(1, txt.indexOf(']'));
        var linkUrl = txt.substring(txt.indexOf('(') + 1, txt.length - 1);
        return '<a href="' + linkUrl + '" target="' + target + '">' + linkText + '</a>';
    });
};

// 格式化代码段
mdeditor.prototype.handleCode = function (arr) {
    var codeHtml = [];
    codeHtml.push('<ol>');
    for (var i = 0, j = arr.length; i < j; i++) {
        var codeLine = arr[i];
        if (i % 2 == 0) {
            codeHtml.push('<li class="md-code-line-even">');
        } else {
            codeHtml.push('<li class="md-code-line-odd">');
        }
        codeHtml.push('<code>');
        codeHtml.push(codeLine);
        codeHtml.push('</code>');
        codeHtml.push('</li>');
    }
    codeHtml.push('</ol>');
    return codeHtml.join('');
};

// 格式化行内代码
mdeditor.prototype.handleInlineCode = function (txt) {
    var me = this;
    return txt.replace(/\`.+?\`/g, function (txt) {
        var inlineCode = txt.substring(1, txt.length - 1);
        inlineCode = me.replaceHtmlTag(inlineCode);
        return '<span class="md-inline-code">' + inlineCode + '</span>';
    });
};

// 替换html标签
mdeditor.prototype.replaceHtmlTag = function (txt) {
    return txt.replace(/\</g, '&lt;').replace(/\>/, '&gt;')
};