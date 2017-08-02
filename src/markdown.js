// @flow
var regLib = {
    code: /^\`{3}(.*)$/,
    code_type: /[^`\s]+/,
    ul: /^[\.\-\*]\s+.+$/,
    ul_flag: /^[\.\-\*]/,
    ol: /^\d+\.\s?.+$/,
    img: /\!\[(.*?)\]\((.*?)\)/g,
    title: /^(#{1,6}).+$/,
    a: /\[((?:[^\(\)\[\]]|\\\[|\\\]|\\\(|\\\))+)\]\((.+?)\)/g,
    b: /\*\*(.+?)\*\*/g,
    i: /\*(.+?)\*/g,
    inline_code: /\`(.+?)\`/g,
    blockquote: /^(!?)>(.+?)$/,
    hr: /^(\*|\_|\-){3,}$/,
    table: /^(\|[^|]+)+\|\s*$/,
    td_split: /[^|]+/g,
    table_td_align: /^(\|\s*:?-+:?\s*)+\|\s*$/,
    table_td_align_left: /^\s*:-+\s*$/,
    table_td_align_center: /^\s*:-+:\s*$/,
    table_td_align_right: /^\s*-+:\s*$/
}


function toLi(tag: string, rows: Array<string>): Array<MdTree> {
    var tree: Array<MdTree> = []

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
                children: [],
                text: handleInlineSet(tag == 'ul' ? rows[i].replace(/^[\.\*\-]\s*/, '') : rows[i].replace(/^\d\.\s*/, ''))
            })
        }
    }
    return tree
}


function handleInlineSet(txt: string): string {
    txt = replaceHtmlTag(txt)
    txt = handleImg(txt)
    txt = handleInlineCode(txt)
    txt = handleLink(txt)
    txt = handleBold(txt)
    txt = handleItalic(txt)
    return txt
}

function handleImg(txt: string): string {
    return txt.replace(regLib.img, function (match, $1, $2) {
        return '<img class="mdeditor-img" alt="' + $1 + '" src="' + $2 + '">'
    })
}

function handleLink(txt: string): string {
    return txt.replace(regLib.a, function (txt, $1, $2) {
        return '<a href="' + $2 + '" target="_blank">' + handleBold($1.replace(/\\([\(\)\[\])])/g, '$1')) + '</a>'
    })
}

function handleBold(txt: string): string {
    return txt.replace(regLib.b, function (match, $1) {
        return '<b>' + $1 + '</b>'
    })
}

function handleItalic(txt: string): string {

    return txt.replace(regLib.i, function (match, $1) {
        return '<i>' + $1 + '</i>'
    })
}

function handleInlineCode(txt: string): string {

    return txt.replace(regLib.inline_code, function (txt, $1) {
        return '<span class="mdeditor-inline-code">' + $1 + '</span>'
    })
}

function replaceHtmlTag(txt: string): string {
    return txt.replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
}


function toBlockquote(rows: Array<string>) {
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
                tag: 'text',
                md: row,
                children: [],
                text: handleInlineSet(row.replace(/^(!)?>/, ''))
            })
        }

    }
    return tree
}

function toTable(rows: Array<string>) {


    var alignRaw = rows[1].match(regLib.td_split) || []
    var align = []

    for (let i = 0, j = alignRaw.length; i < j; i++) {
        if (regLib.table_td_align_right.test(alignRaw[i])) {
            align.push('right')
        } else if (regLib.table_td_align_center.test(alignRaw[i])) {
            align.push('center')
        } else {
            align.push('left')
        }
    }


    var thead = {
        tag: 'tr',
        children: []
    }

    function _tdStyle(i) {
        if (i < align.length && align[i] !== 'left') {
            return {
                'text-align': align[i]
            }
        }
    }

    var thRaw = rows[0].match(regLib.td_split) || []
    var tdCount = thRaw.length
    for (let i = 0; i < tdCount; i++) {
        thead.children.push({
            tag: 'th',
            style: _tdStyle(i),
            md: thRaw[i],
            text: handleInlineSet(thRaw[i].trim())
        })
    }

    var tbody = []
    for (let i = 2, j = rows.length; i < j; i++) {
        var tbodyTr = {
            tag: 'tr',
            children: []
        }
        var tdCountCopy = tdCount
        var tbodyTds = rows[i].match(regLib.td_split) || []
        while (tdCountCopy--) {
            var tdMd = tbodyTds[tdCountCopy]
            tbodyTr.children.unshift({
                tag: 'td',
                style: _tdStyle(tdCountCopy),
                md: tdMd,
                text: tdMd ? handleInlineSet(tdMd.trim()) : ''
            })
        }
        tbody.push(tbodyTr)
    }

    return [thead].concat(tbody)
}

function toTree(rows: Array<string>) {
    var html = []
    var rowsCount = rows.length
    var tag = ''

    for (var i = 0; i < rowsCount; i++) {
        var row = rows[i]
        if (regLib.title.test(row)) {
            var hno = row.match(/^#{1,6}/)
            html.push({
                tag: 'h' + (hno ? hno[0].length : 1),
                md: row,
                text: handleInlineSet(row.replace(/^#{1,6}/, ''))
            })

        } else if (regLib.hr.test(row)) {
            html.push({
                tag: 'hr',
                md: row
            })

        } else if ((tag = regLib.ul.test(row) ? 'ul' : false) || (tag = regLib.ol.test(row) ? 'ol' : false)) {
            var _raw = []

            for (; i < rowsCount; i++) {
                var _rawRow = rows[i]
                if (!regLib[tag].test(_rawRow) && !/^\s+.+/.test(_rawRow)) {
                    i--
                    break
                }
                _raw.push(_rawRow)
            }

            html.push({
                tag: tag,
                children: toLi(tag, _raw),
                md: _raw
            })

        } else if (regLib.table.test(row) && rows[i + 1] && regLib.table_td_align.test(rows[i + 1])) {

            var _raw = [row, rows[i + 1]]
            i += 2
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i]
                if (!regLib.table.test(_rawRow)) {
                    i--
                    break
                }
                _raw.push(_rawRow)
            }

            html.push({
                tag: 'table',
                children: toTable(_raw),
                md: _raw
            })

        } else if (regLib.blockquote.test(row)) {
            var _raw = [row]
            var _class = row.indexOf('!') === 0 ? 'warning' : ''
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
                class: _class,
                children: toBlockquote(_raw),
                md: _raw
            })

        } else if (regLib.code.test(row)) {
            var _raw = [row]
            var codeType = row.match(regLib.code_type)
            codeType = codeType ? codeType[0] : ''
            var _code = []
            i++
            for (; i < rowsCount; i++) {
                var _rawRow = rows[i]
                if (regLib.code.test(_rawRow)) {
                    break
                }
                if (/\n{2,}/.test(_rawRow)) {
                    _rawRow = _rawRow.replace(/\n{2}/, '')
                }
                _raw.push(_rawRow)
                _code.push(_rawRow)
            }
            _raw.push('```')

            html.push({
                tag: 'pre',
                children: [{
                    tag: 'code',
                    text: _code.join('\n')
                }],
                attr: {
                    'data-lang': codeType
                },
                class: codeType,
                md: _raw
            })

        } else if (!/\n+/.test(row)) {
            html.push({
                tag: 'p',
                md: row,
                text: handleInlineSet(row)
            })
        }
    }
    return html
}

function treeToHtml(nodes): string {
    var html = []
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        switch (node.tag) {
            case 'text':
                html.push(node.text)
                if (node.children) {
                    html.push(treeToHtml(node.children))
                }
                break
            default:
                html.push('<' + node.tag)
                if (node.class) {
                    html.push(' class="' + node.class + '" ')
                }
                if (node.style) {
                    html.push(' style="')
                    for (var p in node.style) {
                        html.push(p + ':' + node.style[p] + ';')
                    }
                    html.push('" ')
                }
                if (node.attr) {
                    for (var a in node.attr) {
                        html.push(' ' + a + '="' + node.attr[a] + '" ')
                    }
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

    }
    return html.join('')
}


function mdToTree(md: string) {
    var rows = md.match(/.+|\n{2,}/mg) || [];
    return toTree(rows)
}

function mdToHtml(md: string): string {
    return treeToHtml(mdToTree(md))
}

export {mdToTree, mdToHtml}
