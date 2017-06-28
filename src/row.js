/**
 * Created by qinsx on 2017/6/13.
 */
import  el from './el'
import {parseHTML, isTextNode, createElement}  from './util'

export function rowMixin(mdeditor) {


    mdeditor.prototype.addRow = function () {


        var offset = this.cursor.offset
        var newRow
        var newRowData = ['div', {
            attrs: {
                'row': this._rowNo
            },
            innerHTML: '<br>'
        }]

        var curRow = this.cursor.closestRow()

        // 计算offset
        var cursorNode = this.cursor.node
        if (isTextNode(cursorNode)) {
            //row = closestRow(txtNode, this.el[0])
            while (cursorNode.previousSibling) {
                offset += cursorNode.previousSibling.textContent.length
                cursorNode = cursorNode.previousSibling
            }
        }

        if (curRow) {
            var rowTxt = curRow.text()
            if (offset === 0 && rowTxt !== '') {
                newRow = curRow.insertBefore(newRowData)
            } else if (rowTxt === '') {
                newRow = curRow.insertAfter(newRowData)
            } else {
                var curRowTxt = rowTxt.slice(0, offset)
                curRow.text(curRowTxt)
                var newRowTxt = rowTxt.slice(offset)
                if (newRowTxt !== '') {
                    newRowData[1].innerHTML = newRowTxt
                }
                this._value[curRow.attr('row')] = curRowTxt
                this._value[this._rowNo] = newRowTxt
                newRow = curRow.insertAfter(newRowData)
            }

        } else if (offset === 0) {
            newRow = this.el.prepend(newRowData)
        }

        if (newRow) {
            this.cursor.set(newRow, 0)
            this._rowNo++
        }
    }

    mdeditor.prototype.html2Row = function (html, markdown) {
        var nodes = parseHTML(html)
        var rows = []
        var len = nodes.length
        for (var i = 0; i < len; i++) {
            var div = createElement(['div', {
                attrs: {
                    'row': this._rowNo,
                    'md': 1
                }
            }])
            div.appendChild(nodes[0])
            rows.push(div)
            this._value[this._rowNo] = markdown[i]
            this._rowNo++
        }
        return rows
    }

}

export function initRow(md) {
    md._rowNo = 0
}
