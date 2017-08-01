var regLib = {
    code: /^\`{3}(.*)$/,
    ul: /^[\.\-\*]\s+.+$/,
    ul_flag: /^[\.\-\*]/,
    ol: /^\d+\.\s?.+$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    title: /^(#{1,6}).+$/,
    a: /\[((?:[^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,
    b: /\*\*(.+?)\*\*/g,
    i: /\*(.+?)\*/g,
    inline_code: /\`(.+?)\`/g,
    blockquote: /^>(.+?)$/,
    hr: /^(\*|\_|\-){3,}$/,
    table: /^(\|[^|]+)+\|\s*$/,
    table_td_align: /^(\|\s*:?-+:?\s*)+\|\s*$/,
    table_td_align_left: /^\s*:-+\s*$/,
    table_td_align_center: /^\s*:-+:\s*$/,
    table_td_align_right: /^\s*-+:\s*$/
}

/**
 * 引用<blockquote>
 *
 * @param {any} rows
 * @param {any} start
 * @returns
 */
function handleBlockquote(rows, start) {
    var html = []
    var markdowns = []
    var i = start
    if (regLib.blockquote.test(rows[start])) {
        html.push('<blockquote class="mdeditor-blockquote">')
        for (; i < rows.length; i++) {
            if (!regLib.blockquote.test(rows[i])) {
                break
            }
            var row = rows[i]
            markdowns.push(row)
            var repRow = row.replace(/^>/, '')
            if (regLib.ul.test(repRow)) {
                var ul = handleUl(rows, i, />/)
                html = html.concat(ul.html)
                i = ul.index
            } else if (regLib.ol.test(repRow)) {
                var ol = handleOl(rows, i, />/)
                html = html.concat(ol.html)
                i = ol.index
            } else {
                html.push(handleParagraph(repRow))
            }
        }
        html.push('</blockquote>')
    }
    return {
        type: 'blockquote',
        markdown: markdowns,
        html: html,
        index: i - 1
    }
}

/**
 * 无序列表<ul>
 *
 * @param {any} rows
 * @param {any} start
 * @param {any} reg
 * @returns
 */
function handleUl(rows, start, reg) {
    var html = []
    var markdowns = []
    var i = start
    if (regLib.ul.test(reg ? rows[start].replace(reg, '') : rows[start])) {
        html.push('<ul class="mdeditor-ul">')
        for (; i < rows.length; i++) {
            var row, repRow = row = rows[i]

            if (reg) {
                repRow = row.replace(reg, '')
            }

            if (/^\s+/.test(repRow)) {

                repRow = repRow.replace(/^\s+/, '')

                if (regLib.ul.test(repRow)) {
                    var ul = handleUl(rows, i, /^\s+/)
                    html = html.concat(ul.html)
                    markdowns = markdowns.concat(ul.markdown)
                    i = ul.index
                } else if (regLib.ol.test(repRow)) {
                    var ol = handleOl(rows, i, /^\s+/)
                    html = html.concat(ol.html)
                    markdowns = markdowns.concat(ol.markdown)
                    i = ol.index
                } else {
                    html.push(handleParagraph(repRow))
                }
                html.push('</li>')
                continue
            } else if (!regLib.ul.test(repRow) || (reg && !reg.test(row) )) {
                html.push('</li>')
                break
            } else if (i != start) {
                html.push('</li>')
            }
            markdowns.push(row)

            repRow = replaceHtmlTag(repRow)
            repRow = repRow.replace(/^[\.\*\-]\s*/, '')
            html.push('<li>' + handleInlineSet(repRow))
        }
        html.push('</ul>')
    }
    return {
        type: 'ul',
        markdown: markdowns,
        html: html,
        index: i - 1
    }
}


function toLi(rows) {
    var tree = []

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        if (/^\s+/.test(row)) {

            var _blank = []
            for (; i < rows.length; i++) {
                if (/^\s+/.test(rows[i])) {
                    _blank.push(rows[i].replace(/^\s+/, ''))
                } else {
                    i--
                    break
                }
            }
            tree[tree.length - 1].children = toTree(_blank)

        } else {
            tree.push({
                tag: 'li',
                md: rows[i],
                text: rows[i].replace(/^[\.\*\-]\s*/, '')
            })
        }

    }
    return tree
}

/**
 * 有序列表<ol>
 *
 * @param {any} rows
 * @param {any} start
 * @param {any} reg
 * @returns
 */
function handleOl(rows, start, reg) {
    var html = []
    var markdowns = []
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
            markdowns.push(row)
            row = replaceHtmlTag(row)
            row = row.replace(/^\d+\.\s*/, '')
            html.push('<li>' + handleInlineSet(row) + '</li>')
        }
        html.push('</ol>')
    }
    return {
        type: 'ol',
        markdown: markdowns,
        html: html,
        index: i - 1
    }
}


function handlePre(rows, start) {
    var html = []
    var markdowns = []
    var i = start
    var firstRow = rows[start]
    var codeType = ''

    if (regLib.code.test(firstRow)) {
        codeType = firstRow.replace(/[`\s]/g, '').toLowerCase()
        html.push('<pre class="mdeditor-code">')
        html.push('<code class="' + codeType + '">')
        markdowns.push(firstRow)
        i++
        for (; i < rows.length; i++) {
            var row = rows[i]
            if (regLib.code.test(row)) {
                markdowns.push(row)
                break
            }
            markdowns.push(row)
            row = replaceHtmlTag(row)
            html.push(row + '\n')
        }
        if (html.length === 2) {
            html.push('<br>')
        }
        html.push('</code>')
        html.push('</pre>')
    }
    return {
        type: 'pre',
        markdown: markdowns,
        html: html,
        extra: {
            codeType: codeType
        },
        index: i
    }
}

