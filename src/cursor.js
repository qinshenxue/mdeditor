const def = Object.defineProperty


function Cursor(editor) {

    this.editor = editor

    this.path = []

    def(this, 'selection', {
        get: function () {
            return window.getSelection()
        }
    })
    // 鼠标所在的 dom 节点
    def(this, 'node', {
        get: function () {
            if (this._inside()) {
                return this.selection.baseNode
            }
            return null

        }
    })
    def(this, 'offset', {
        get: function () {
            return this.selection.baseOffset
        }
    })

}

/**
 * 鼠标是否在绑定的编辑器内
 * @returns {boolean}
 * @private
 */
Cursor.prototype._inside = function () {
    var node = this.selection.baseNode
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
    return match
}

/**
 * 查找光标所在的行
 * @returns {el}
 */
Cursor.prototype.closestRow = function () {
    return this.closest('[row]')
}

// /**
//  * 光标是否在node中
//  * @param nodeName HTMLElement nodeName，全大写
//  * @returns {boolean}
//  */
// Cursor.prototype.in = function (nodeName) {
//     if (this._inside()) {
//         var _path = this.path
//         var i = _path.length
//         while (i--) {
//             if (_path[i].nodeName === nodeName) {
//                 return true
//             }
//         }
//         return false
//     }
//     return false
// }

/**
 * 判断光标是否在行末
 * @returns {boolean}
 */
Cursor.prototype.isAtEnd = function () {
    const row = this.closestRow()
    if (row) {
        const childNodes = row.childNodes
        const childCount = childNodes.length
        if (childCount) {
            const lastChild = childNodes[childCount - 1]
            if (/\n/.test(this.node.nodeValue)) {
                return false
            } else {
                return lastChild.isEqualNode(this.node) && this.offset === lastChild.nodeValue.length
            }
        } else {
            return false
        }
    }
    return false
}

/**
 * 设定光标位置
 * @param node 光标所在的节点
 * @param offset 光标偏移长度
 */
Cursor.prototype.set = function (node, offset) {
    var selection = window.getSelection()
    var range = document.createRange()
    if (node instanceof Text && typeof offset !== 'number') {
        offset = node.nodeValue.length
        range.setStart(node, offset)
    } else if (node instanceof HTMLBRElement) {
        range.setStart(node, 0)
    }
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
}

export default Cursor
