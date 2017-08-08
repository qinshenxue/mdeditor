/**
 * Created by qinsx on 2017/6/13.
 */


import {initMixin} from './init'
import {eventsMixin} from './events'
import {initGlobalApi} from './global'
import {rowMixin} from './row'
import {apiMixin} from './api'
function mdeditor(id, options) {
    this._init(id, options)
    return this
}
initGlobalApi(mdeditor)
initMixin(mdeditor)
eventsMixin(mdeditor)
rowMixin(mdeditor)
apiMixin(mdeditor)
export default  mdeditor
