import el from './el'

import {initEvent}  from './events'
import {initRow}  from './row'
import cursor from './cursor'

export function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {

        var md = this
        if (id) {
            this.el = el(id)
            this.el.attr('contenteditable', true)
            initRow(md)
            initEvent(md)
            md.addRow()
            this.cursor = new cursor(this.el[0])
        }

        this.options = options

    }
    mdeditor.prototype._init.prototype = mdeditor.prototype
}

