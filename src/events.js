/**
 * Created by qinsx on 2017/6/13.
 */

import {
    mdToTree
} from './markdown'

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
    md._keyCodes = {
        enter: 13,
        backspace: 8,
        z: 90
    }
    md._history = []

    md.on('keydown', function keydown(e) {

        // 按 enter，但是没有按 shift
        if (e.keyCode === md._keyCodes.enter && !e.shiftKey) {
            e.preventDefault()
            md.addRow()
        } else if (e.keyCode === md._keyCodes.backspace && !md.el.text()) { // 8：backspace 编辑器没有内容时，阻止删除子节点
            e.preventDefault()
        } else if (e.keyCode === md._keyCodes.z && e.ctrlKey) {
            e.preventDefault()
            md._lastRow = null
            md._history.pop()

            if (md._history.length) {
                var pop = md._history.pop()
                if (pop) {
                    md.setMarkdown(pop)
                }
            } else {
                md.setMarkdown('')
            }
        }

    })


    md.on('blur', function blur() {
        md.trigger('rowchange', md._lastRow)
        md._lastRow = null
    })


    md.on('input', function input() {
        if (md._history.length > 100) {
            md._history.shift()
        }
        md._history.push(md.getMarkdown())
    })


    md.on('rowchange', function rowchange(oldRow) {

        if (oldRow) {

            var text = oldRow.text()
            var type = oldRow.attr('class')
            if (text !== '') {
                var tree = mdToTree(text)

                var rows = this.htmlToRow(tree, oldRow.attr('row'))
                if (rows.length === 1 && type && rows[0].className === type) {

                    oldRow.text(rows[0].textContent)

                } else {
                    oldRow.replaceWith(rows)

                }

            }

        }
    })
    document.addEventListener('selectionchange', function selectionchange() {
        // 目前仅支持非选择区域
        if (window.getSelection().isCollapsed) {
            var row = md.cursor.closestRow()
            if (row) {
                if (md._lastRow && md._lastRow.attr('row') !== row.attr('row')) { // 光标所在行和之前行号不相等才触发rowchange
                    md.trigger('rowchange', md._lastRow, row)
                } else if (!md._lastRow) { // 首次换行
                    md.trigger('rowchange', md._lastRow, row)
                }
            } else if (md._lastRow) { // 离开编辑器，但是仍然触发了selectionchange，说明光标仍然在当前页面上
                md.trigger('rowchange', md._lastRow)
            }
            md._lastRow = row
        } else {
            md._lastRow = null
        }
    })
}
