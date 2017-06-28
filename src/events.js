/**
 * Created by qinsx on 2017/6/13.
 */

import  {mdToHtml} from './markdown'

export function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        ( this._events[eventName] || (this._events[eventName] = [])).push(cb)
        this.el[0].addEventListener(eventName, cb)
    }

    mdeditor.prototype.trigger = function (eventName) {
        var md = this
        var params = Array.prototype.slice.call(arguments, 1)
        if (this._events[eventName]) {
            this._events[eventName].forEach(function (cb) {
                cb.apply(md, params)
            })
        }
    }
}


export function initEvent(md) {
    md._events = []
    md._lastRow = null
    md._value = []
    md.on('keydown', function keydown(e) {

        // enter
        if (e.keyCode === 13) {
            if (md.cursor.in('PRE')) {
                return
            }
            if (md.cursor.closest('[row]') && e.shiftKey) {
                return
            }
            e.preventDefault()
            md.addRow()
        }

    })
    md.on('input', function input() {

        var row = md.cursor.closestRow()
        if (row && (!row.hasAttr('md') || md.cursor.in('CODE'))) {
            var txt = row.text()
            if (row.hasAttr('code')) {
                txt = '```\n' + txt
                if (!/\n$/.test(txt)) {
                    txt += '\n'
                }
                txt += '```'
            }
            md._value[row.attr('row')] = txt
        }

        if (!md.el.children().length) {
            md.el.empty()
            md.addRow()
        }
    })

    md.on('dblclick', function dblclick() {

        if (md.cursor.in('CODE')) {
            var row = md.cursor.closestRow()
            if (row) {
                var rowNo = row.attr('row')
                row.html(md._value[rowNo])
                row.removeAttr('md')
                row.removeAttr('code')
            }
        }
    })

    md.on('rowchange', function rowchange(oldRow, newRow) {
        var oldRemoved = null

        if (oldRow) {
            var oldRowNo = oldRow.attr('row')
            if (!md.el.find('[row="' + oldRowNo + '"]')) {
                oldRemoved = oldRowNo
            } else if (!oldRow.hasAttr('md')) {
                var text = oldRow.text()
                if (text !== '') {
                    var mdHtml = mdToHtml(text)
                    var html = mdHtml.html.join('')
                    if (mdHtml.html.length == 1) {
                        oldRow.html(html)
                    } else {
                        var rows = this.htmlToRow(html, mdHtml.markdown)
                        oldRow.replaceWith(rows)
                    }
                    if (/^\<pre(.+\n?)+\<\/pre\>$/.test(html)) {
                        oldRow.attr('code', 1)
                    }
                    oldRow.attr('md', 1)
                }
            }
        }

        if (newRow && newRow.hasAttr('md') && !newRow.hasAttr('code')) {

            var newRowNo = newRow.attr('row')
            var newRowTxt = md._value[newRowNo]
            newRowTxt = newRowTxt ? newRowTxt : ''
            if (oldRemoved) {
                newRowTxt += md._value[oldRemoved]
                md._value[oldRemoved] = ''
            }

            newRow.text(newRowTxt)
            newRow.removeAttr('md')
            md.cursor.set(newRow[0], newRowTxt.length)
        }

    })
    document.addEventListener('selectionchange', function selectionchange() {
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow()

            if (row) {
                if (md._lastRow && md._lastRow.attr('row') !== row.attr('row')) {
                    md.trigger('rowchange', md._lastRow, row)
                } else if (!md._lastRow) {
                    md.trigger('rowchange', md._lastRow, row)
                }
            } else if (md._lastRow) {   // 离开编辑器
                md.trigger('rowchange', md._lastRow)
            }
            md._lastRow = row
        }


    })
}
