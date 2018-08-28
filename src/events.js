/* @flow */

import {
    mdToTree
} from './markdown'

function eventsMixin(mdeditor: Class<Mdeditor>) {

    mdeditor.prototype._initEvent = function () {


        const me = this
        const bind = this.elm.addEventListener


        /*  bind('keyup', function keydown(e) {

            // console.log(e.shiftKey)
             if (e.keyCode === 13 && !e.shiftKey) {

                 var row = me.cursor.closestRow()
                 row.setAttribute('class', '')
                 row.setAttribute('row', me._rowNo++)
             }

         }) */
        bind('paste', function paste(e) {
            e.preventDefault()
            var txt = e.clipboardData.getData('text/plain')
            var div = document.createElement('div')
            div.innerText = txt.replace(/\s+$/, '') // 移除末尾的换行
            document.execCommand("insertHTML", false, div.innerHTML.replace(/<br>/g, '\u000A'))
        })
        bind('keydown', function keydown(e) {
            if (e.keyCode === 13 && !e.shiftKey) {

                e.preventDefault()

                // if (row.textContent && me.cursor.node === row.childNodes[row.childNodes.length - 1] && me.cursor.node.length === me.cursor.offset) {
                if (me.cursor.isAtEnd()) {
                    document.execCommand("insertHTML", false, `<div row='${me._rowNo++}'></div>`)
                }
            } else if (e.keyCode === 8 && !me.elm.textContent) {
                e.preventDefault()
            }
        })

        bind('blur', setCls)

        this._lastRow = null

        function setCls() {
            if (me._lastRow) {
                var tree = mdToTree(me._lastRow.innerText)
                if (tree.length) {
                    var root = tree[0]
                    me._lastRow.setAttribute('class', root.tag)
                    if (root.attr) {
                        Object.keys(root.attr).forEach(function (key) {
                            if (root.attr && root.attr[key]) {
                                me._lastRow.setAttribute(key, root.attr[key])
                            }
                        })
                    }
                }
            }
        }

        document.addEventListener('selectionchange', function selectionchange() {

            if (window.getSelection().isCollapsed) {
                var row = me.cursor.closestRow()
                //  光标在编辑器内
                if (row) {
                    if (!me._lastRow && !row.textContent) {
                        // 选择区域，删除时，如果鼠标停留的行没有内容了，则清空之前加的CSS
                        row.setAttribute('class', '')
                    } else if (me._lastRow && me._lastRow.getAttribute('row') !== row.getAttribute('row')) {
                        // 行号发生变化计算才计算，提高性能
                        setCls()
                    }
                } else {
                    setCls()
                }

                me._lastRow = row
            } else {
                me._lastRow = null
            }
        })


    }
}


export default eventsMixin
