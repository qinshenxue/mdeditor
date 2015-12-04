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

mdeditor.prototype.regApi = {
    code: /^\`{3}.*$/,
    ul: /^[\.\-\*]\s?.+$/,
    ol: /^\d+\.\s?.+$/,
    toc: /^\s*\[TOC\]\s*$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    title: /^#{1,6}.+$/,
    blockquote: /^\>\s+.+$/
};

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
    var arr = [];

    // 逐行分析
    var html = md.replace(/^.+$/mg, function (txt) {

        var preHtml = '';

        if (me.regApi.toc.test(txt)) {
            me.toc = [];
            return '';
        }


        if (flag == 'ul' && !me.regApi.ul.test(txt)) {
            arr.push('</ul>');
            preHtml = arr.join('');
            flag = '';
            arr = [];
        }

        if (flag == 'ol' && !me.regApi.ol.test(txt)) {
            arr.push('</ol>');
            preHtml = arr.join('');
            flag = '';
            arr = [];
        }

        // 遇到代码起始标记，标记为代码
        if (flag == '' && flag != 'code' && me.regApi.code.test(txt)) {
            flag = 'code';
            me.codeType = txt.replace(/[`\s]/g, '');
            arr.push(preHtml);
            return '';
        }


        if (flag == '' && flag != 'ul' && me.regApi.ul.test(txt)) {
            flag = 'ul';
            arr.push(preHtml);
            arr.push('<ul class="mdeditor-ul">');
        }

        if (flag == '' && flag != 'ol' && me.regApi.ol.test(txt)) {
            flag = 'ol';
            arr.push(preHtml);
            arr.push('<ol class="mdeditor-ol">');
        }


        switch (flag) {
            case 'code':
                // 处理代码
                if (flag == 'code' && /^\`{3}.*$/.test(txt)) {
                    flag = '';
                    preHtml = arr.shift();
                    var codeHtml = me.handleCode(arr);
                    arr = [];
                    return preHtml + '<pre class="mdeditor-code mdeditor-code-' + me.codeType.toLowerCase() + '">' + codeHtml + '</pre>';
                } else {
                    arr.push(me.replaceHtmlTag(txt));
                    return '';
                }
            case 'ul':
                arr.push(me.handleUnorderedList(txt));
                return '';
            case 'ol':
                arr.push(me.handleOrderList(txt));
                return '';
            case '':
                // 图片处理
                if (me.regApi.img.test(txt)) {
                    return preHtml + me.handleImg(txt);
                }
                return preHtml + me.handleText(txt);
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

    if (flag == 'ul') {
        arr.push('</ul>');
        html += arr.join('');
    } else if (flag == 'ol') {
        arr.push('</ol>');
        html += arr.join('');
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


    if (me.regApi.title.test(txt)) {

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
    this.toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + anchor + '">' + txt + '</a>');
};

mdeditor.prototype.handleImg = function (txt) {
    var me = this;
    return '<p class="mdeditor-img">' + txt.replace(me.regApi.img, function (match, $1, $2) {
            return '<img alt="' + $1 + '" src="' + $2 + '">';
        }) + '</p>';
};

// 格式化无序列表
mdeditor.prototype.handleUnorderedList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    txt = txt.replace(/^[\.\*\-]\s*/, '');
    return '<li>' + txt + '</li>';
};

// 格式化有序列表
mdeditor.prototype.handleOrderList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    txt = txt.replace(/^\d+\.\s*/, '');
    return '<li>' + txt + '</li>';
};

// 格式化链接
mdeditor.prototype.handleLink = function (txt) {
    var targetBlankReg = /.*(?=\,\s*_blank)/;
    return txt.replace(/\[(.*?)\]\((.*?)\)/g, function (txt, $1, $2) {
        var target = '_self';
        var targetBlankMatch = txt.match(targetBlankReg);
        if (targetBlankMatch) {
            target = '_blank';
        }
        return '<a href="' + $2 + '" target="' + target + '">' + $1 + '</a>';
    });
};

// 格式化代码段
mdeditor.prototype.handleCode = function (arr) {
    var me = this;
    var codeHtml = [];
    codeHtml.push('<ol>');
    for (var i = 0, j = arr.length; i < j; i++) {
        var codeLine = arr[i];
        var codeLineCls = "md-code-line-odd";
        if (i % 2 == 0) {
            codeLineCls = "md-code-line-even";
        }
        if (i == 0) {
            codeLineCls += ' md-code-line-first';
        } else if (i == j - 1) {
            codeLineCls += ' md-code-line-last';
        }

        codeHtml.push('<li class="' + codeLineCls + '">');
        codeHtml.push('<code>');
        codeHtml.push(me.handleCodeType(codeLine));
        codeHtml.push('</code>');
        codeHtml.push('</li>');
    }
    codeHtml.push('</ol>');
    return codeHtml.join('');
};
mdeditor.prototype.handleCodeType = function (txt) {
    var me = this;

    switch (me.codeType.toLocaleLowerCase()) {
        case 'css':
            return txt.replace(/([a-zA-Z-]+:)([^;]+)(;?)/g, '<span class="css-property-name">$1</span><span class="css-property-value">$2</span><span class="css-semicolon">$3</span>');
        default:
            return txt;
    }

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