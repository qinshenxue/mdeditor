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
    return node && node.nodeName === '#text'
}


function parseHTML(string) {
    const context = document.implementation.createHTMLDocument();

    // Set the base href for the created document so any parsed elements with URLs
    // are based on the document's URL
    const base = context.createElement('base');
    base.href = document.location.href;
    context.head.appendChild(base);

    context.body.innerHTML = string;
    return context.body.children;
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
    if (args.length == 1) return elms[0]
    return elms
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
    return brother
};
el.prototype.insertBefore = function () {
    var brother = createElement.apply(null, arguments);
    this[0].parentNode.insertBefore(brother, this[0]);
    return brother
};

el.prototype.prepend = function () {
    var child = createElement.apply(null, arguments);
    this[0].insertBefore(child, this[0].firstChild);
    return child
};

el.prototype.append = function () {
    var child = createElement.apply(null, arguments);
    this[0].appendChild(child);
    return child
};
el.prototype.empty = function () {
    this[0].innerHTML = '';
};
el.prototype.children = function () {
    return this[0].childNodes
};
el.prototype.text = function (text) {
    if (text === undefined) {
        return this[0].textContent
    }
    this[0].textContent = text;
};
el.prototype.html = function (html) {
    if (html === undefined) {
        return this[0].innerHTML
    }
    this[0].innerHTML = html;
};
el.prototype.find = function (selector) {
    var found = this[0].querySelector(selector);
    return found ? new el(found) : found
};
el.prototype.hasAttr = function (attrName) {
    return this[0].hasAttribute(attrName)
};
el.prototype.removeAttr = function (attrName) {
    return this[0].removeAttribute(attrName)
};
el.prototype.attr = function (attrName, attrVal) {
    if (attrVal !== undefined) {
        return this[0].setAttribute(attrName, attrVal)
    }
    return this[0].getAttribute(attrName)
};

el.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this[0].getAttribute(name)
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
    code: /^\`{3}.*$/,
    ul: /^[\.\-\*]\s+.+$/,
    ol: /^\d+\.\s?.+$/,
    toc: /^\s*\[TOC\]\s*$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    title: /^#{1,6}.+$/,
    a: /\[(([^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,
    b: /\*\*(.+?)\*\*/g,
    i: /\*(.+?)\*/g,
    inline_code: /\`(.+?)\`/g,
    blockquote: /^>(.+?)$/,
    hr: /^(\*\s*){3,}|(-\s*){3,}|(_\s*){3,}$/,
    table: /^(\|[^|]+)+\|\s*$/,
    table_td_align: /^(\|\s*:?-+:?\s*)+\|\s*$/,
    table_td_align_left: /^\s*:-+\s*$/,
    table_td_align_center: /^\s*:-+:\s*$/,
    table_td_align_right: /^\s*-+:\s*$/
};
function handleBlockquote(rows, start) {
    var html = [];
    var i = start;
    if (regLib.blockquote.test(rows[start])) {
        html.push('<blockquote class="mdeditor-blockquote">');
        for (; i < rows.length; i++) {
            if (!regLib.blockquote.test(rows[i])) {
                break
            }
            var row = rows[i].replace(/>/, '');
            if (regLib.ul.test(row)) {
                var ul = handleUl(rows, i, />/);
                html = html.concat(ul.html);
                i = ul.index;
            } else if (regLib.ol.test(row)) {
                var ol = handleOl(rows, i, />/);
                html = html.concat(ol.html);
                i = ol.index;
            } else {
                html.push(handleParagraph(row));
            }
        }
        html.push('</blockquote>');
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleUl(rows, start, reg) {
    var html = [];
    var i = start;
    if (regLib.ul.test(reg ? rows[start].replace(reg, '') : rows[start])) {
        html.push('<ul class="mdeditor-ul">');
        for (; i < rows.length; i++) {
            var row = rows[i];
            if (reg) {
                row = row.replace(reg, '');
            }
            if (!regLib.ul.test(row)) {
                break
            }
            row = replaceHtmlTag(row);
            row = row.replace(/^[\.\*\-]\s*/, '');
            html.push('<li>' + handleInlineSet(row) + '</li>');
        }
        html.push('</ul>');
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleOl(rows, start, reg) {
    var html = [];
    var i = start;
    if (regLib.ol.test(reg ? rows[start].replace(reg, '') : rows[start])) {
        html.push('<ol class="mdeditor-ol">');
        for (; i < rows.length; i++) {
            var row = rows[i];
            if (reg) {
                row = row.replace(reg, '');
            }
            if (!regLib.ol.test(row)) {
                break
            }
            row = replaceHtmlTag(row);
            row = row.replace(/^\d+\.\s*/, '');
            html.push('<li>' + handleInlineSet(row) + '</li>');

        }
        html.push('</ol>');
    }
    return {
        html: html,
        index: i - 1
    }
}


function handlePre(rows, start) {
    var html = [];
    var i = start;
    var firstRow = rows[start];
    if (regLib.code.test(firstRow)) {
        var codeType = firstRow.replace(/[`\s]/g, '');
        html.push('<pre class="mdeditor-code">');
        html.push('<code class="' + codeType.toLowerCase() + '">');
        i++;
        for (; i < rows.length; i++) {
            var row = rows[i];
            if (regLib.code.test(row)) {
                break
            }
            row = replaceHtmlTag(row);
            html.push(row + '\n');
        }
        // console.log(html.length)
        if (html.length === 2) {
            html.push('<br>');
        }
        html.push('</code>');
        html.push('</pre>');
    }
    return {
        html: html,
        index: i
    }
}

