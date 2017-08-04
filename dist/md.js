(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mdeditor = factory());
}(this, (function () { 'use strict';

/**
 * Created by qinsx on 2017/6/13.
 */

function extend(source, dest) {
    var destKeys = Object.keys(dest);
    var i = destKeys.length;
    while (i--) {
        source[destKeys[i]] = dest[destKeys[i]];
    }
}



function isTextNode(node) {
    return node instanceof Text;
}



function createElement() {

    var elms = [];
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (item) {
        var elm = document.createElement(item[0]);
        var elmData = item[1];
        if (elmData) {
            if (elmData.attrs) {
                for (var attr in elmData.attrs) {
                    elm.setAttribute(attr, elmData.attrs[attr]);
                }
            }
            if (elmData.innerHTML) {
                elm.innerHTML = elmData.innerHTML;
            }
        }
        elms.push(elm);
    });
    if (args.length == 1) return elms[0];
    return elms;
}

/**
 * Created by qinsx on 2017/6/13.
 */

function el(selector) {
    if (typeof selector === 'string') {
        this[0] = document.querySelector(selector);
    } else if (selector instanceof HTMLElement) {
        this[0] = selector;
    }
}
el.prototype.insertAfter = function () {
    var brother = createElement.apply(null, arguments);
    this[0].parentNode.insertBefore(brother, this[0].nextSibling);
    return brother;
};
el.prototype.insertBefore = function () {
    var brother = createElement.apply(null, arguments);
    this[0].parentNode.insertBefore(brother, this[0]);
    return brother;
};

el.prototype.prepend = function () {
    var child = createElement.apply(null, arguments);
    this[0].insertBefore(child, this[0].firstChild);
    return child;
};

el.prototype.append = function (node) {
    var child = node instanceof Text || node instanceof HTMLElement ? node : createElement.apply(null, arguments);
    this[0].appendChild(child);
    return child;
};
el.prototype.empty = function () {
    this[0].innerHTML = '';
};
el.prototype.children = function () {
    return this[0].childNodes;
};
el.prototype.text = function (text) {
    if (text === undefined) {
        return this[0].textContent;
    }
    this[0].textContent = text;
};
el.prototype.html = function (html) {
    if (html === undefined) {
        return this[0].innerHTML;
    }
    this[0].innerHTML = html;
};
el.prototype.find = function (selector) {
    var found = this[0].querySelector(selector);
    return found ? new el(found) : found;
};
el.prototype.hasAttr = function (attrName) {
    return this[0].hasAttribute(attrName);
};
el.prototype.removeAttr = function (attrName) {
    return this[0].removeAttribute(attrName);
};
el.prototype.attr = function (attrName, attrVal) {
    if (attrVal !== undefined) {
        return this[0].setAttribute(attrName, attrVal);
    }
    return this[0].getAttribute(attrName);
};

el.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this[0].getAttribute(name);
    }
    this[0].setAttribute(name, value);
};
el.prototype.replaceWith = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
        this[0].parentNode.insertBefore(nodes[i], this[0]);
    }
    this[0].remove();
};

