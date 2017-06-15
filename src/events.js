/**
 * Created by qinsx on 2017/6/13.
 */

import  {
    getCursorNode, closestRow, hasContent, setCursor,
    getCursorOffset
}  from './util'
import  {mdToHtml} from './markdown'

export function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        ( this._events[eventName] || (this._events[eventName] = [])).push(cb)
        this.el[0].addEventListener(eventName, cb)
    }

    mdeditor.prototype.trigger = function (eventName) {
        var md = this;
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
        if (!e.shiftKey && e.keyCode === 13) {
            e.preventDefault()
            md.addRow()
        }
    })
    md.on('input', function (e) {
        //console.log(md.el.children().length)
        if (!md.el.children().length) {
            md.el.empty()
            md.addRow()
        }
    })

    md.on('rowchange', function rowchange(oldRow, newRow) {
        //console.log(oldRow,newRow)
        if (oldRow && !oldRow.hasAttribute('md')) {
            var text = oldRow.textContent
            if (hasContent(text)) {
                md._value[oldRow.getAttribute('row')] = text
                var html = mdToHtml(text)
                oldRow.innerHTML = html.join('')
                oldRow.setAttribute('md', 1)
            }
        }
        if (newRow && newRow.hasAttribute('md')) {
            var rowNo = newRow.getAttribute('row')
            newRow.innerHTML = md._value[rowNo]
            newRow.removeAttribute('md')
            setCursor(newRow, md._value[rowNo].length)
        }

    })
    document.addEventListener('selectionchange', function selectionchange() {

        if (window.getSelection().isCollapsed) {
            var row = closestRow(getCursorNode(), md.el[0])

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