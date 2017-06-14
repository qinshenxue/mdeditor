(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.mdeditor = factory());
}(this, (function () { 'use strict';

/**
 * Created by qinsx on 2017/6/13.
 */

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


function el(selector) {
    this[0] = document.querySelector(selector);
}
el.prototype.insertAfter = function () {
    this[0].parentNode.insertBefore(createElement.apply(null, arguments), this[0].nextSibling);
};
el.prototype.insertBefore = function () {
    this[0].parentNode.insertBefore(createElement.apply(null, arguments), this[0]);
};

el.prototype.prepend = function () {
    this[0].insertBefore(createElement.apply(null, arguments), this[0].firstChild);
};

el.prototype.append = function () {
    var child = createElement.apply(null, arguments);
    this[0].appendChild(child);
    return child
};

el.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this[0].getAttribute(name)
    }
    this[0].setAttribute(name, value);
};

var el$1 = function (selector) {
    return new el(selector)
};

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


function setCursor(node, offset) {
    var selection = window.getSelection();
    var range = document.createRange();
    var selectNode = node;
    range.setStart(selectNode, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}



function closestRow(node, rootNode) {

    if (node.nodeName === '#text') {
        node = node.parentNode;
    }
    while ('hasAttribute' in node && !node.hasAttribute('row')) {
        node = node.parentNode;
    }
    if (node.parentNode && node.parentNode.isEqualNode(rootNode)) {
        return node
    }
    return null
}


function getCursorNode() {
    return window.getSelection().focusNode
}

function hasContent(txt) {
    return !/^[\u200B\s]*$/.test(txt)
}

var regLib = {
    code: /^\`{3}.*$/,
    ul: /^[\.\-\*]\s+.+$/,
    ol: /^\d+\.\s?.+$/,
    toc: /^\s*\[TOC\]\s*$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    title: /^#{1,6}.+$/,
    a: /\[(([^(\(\)\[\])]|\\\[|\\\]|\\\(|\\\))+?)\]\((.+?)\)/g,
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
                break;
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
    };
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
                break;
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
    };
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
                break;
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
    };
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
                break;
            }
            row = replaceHtmlTag(row);
            html.push(row + '\n');
        }
        html.push('</code>');
        html.push('</pre>');
    }
    return {
        html: html,
        index: i
    };
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
                break;
            }
            row = replaceHtmlTag(row);
            html.push(handleTr(row, tdAlign));
        }

        html.push('</table>');
    }
    return {
        html: html,
        index: i - 1
    };
}

function handleTr(txt, align) {
    var arr = txt.match(/[^|]+/g);
    var tr = '<tr>';
    for (var i = 0, j = arr.length; i < j; i++) {
        tr += '<td style="text-align:' + align[i] + '">' + handleInlineSet(arr[i]) + '</td>';
    }
    tr += '</tr>';
    return tr;
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
    return align;
}

function handleTitle(txt, toc) {
    return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
        var hno = $1.length;
        $2 = replaceHtmlTag($2);
        toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 + '">' + $2 + '</a>');
        return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno + '>';
    });
}

function handleParagraph(txt) {
    txt = replaceHtmlTag(txt);
    return '<p>' + handleInlineSet(txt) + '</p>';
}

function handleInlineSet(txt) {
    txt = handleImg(txt);
    txt = handleInlineCode(txt);
    txt = handleLink(txt);
    txt = handleBold(txt);
    txt = handleItalic(txt);
    return txt;
}

function handleImg(txt) {
    return txt.replace(regLib.img, function (match, $1, $2) {
        return '<img class="mdeditor-img" alt="' + $1 + '" src="' + $2 + '">';
    });
}

function handleLink(txt) {
    
    return txt.replace(regLib.a, function (txt, $1, $2) {
        return '<a href="' + $2 + '" target="_blank">' + handleBold($1.replace(/\\([\(\)\[\])])/g, '$1')) + '</a>';
    });
}

function handleBold(txt) {
    
    return txt.replace(regLib.b, function (match, $1) {
        return '<b>' + $1 + '</b>';
    });
}

function handleItalic(txt) {
    
    return txt.replace(regLib.i, function (match, $1) {
        return '<i>' + $1 + '</i>';
    });
}

function handleInlineCode(txt) {
    
    return txt.replace(regLib.inline_code, function (txt, $1) {
        return '<span class="mdeditor-inline-code">' + $1 + '</span>';
    });
}

function replaceHtmlTag(txt) {
    return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}

function removeSpace(txt) {
    return txt.replace(/\u200B/g, '')
}

function mdToHtml(md) {
    var rows = md.match(/.+/mg) || [],
        html = [],
        rowsCount = rows.length,
        toc=[],
        rowsStart = 0;

    if (rowsCount > 0) {

        for (var i = rowsStart; i < rowsCount; i++) {
            var row = removeSpace(rows[i]);
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

    return html;
}

/**
 * Created by qinsx on 2017/6/13.
 */

var events = {};
function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        ( events[eventName] || (events[eventName] = [])).push(cb);
        this.el[0].addEventListener(eventName, cb);
    };

    mdeditor.prototype.trigger = function (eventName) {
        var md = this;
        var params = Array.prototype.slice.call(arguments, 1);
        if (events[eventName]) {
            events[eventName].forEach(function (cb) {
                cb.apply(md, params);
            });
        }
    };
}

var lastRow = null;

function initEvent(md) {
    md.on('keydown', function keydown(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            md.addRow();
        }
    });

    md.on('rowchange', function rowchange(oldRow, newRow) {
        //console.log(oldRow,newRow)
        if (oldRow && !oldRow.hasAttribute('md')) {
            var md = oldRow.textContent;
            if (hasContent(md)) {
                var mdHtml = mdToHtml(md);
                oldRow.innerHTML = mdHtml.join('') + '<div style="display: none">' + md + '</div>';
                oldRow.setAttribute('md', 1);
            }
        }
        if (newRow && newRow.hasAttribute('md')) {
            newRow.innerHTML = newRow.lastChild.textContent;
            newRow.removeAttribute('md');
            setCursor(newRow.childNodes[0], newRow.lastChild.textContent.length);
        }

    });
    document.addEventListener('selectionchange', function selectionchange() {
        var row = closestRow(getCursorNode(), md.el[0]);
        console.log('row',row);
        console.log('last',lastRow);

        if (row) {
            if (lastRow && lastRow.getAttribute('row') !== row.getAttribute('row')) {
                md.trigger('rowchange', lastRow, row);
            } else if (!lastRow) {
                md.trigger('rowchange', lastRow, row);
            }
        } else if (lastRow) {   // 离开编辑器
            md.trigger('rowchange', lastRow);
        }
        lastRow = row;
    });
}

function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {


        if (id) {
            this.el = el$1(id);
            this.el.attr('contenteditable', true);
            this.addRow();
            initEvent(this);
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
var row = 0;

function mixin(mdeditor) {
    mdeditor.prototype.addRow = function () {
        row++;
        var appended = this.el.append(['div', {
            attrs: {
                'row': row
            },
            innerHTML: '<br>'
        }]);
        setCursor(appended, 1);
    };
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

mixin(mdeditor);

return mdeditor;

})));
