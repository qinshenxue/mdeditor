(function (window) {
    var mdeditor = function (options) {
        return new mdeditor.prototype.init(options);
    };
    mdeditor.prototype = {
        init: function (options) {
            var me = this;
            var defaults = {
                id: '',
                placeholder: '',
                name: '',
                aTarget: '_blank'
            };
            if (options && options.id) {

                me.copy(defaults, options);

                var wrap = this.getDom(options.id);

                var html = '<textarea id="mdeditor" class="mdeditor" name="{name}" placeholder="{placeholder}"></textarea><div id="mdeditor-html" class="mdeditor-html"></div>';

                html = me.formatString(html, defaults);
                wrap.innerHTML = html;

                var editor = this.getDom('mdeditor');
                var editor2Html = this.getDom('mdeditor-html');

                editor.addEventListener('input', function () {
                    var txt = this.value;
                    me.markdownToHtml(txt);
                });
                me.editor = editor;
                me.editor2Html = editor2Html;
            }
            me.options = defaults;
            return me;
        },

        regLib: {
            code: /^\`{3}.*$/,
            ul: /^[\.\-\*]\s?.+$/,
            ol: /^\d+\.\s?.+$/,
            toc: /^\s*\[TOC\]\s*$/,
            img: /\!\[(.*?)\]\((.*?)\)/g,
            title: /^#{1,6}.+$/,
            a: /\[(.*?)\]\((.*?)\)/g,
            b: /\*\*(.+?)\*\*/g,
            inlinecode: /\`(.+?)\`/g
        },

        formatString: function (format, data) {
            return format.replace(/{\w+}/g, function ($1) {
                var key = $1.substr(1, $1.length - 2);
                return data[key];
            });
        },

        copy: function (source, dest) {
            for (var name in dest) {
                source[name] = dest[name];
            }
            return source;
        },

        getDom: function (_id) {
            return document.getElementById(_id);
        },

        getMarkdown: function () {
            if (this.editor) {
                return this.editor.value;
            } else {
                return null;
            }
        },

        setMarkdown: function (markdown) {
            if (this.editor) {
                this.editor.value = markdown;
            }
            return this.markdownToHtml(markdown);
        },

        getHTML: function () {
            if (this.editor2Html) {
                return this.editor2Html.innerHTML;
            } else {
                return '';
            }
        },

        markdownToHtml: function (md) {
            var me = this;
            var rows = md.match(/.+/mg) || [];
            var html = [];
            var flag = '';
            var codeType = '';
            var rowsCount = rows.length;
            var rowsStart = 0;
            var toc = null;
            if (rowsCount && me.regLib.toc.test(rows[0])) {
                rowsStart = 1;
                toc = ['<div class="mdeditor-toc">'];
            }
            for (var i = rowsStart; i < rowsCount; i++) {
                var row = rows[i];
                switch (flag) {
                    case 'ol':
                        if (!me.regLib.ol.test(row)) {
                            i--;
                            flag = '';
                            html.push('</ol>');
                        } else {
                            html.push(me.handleOrderList(row));
                            if (i == rowsCount - 1) {
                                html.push('</ol>');
                            }
                        }
                        break;
                    case 'ul':
                        if (!me.regLib.ul.test(row)) {
                            i--;
                            flag = '';
                            html.push('</ul>');
                        } else {
                            html.push(me.handleUnorderedList(row));
                            if (i == rowsCount - 1) {
                                html.push('</ul>');
                            }
                        }
                        break;
                    case 'code':
                        if (me.regLib.code.test(row)) {
                            flag = '';
                            html.push('</code>');
                            html.push('</pre>');
                        } else {
                            html.push('<li><div>' + me.handleCodeType(codeType, row) + '</div></li>');
                        }
                        break;
                    default :
                        if (me.regLib.title.test(row)) {
                            html.push(me.handleTitle(row, toc));
                        } else if (me.regLib.ol.test(row)) {
                            i--;
                            flag = 'ol';
                            html.push('<ol  class="mdeditor-ol">');
                        } else if (me.regLib.ul.test(row)) {
                            i--;
                            flag = 'ul';
                            html.push('<ul  class="mdeditor-ul">');
                        } else if (me.regLib.code.test(row)) {
                            flag = 'code';
                            codeType = row.replace(/[`\s]/g, '');
                            html.push('<pre class="mdeditor-code mdeditor-code-' + codeType.toLowerCase() + '">');
                            html.push('<ol>');
                        } else if (me.regLib.img.test(row)) {
                            html.push(me.handleImg(row));
                        } else {
                            html.push(me.handleParagraph(row));
                        }
                        break;
                }
            }

            html = (toc ? toc.join('') + '</div>' : '') + html.join('');

            if (this.editor2Html) {
                this.editor2Html.innerHTML = html;
            }
            return html;
        },

        handleTitle: function (txt, toc) {
            var me = this;
            return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
                var hno = $1.length;
                if (toc) {
                    toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 + '">' + $2 + '</a>');
                }
                return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno + '>';
            });
        },

        handleParagraph: function (txt) {
            return '<p>' + this.handleInlineSet(txt) + '</p>';
        },

        handleInlineSet: function (txt) {
            txt = this.replaceHtmlTag(txt);
            txt = this.handleInlineCode(txt);
            txt = this.handleLink(txt);
            txt = this.handleBold(txt);
            return txt;
        },

        handleImg: function (txt) {
            return '<p class="mdeditor-img">' + txt.replace(this.regLib.img, function (match, $1, $2) {
                    return '<img alt="' + $1 + '" src="' + $2 + '">';
                }) + '</p>';
        },

        handleLink: function (txt) {
            var me = this;
            return txt.replace(me.regLib.a, function (txt, $1, $2) {
                $1 = me.handleBold($1);
                return '<a href="' + $2 + '" target="' + me.options.aTarget + '">' + $1 + '</a>';
            });
        },

        handleBold: function (txt) {
            var me = this;
            return txt.replace(me.regLib.b, function (match, $1) {
                return '<b>' + $1 + '</b>';
            });
        },

        handleInlineCode: function (txt) {
            var me = this;
            return txt.replace(me.regLib.inlinecode, function (txt, $1) {
                return '<span class="mdeditor-inline-code">' + me.replaceHtmlTag($1) + '</span>';
            });
        },

        handleUnorderedList: function (txt) {
            txt = txt.replace(/^[\.\*\-]\s*/, '');
            txt = this.handleInlineSet(txt);
            return '<li>' + txt + '</li>';
        },

        handleOrderList: function (txt) {
            txt = txt.replace(/^\d+\.\s*/, '');
            txt = this.handleInlineSet(txt);
            return '<li>' + txt + '</li>';
        },

        handleCodeType: function (codeType, txt) {
            switch (codeType) {
                case 'css':
                    return txt.replace(/([a-zA-Z-]+:)([^;]+)(;?)/g, '<span class="css-property-name">$1</span><span class="css-property-value">$2</span><span class="css-semicolon">$3</span>');
                default:
                    return txt;
            }
        },

        replaceHtmlTag: function (txt) {
            return txt.replace(/\</g, '&lt;').replace(/\>/, '&gt;');
        }
    };
    mdeditor.prototype.init.prototype = mdeditor.prototype;
    window.mdeditor = mdeditor;
})(window);