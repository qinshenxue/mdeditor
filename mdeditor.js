var mdeditor = function (options) {
    return new mdeditor.prototype.init(options);
};

mdeditor.prototype.init = function (options) {

    var me = this;

    var wrap = this.getDom(options.id);

    var html = '<textarea id="mdeditor"></textarea><div id="mdeditor-html" class="mdeditor-html"></div>';

    wrap.innerHTML = html;

    var editor = this.getDom('mdeditor');
    var editorHtml = this.getDom('mdeditor-html');

    editor.addEventListener('input', function () {
        var txt = this.value;
        me.markdownToHtml(txt);
    });

    this.editor = editor;
    this.editorHtml = editorHtml;
    return this;
};

mdeditor.prototype.init.prototype = mdeditor.prototype;


mdeditor.prototype.getDom = function (_id) {
    return document.getElementById(_id);
};

mdeditor.prototype.markdownToHtml = function (md) {
    var me = this;
    var flag = '';
    var code = [];

    // 逐行分析
    var html = md.replace(/^.+$/mg, function ($1) {

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
    this.editorHtml.innerHTML = html;
};


mdeditor.prototype.handleText = function (txt) {

    /* 超链接处理 */
    txt = this.handleLink(txt);

    /* 行内代码处理 */
    txt = this.handleInlineCode(txt);

    if (/^#{1}(?!#).+$/.test(txt)) {
        return '<h1>' + txt.replace(/#+\s*/, '') + '</h1>';
    } else if (/^#{2}(?!#).+$/.test(txt)) {
        return '<h2>' + txt.replace(/#+\s*/, '') + '</h2>';
    } else if (/^#{3}(?!#).+$/.test(txt)) {
        return '<h3>' + txt.replace(/#+\s*/, '') + '</h3>';
    } else if (/^#{4}(?!#).+$/.test(txt)) {
        return '<h4>' + txt.replace(/#+\s*/, '') + '</h4>';
    } else if (/^#{5}(?!#).+$/.test(txt)) {
        return '<h5>' + txt.replace(/#+\s*/, '') + '</h5>';
    } else if (/^#{6}(?!#).+$/.test(txt)) {
        return '<h6>' + txt.replace(/#+\s*/, '') + '</h6>';
    } else {
        return '<p>' + txt + '</p>';
    }

    return '';
};


mdeditor.prototype.handleImg = function (txt) {
    var alt = txt.substring(txt.indexOf('[') + 1, txt.indexOf(']'));
    var src = txt.substring(txt.indexOf('(') + 1, txt.length - 1);
    return '<img alt="' + alt + '" src="' + src + '">';
};


mdeditor.prototype.handleUnorderedList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    txt = txt.replace(/^\.\s?/, '');
    return '<div class="md-ul">' + txt + '</div>';
};
mdeditor.prototype.handleOrderList = function (txt) {
    var me = this;
    txt = me.handleLink(txt);
    txt = me.handleInlineCode(txt);
    var no = txt.substring(0, txt.indexOf('.'));
    txt = txt.replace(/^\d+\.\s?/, '');
    return '<div class="md-ol"><span class="md-ol-no">' + no + '.</span>' + txt + '</div>';
};


mdeditor.prototype.handleLink = function (txt) {
    return txt.replace(/\[.*?\]\(.*?\)/g, function (txt) {
        var linkText = txt.substring(1, txt.indexOf(']'));
        var linkUrl = txt.substring(txt.indexOf('(') + 1, txt.length - 1);
        return '<a href="' + linkUrl + '">' + linkText + '</a>';
    });
};

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

mdeditor.prototype.handleInlineCode = function (txt) {
    return txt.replace(/\`.+?\`/g, function (txt) {
        var inlineCode = txt.substring(1, txt.length - 1);
        return '<span class="md-inline-code">' + inlineCode + '</span>';
    });
};

mdeditor.prototype.replaceHtmlTag = function (txt) {
    return txt.replace(/\</g, '&lt;').replace(/\>/, '&gt;')
};
