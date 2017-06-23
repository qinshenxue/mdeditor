/**
 * Created by qinsx on 2017/6/14.
 */

var def = Object.defineProperty

function Cursor(editor) {

    this.editor = editor

    var me = this
    this.path = []

    def(this, 'sel', {
        get: function () {
            return window.getSelection()
        }
    })
    def(this, 'node', {
        get: function () {
            if (me.sel.type === 'Range') {
                return me.sel.anchorNode
            }
            return me.sel.focusNode
        }
    })
    def(this, 'offset', {
        get: function () {
            return me.sel.focusOffset
        }
    })

}

Cursor.prototype._inside = function () {
    var node = this.node
    var _path = [node]
    while (node && !node.isEqualNode(this.editor)) {
        node = node.parentNode
        _path.push(node)
    }
    this.path = _path
    return !!node && node.isEqualNode(this.editor)
}

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

Cursor.prototype.closestRow = function () {
    return this.closest('[row]')
}

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

Cursor.prototype.set = function (node, offset) {
    var selection = window.getSelection()
    var range = document.createRange()
    if (offset === undefined) {
        offset = node.textContent.length
    }
    range.setStart(node.childNodes[0], offset)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
}


export default Cursor