function handleTable(rows, start) {
    var html = [];
    var i = start;
    var firstRow = rows[start];
    var nextRow = rows[start + 1];
    if (nextRow && regLib.table.test(firstRow) && regLib.table_td_align.test(nextRow)) {

        html.push('<table class="mdeditor-table">');
        html.push('<tr>');
        var tdArr = firstRow.match(/[^|]+/g);
        var tdAlign = handleTdAlign(nextRow);
        for (var m = 0, n = tdArr.length; m < n; m++) {
            html.push('<th style="text-align:' + tdAlign[m] + '">' + replaceHtmlTag(tdArr[m]) + '</th>');
        }
        html.push('</tr>');

        i += 2;

        for (; i < rows.length; i++) {
            var row = rows[i];
            if (!regLib.table.test(row)) {
                break
            }
            row = replaceHtmlTag(row);
            html.push(handleTr(row, tdAlign));
        }

        html.push('</table>');
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleTr(txt, align) {
    var arr = txt.match(/[^|]+/g);
    var tr = '<tr>';
    for (var i = 0, j = arr.length; i < j; i++) {
        tr += '<td style="text-align:' + align[i] + '">' + handleInlineSet(arr[i]) + '</td>';
    }
    tr += '</tr>';
    return tr
}

function handleTdAlign(txt) {
    var arr = txt.match(/[^|]+/g);
    var align = [];
    for (var i = 0, j = arr.length; i < j; i++) {
        if (regLib.table_td_align_right.test(arr[i])) {
            align.push('right');
        } else if (regLib.table_td_align_center.test(arr[i])) {
            align.push('center');
        } else {
            align.push('left');
        }
    }
    return align
}

function handleTitle(txt, toc) {
    return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
        var hno = $1.length;
        $2 = replaceHtmlTag($2);
        toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 + '">' + $2 + '</a>');
        return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno + '>'
    })
}

function handleParagraph(txt) {
    txt = replaceHtmlTag(txt);
    return '<p>' + handleInlineSet(txt) + '</p>'
}

function handleInlineSet(txt) {
    txt = handleImg(txt);
    txt = handleInlineCode(txt);
    txt = handleLink(txt);
    txt = handleBold(txt);
    txt = handleItalic(txt);
    return txt
}

function handleImg(txt) {
    return txt.replace(regLib.img, function (match, $1, $2) {
        return '<img class="mdeditor-img" alt="' + $1 + '" src="' + $2 + '">'
    })
}

function handleLink(txt) {

    return txt.replace(regLib.a, function (txt, $1, $2, $3) {
        return '<a href="' + $3 + '" target="_blank">' + handleBold($1.replace(/\\([\(\)\[\])])/g, '$1')) + '</a>'
    })
}

function handleBold(txt) {

    return txt.replace(regLib.b, function (match, $1) {
        return '<b>' + $1 + '</b>'
    })
}

function handleItalic(txt) {

    return txt.replace(regLib.i, function (match, $1) {
        return '<i>' + $1 + '</i>'
    })
}

function handleInlineCode(txt) {

    return txt.replace(regLib.inline_code, function (txt, $1) {
        return '<span class="mdeditor-inline-code">' + $1 + '</span>'
    })
}

function replaceHtmlTag(txt) {
    return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
}

function mdToHtml(md) {
    var rows = md.match(/.+/mg) || [],
        html = [],
        rowsCount = rows.length,
        toc = [],
        rowsStart = 0;

    if (rowsCount > 0) {

        for (var i = rowsStart; i < rowsCount; i++) {
            var row = rows[i];
            if (regLib.title.test(row)) {
                html.push(handleTitle(row, toc));

            } else if (regLib.hr.test(row)) {
                html.push('<hr>');

            } else if (regLib.ul.test(row)) {
                var ul = handleUl(rows, i);
                html = html.concat(ul.html);
                i = ul.index;

            } else if (regLib.ol.test(row)) {
                var ol = handleOl(rows, i);
                html = html.concat(ol.html);
                i = ol.index;

            } else if (regLib.table.test(row)) {
                var table = handleTable(rows, i);
                html = html.concat(table.html);
                i = table.index;

            } else if (regLib.blockquote.test(row)) {
                var blockquote = handleBlockquote(rows, i);
                html = html.concat(blockquote.html);
                i = blockquote.index;

            } else if (regLib.code.test(row)) {
                var pre = handlePre(rows, i);
                html = html.concat(pre.html);
                i = pre.index;

            } else {
                html.push(handleParagraph(row));
            }
        }
    }

    return html
}

