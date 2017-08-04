import {mdToTree} from './markdown'

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
        var markdown = []
        for (var i = 0; i < rows.length; i++) {
            var rowNo = rows[i].getAttribute('row')
            if (rowNo) {
                markdown.push(this._value[rowNo])
            }
        }
        return markdown
    }

    /**
     * 返回html
     * @returns {Array}
     */
    mdeditor.prototype.getHtml = function () {
        var rows = this.el.children()
        var html = []
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].hasAttribute('md')) {
                html.push(rows[i].innerHTML)
            }
        }
        return html
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
        var tree = mdToTree(markdown)
        var rows = this.htmlToRow(tree)
        var me = this
        rows.forEach(function (row) {
            me.el.append(row)
        })
    }
}
