/**
 * Created by qinsx on 2017/6/13.
 */
import  el from './el'

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

        var cursorRow = this.cursor.closestRow()

        /*  var row
         if (isTextNode(txtNode)) {
         row = closestRow(txtNode, this.el[0])
         while (txtNode.previousSibling) {
         offset += txtNode.previousSibling.textContent.length
         txtNode = txtNode.previousSibling
         }
         }
         */

        if (cursorRow) {
            var rowTxt = cursorRow.textContent
            if (offset === 0 && rowTxt !== '') {
                newRow = el(cursorRow).insertBefore(newRowData)
            } else if (rowTxt === '') {
                newRow = el(cursorRow).insertAfter(newRowData)
            } else {
                cursorRow.textContent = rowTxt.slice(0, offset)
                var newRowTxt = rowTxt.slice(offset)
                if (newRowTxt !== '') {
                    newRowData[1].innerHTML = newRowTxt
                }
                newRow = el(cursorRow).insertAfter(newRowData)
            }

        } else if (offset === 0) {
            newRow = this.el.prepend(newRowData)
        }

        if (newRow) {
            this.cursor.set(newRow, 0)
            this._rowNo++
        }
    }
}

export function initRow(md) {
    md._rowNo = 0
}
