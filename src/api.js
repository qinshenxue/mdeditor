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
}
