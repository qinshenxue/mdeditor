(function (window) {
    var mdeditor = function (options) {
        return new mdeditor.prototype.init(options);
    };
    mdeditor.version = '1.2.0';
    mdeditor.getType = function (obj) {
        return Object.prototype.toString.call(obj).match(/\[object\s(\w+)\]/)[1].toLowerCase();
    };
    mdeditor.addGrammar = function (grammar) {
        grammar in mdeditor || (mdeditor.prototype.grammar = []);
        if (this.getType(grammar) == 'array') {
            mdeditor.prototype.grammar = mdeditor.prototype.grammar.concat(grammar);
        } else {
            mdeditor.prototype.grammar.push(grammar);
        }
        return mdeditor;
    };
    mdeditor.prototype = {
        constructor: mdeditor,
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

                var wrap = this.getDom('#' + options.id);

                var html = '<textarea class="mdeditor" name="{{name}}" placeholder="{{placeholder}}"></textarea><div class="mdeditor-html"></div>';

                html = me.formatString(html, defaults);
                wrap.innerHTML = html;

                var editor = this.getDom('#' + defaults.id + ' .mdeditor');
                var editor2Html = this.getDom('#' + defaults.id + ' .mdeditor-html');

                if (editor.oninput === undefined) {
                    editor.onkeyup = function () {
                        me.markdownToHtml(this.value);
                    };
                } else {
                    editor.oninput = function () {
                        me.markdownToHtml(this.value);
                    };
                }

                var mousePosition = '';
                editor.onscroll = function () {
                    if (mousePosition == 'editor') {
                        editor2Html.scrollTop = editor.scrollTop / (editor.scrollHeight - editor.clientHeight) * (editor2Html.scrollHeight - editor2Html.clientHeight);
                    }
                };
                editor2Html.onscroll = function () {
                    if (mousePosition == 'editor2Html') {
                        editor.scrollTop = editor2Html.scrollTop / (editor2Html.scrollHeight - editor2Html.clientHeight) * (editor.scrollHeight - editor.clientHeight);
                    }
                };
                editor.onmousemove = function () {
                    mousePosition = 'editor';
                };
                editor2Html.onmousemove = function () {
                    mousePosition = 'editor2Html';
                };
                me.editor = editor;
                me.editor2Html = editor2Html;
            }
            me.options = defaults;
            return me;
        },

        regLib: {
            code: /^\`{3}.*$/,
            ul: /^[\.\-\*]\s+.+$/,
            ol: /^\d+\.\s?.+$/,
            toc: /^\s*\[TOC\]\s*$/,
            img: /\!\[(.*?)\]\((.*?)\)/g,
            title: /^#{1,6}.+$/,
            a: /\[(.*?)\]\((.*?)\)/g,
            b: /\*\*(.+?)\*\*/g,
            i: /\*(.+?)\*/g,
            inline_code: /\`(.+?)\`/g,
            blockquote: /^>(.+?)$/,
            table: /^(\|[^|]+)+\|\s*$/,
            table_td_align: /^(\|\s*:?-+:?\s*)+\|\s*$/,
            table_td_align_left: /^\s*:-+\s*$/,
            table_td_align_center: /^\s*:-+:\s*$/,
            table_td_align_right: /^\s*-+:\s*$/
        },

        formatString: function (format, data) {
            return format.replace(/{{(\w+)}}/g, function (m, c) {
                return data[c];
            });
        },

        copy: function (source, dest) {
            for (var name in dest) {
                source[name] = dest[name];
            }
            return source;
        },

        getDom: function (selector) {
            return document.querySelector(selector);
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
            var rows = md.match(/.+/mg) || [];
            var html = [];
            var rowsCount = rows.length;
            var rowsStart = 0;
            var toc = null;
            var grammarIndex;
            if (rowsCount && this.regLib.toc.test(rows[0])) {
                rowsStart = 1;
                toc = ['<div class="mdeditor-toc">'];
            }
            for (var i = rowsStart; i < rowsCount; i++) {
                var row = rows[i];

                if (this.regLib.title.test(row)) {
                    html.push(this.handleTitle(row, toc));

                } else if (this.regLib.ul.test(row)) {
                    var ul = this.handleUl(rows, i);
                    html = html.concat(ul.html);
                    i = ul.index;

                } else if (this.regLib.ol.test(row)) {
                    var ol = this.handleOl(rows, i);
                    html = html.concat(ol.html);
                    i = ol.index;

                } else if (this.regLib.table.test(row)) {
                    var table = this.handleTable(rows, i);
                    html = html.concat(table.html);
                    i = table.index;

                } else if (this.regLib.blockquote.test(row)) {
                    var blockquote = this.handleBlockquote(rows, i);
                    html = html.concat(blockquote.html);
                    i = blockquote.index;

                } else if (this.regLib.code.test(row)) {
                    var pre = this.handlePre(rows, i);
                    html = html.concat(pre.html);
                    i = pre.index;

                } else {
                    var gra=this.matchGrammar(row);
                    if(gra){
                        var tag = gra.handle.call(this, rows, i, gra);
                        html = html.concat(tag.html);
                        i = tag.index;
                    }else{
                        html.push(this.handleParagraph(row));
                    }
                }
            }

            html = (toc ? toc.join('') + '</div>' : '') + html.join('');

            if (this.editor2Html) {
                this.editor2Html.innerHTML = html;
            }
            return html;
        },

        matchGrammar: function (row) {
            if (this.grammar && this.grammar.length > 0) {
                for (var i = 0, j = this.grammar.length; i < j; i++) {
                    if (this.grammar[i].reg.test(row)) {
                        return this.grammar[i];
                    }
                }
            }
            return false;
        },

        handleBlockquote: function (rows, start) {
            var html = [];
            var i = start
            if (this.regLib.blockquote.test(rows[start])) {
                html.push('<blockquote class="mdeditor-blockquote">');
                for (; i < rows.length; i++) {
                    if (!this.regLib.blockquote.test(rows[i])) {
                        break;
                    }
                    var row = rows[i].replace(/>/, '');
                    if (this.regLib.ul.test(row)) {
                        var ul = this.handleUl(rows, i, />/);
                        html = html.concat(ul.html);
                        i = ul.index;
                    } else if (this.regLib.ol.test(row)) {
                        var ol = this.handleOl(rows, i, />/);
                        html = html.concat(ol.html);
                        i = ol.index;
                    } else {
                        html.push(this.handleParagraph(row));
                    }
                }
                html.push('</blockquote>');
            }
            return {
                html: html,
                index: i - 1
            };
        },

        handleUl: function (rows, start, reg) {
            var html = [];
            var i = start;
            if (this.regLib.ul.test(reg ? rows[start].replace(reg, '') : rows[start])) {
                html.push('<ul class="mdeditor-ul">');
                for (; i < rows.length; i++) {
                    var row = rows[i];
                    if (reg) {
                        row = row.replace(reg, '');
                    }
                    if (!this.regLib.ul.test(row)) {
                        break;
                    }
                    row = this.replaceHtmlTag(row);
                    row = row.replace(/^[\.\*\-]\s*/, '');
                    html.push('<li>' + this.handleInlineSet(row) + '</li>');
                }
                html.push('</ul>');
            }
            return {
                html: html,
                index: i - 1
            };
        },

        handleOl: function (rows, start, reg) {
            var html = [];
            var i = start;
            if (this.regLib.ol.test(reg ? rows[start].replace(reg, '') : rows[start])) {
                html.push('<ol class="mdeditor-ol">');
                for (; i < rows.length; i++) {
                    var row = rows[i];
                    if (reg) {
                        row = row.replace(reg, '');
                    }
                    if (!this.regLib.ol.test(row)) {
                        break;
                    }
                    row = this.replaceHtmlTag(row);
                    row = row.replace(/^\d+\.\s*/, '');
                    html.push('<li>' + this.handleInlineSet(row) + '</li>');

                }
                html.push('</ol>');
            }
            return {
                html: html,
                index: i - 1
            };
        },


        handlePre: function (rows, start) {
            var html = [];
            var i = start;
            var firstRow = rows[start];
            if (this.regLib.code.test(firstRow)) {
                var codeType = firstRow.replace(/[`\s]/g, '');
                html.push('<pre class="mdeditor-code mdeditor-code-' + codeType.toLowerCase() + '">');
                html.push('<ol>');
                i++;
                for (; i < rows.length; i++) {
                    var row = rows[i];
                    if (this.regLib.code.test(row)) {
                        break;
                    }
                    row = this.replaceHtmlTag(row);
                    html.push('<li><div>' + this.handleCodeType(codeType, row) + '</div></li>');
                }
                html.push('</ol>');
                html.push('</pre>');
            }
            return {
                html: html,
                index: i
            };
        },

        handleTable: function (rows, start) {
            var html = [];
            var i = start;
            var firstRow = rows[start];
            var nextRow = rows[start + 1];
            if (nextRow && this.regLib.table.test(firstRow) && this.regLib.table_td_align.test(nextRow)) {

                html.push('<table class="mdeditor-table">');
                html.push('<tr>');
                var tdArr = firstRow.match(/[^|]+/g);
                var tdAlign = this.handleTdAlign(nextRow);
                for (var m = 0, n = tdArr.length; m < n; m++) {
                    html.push('<th style="text-align:' + tdAlign[m] + '">' + this.replaceHtmlTag(tdArr[m]) + '</th>');
                }
                html.push('</tr>');

                i += 2;

                for (; i < rows.length; i++) {
                    var row = rows[i];
                    if (!this.regLib.table.test(row)) {
                        break;
                    }
                    row = this.replaceHtmlTag(row);
                    html.push(this.handleTr(row, tdAlign));
                }

                html.push('</table>');
            }
            return {
                html: html,
                index: i - 1
            };
        },

        handleTr: function (txt, align) {
            var arr = txt.match(/[^|]+/g);
            var tr = '<tr>';
            for (var i = 0, j = arr.length; i < j; i++) {
                tr += '<td style="text-align:' + align[i] + '">' + this.handleInlineSet(arr[i]) + '</td>';
            }
            tr += '</tr>';
            return tr;
        },

        handleTdAlign: function (txt) {
            var arr = txt.match(/[^|]+/g);
            var align = [];
            for (var i = 0, j = arr.length; i < j; i++) {
                if (this.regLib.table_td_align_right.test(arr[i])) {
                    align.push('right');
                } else if (this.regLib.table_td_align_center.test(arr[i])) {
                    align.push('center');
                } else {
                    align.push('left');
                }
            }
            return align;
        },

        handleTitle: function (txt, toc) {
            var me = this;
            return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
                var hno = $1.length;
                $2 = me.replaceHtmlTag($2);
                if (toc) {
                    toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 + '">' + $2 + '</a>');
                }
                return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno + '>';
            });
        },

        handleParagraph: function (txt) {
            txt = this.replaceHtmlTag(txt);
            return '<p>' + this.handleInlineSet(txt) + '</p>';
        },

        handleInlineSet: function (txt) {
            txt = this.handleImg(txt);
            txt = this.handleInlineCode(txt);
            txt = this.handleLink(txt);
            txt = this.handleBold(txt);
            txt = this.handelItalic(txt);
            return txt;
        },

        handleImg: function (txt) {
            return txt.replace(this.regLib.img, function (match, $1, $2) {
                return '<img class="mdeditor-img" alt="' + $1 + '" src="' + $2 + '">';
            });
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

        handelItalic: function (txt) {
            var me = this;
            return txt.replace(me.regLib.i, function (match, $1) {
                return '<i>' + $1 + '</i>';
            });
        },

        handleInlineCode: function (txt) {
            var me = this;
            return txt.replace(me.regLib.inline_code, function (txt, $1) {
                return '<span class="mdeditor-inline-code">' + $1 + '</span>';
            });
        },

        /* 高亮各种代码类型 */
        handleCodeType: function (codeType, txt) {
            switch (codeType) {
                case 'javascript':
                    return this.highlightJs(txt);
                case 'css':
                    return txt.replace(/([a-zA-Z-]+:)([^;\{]+)(;)/g, '<span class="css-property-name">$1</span><span class="css-property-value">$2</span><span class="css-semicolon">$3</span>');
                case 'xml':
                    return txt.replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, '<span class="xml-lt">$1</span><span class="xml-tag-name">$2</span><span class="xml-tag-attr">$3</span><span class="xml-gt">$4</span>');
                default:
                    return txt;
            }
        },

        highlightJs: function (txt) {
            var keywords = ['break',
                'case', 'catch', 'continue',
                'default', 'delete', 'do',
                'else', 'finally', 'for', 'function',
                'if', 'in', 'instanceof',
                'new',
                'return',
                'switch',
                'this', 'throw', 'try', 'typeof',
                'var', 'void',
                'while', 'with'
            ];

            var keywordReg = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
            return txt.replace(/('|").*?('|")/g, function (v) {
                return '<span class="js-string">' + v + '</span>';
            }).replace(keywordReg, function (v) {
                return '<span class="js-keyword">' + v + '</span>';
            }).replace(/\/\/.+$/, function (v) {
                return '<span class="js-line-comment">' + v + '</span>';
            });

        },

        replaceHtmlTag: function (txt) {
            return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        }
    };
    mdeditor.prototype.init.prototype = mdeditor.prototype;
    window.mdeditor = mdeditor;
})(window);