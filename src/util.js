/**
 * Created by qinsx on 2017/6/13.
 */

export function extend(source, dest) {
    var destKeys = Object.keys(dest)
    var i = destKeys.length
    while (i--) {
        source[destKeys[i]] = dest[destKeys[i]]
    }
}


export function setCursor(node, offset) {
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

export function getCursorOffset() {
    return window.getSelection().focusOffset
    /* if (!sel.focusNode) {
     return 0
     }
     var node = sel.focusNode.parentNode
     var nodeName = node.nodeName
     if (nodeName.match(/^H(\d)$/)) {
     offset += Number(RegExp.$1)
     } else if (nodeName.match(/^A$/)) {
     offset += 1
     }
     while (node.previousSibling) {
     node = node.previousSibling
     nodeName = node.nodeName
     if (nodeName === 'A') {
     offset += 4 + node.textContent.length + node.getAttribute('href').length
     } else if (nodeName === '#text') {
     offset += node.textContent.length
     }
     }
     return offset + 1*/
    // window.getSelection().focusOffset
}

export function closestRow(node, rootNode) {
    if (!node) {
        return
    }
    if (node.nodeName === '#text') {
        node = node.parentNode
    }
    while ('hasAttribute' in node && !node.hasAttribute('row')) {
        node = node.parentNode
    }
    if (node.parentNode && node.parentNode.isEqualNode(rootNode)) {
        return node
    }
    return null
}


export function getCursorNode() {
    return window.getSelection().focusNode
}

export function hasContent(txt) {
    return !/^[\u200B\s]*$/.test(txt)
}

export function isTextNode(node) {
    return node && node.nodeName === '#text'
}
