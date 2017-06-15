export function markdownMixin(mdeditor) {

    mdeditor.prototype.getMarkdown = function () {

    }

}

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
}
function handleBlockquote(rows, start) {
    var html = []
    var i = start
    if (regLib.blockquote.test(rows[start])) {
        html.push('<blockquote class="mdeditor-blockquote">')
        for (; i < rows.length; i++) {
            if (!regLib.blockquote.test(rows[i])) {
                break
            }
            var row = rows[i].replace(/>/, '')
            if (regLib.ul.test(row)) {
                var ul = handleUl(rows, i, />/)
                html = html.concat(ul.html)
                i = ul.index
            } else if (regLib.ol.test(row)) {
                var ol = handleOl(rows, i, />/)
                html = html.concat(ol.html)
                i = ol.index
            } else {
                html.push(handleParagraph(row))
            }
        }
        html.push('</blockquote>')
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleUl(rows, start, reg) {
    var html = []
    var i = start
    if (regLib.ul.test(reg ? rows[start].replace(reg, '') : rows[start])) {
        html.push('<ul class="mdeditor-ul">')
        for (; i < rows.length; i++) {
            var row = rows[i]
            if (reg) {
                row = row.replace(reg, '')
            }
            if (!regLib.ul.test(row)) {
                break
            }
            row = replaceHtmlTag(row)
            row = row.replace(/^[\.\*\-]\s*/, '')
            html.push('<li>' + handleInlineSet(row) + '</li>')
        }
        html.push('</ul>')
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleOl(rows, start, reg) {
    var html = []
    var i = start
    if (regLib.ol.test(reg ? rows[start].replace(reg, '') : rows[start])) {
        html.push('<ol class="mdeditor-ol">')
        for (; i < rows.length; i++) {
            var row = rows[i]
            if (reg) {
                row = row.replace(reg, '')
            }
            if (!regLib.ol.test(row)) {
                break
            }
            row = replaceHtmlTag(row)
            row = row.replace(/^\d+\.\s*/, '')
            html.push('<li>' + handleInlineSet(row) + '</li>')

        }
        html.push('</ol>')
    }
    return {
        html: html,
        index: i - 1
    }
}


function handlePre(rows, start) {
    var html = []
    var i = start
    var firstRow = rows[start]
    if (regLib.code.test(firstRow)) {
        var codeType = firstRow.replace(/[`\s]/g, '')
        html.push('<pre class="mdeditor-code">')
        html.push('<code class="' + codeType.toLowerCase() + '">')
        i++
        for (; i < rows.length; i++) {
            var row = rows[i]
            if (regLib.code.test(row)) {
                break
            }
            row = replaceHtmlTag(row)
            html.push(row + '\n')
        }
        // console.log(html.length)
        if (html.length === 2) {
            html.push('<br>')
        }
        html.push('</code>')
        html.push('</pre>')
    }
    return {
        html: html,
        index: i
    }
}

function handleTable(rows, start) {
    var html = []
    var i = start
    var firstRow = rows[start]
    var nextRow = rows[start + 1]
    if (nextRow && regLib.table.test(firstRow) && regLib.table_td_align.test(nextRow)) {

        html.push('<table class="mdeditor-table">')
        html.push('<tr>')
        var tdArr = firstRow.match(/[^|]+/g)
        var tdAlign = handleTdAlign(nextRow)
        for (var m = 0, n = tdArr.length; m < n; m++) {
            html.push('<th style="text-align:' + tdAlign[m] + '">' + replaceHtmlTag(tdArr[m]) + '</th>')
        }
        html.push('</tr>')

        i += 2

        for (; i < rows.length; i++) {
            var row = rows[i]
            if (!regLib.table.test(row)) {
                break
            }
            row = replaceHtmlTag(row)
            html.push(handleTr(row, tdAlign))
        }

        html.push('</table>')
    }
    return {
        html: html,
        index: i - 1
    }
}

function handleTr(txt, align) {
    var arr = txt.match(/[^|]+/g)
    var tr = '<tr>'
    for (var i = 0, j = arr.length; i < j; i++) {
        tr += '<td style="text-align:' + align[i] + '">' + handleInlineSet(arr[i]) + '</td>'
    }
    tr += '</tr>'
    return tr
}

function handleTdAlign(txt) {
    var arr = txt.match(/[^|]+/g)
    var align = []
    for (var i = 0, j = arr.length; i < j; i++) {
        if (regLib.table_td_align_right.test(arr[i])) {
            align.push('right')
        } else if (regLib.table_td_align_center.test(arr[i])) {
            align.push('center')
        } else {
            align.push('left')
        }
    }
    return align
}

function handleTitle(txt, toc) {
    return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
        var hno = $1.length
        $2 = replaceHtmlTag($2)
        toc.push('<a class="mdeditor-toc-' + hno + '" href="#' + $2 + '">' + $2 + '</a>')
        return '<h' + hno + ' id="' + $2 + '" >' + $2 + '</h' + hno + '>'
    })
}

function handleParagraph(txt) {
    txt = replaceHtmlTag(txt)
    return '<p>' + handleInlineSet(txt) + '</p>'
}

function handleInlineSet(txt) {
    txt = handleImg(txt)
    txt = handleInlineCode(txt)
    txt = handleLink(txt)
    txt = handleBold(txt)
    txt = handleItalic(txt)
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

function removeSpace(txt) {
    return txt.replace(/\u200B/g, '')
}

export function mdToHtml(md) {
    var rows = md.match(/.+/mg) || [],
        html = [],
        rowsCount = rows.length,
        toc = [],
        rowsStart = 0

    if (rowsCount > 0) {

        for (var i = rowsStart; i < rowsCount; i++) {
            var row = rows[i]
            if (regLib.title.test(row)) {
                html.push(handleTitle(row, toc))

            } else if (regLib.hr.test(row)) {
                html.push('<hr>')

            } else if (regLib.ul.test(row)) {
                var ul = handleUl(rows, i)
                html = html.concat(ul.html)
                i = ul.index

            } else if (regLib.ol.test(row)) {
                var ol = handleOl(rows, i)
                html = html.concat(ol.html)
                i = ol.index

            } else if (regLib.table.test(row)) {
                var table = handleTable(rows, i)
                html = html.concat(table.html)
                i = table.index

            } else if (regLib.blockquote.test(row)) {
                var blockquote = handleBlockquote(rows, i)
                html = html.concat(blockquote.html)
                i = blockquote.index

            } else if (regLib.code.test(row)) {
                var pre = handlePre(rows, i)
                html = html.concat(pre.html)
                i = pre.index

            } else {
                html.push(handleParagraph(row))
            }
        }
    }

    return html
}