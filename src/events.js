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
        if (e.keyCode === 13) {
            if (md.cursor.in('PRE')) {
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
        var appendText = '';
        if (oldRow && !oldRow.hasAttr('md')) {
            var text = oldRow.text()
            if (text !== '') {
                var html = mdToHtml(text).join('')
                oldRow.html(html)
                if (/^\<pre(.+\n?)+\<\/pre\>$/.test(html)) {
                    oldRow.attr('code', 1)
                }
                oldRow.attr('md', 1)
            }
            var oldRowNo = oldRow.attr('row')
            if (!md.el.find('[row="' + oldRowNo + '"]') && md._value[oldRowNo]) {
                appendText = md._value[oldRowNo]
            }
        }

        if (newRow && newRow.hasAttr('md') && !newRow.hasAttr('code')) {
            var rowNo = newRow.attr('row')
            md._value[rowNo] += appendText
            newRow.html(md._value[rowNo])
            newRow.removeAttr('md')
            md.cursor.set(newRow[0], md._value[rowNo].length)
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
