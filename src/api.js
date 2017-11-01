import {
    mdToTree,
    mdToHtml
} from './markdown'

/**
 * 实例可用api
 * @param mdeditor
 */
export function apiMixin(mdeditor) {


    /**
     * 返回markdown
     * @returns {Array}
     */
    mdeditor.prototype.getMarkdown = function () {

        var rows = this.el.children()
        var markdown = ''
        for (var i = 0; i < rows.length; i++) {
            markdown += rows[i].textContent + '\n\n'  // 用 innerText 会导致记录 _history 有空值情况
        }
        return markdown
    }

    /**
     * 返回html
     * @returns {Array}
     */
    mdeditor.prototype.getHtml = function () {
        return mdToHtml(this.getMarkdown())
    }

    /**
     * 初始化markdown值，markdown转成html
     * @param markdown
     */
    mdeditor.prototype.setMarkdown = function (markdown) {
        // 初始化行号
        this._rowNo = 0
        this._value = []
        this.el.empty()
        if (typeof markdown === 'string' && markdown.trim()) {
            var tree = mdToTree(markdown)
            var rows = this.htmlToRow(tree)
            var me = this
            rows.forEach(function (row) {
                me.el.append(row)
            })
        } else {
            this.el.append(['div', {
                attrs: {
                    'row': this._rowNo++
                },
                innerHTML: '<br>'
            }])
        }


    }

    mdeditor.prototype.insertMarkdown = function (markdown) {
        var row = this.cursor.closestRow();
        if (row) {
            var txt = row.text()
            var offset = this.cursor.offset
            row.text(txt.slice(0, offset) + markdown + txt.slice(offset))
        }
    }
}
