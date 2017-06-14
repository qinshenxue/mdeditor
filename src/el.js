/**
 * Created by qinsx on 2017/6/13.
 */

function createElement() {

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


function el(selector) {
    this[0] = document.querySelector(selector)
}
el.prototype.insertAfter = function () {
    this[0].parentNode.insertBefore(createElement.apply(null, arguments), this[0].nextSibling)
}
el.prototype.insertBefore = function () {
    this[0].parentNode.insertBefore(createElement.apply(null, arguments), this[0])
}

el.prototype.prepend = function () {
    this[0].insertBefore(createElement.apply(null, arguments), this[0].firstChild)
}

el.prototype.append = function () {
    var child = createElement.apply(null, arguments)
    this[0].appendChild(child)
    return child
}

el.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this[0].getAttribute(name)
    }
    this[0].setAttribute(name, value)
}

export default function (selector) {
    return new el(selector)
}