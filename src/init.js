import el from './el'

import {initEvent}  from './events'

export function initMixin(mdeditor) {
    mdeditor.prototype._init = function (id, options) {


        if (id) {
            this.el = el(id)
            this.el.attr('contenteditable', true)
            this.addRow();
            initEvent(this)
        }

        this.options = options

    }
    mdeditor.prototype._init.prototype = mdeditor.prototype
}

