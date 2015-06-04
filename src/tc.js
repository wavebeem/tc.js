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

TC.Number = function TC_Number(x) {
    return assertType(typeof x === "number", "Number")
}

TC.String = function TC_String(x) {
    return assertType(typeof x === "string", "String")
}

// TC.Function = function(x) {
//     return assertType(typeof x === "function", "Function")
// }

TC.Boolean = function TC_Boolean(x) {
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
        var ok = ts
            .map(H.safePredicate)
            .some(function(t) { return t(x) })
        return assertType(ok, "Or<" + ts.map(H.show).join(', ') + ">")
    }
}

TC.And = function(ts) {
    return function(x) {
        var ok = ts
            .map(H.safePredicate)
            .every(function(t) { return t(x) })
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
        return Object
            .keys(o)
            .every(function(k) {
                return o[k](x[k])
            })
    }
}

TC.Interface = function(name, o) {
    o = Object.freeze(o)
    function ret(x) {
        var sameKeys =
            Object.keys(o).sort().join('') ===
            Object.keys(x).sort().join('')
        var allTypesMatch = Object
            .keys(o)
            .every(function(k) {
                return o[k](x[k])
            })
        return sameKeys && allTypesMatch
    }
    ret.__tcName__ = name
    return ret
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
        ts.forEach(function(t, i) {
            var ok = true
            try {
                ok = t(args[i])
            } catch(e) {
                ok = false
            }
            if (ok === false) {
                throw new Error(
                    "argument " + (i + 1)
                    + " (" + H.show(args[i]) + ")"
                    + " was not a " + H.show(t)
                    + " in parameters (" + ts.map(H.show).join(', ') + ")"
                    + " of " + H.show(f)
                )
            }
        })
        var x = f.apply(this, arguments)
        H.throwOnFalse(t)(x)
        return x
    }
}

module.exports = Object.freeze(TC)
