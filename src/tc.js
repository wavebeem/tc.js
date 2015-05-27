var H = require('./helpers')

function TC(self) {
    self = self || Object.freeze({})
    function Takes(types) {
        return TC(H.overlay(self, '_takes', types))
    }
    function Returns(type) {
        return TC(H.overlay(self, '_returns', type))
    }
    function By(f) {
        return TC.wrap(self._takes, self._returns, f)
    }
    return {
        Takes: Takes,
        Returns: Returns,
        By: By,
    }
}

function assertType(p, t) {
    if (!p) {
        throw new Error("not a(n) " + t)
    }
    return true
}

TC.Number = function(x) {
    return assertType(typeof x === "number", "Number")
}

TC.String = function(x) {
    return assertType(typeof x === "string", "String")
}

// TC.Function = function(x) {
//     return assertType(typeof x === "function", "Function")
// }

TC.Boolean = function(x) {
    return assertType(typeof x === "boolean", "Boolean")
}

TC.Undefined = function(x) {
    return assertType(x === undefined, "Undefined")
}

TC.Null = function(x) {
    return assertType(x === null, "Null")
}

TC.Or = function(ts) {
    return function(x) {
        var ok = ts.some(function(t) { return t(x) })
        return assertType(ok, "Or<" + ts.map(H.show).join(', ') + ">")
    }
}

TC.And = function(ts) {
    return function(x) {
        var ok = ts.every(function(t) { return t(x) })
        return assertType(ok, "And<" + ts.map(H.show).join(', ') + ">")
    }
}

TC.Optional = function(t) {
    return TC.Or([TC.Undefined, t])
}

TC.Void = TC.Or([TC.Null, TC.Undefined])

TC.Date = function(x) {
    return assertType(x instanceof Date, "Date")
}

TC.Type = function(x) {
    return assertType(typeof x === 'function', "Type")
}

TC.Nonzero = TC.And([TC.Number, function(x) {
    return assertType(x !== 0, "Nonzero")
}])

TC.Integer = TC.And([TC.Number, function(x) {
    return assertType(Math.floor(x) === x, "Integer")
}])

TC.Natural = TC.And([TC.Integer, function(x) {
    return assertType(x >= 0, "Natural")
}])

TC.Map = function(t) {
    return function(x) {
        var ok = Object
            .keys(x)
            .every(H.safePredicate(function(k) { return t(x[k]) }))
        return assertType(ok, "Map<" + H.show(t) + ">")
    }
}

TC.Object = function(o) {
    o = Object.freeze(o)
    return function(x) {
        // TODO: Assert all types in `o` are valid in `x`
        return true
    }
}

TC.Any = function(x) {
    return true
}

TC.Array = function(t) {
    return function(x) {
        // Make a non-sparse copy of the array.
        x = [].concat.apply([], x)
        var ok = x.every(H.safePredicate(t))
        return assertType(ok, "Array<" + H.show(t) + ">")
    }
}

TC.Tuple = function(ts) {
    return function(xs) {
        var ok = xs
            && xs.length === ts.length
            && H.zipWith(H.throwOnFalse(H.call), ts, xs)
        return assertType(ok, "Tuple<" + ts.map(H.show).join(', ') + ">")
    }
}

TC.wrap = function(ts, t, f) {
    if (!TC.Array(TC.Type)(ts)) {
        throw new Error("TC-wrapped function did not specify input types")
    }
    if (!TC.Type(t)) {
        throw new Error("TC-wrapped function did not specify output type")
    }
    return function() {
        var args = H.toArray(arguments)
        if (args.length !== ts.length) {
            throw new Error("incorrect argument count")
        }
        H.zipWith(H.throwOnFalse(H.call), ts, args)
        var x = f.apply(null, arguments)
        H.throwOnFalse(t)(x)
        return x
    }
}

module.exports = Object.freeze(TC)