var regLib = {
    title: /^(#{1,6}).+$/,
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
                tag: 'text',
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
            html.push({
                tag: 'h' + hno[0].length,
                md: row,
                html: handleInlineSet(row.replace(hFlagReg, ''))
            });
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

            var _raw = [row, rows[i + 1]];
            i += 2;
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i];
                if (!regLib.table.test(_rawRow)) {
                    i--;
                    break;
                }
                _raw.push(_rawRow);
            }

            html.push({
                tag: 'table',
                children: toTable(_raw),
                md: _raw.join('\n')
            });
        } else if (regLib.blockquote.test(row)) {
            var _raw = [row];
            var _class = row.indexOf('!') == 0 ? 'warning' : '';
            i++;
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i];
                if (!regLib.blockquote.test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    i--;
                    break;
                }
                _raw.push(_rawRow);
            }
            html.push({
                tag: 'blockquote',
                class: _class,
                children: toBlockquote(_raw),
                md: _raw.join('\n')
            });
        } else if (regLib.code.test(row)) {
            var _raw = [row];
            var codeType = row.match(/[^`\s]+/);
            codeType = codeType ? codeType[0] : '';
            var _code = '';
            for (i++; i < rowsCount; i++) {
                var _rawRow = replaceHtmlTag(rows[i]);
                if (regLib.code.test(_rawRow)) {
                    break;
                }
                _raw.push(_rawRow);
                _code += _rawRow;
                if (!/^\n/.test(_rawRow)) {
                    _code += '\n';
                }
            }
            _raw.push('```');

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
                md: _raw.join('\n')
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
    for (var i = 0; i < nodes.length; i++) {
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

/**
 * Created by qinsx on 2017/6/13.
 */

function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        (this._events[eventName] || (this._events[eventName] = [])).push(cb);
        this.el[0].addEventListener(eventName, cb);
    };

    mdeditor.prototype.trigger = function (eventName) {
        var md = this;
        var params = Array.prototype.slice.call(arguments, 1);
        if (this._events[eventName]) {
            this._events[eventName].forEach(function (cb) {
                cb.apply(md, params);
            });
        }
    };
}

/**
 * 绑定事件
 * @param md
 */
function initEvent(md) {
    md._events = [];
    md._lastRow = null;
    md._value = [];
    md.on('keydown', function keydown(e) {

        // enter
        if (e.keyCode === 13) {
            if (md.cursor.in('PRE')) {
                return;
            }
            if (md.cursor.closest('[row]') && e.shiftKey) {
                return;
            }
            e.preventDefault();
            md.addRow();
        }
    });
    md.on('input', function input() {
        var row = md.cursor.closestRow();
        if (row && (!row.hasAttr('md') || md.cursor.in('CODE'))) {
            var txt = row.text();
            if (row.attr('type') == 'pre' && row.hasAttr('md')) {
                txt = '```\n' + txt;
                if (!/\n$/.test(txt)) {
                    txt += '\n';
                }
                txt += '```';
            }
            md._value[row.attr('row')] = txt;
        }

        if (!md.el.children().length) {
            md.el.empty();
            md.addRow();
        }
    });

    md.on('blur', function blur() {
        md.trigger('rowchange', md._lastRow);
        md._lastRow = null;
    });

    md.on('dblclick', function dblclick() {

        if (md.cursor.in('CODE')) {
            var row = md.cursor.closestRow();
            if (row) {
                var rowNo = row.attr('row');
                row.text(md._value[rowNo]);
                console.log(md._value[rowNo]);
                row.removeAttr('md');
                row.removeAttr('code');
            }
        }
    });

    md.on('rowchange', function rowchange(oldRow, newRow) {
        var oldRemoved = null;

        if (oldRow) {
            var oldRowNo = oldRow.attr('row');
            if (!md.el.find('[row="' + oldRowNo + '"]')) {
                oldRemoved = oldRowNo;
            } else if (!oldRow.hasAttr('md')) {
                var text = oldRow.text();
                if (text !== '') {
                    var tree = mdToTree(text);
                    if (tree.length == 1) {
                        oldRow.html(treeToHtml(tree));
                        oldRow.attr('type', tree[0].tag);
                    } else {
                        var rows = this.htmlToRow(tree);
                        oldRow.replaceWith(rows);
                    }
                    oldRow.attr('md', 1);
                }
            }
        }

        if (newRow && newRow.hasAttr('md') && !(newRow.attr('type') == 'pre')) {

            var newRowNo = newRow.attr('row');
            var newRowTxt = md._value[newRowNo];
            newRowTxt = newRowTxt ? newRowTxt : '';
            if (oldRemoved && md._value[oldRemoved]) {
                newRowTxt += md._value[oldRemoved];
                md._value[oldRemoved] = '';
            }

            newRow.text(newRowTxt);
            newRow.removeAttr('md');
            md.cursor.set(newRow[0], newRowTxt.length);
        }
    });
    document.addEventListener('selectionchange', function selectionchange() {
        // 目前仅支持非选择区域
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow();
            if (row) {
                if (md._lastRow && md._lastRow.attr('row') !== row.attr('row')) {
                    // 光标所在行和之前行号不相等才触发rowchange
                    md.trigger('rowchange', md._lastRow, row);
                } else if (!md._lastRow) {
                    // 首次换行
                    md.trigger('rowchange', md._lastRow, row);
                }
            } else if (md._lastRow) {
                // 离开编辑器，但是仍然触发了selectionchange，说明光标仍然在当前页面上
                md.trigger('rowchange', md._lastRow);
            }
            md._lastRow = row;
        }
    });
}

/**
 * Created by qinsx on 2017/6/13.
 */
function rowMixin(mdeditor) {

    /**
     * 给编辑器增加一行
     */
    mdeditor.prototype.addRow = function () {

        var offset = this.cursor.offset;
        var newRow;
        var newRowData = ['div', {
            attrs: {
                'row': this._rowNo
            },
            innerHTML: '<br>'
        }];

        // 计算offset（主要是用了shift换行输入的情况）
        var cursorNode = this.cursor.node;
        if (isTextNode(cursorNode)) {
            while (cursorNode.previousSibling) {
                offset += cursorNode.previousSibling.textContent.length;
                cursorNode = cursorNode.previousSibling;
            }
        }
        var curRow = this.cursor.closestRow();

        if (curRow) {
            var rowTxt = curRow.text();
            if (offset === 0 && rowTxt !== '') {
                newRow = curRow.insertBefore(newRowData);
            } else if (rowTxt === '') {
                newRow = curRow.insertAfter(newRowData);
            } else {
                var curRowTxt = rowTxt.slice(0, offset);
                curRow.text(curRowTxt);
                var newRowTxt = rowTxt.slice(offset);
                if (newRowTxt !== '') {
                    newRowData[1].innerHTML = newRowTxt;
                }
                this._value[curRow.attr('row')] = curRowTxt;
                this._value[this._rowNo] = newRowTxt;
                newRow = curRow.insertAfter(newRowData);
            }
        } else if (offset === 0) {
            newRow = this.el.prepend(newRowData);
        }

        if (newRow) {
            this.cursor.set(newRow, 0);
            this._rowNo++;
        }
    };

    /**
     * 将markdown解析成的html，转换成符合编辑器的行，保证每一行只有一个类型（p、pre、ul、li等）
     * @param html 由mdToHtml返回的html数组
     * @returns {Array}
     */
    mdeditor.prototype.htmlToRow = function (tree) {
        var rows = [];
        for (var i = 0; i < tree.length; i++) {
            var div = createElement(['div', {
                attrs: {
                    'row': this._rowNo,
                    'md': 1,
                    type: tree[i].tag
                },
                innerHTML: treeToHtml([tree[i]])
            }]);
            rows.push(div);
            this._value[this._rowNo] = tree[i].md;
            this._rowNo++;
        }
        return rows;
    };
}

/**
 * 初始化mdeditor实例的行号为0
 * @param md mdeditor实例
 */
function initRow(md) {
    md._rowNo = 0;
}

/**
 * Created by qinsx on 2017/6/14.
 */

var def = Object.defineProperty;

function Cursor(editor) {

    this.editor = editor;

    var me = this;
    this.path = [];

    def(this, 'sel', {
        get: function get() {
            return window.getSelection();
        }
    });
    def(this, 'node', {
        get: function get() {
            if (me.sel.type === 'Range') {
                return me.sel.anchorNode;
            }
            return me.sel.focusNode;
        }
    });
    def(this, 'offset', {
        get: function get() {
            return me.sel.focusOffset;
        }
    });
}
/**
 * 鼠标是否在绑定的编辑器内
 * @returns {boolean}
 * @private
 */
Cursor.prototype._inside = function () {
    var node = this.node;
    var _path = [node];
    while (node && !node.isEqualNode(this.editor)) {
        node = node.parentNode;
        _path.push(node);
    }
    this.path = _path;
    return !!node && node.isEqualNode(this.editor);
};
/**
 * 向上查找符合selector的节点
 * @param selector css选择器
 * @returns {*}
 */
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
    return match ? new el(match) : match;
};

