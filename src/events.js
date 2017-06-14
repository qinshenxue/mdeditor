/**
 * Created by qinsx on 2017/6/13.
 */

import  {
    getCursorNode, closestRow, hasContent, setCursor,
    getCursorOffset
}  from './util'
import  {mdToHtml} from './markdown/index'

var events = {};
export function eventsMixin(mdeditor) {

    mdeditor.prototype.on = function (eventName, cb) {
        ( events[eventName] || (events[eventName] = [])).push(cb)
        this.el[0].addEventListener(eventName, cb)
    }

    mdeditor.prototype.trigger = function (eventName) {
        var md = this;
        var params = Array.prototype.slice.call(arguments, 1)
        if (events[eventName]) {
            events[eventName].forEach(function (cb) {
                cb.apply(md, params)
            })
        }
    }
}

var lastRow = null

export function initEvent(md) {
    md.on('keydown', function keydown(e) {
        if (e.keyCode === 13) {
            e.preventDefault()
            md.addRow()
        }
    })

    md.on('rowchange', function rowchange(oldRow, newRow) {
        //console.log(oldRow,newRow)
        if (oldRow && !oldRow.hasAttribute('md')) {
            var md = oldRow.textContent
            if (hasContent(md)) {
                var mdHtml = mdToHtml(md)
                oldRow.innerHTML = mdHtml.join('') + '<div style="display: none">' + md + '</div>'
                oldRow.setAttribute('md', 1)
            }
        }
        if (newRow && newRow.hasAttribute('md')) {
            newRow.innerHTML = newRow.lastChild.textContent
            newRow.removeAttribute('md')
            setCursor(newRow.childNodes[0], newRow.lastChild.textContent.length)
        }

    })
    document.addEventListener('selectionchange', function selectionchange() {
        var row = closestRow(getCursorNode(), md.el[0])
        console.log('row',row)
        console.log('last',lastRow)

        if (row) {
            if (lastRow && lastRow.getAttribute('row') !== row.getAttribute('row')) {
                md.trigger('rowchange', lastRow, row)
            } else if (!lastRow) {
                md.trigger('rowchange', lastRow, row)
            }
        } else if (lastRow) {   // 离开编辑器
            md.trigger('rowchange', lastRow)
        }
        lastRow = row
    })
}