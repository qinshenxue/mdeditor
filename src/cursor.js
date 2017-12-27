/**
 * Created by qinsx on 2017/6/14.
 */

var def = Object.defineProperty

import el from './el'

function Cursor(editor) {

    this.editor = editor

    var me = this
    this.path = []

    def(this, 'sel', {
        get: function () {
            return window.getSelection()
        }
    })
    // 鼠标所在的 dom 节点
    def(this, 'node', {
        get: function () {
            /* if (me.sel.type === 'Range') {
             return me.sel.baseNode
             }*/
            if (this.inside()) {
                return me.sel.baseNode
            }
            return null

        }
    })
    def(this, 'offset', {
        get: function () {
            return me.sel.baseOffset
        }
    })

}
/**
 * 鼠标是否在绑定的编辑器内
 * @returns {boolean}
 * @private
 */
Cursor.prototype._inside = function () {
    var node = this.sel.baseNode
    var _path = [node]
    while (node && !node.isEqualNode(this.editor)) {
        node = node.parentNode
        _path.push(node)
    }
    this.path = _path
    return !!node && node.isEqualNode(this.editor)
}
/**
 * 向上查找符合selector的节点
 * @param selector css选择器
 * @returns {*}
 */
Cursor.prototype.closest = function (selector) {
    var match = null
    if (this._inside()) {
        this.path.some(function (p) {
            if (p.matches && p.matches(selector)) {
                match = p
                return true
            }
        })
    }
    return match ? new el(match) : match
}

/**
 * 查找光标所在的行
 * @returns {el}
 */
Cursor.prototype.closestRow = function () {
    return this.closest('[row]')
}

/**
 * 光标是否在node中
 * @param nodeName HTMLElement nodeName，全大写
 * @returns {boolean}
 */
Cursor.prototype.in = function (nodeName) {
    if (this._inside()) {
        var _path = this.path
        var i = _path.length
        while (i--) {
            if (_path[i].nodeName === nodeName) {
                return true
            }
        }
        return false
    }
    return false
}

/**
 * 设定光标位置
 * @param node 光标所在的节点
 * @param offset 光标偏移长度
 */
Cursor.prototype.set = function (node, offset) {
    var elm = node
    if (node instanceof el) {
        elm = node[0]
    }
    var isTxtNode = node instanceof Text
    var selection = window.getSelection()
    var range = document.createRange()
    if (offset === undefined) {
        offset = isTxtNode ? node.nodeValue.length : elm.textContent.length
    }
    range.setStart(isTxtNode ? node : elm.childNodes[0], offset)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
}

export default Cursor
