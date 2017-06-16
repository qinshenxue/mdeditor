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

export function hasContent(txt) {
    return !/^[\u200B\s]*$/.test(txt)
}

export function isTextNode(node) {
    return node && node.nodeName === '#text'
}