/**
 * 查找光标所在的行
 * @returns {el}
 */
Cursor.prototype.closestRow = function () {
    return this.closest('[row]');
};

/**
 * 光标是否在node中
 * @param nodeName HTMLElement nodeName，全大写
 * @returns {boolean}
 */
Cursor.prototype.in = function (nodeName) {
    if (this._inside()) {
        var _path = this.path;
        var i = _path.length;
        while (i--) {
            if (_path[i].nodeName === nodeName) {
                return true;
            }
        }
        return false;
    }
    return false;
};

/**
 * 设定光标位置
 * @param node 光标所在的节点
 * @param offset 光标偏移长度
 */
Cursor.prototype.set = function (node, offset) {
    var elm = node;
    if (node instanceof el) {
        elm = node[0];
    }
    var isTxtNode = node instanceof Text;
    var selection = window.getSelection();
    var range = document.createRange();
    if (offset === undefined) {
        offset = isTxtNode ? node.nodeValue.length : elm.textContent.length;
    }
    range.setStart(isTxtNode ? node : elm.childNodes[0], offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
};

function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {

        var md = this;
        if (id) {
            this.el = new el(id);
            this.el.attr('contenteditable', true);
            this.cursor = new Cursor(this.el[0]);
            initRow(md);
            initEvent(md);
            md.addRow();
        }

        this.options = options;
    };
    mdeditor.prototype._init.prototype = mdeditor.prototype;
}

/**
 * Created by qinsx on 2017/6/13.
 */

function initGlobalApi(mdeditor) {
  mdeditor.extend = extend;
}

/**
 * 实例可用api
 * @param mdeditor
 */
function apiMixin(mdeditor) {

    /**
     * 返回markdown
     * @returns {Array}
     */
    mdeditor.prototype.getMarkdown = function () {
        var rows = this.el.children();
        var markdown = [];
        for (var i = 0; i < rows.length; i++) {
            var rowNo = rows[i].getAttribute('row');
            if (rowNo) {
                markdown.push(this._value[rowNo]);
            }
        }
        return markdown;
    };

    /**
     * 返回html
     * @returns {Array}
     */
    mdeditor.prototype.getHtml = function () {
        var rows = this.el.children();
        var html = [];
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].hasAttribute('md')) {
                html.push(rows[i].innerHTML);
            }
        }
        return html;
    };

    /**
     * 初始化markdown值，markdown转成html
     * @param markdown
     */
    mdeditor.prototype.setMarkdown = function (markdown) {
        // 初始化行号
        this._rowNo = 0;
        this._value = [];
        this.el.empty();
        var tree = mdToTree(markdown);
        var rows = this.htmlToRow(tree);
        var me = this;
        rows.forEach(function (row) {
            me.el.append(row);
        });
    };
}

/**
 * Created by qinsx on 2017/6/13.
 */

function mdeditor(options) {
  return new mdeditor.prototype._init(options);
}
initGlobalApi(mdeditor);
initMixin(mdeditor);
eventsMixin(mdeditor);
rowMixin(mdeditor);
apiMixin(mdeditor);

return mdeditor;

})));
