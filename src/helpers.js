function zipWith(f, xs, ys) {
    var xys = []
    if (xs.length !== ys.length) {
        throw new Error(
            "can't zip over different sized lists: "
            + show(xs)
            + " and "
            + show(ys)
        )
    }
    for (var i = 0, n = xs.length; i < n; i++) {
        xys.push(f(xs[i], ys[i]))
    }
    return xys
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

function throwOnFalse(f) {
    return function() {
        var x = f.apply(this, arguments)
        if (x === false) {
            throw new Error("Oops!")
        }
        return x
    }
}

function overlay(o, k, v) {
    var o2 = Object.create(o)
    Object.defineProperty(o2, k, { value: v })
    return Object.freeze(o2)
}

function toArray(xs) {
    return Array.prototype.slice.call(xs)
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
        var n = x.name || x.__tcName__
        // return  n ? ('[Function: ' + n + ']') : '[Function]'
        return  n || '[Function]'
    }
    if (x === undefined) {
        return '' + x
    }
    return JSON.stringify(x)
}

module.exports = {
    zipWith: zipWith,
    call: call,
    safePredicate: safePredicate,
    throwOnFalse: throwOnFalse,
    overlay: overlay,
    toArray: toArray,
    show: show,
}
