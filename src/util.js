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


export function parseHTML(string) {
    const context = document.implementation.createHTMLDocument();

    // Set the base href for the created document so any parsed elements with URLs
    // are based on the document's URL
    const base = context.createElement('base');
    base.href = document.location.href;
    context.head.appendChild(base);

    context.body.innerHTML = string;
    return context.body.children;
}

export function createElement() {

    var elms = []
    var args = Array.prototype.slice.call(arguments)
    args.forEach(function (item) {
        var elm = document.createElement(item[0])
        var elmData = item[1]
        if (elmData) {
            if (elmData.attrs) {
                for (var attr in elmData.attrs) {
                    elm.setAttribute(attr, elmData.attrs[attr])
                }
            }
            if (elmData.innerHTML) {
                elm.innerHTML = elmData.innerHTML
            }
        }
        elms.push(elm)
    })
    if (args.length == 1) return elms[0]
    return elms
}
