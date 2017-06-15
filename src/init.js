import el from './el'

import {initEvent}  from './events'
import {initRow}  from './row'

export function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {

        var md = this
        if (id) {
            this.el = el(id)
            this.el.attr('contenteditable', true)
            initRow(md)
            initEvent(md)
            md.addRow()
        }

        this.options = options

    }
    mdeditor.prototype._init.prototype = mdeditor.prototype
}

