import el from './el'

import {initEvent}  from './events'
import {initRow}  from './row'
import Cursor from './cursor'

export function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {

        var md = this
        if (id) {
            this.el = el(id)
            this.el.attr('contenteditable', true)
            this.cursor = new Cursor(this.el[0])
            initRow(md)
            initEvent(md)
            md.addRow()
        }

        this.options = options

    }
    mdeditor.prototype._init.prototype = mdeditor.prototype
}

