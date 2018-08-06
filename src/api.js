/* @flow */
import {mdToTree, mdToHtml} from './markdown'


export default function apiMixin(mdeditor: Class<Mdeditor>) {


    mdeditor.prototype.getMarkdown = function (): string {
        return this.elm.innerText
    }

    mdeditor.prototype.getHtml = function (): string {
        return mdToHtml(this.getMarkdown())
    }

    mdeditor.prototype.setMarkdown = function (markdown: string) {
        let tree = mdToTree(markdown)
        let html = ''
        for (let i = 0, j = tree.length; i < j; i++) {
            let item = tree[i]
            html += `<div row="${this._rowNo++}" class="${item.tag}">${(item.md || '').replace(/\n/g, '<br>')}</div>`
        }
        this.elm.innerHTML = html
    }

    mdeditor.prototype.insertMarkdown = function (markdown: string) {
        document.execCommand('insertText', false, markdown)
    }
}
