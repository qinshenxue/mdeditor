// @flow
/**
 * Created by qinsx on 2017/6/13.
 */
import {isTextNode, createElement}  from './util'
import {treeToHtml}  from './markdown'

export function rowMixin(mdeditor) {


    /**
     * 给编辑器增加一行
     */
    mdeditor.prototype.addRow = function () {


        var offset = this.cursor.offset
        var newRow
        var newRowData = ['div', {
            attrs: {
                'row': this._rowNo
            },
            innerHTML: '<br>'
        }]


        // 计算offset（主要是用了shift换行输入的情况）
        var cursorNode = this.cursor.node
        if (isTextNode(cursorNode)) {
            while (cursorNode.previousSibling) {
                offset += cursorNode.previousSibling.textContent.length
                cursorNode = cursorNode.previousSibling
            }
        }
        var curRow = this.cursor.closestRow()

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
                //this._value[curRow.attr('row')] = curRowTxt
                //this._value[this._rowNo] = newRowTxt
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

    /**
     * 将markdown解析成的html，转换成符合编辑器的行，保证每一行只有一个类型（p、pre、ul、li等）
     * @param html 由mdToHtml返回的html数组
     * @returns {Array}
     */
    mdeditor.prototype.htmlToRow = function (tree: Array<MdTree>) {
        var rows = []
        for (var i = 0; i < tree.length; i++) {
            var div = createElement(['div', {
                attrs: {
                    'row': this._rowNo,
                    class: tree[i].tag
                },
                text: tree[i].md
            }])
            rows.push(div)
            this._value[this._rowNo] = tree[i].md
            this._rowNo++
        }
        return rows
    }

}

/**
 * 初始化mdeditor实例的行号为0
 * @param md mdeditor实例
 */
export function initRow(md) {
    md._rowNo = 0
}
