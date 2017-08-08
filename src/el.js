/**
 * Created by qinsx on 2017/6/13.
 */

import  {createElement} from './util'

function el(selector) {
    if (typeof selector === 'string') {
        this[0] = document.querySelector(selector)
    } else if (selector instanceof HTMLElement) {
        this[0] = selector
    }
}
el.prototype.insertAfter = function () {
    var brother = createElement.apply(null, arguments)
    this[0].parentNode.insertBefore(brother, this[0].nextSibling)
    return brother
}
el.prototype.insertBefore = function () {
    var brother = createElement.apply(null, arguments)
    this[0].parentNode.insertBefore(brother, this[0])
    return brother
}

el.prototype.prepend = function () {
    var child = createElement.apply(null, arguments)
    this[0].insertBefore(child, this[0].firstChild)
    return child
}

el.prototype.append = function (node) {
    var child = (node instanceof Text || node instanceof HTMLElement) ? node : createElement.apply(null, arguments)
    this[0].appendChild(child)
    return child
}
el.prototype.empty = function () {
    this[0].innerHTML = ''
}
el.prototype.children = function () {
    return this[0].childNodes
}
el.prototype.text = function (text) {
    if (text === undefined) {
        return this[0].innerText
    }
    this[0].innerText = text
}
el.prototype.html = function (html) {
    if (html === undefined) {
        return this[0].innerHTML
    }
    this[0].innerHTML = html;
}
el.prototype.find = function (selector) {
    var found = this[0].querySelector(selector)
    return found ? new el(found) : found
}
el.prototype.hasAttr = function (attrName) {
    return this[0].hasAttribute(attrName)
}
el.prototype.removeAttr = function (attrName) {
    return this[0].removeAttribute(attrName)
}
el.prototype.attr = function (attrName, attrVal) {
    if (attrVal !== undefined) {
        return this[0].setAttribute(attrName, attrVal)
    }
    return this[0].getAttribute(attrName)
}

el.prototype.attr = function (name, value) {
    if (value === undefined) {
        return this[0].getAttribute(name)
    }
    this[0].setAttribute(name, value)
}
el.prototype.replaceWith = function (nodes) {
    for (var i = 0; i < nodes.length; i++) {
        this[0].parentNode.insertBefore(nodes[i], this[0])
    }
    this[0].remove()
}


export default el
