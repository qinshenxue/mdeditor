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
    def(this, 'at', {
        get: function () {
            return me._inside()
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

cursor.prototype.set = function () {
}
cursor.prototype.closest = function () {
    if (this._inside()) {
        return false
    }
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
    } else {
        return false
    }
}
cursor.prototype.moveTo = function () {
}

cursor.prototype.offset = function () {
}

export default cursor
