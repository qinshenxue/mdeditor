/**
 * Created by qinsx on 2017/6/13.
 */


import {initMixin} from './init'
import {eventsMixin} from './events'
import {initGlobalApi} from './global'
import {mixin} from './mixin'
function mdeditor(options) {
    return new mdeditor.prototype._init(options)
}
initGlobalApi(mdeditor)
initMixin(mdeditor)

eventsMixin(mdeditor)

mixin(mdeditor)

export default  mdeditor