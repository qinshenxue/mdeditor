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
    return node instanceof Text
}


export function parseHTML(string) {
    const context = document.implementation.createHTMLDocument();

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
            if (elmData.text) {
                elm.innerText = elmData.text
            }
        }
        elms.push(elm)
    })
    if (args.length == 1) return elms[0]
    return elms
}
