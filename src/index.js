//@flow
import eventsMixin from './events'
import Cursor from './cursor'
import apiMixin from './api'
import {mdToTree} from './markdown'


function mdeditor(el: string, options?: Options) {

    const elm = document.querySelector(el)
    if (elm) {
        this.elm = elm // 编辑器dom
        this._rowNo = 0 // 行号
        elm.setAttribute('contenteditable', 'true')
        let tree = []
        if (options && options.markdown && (tree = mdToTree(options.markdown)).length) {
            let html = ''
            tree.forEach(item => {
                html += `<div row="${this._rowNo++}" class="${item.tag}">${item.md || ''}</div>`
            });
            elm.innerHTML = html
        } else {
            elm.innerHTML = `<div row="${this._rowNo++}"><br></div>`
        }
        this._initEvent()
        this.cursor = new Cursor(elm)
    }
    return this
}

eventsMixin(mdeditor)
apiMixin(mdeditor)

export default mdeditor
