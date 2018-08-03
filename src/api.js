import {
    mdToTree,
    mdToHtml
} from './markdown'

/**
 * 实例可用api
 * @param mdeditor
 */
export default function apiMixin(mdeditor) {


    /**
     * 返回markdown
     * @returns {Array}
     */
    mdeditor.prototype.getMarkdown = function () {

        return this.elm.innerText
    }

    /**
     * 返回html
     * @returns {Array}
     */
    mdeditor.prototype.getHtml = function () {
        return mdToHtml(this.getMarkdown())
    }

    mdeditor.prototype.setMarkdown = function (markdown) {
        let tree = mdToTree(markdown)
        let html = ''
        tree.forEach(item => {
            html += `<div row="${this._rowNo++}" class="${item.tag}">${item.md.replace(/\n/g,'<br>')}</div>`
        });
        this.elm.innerHTML = html
    }

    /**
     * 插入 markdown
     * @param {String} markdown
     */
    mdeditor.prototype.insertMarkdown = function (markdown) {
        document.execCommand('insertText', false, markdown)
    }
}
