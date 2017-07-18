/**
 * Created by qinsx on 2017/6/13.
 */

import { mdToHtml } from './markdown'

export function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        (this._events[eventName] || (this._events[eventName] = [])).push(cb)
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


/**
 * 绑定事件
 * @param md
 */
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
            if (row.attr('type') == 'pre' && row.hasAttr('md')) {
                console.log(txt)
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

    md.on('blur', function blur() {
        md.trigger('rowchange', md._lastRow)
        md._lastRow = null
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
                    if (mdHtml.length == 1) {
                        oldRow.html(mdHtml[0].html.join(''))
                        oldRow.attr('type', mdHtml[0].type)
                    } else {
                        var rows = this.htmlToRow(mdHtml)
                        oldRow.replaceWith(rows)
                    }
                    oldRow.attr('md', 1)
                }
            }
        }

        if (newRow && newRow.hasAttr('md') && !(newRow.attr('type') == 'pre')) {

            var newRowNo = newRow.attr('row')
            var newRowTxt = md._value[newRowNo]
            newRowTxt = newRowTxt ? newRowTxt : ''
            if (oldRemoved && md._value[oldRemoved]) {
                newRowTxt += md._value[oldRemoved]
                md._value[oldRemoved] = ''
            }

            newRow.text(newRowTxt)
            newRow.removeAttr('md')
            md.cursor.set(newRow[0], newRowTxt.length)
        }

    })
    document.addEventListener('selectionchange', function selectionchange() {
        // 目前仅支持非选择区域
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow()
            if (row) {
                if (md._lastRow && md._lastRow.attr('row') !== row.attr('row')) {  // 光标所在行和之前行号不相等才触发rowchange
                    md.trigger('rowchange', md._lastRow, row)
                } else if (!md._lastRow) {  // 首次换行
                    md.trigger('rowchange', md._lastRow, row)
                }
            } else if (md._lastRow) {   // 离开编辑器，但是仍然触发了selectionchange，说明光标仍然在当前页面上
                md.trigger('rowchange', md._lastRow)
            }
            md._lastRow = row
        }
    })
}
