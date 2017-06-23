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
    md.on('input', function () {
        var row = md.cursor.closest('[row]')
        if (row && (!row.hasAttribute('md') || md.cursor.in('CODE'))) {
            var txt = row.textContent
            if (row.hasAttribute('code')) {
                txt = '```\n' + txt
                if (!/\n$/.test(txt)) {
                    txt += '\n'
                }
                txt += '```'
            }
            md._value[row.getAttribute('row')] = txt
        }

        if (!md.el.children().length) {
            md.el.empty()
            md.addRow()
        }
    })

    md.on('dblclick', function dblclick(e) {

        if (md.cursor.in('CODE')) {
            var row = md.cursor.closest('[row]')
            if (row) {
                var rowNo = row.getAttribute('row')
                row.innerHTML = md._value[rowNo]
                row.removeAttribute('md')
                row.removeAttribute('code')
            }
        }
    })

    md.on('rowchange', function rowchange(oldRow, newRow) {
        if (oldRow && !oldRow.hasAttribute('md')) {
            var text = oldRow.textContent
            if (text !== '') {

                var html = mdToHtml(text).join('')
                oldRow.innerHTML = html
                if (/^\<pre(.+\n?)+\<\/pre\>$/.test(html)) {
                    oldRow.setAttribute('code', 1)
                }
                oldRow.setAttribute('md', 1)
            }
        }

        if (newRow && newRow.hasAttribute('md') && !newRow.hasAttribute('code')) {
            var rowNo = newRow.getAttribute('row')
            newRow.innerHTML = md._value[rowNo]
            newRow.removeAttribute('md')
            md.cursor.set(newRow, md._value[rowNo].length)
        }

    })
    document.addEventListener('selectionchange', function selectionchange() {
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow()

            if (row) {
                if (md._lastRow && md._lastRow.getAttribute('row') !== row.getAttribute('row')) {
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
