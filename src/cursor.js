/**
 * Created by qinsx on 2017/6/14.
 */

var def = Object.defineProperty

function cursor(editor) {

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
            return me.sel.focusNode
        }
    })
    def(this, 'offset', {
        get: function () {
            return me.sel.focusOffset
        }
    })

}

cursor.prototype._inside = function () {
    var focusNode = this.sel.focusNode
    var _path = [focusNode]
    while (focusNode && !focusNode.isEqualNode(this.editor)) {
        focusNode = focusNode.parentNode
        _path.push(focusNode)
    }
    this.path = _path
    return !!focusNode && focusNode.isEqualNode(this.editor)
}

cursor.prototype.closest = function (selector) {
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

cursor.prototype.closestRow = function () {
    return this.closest('[row]')
}

cursor.prototype.in = function (nodeName) {
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

cursor.prototype.set = function (node, offset) {
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


export default cursor