function handleTable(rows, start) {
    var html = []
    var markdowns = []
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
        markdowns.push(firstRow)
        markdowns.push(nextRow)
        i += 2

        for (; i < rows.length; i++) {
            var row = rows[i]
            if (!regLib.table.test(row)) {
                break
            }
            markdowns.push(row)
            row = replaceHtmlTag(row)
            html.push(handleTr(row, tdAlign))
        }

        html.push('</table>')
    }
    return {
        type: 'table',
        markdown: markdowns,
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

function handleTitle(txt) {
    return txt.replace(/(#{1,6})(.+)/, function (match, $1, $2) {
        var hno = $1.length
        $2 = replaceHtmlTag($2)
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
    return txt.replace(regLib.a, function (txt, $1, $2) {
        return '<a href="' + $2 + '" target="_blank">' + handleBold($1.replace(/\\([\(\)\[\])])/g, '$1')) + '</a>'
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

function dataFormat(type, markdown, html) {
    return {
        html: [html],
        markdown: [markdown],
        type: type
    }
}


function toBlockquote(rows) {
    var tree = []

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        if (/^\s+/.test(row)) {

            var _blank = []
            for (; i < rows.length; i++) {
                if (/^\s+/.test(rows[i])) {
                    _blank.push(rows[i].replace(/^\s+/, ''))
                } else {
                    i--
                    break
                }
            }
            tree[tree.length - 1].children = toTree(_blank)

        } else {
            tree.push({
                tag: 'p',
                md: row,
                text: row.replace(/^>/, '')
            })
        }

    }
    return tree
}

function toTree(rows) {
    var html = []
    var rowsCount = rows.length
    for (var i = 0; i < rowsCount; i++) {
        var row = rows[i]
        if (regLib.title.test(row)) {
            html.push({
                tag: 'h' + (RegExp.$1 ? RegExp.$1.length : 1),
                md: row,
                text: row.replace(/^#{1,6}/, '')
            })

        } else if (regLib.hr.test(row)) {
            html.push({
                tag: 'hr',
                md: row
            })

        } else if (regLib.ul.test(row)) {
            var _raw = []
            for (var j = i; j < rowsCount; j++) {
                var _rawRow = rows[j]
                if (!regLib.ul.test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    break
                }
                _raw.push(_rawRow)

            }
            i = j - 1
            html.push({
                tag: 'ul',
                children: toLi(_raw),
                md: _raw
            })

        } else if (regLib.ol.test(row)) {

            var _raw = []
            for (var j = i; j < rowsCount; j++) {
                var _rawRow = rows[j]
                if (!regLib.ol.test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    break
                }
                _raw.push(_rawRow)
            }
            i = j - 1
            html.push({
                tag: 'ol',
                children: toLi(_raw),
                md: _raw
            })


        } else if (regLib.table.test(row)) {
            var table = handleTable(rows, i)
            html.push(table)
            i = table.index

        } else if (regLib.blockquote.test(row)) {
            var _raw = [row]
            i++
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i]
                if (!regLib.blockquote.test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    i--
                    break
                }
                _raw.push(_rawRow)
            }
            html.push({
                tag: 'blockquote',
                children: toBlockquote(_raw),
                md: _raw
            })

        } else if (regLib.code.test(row)) {
            var _raw = [row]
            var codeType = RegExp.$1 || ''
            var _code = []
            i++
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i]
                if (regLib.code.test(_rawRow)) {
                    break
                }
                _code.push(_rawRow)
            }
            _raw.push('```')
            html.push({
                tag: 'pre',
                children: [{
                    tag: 'code',
                    text: _code.join('\n')
                }],
                class: codeType.trim(),
                md: _raw
            })

        } else {
            html.push({
                tag: 'p',
                md: row,
                text: row
            })
        }
    }
    return html
}

export function treeToHtml(nodes) {
    var html = []
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        html.push('<' + node.tag)
        if (node.class) {
            html.push(' class="' + node.class + '" ')
        }
        html.push('>')
        if (node.text) {
            html.push(node.text)
        }
        if (node.children) {
            html.push(treeToHtml(node.children))
        }
        html.push('</' + node.tag + '>')
    }
    return html.join('')
}

export function mdToTree(md) {

    var rows = md.match(/.+/mg) || [];
    return toTree(rows)
}

export function mdToHtml(md) {
    var rows = md.match(/.+/mg) || [],
        html = [],
        rowsCount = rows.length;

    if (rowsCount > 0) {


        for (var i = 0; i < rowsCount; i++) {
            var row = rows[i]
            if (regLib.title.test(row)) {
                html.push(dataFormat('h', row, handleTitle(row)))

            } else if (regLib.hr.test(row)) {
                html.push(dataFormat('hr', row, '<hr>'))

            } else if (regLib.ul.test(row)) {
                var ul = handleUl(rows, i)
                html.push(ul)
                i = ul.index

            } else if (regLib.ol.test(row)) {
                var ol = handleOl(rows, i)
                html.push(ol)
                i = ol.index

            } else if (regLib.table.test(row)) {
                var table = handleTable(rows, i)
                html.push(table)
                i = table.index

            } else if (regLib.blockquote.test(row)) {
                var blockquote = handleBlockquote(rows, i)
                html.push(blockquote)
                i = blockquote.index

            } else if (regLib.code.test(row)) {
                var pre = handlePre(rows, i)
                html.push(pre)
                i = pre.index

            } else {
                html.push(dataFormat('p', row, handleParagraph(row)))
            }
        }
    }

    return html
}
