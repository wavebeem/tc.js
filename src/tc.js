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

TC.Function = function(x) {
    return assertType(typeof x === "function", "Function")
}

TC.Boolean = function(x) {
    return assertType(typeof x === "boolean", "Boolean")
}

TC.Void = function(x) {
    return assertType(x === null || x === undefined, "Void")
}

TC.Date = function(x) {
    return assertType(x instanceof Date, "Date")
}

TC.Type = TC.Function

TC.Nonzero = function(x) {
    return TC.Number(x) && assertType(x !== 0, "")
}

TC.Object = function(t) {
    return function(x) {
        var ok = Object
            .keys(x)
            .every(H.safePredicate(function(k) { return t(x[k]) }))
        return assertType(ok, "Object<" + H.show(t) + ">")
    }
}

TC.Any = function(x) {
    return true
}

TC.Array = function(t) {
    return function(x) {
        // Make a non-sparse copy of the array.
        x = Array.prototype.concat.apply(Array.prototype, x)
        var ok = x.every(H.safePredicate(t))
        return assertType(ok, "Array<" + H.show(t) + ">")
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
