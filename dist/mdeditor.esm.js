/* https://github.com/qinshenxue/mdeditor */
var regLib = {
    title: /^#{1,6}.+$/,
    ul: /^[\.\-\*]\s+.+$/,
    ol: /^\d+\.\s?.+$/,
    blockquote: /^!?>.+?$/,
    code: /^\`{3}.*$/,
    table: /^(\|[^|]+)+\|\s*$/,
    align: /^(\|\s*:?-+:?\s*)+\|\s*$/,
    hr: /^(\*|\_|\-){3,}$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    a: /\[((?:[^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,
    b: /\*\*(.+?)\*\*/g,
    i: /\*(.+?)\*/g,
    inlineCode: /\`(.+?)\`/g
};

function toLi(tag, rows) {
    var tree = [];

    for (var i = 0, j = rows.length; i < j; i++) {
        var row = rows[i];
        if (/^\s+/.test(row)) {

            var _blank = [];
            for (; i < rows.length; i++) {
                if (/^\s+/.test(rows[i])) {
                    _blank.push(rows[i].replace(/^\s+/, ''));
                } else {
                    i--;
                    break;
                }
            }
            tree[tree.length - 1].children = toTree(_blank);
        } else {
            tree.push({
                tag: 'li',
                md: rows[i],
                children: [],
                html: handleInlineSet(tag == 'ul' ? rows[i].replace(/^[\.\*\-]\s*/, '') : rows[i].replace(/^\d\.\s*/, ''))
            });
        }
    }
    return tree;
}

function handleInlineSet(txt) {
    txt = replaceHtmlTag(txt);
    txt = handleImg(txt);
    txt = handleInlineCode(txt);
    txt = handleLink(txt);
    txt = handleBold(txt);
    txt = handleItalic(txt);
    return txt;
}

function handleImg(txt) {
    return txt.replace(regLib.img, '<img alt="$1" src="$2">');
}

function handleLink(txt) {
    return txt.replace(regLib.a, function (txt, $1, $2) {
        return '<a href="' + $2 + '" target="_blank">' + handleInlineSet($1.replace(/\\([\(\)\[\])])/g, '$1')) + '</a>';
    });
}

function handleBold(txt) {
    return txt.replace(regLib.b, '<b>$1</b>');
}

function handleItalic(txt) {
    return txt.replace(regLib.i, '<i>$1</i>');
}

function handleInlineCode(txt) {
    return txt.replace(regLib.inlineCode, '<code>$1</code>');
}

function replaceHtmlTag(txt) {
    return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}

function toBlockquote(rows) {
    var tree = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (/^\s+/.test(row)) {

            var _blank = [];
            for (; i < rows.length; i++) {
                if (/^\s+/.test(rows[i])) {
                    _blank.push(rows[i].replace(/^\s+/, ''));
                } else {
                    i--;
                    break;
                }
            }
            tree[tree.length - 1].children = toTree(_blank);
        } else {
            tree.push({
                tag: 'p',
                md: row,
                children: [],
                html: handleInlineSet(row.replace(/^(!)?>/, ''))
            });
        }
    }
    return tree;
}

function toTable(rows) {

    var tdSplit = /[^|]+/g;

    var alignRaw = rows[1].match(tdSplit) || [];
    var align = [];

    for (var i = 0, j = alignRaw.length; i < j; i++) {
        if (/^\s*-+:\s*$/.test(alignRaw[i])) {
            align.push('right');
        } else if (/^\s*:-+:\s*$/.test(alignRaw[i])) {
            align.push('center');
        } else {
            align.push('left');
        }
    }

    var thead = {
        tag: 'tr',
        children: []
    };

    function _tdStyle(i) {
        if (i < align.length && align[i] !== 'left') {
            return {
                'text-align': align[i]
            };
        }
    }

    var thRaw = rows[0].match(tdSplit) || [];
    var tdCount = thRaw.length;
    for (var _i = 0; _i < tdCount; _i++) {
        thead.children.push({
            tag: 'th',
            style: _tdStyle(_i),
            md: thRaw[_i],
            html: handleInlineSet(thRaw[_i].trim())
        });
    }

    var tbody = [];
    for (var _i2 = 2, _j = rows.length; _i2 < _j; _i2++) {
        var tbodyTr = {
            tag: 'tr',
            children: []
        };
        var tdCountCopy = tdCount;
        var tbodyTds = rows[_i2].match(tdSplit) || [];
        while (tdCountCopy--) {
            var tdMd = tbodyTds[tdCountCopy];
            tbodyTr.children.unshift({
                tag: 'td',
                style: _tdStyle(tdCountCopy),
                md: tdMd,
                html: tdMd ? handleInlineSet(tdMd.trim()) : ''
            });
        }
        tbody.push(tbodyTr);
    }

    return [thead].concat(tbody);
}

function toTree(rows) {
    var html = [];
    var rowsCount = rows.length;
    var tag = '';

    for (var i = 0; i < rowsCount; i++) {
        var row = rows[i];
        if (regLib.title.test(row)) {
            var hFlagReg = /^#{1,6}/;
            var hno = row.match(hFlagReg);
            if (hno) {
                html.push({
                    tag: 'h' + hno[0].length,
                    md: row,
                    html: handleInlineSet(row.replace(hFlagReg, '').replace(/^\s*/, ''))
                });
            }
        } else if (regLib.hr.test(row)) {
            html.push({
                tag: 'hr',
                md: row
            });
        } else if ((tag = regLib.ul.test(row) ? 'ul' : false) || (tag = regLib.ol.test(row) ? 'ol' : false)) {
            var _raw = [];

            for (; i < rowsCount; i++) {
                var _rawRow = rows[i];
                if (!regLib[tag].test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    i--;
                    break;
                }
                _raw.push(_rawRow);
            }

            html.push({
                tag: tag,
                children: toLi(tag, _raw),
                md: _raw.join('\n')
            });
        } else if (regLib.table.test(row) && rows[i + 1] && regLib.align.test(rows[i + 1])) {

            var _raw2 = [row, rows[i + 1]];
            i += 2;
            for (; i < rowsCount; i++) {
                var _rawRow2 = rows[i];
                if (!regLib.table.test(_rawRow2)) {
                    i--;
                    break;
                }
                _raw2.push(_rawRow2);
            }

            html.push({
                tag: 'table',
                children: toTable(_raw2),
                md: _raw2.join('\n')
            });
        } else if (regLib.blockquote.test(row)) {
            var _raw3 = [row];
            var _class = row.indexOf('!') == 0 ? 'warning' : '';
            i++;
            for (; i < rowsCount; i++) {
                var _rawRow3 = rows[i];
                if (!regLib.blockquote.test(_rawRow3) && !/^\s+.+/.test(_rawRow3)) {
                    i--;
                    break;
                }
                _raw3.push(_rawRow3);
            }
            html.push({
                tag: 'blockquote',
                class: _class,
                children: toBlockquote(_raw3),
                md: _raw3.join('\n')
            });
        } else if (regLib.code.test(row)) {

            var codeType = row.match(/[^`\s]+/);
            codeType = codeType ? codeType[0] : '';
            var _code = '';
            for (i++; i < rowsCount; i++) {
                var _rawRow4 = replaceHtmlTag(rows[i]);
                if (regLib.code.test(_rawRow4)) {
                    break;
                }
                _code += _rawRow4;
                if (!/^\n/.test(_rawRow4)) {
                    _code += '\n';
                }
            }

            html.push({
                tag: 'pre',
                children: [{
                    tag: 'code',
                    html: _code
                }],
                attr: {
                    'data-lang': codeType
                },
                class: codeType,
                md: row + '\n' + _code + '```'
            });
        } else if (!/^\n+/.test(row)) {
            html.push({
                tag: 'p',
                md: row,
                html: handleInlineSet(row)
            });
        }
    }
    return html;
}

