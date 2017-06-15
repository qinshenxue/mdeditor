/**
 * Created by qinsx on 2017/6/13.
 */
import {
    setCursor, getCursorOffset, closestRow, getCursorNode,
    isTextNode
} from './util'
import  el from './el'

export function rowMixin(mdeditor) {


    mdeditor.prototype.addRow = function () {
        var txtNode = getCursorNode()


        var offset = getCursorOffset()
        var appended
        var appendNode = ['div', {
            attrs: {
                'row': this._rowNo
            },
            innerHTML: '<br>'
        }]


        var row
        if (isTextNode(txtNode)) {
            row = closestRow(txtNode, this.el[0])
            while (txtNode.previousSibling) {
                offset += txtNode.previousSibling.textContent.length
                txtNode = txtNode.previousSibling
            }
        }


        if (offset === 0) {
            appended = this.el.prepend(appendNode)
        } else if (row) {
            var rowTxt = row.textContent
            row.textContent = rowTxt.slice(0, offset)
            var newRowTxt = rowTxt.slice(offset)
            appendNode[1].innerHTML = newRowTxt === '' ? '<br>' : newRowTxt
            appended = el(row).insertAfter(appendNode)
        }
        if (appended) {
            setCursor(appended, 0)
            this._rowNo++
        }
    }
}

export function initRow(md) {
    md._rowNo = 0
}