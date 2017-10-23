// @flow
/**
 * Created by qinsx on 2017/6/13.
 */
import {
    isTextNode,
    createElement
} from './util'
import {
    treeToHtml
} from './markdown'

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
        var curRow = this.cursor.closestRow()


        if (!cursorNode) { // 在没光标的情况下添加行
            newRow = this.el.append(newRowData)


        } else if (!cursorNode.nextSibling && cursorNode.textContent.length === offset) { // 光标在行尾时，在当前行后添加
            newRow = curRow.insertAfter(newRowData)

        } else if (!cursorNode.previousSibling && offset === 0) { // 光标在行首时，在当前行前添加
            newRow = curRow.insertBefore(newRowData)

        } else { // 光标在段落中间
            var rowText = curRow.text()
            while (cursorNode.previousSibling) {
                offset += cursorNode.previousSibling.textContent.length
                cursorNode = cursorNode.previousSibling
            }
            curRow.text(rowText.slice(0, offset))
            newRowData[1].innerHTML = null
            newRowData[1].text = rowText.slice(offset)
            newRow = curRow.insertAfter(newRowData)
        }

        this.cursor.set(newRow, 0) // 设置光标到行首
        this._rowNo++
    }

    /**
     * 将markdown解析成的html，转换成符合编辑器的行，保证每一行只有一个类型（p、pre、ul、li等）
     * @param html 由mdToHtml返回的html数组
     * @returns {Array}
     */
    mdeditor.prototype.htmlToRow = function (tree: Array < MdTree > , firstRowNo) {
        var rows = []

        for (var i = 0; i < tree.length; i++) {

            var rowNo = ((i == 0 && firstRowNo) ? firstRowNo : this._rowNo++)

            var divConfig = {
                attrs: {
                    row: rowNo,
                    class: tree[i].tag
                }
            }

            if (tree[i].tag === 'pre') {
                divConfig.innerHTML = tree[i].md // < 和 > 被转码，用 text() 将不能正常显示 < 和 >
            } else {
                divConfig.text = tree[i].md
            }

            rows.push(createElement(['div', divConfig]))
            this._value[rowNo] = tree[i].md
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