function treeToHtml(nodes) {
    var html = [];
    for (var i = 0, j = nodes.length; i < j; i++) {
        var node = nodes[i];

        if (node.tag == 'text') {
            html.push(node.html);
            if (node.children) {
                html.push(treeToHtml(node.children));
            }
        } else {
            html.push('<' + node.tag);
            if (node.class) {
                html.push(' class="' + node.class + '" ');
            }
            if (node.style) {
                html.push(' style="');
                for (var p in node.style) {
                    html.push(p + ':' + node.style[p] + ';');
                }
                html.push('" ');
            }
            if (node.attr) {
                for (var a in node.attr) {
                    html.push(' ' + a + '="' + node.attr[a] + '" ');
                }
            }
            html.push('>');
            if (node.html) {
                html.push(node.html);
            }
            if (node.children) {
                html.push(treeToHtml(node.children));
            }
            html.push('</' + node.tag + '>');
        }
    }
    return html.join('');
}

function mdToTree(md) {
    var rows = md.match(/.+|^\n/mg) || [];
    return toTree(rows);
}

function mdToHtml(md) {
    return treeToHtml(mdToTree(md));
}

function eventsMixin(mdeditor) {

    mdeditor.prototype._initEvent = function () {

        var me = this;
        var bind = this.elm.addEventListener;

        bind('paste', function paste(e) {
            e.preventDefault();
            var txt = e.clipboardData.getData('text/plain');
            var div = document.createElement('div');
            div.innerText = txt;
            document.execCommand("insertHTML", false, div.innerHTML.replace(/<br>/g, '\n'));
        });
        bind('keydown', function keydown(e) {
            if (e.keyCode === 13 && !e.shiftKey) {

                e.preventDefault();

                if (me.cursor.isAtEnd()) {
                    document.execCommand("insertHTML", false, '<div row=\'' + me._rowNo++ + '\'></div>');
                }
            } else if (e.keyCode === 8 && !me.elm.textContent) {
                e.preventDefault();
            }
        });

        bind('blur', setCls);

        this._lastRow = null;

        function setCls() {
            if (me._lastRow) {
                var tree = mdToTree(me._lastRow.innerText);
                if (tree.length) {
                    var root = tree[0];
                    me._lastRow.setAttribute('class', root.tag);
                    if (root.attr) {
                        Object.keys(root.attr).forEach(function (key) {
                            if (root.attr && root.attr[key]) {
                                me._lastRow.setAttribute(key, root.attr[key]);
                            }
                        });
                    }
                }
            }
        }

        document.addEventListener('selectionchange', function selectionchange() {

            if (window.getSelection().isCollapsed) {
                var row = me.cursor.closestRow();

                if (row) {
                    if (!me._lastRow && !row.textContent) {
                        row.setAttribute('class', '');
                    } else if (me._lastRow && me._lastRow.getAttribute('row') !== row.getAttribute('row')) {
                        setCls();
                    }
                } else {
                    setCls();
                }

                me._lastRow = row;
            } else {
                me._lastRow = null;
            }
        });
    };
}