/**
 * Created by qinsx on 2017/6/13.
 */

function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        ( this._events[eventName] || (this._events[eventName] = [])).push(cb);
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


function initEvent(md) {
    md._events = [];
    md._lastRow = null;
    md._value = [];
    md.on('keydown', function keydown(e) {

        // enter
        if (e.keyCode === 13) {
            if (md.cursor.in('PRE')) {
                return
            }
            if (md.cursor.closest('[row]') && e.shiftKey) {
                return
            }
            e.preventDefault();
            md.addRow();
        }

    });
    md.on('input', function input() {

        var row = md.cursor.closestRow();
        if (row && (!row.hasAttr('md') || md.cursor.in('CODE'))) {
            var txt = row.text();
            if (row.hasAttr('code')) {
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

    md.on('dblclick', function dblclick() {

        if (md.cursor.in('CODE')) {
            var row = md.cursor.closestRow();
            if (row) {
                var rowNo = row.attr('row');
                row.html(md._value[rowNo]);
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
                    var html = mdToHtml(text).join('');
                    var rows = this.html2Row(html);
                    if (rows.length == 1) {
                        oldRow.html(html);
                    } else {
                        oldRow.replaceWith(rows);
                        //console.log(rows)
                        //console.log(rows)
                    }
                    if (/^\<pre(.+\n?)+\<\/pre\>$/.test(html)) {
                        oldRow.attr('code', 1);
                        md.cursor.set(oldRow.find('code'));
                    }
                    oldRow.attr('md', 1);
                }
            }
        }

        if (newRow && newRow.hasAttr('md') && !newRow.hasAttr('code')) {

            var newRowNo = newRow.attr('row');
            var newRowTxt = md._value[newRowNo];
            if (oldRemoved) {
                md._value[newRowNo] += md._value[oldRemoved];
                md._value[oldRemoved] = '';
            }

            newRow.text(md._value[newRowNo]);
            newRow.removeAttr('md');
            md.cursor.set(newRow[0], newRowTxt.length);
        }

    });
    document.addEventListener('selectionchange', function selectionchange() {
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow();

            if (row) {
                if (md._lastRow && md._lastRow.attr('row') !== row.attr('row')) {
                    md.trigger('rowchange', md._lastRow, row);
                } else if (!md._lastRow) {
                    md.trigger('rowchange', md._lastRow, row);
                }
            } else if (md._lastRow) {   // 离开编辑器
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


    mdeditor.prototype.addRow = function () {


        var offset = this.cursor.offset;
        var newRow;
        var newRowData = ['div', {
            attrs: {
                'row': this._rowNo
            },
            innerHTML: '<br>'
        }];

        var curRow = this.cursor.closestRow();

        // 计算offset
        var cursorNode = this.cursor.node;
        if (isTextNode(cursorNode)) {
            //row = closestRow(txtNode, this.el[0])
            while (cursorNode.previousSibling) {
                offset += cursorNode.previousSibling.textContent.length;
                cursorNode = cursorNode.previousSibling;
            }
        }

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

    mdeditor.prototype.html2Row = function (html) {
        var nodes = parseHTML(html);
        var rows = [];
        while (nodes.length) {
            var div = createElement(['div', {
                attrs: {
                    'row': this._rowNo,
                    'md': 1
                }
            }]);
            div.appendChild(nodes[0]);
            rows.push(div);
            this._rowNo++;
        }
        return rows
    };

}

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
        get: function () {
            return window.getSelection()
        }
    });
    def(this, 'node', {
        get: function () {
            if (me.sel.type === 'Range') {
                return me.sel.anchorNode
            }
            return me.sel.focusNode
        }
    });
    def(this, 'offset', {
        get: function () {
            return me.sel.focusOffset
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
    return !!node && node.isEqualNode(this.editor)
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
                return true
            }
        });
    }
    return match ? new el(match) : match
};

/**
 * 查找光标所在的行
 * @returns {el}
 */
Cursor.prototype.closestRow = function () {
    return this.closest('[row]')
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
                return true
            }
        }
        return false
    }
    return false
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
    var selection = window.getSelection();
    var range = document.createRange();
    if (offset === undefined) {
        offset = elm.textContent.length;
    }
    range.setStart(elm.childNodes[0], offset);
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
 * Created by qinsx on 2017/6/13.
 */


function mdeditor(options) {
    return new mdeditor.prototype._init(options)
}
initGlobalApi(mdeditor);
initMixin(mdeditor);
eventsMixin(mdeditor);
rowMixin(mdeditor);

return mdeditor;

})));
