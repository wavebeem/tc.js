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

TC.newType = H.newType

function assertType(p, t) {
    if (!p) {
        throw new Error("not a(n) " + t)
    }
    return true
}

function installType(name, predicate) {
    TC[name] = TC.newType('TC.' + name, predicate)
}

function showTypeParameters(s, ts) {
    return s + '<' + ts.map(H.show).join(', ') + '>'
}

H.eachKeyVal(installType, {
    Any: function(x) { return true },
    Number: function(x) { return typeof x === 'number' },
    String: function(x) { return typeof x === 'string' },
    Boolean: function(x) { return typeof x === 'boolean' },
    Type: function(x) { return typeof x === 'function' },
    Date: function(x) { return x instanceof Date },
    Undefined: function(x) { return x === undefined },
    Null: function(x) { return x === null },
})

H.assign(TC, {
    Or: function(name, ts) {
        name = name || showTypeParameters('TC.Or', ts)
        return TC.newType(name, function f(x) {
            return ts.some(function(t) { return t(x) })
        })
    },
    And: function(name, ts) {
        name = name || showTypeParameters('TC.And', ts)
        return TC.newType(name, function(x) {
            return ts.every(function(t) { return t(x) })
        })
    },
})

TC.Optional = function(name, t) { return TC.Or(name, [TC.Undefined, t]) }

H.assign(TC, {
    Void: TC.Or('TC.Void', [TC.Undefined, TC.Null]),
    Nonzero: TC.And('TC.Nonzero', [TC.Number, function(x) {
        return x !== 0
    }]),
    Integer: TC.And('TC.Integer', [TC.Number, function(x) {
        return Math.floor(x) === x
    }]),
})

TC.Natural = TC.And('TC.Natural', [TC.Integer, function(x) {
    return x >= 0
}])

TC.Map = function(name, t) {
    name = name || showTypeParameters('TC.Map', [t])
    return TC.newType(name, function(x) {
        return Object
            .keys(x)
            .every(function(k) { return t(x[k]) })
    })
}

TC.Object = function(name, o) {
    o = Object.freeze(o)
    var ks = Object.keys(o)
    name = name || showTypeParameters('TC.Object', ks)
    return TC.newType(name, function(x) {
        return ks.every(function(k) { return o[k](x[k]) })
    })
}

TC.Interface = function(name, o) {
    o = Object.freeze(o)
    var ks = Object.keys(o)
    name = name || showTypeParameters('TC.Interface', ks)
    return TC.newType(name, function(x) {
        return H.sameKeys(o, x) &&
            ks.every(function(k) { return o[k](x[k]) })
    })
}

TC.Array = function(name, t) {
    name = name || showTypeParameters('TC.Array', [t])
    return TC.newType(name, function(x) {
        // Make a non-sparse copy of the array.
        x = [].concat.apply([], x)
        return x.every(t)
    })
}

TC.Tuple = function(name, ts) {
    ts = Object.freeze(ts)
    name = name || showTypeParameters('TC.Tuple', ts)
    return TC.newType(name, function(xs) {
        return xs
            && xs.length === ts.length
            && H.zipWith(H.call, ts, xs)
    })
}

TC.wrap = function(ts, t, f) {
    if (!TC.Array(null, TC.Type)(ts)) {
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
        if (!t(x)) {
            throw new Error("return type failed: " + t)
        }
        return x
    }
}

module.exports = Object.freeze(TC)
