var __TC_NAME__ = '-tcName'

function format(fmt, data) {
    var re = /\{([^{}]+)\}/g
    return fmt.replace(re, function(match, key) {
        return key in data
            ? data[key]
            : ''
    })
}

function zipWith(f, xs, ys) {
    var xys = []
    if (xs.length !== ys.length) {
        throw new Error(format(
            "can't zip over different sized lists: {xs} and {ys}",
            {xs: xs, ys: ys}
        ))
    }
    for (var i = 0, n = xs.length; i < n; i++) {
        xys.push(f(xs[i], ys[i]))
    }
    return xys
}

function eachKeyVal(f, obj) {
    for (var k in obj) {
        f(k, obj[k])
    }
}

function assign(dst, src) {
    for (var k in src) {
        dst[k] = src[k]
    }
}

function call(f, x) {
    return f(x)
}

function safePredicate(f) {
    return function() {
        try {
            return f.apply(this, arguments)
        } catch (e) {
            return false
        }
    }
}

function show(x) {
    if (x instanceof Array) {
        var s = x.map(basicShow).join(', ')
        return '[' + s + ']'
    }
    if (x && typeof x === 'object') {
        var s = Object
            .keys(x)
            .reduce(function(pairs, k) {
                var v = x[k]
                pairs.push(basicShow(k) + ': ' + basicShow(v))
                return pairs
            }, [])
            .join(', ')
        return '{' + s + '}'
    }
    return basicShow(x)
}

function basicShow(x) {
    if (typeof x === 'function') {
        return  x.name || x[__TC_NAME__] || '[Function]'
    }
    if (typeof x === 'string') {
        return JSON.stringify(x)
    }
    return '' + x
}

function newType(name, predicate) {
    return Object.defineProperty(
        safePredicate(predicate),
        __TC_NAME__,
        {value: name}
    )
}

module.exports = {
    format: format,
    zipWith: zipWith,
    call: call,
    safePredicate: safePredicate,
    show: show,
    newType: newType,
    eachKeyVal: eachKeyVal,
    assign: assign,
}
