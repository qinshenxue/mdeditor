/**
 * Created by qinsx on 2017/6/13.
 */
import {setCursor} from './util'

var row = 0

export function mixin(mdeditor) {
    mdeditor.prototype.addRow = function () {
        row++;
        var appended = this.el.append(['div', {
            attrs: {
                'row': row
            },
            innerHTML: '<br>'
        }])
        setCursor(appended, 1)
    }
}