var def = Object.defineProperty;

function Cursor(editor) {

    this.editor = editor;

    this.path = [];

    def(this, 'selection', {
        get: function get() {
            return window.getSelection();
        }
    });

    def(this, 'node', {
        get: function get() {
            if (this._inside()) {
                return this.selection.baseNode;
            }
            return null;
        }
    });
    def(this, 'offset', {
        get: function get() {
            return this.selection.baseOffset;
        }
    });
}

Cursor.prototype._inside = function () {
    var node = this.selection.baseNode;
    var _path = [node];
    while (node && !node.isEqualNode(this.editor)) {
        node = node.parentNode;
        _path.push(node);
    }
    this.path = _path;
    return !!node && node.isEqualNode(this.editor);
};

Cursor.prototype.closest = function (selector) {
    var match = null;
    if (this._inside()) {
        this.path.some(function (p) {
            if (p.matches && p.matches(selector)) {
                match = p;
                return true;
            }
        });
    }
    return match;
};

Cursor.prototype.closestRow = function () {
    return this.closest('[row]');
};

Cursor.prototype.isAtEnd = function () {
    var row = this.closestRow();
    if (row) {
        var childNodes = row.childNodes;
        var childCount = childNodes.length;
        if (childCount) {
            var lastChild = childNodes[childCount - 1];
            if (/\n/.test(this.node.nodeValue)) {
                return false;
            } else {
                return lastChild.isEqualNode(this.node) && this.offset === lastChild.nodeValue.length;
            }
        } else {
            return false;
        }
    }
    return false;
};

Cursor.prototype.set = function (node, offset) {
    var selection = window.getSelection();
    var range = document.createRange();
    if (node instanceof Text && typeof offset !== 'number') {
        offset = node.nodeValue.length;
        range.setStart(node, offset);
    } else if (node instanceof HTMLBRElement) {
        range.setStart(node, 0);
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};

function apiMixin(mdeditor) {

    mdeditor.prototype.getMarkdown = function () {
        return this.elm.innerText;
    };

    mdeditor.prototype.getHtml = function () {
        return mdToHtml(this.getMarkdown());
    };

    mdeditor.prototype.setMarkdown = function (markdown) {
        var tree = mdToTree(markdown);
        var html = '';
        for (var i = 0, j = tree.length; i < j; i++) {
            var item = tree[i];
            html += '<div row="' + this._rowNo++ + '" class="' + item.tag + '">' + (item.md || '').replace(/\n/g, '<br>') + '</div>';
        }
        this.elm.innerHTML = html;
    };

    mdeditor.prototype.insertMarkdown = function (markdown) {
        document.execCommand('insertText', false, markdown);
    };
}

function mdeditor(el, options) {

    var elm = document.querySelector(el);
    if (elm) {
        this.elm = elm;
        this._rowNo = 0;
        elm.setAttribute('contenteditable', 'true');
        var tree = [];
        if (options && options.markdown && (tree = mdToTree(options.markdown)).length) {
            var html = '';
            for (var i = 0, j = tree.length; i < j; i++) {
                var item = tree[i];
                html += '<div row="' + this._rowNo++ + '" class="' + item.tag + '">' + (item.md || '') + '</div>';
            }
            elm.innerHTML = html;
        } else {
            elm.innerHTML = '<div row="' + this._rowNo++ + '"></div>';
        }
        this._initEvent();
        this.cursor = new Cursor(elm);
    }
    return this;
}

eventsMixin(mdeditor);
apiMixin(mdeditor);

export default mdeditor;
