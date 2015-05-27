[![Build Status](https://travis-ci.org/saikobee/tc.js.svg?branch=master)](https://travis-ci.org/saikobee/tc.js)
[![Dependency Status](https://david-dm.org/username/repo.svg)](https://david-dm.org/saikobee/tc.js)

# Purpose

`TC` is a runtime type checker for JavaScript.

# Installation

`npm install -g saikobee/tc.js`

If you want to use TC in a browser environment, try bundling it with
[Browserify](http://browserify.org).

# Warning

The API here is not final. The name is also not final. I don't intend to put
this on npm until I've come up with a better name.

# TODO

- Type "and":
```javascript
// Needs example use case...
```
- Better error messages
  Maybe something like `T.tcName` falling back to `T.name`
- Solidified API for type checkers

Type "or":

```javascript
var NOrS = TC.Or([TC.Number, TC.String])
var add = TC()
    .Takes([NOrS, NOrS])
    .Returns(TC.String)
    .By(function(a, b) { return a + b })
```

`TC.Integer`, `TC.Real`...

`TC.Struct`:

```javascript
var TPoint = TC.Struct({
    x: TC.Number,
    y: TC.Number,
})
var pointAdd = TC()
    .Takes([TPoint, TPoint])
    .Returns(TPoint)
    .By(function(p1, p2) {
        return {
            x: p1.x + p2.x,
            y: p2.y + p2.y,
        }
    })
```

Also you should be able to specify a function as a type like:

```javascript
TC.Function([T1, T2, ...Tn], T)
```

...and that will wrap the argument with `TC.wrap`, or if it's already been
wrapped, throw if it has been wrapped with a different signature.

# Example

```javascript
var TC = require('tc');

var add = TC()
    .Takes([TC.Number, TC.Number])
    .Returns(TC.Number)
    .By(function(a, b) { return a + b; });

add(3, 2);   // => 5
add(3, 'x'); // => Error "wrong argument type"
add();       // => Error "wrong number of arguments"

var getName = TC()
    .Takes([TC.Object(TC.Any)])
    .Returns(TC.String)
    .By(function(obj) { return obj.name; });

getName({ name: 'Brian' }); // => 'Brian'
getName({ name: null });    // => Error "wrong return type"

// NOTE: `TC.wrap(ts, t, f)` is shorthand for `TC().Takes(ts).Returns(t).By(f)`
var max = TC.wrap([TC.Number, TC.Number], TC.Number, Math.max);
max(3, 2); // => 3
max();     // => Error "wrong number of arguments"
```

# Usage

## `TC()`

`TC()` takes no arguments and returns a builder object with three methods:
`Takes`, `Returns`, and `By`. Returns an immutable TC object.

### `TC().Takes([T1, T2, T3, ..., Tn])`

`Takes` takes an array of types. These correspond to the types of the parameters
to the function specified in `By`. Returns a new TC object with the parameter
type constraints specified

### `TC().Returns(T)`

`Returns` takes a type which is the return type of the function specified in
`By`. Returns a new TC object with the return type constraint specified.

### `TC().By(f)`

`By` takes a function. Returns a function which is wrapped using the type
constraints specified in `Takes` and `Returns`.

## `TC.wrap(parameterTypes, returnType, theFunction)`

Wraps the function with the type constraints specified. Equivalent to
`TC().Takes(parameterTypes).Returns(returnType).By(theFunction)`.

## Type Constraints

The following are type constraints are to be used as arguments to `.Takes`,
`.Returns`, or the first two arguments of `TC.Wrap`.

### `TC.Number`

Checks for `typeof x === "number"`.

### `TC.String`

Checks for `typeof x === "string"`.

### `TC.Void`

Checks for `x === null || x === undefined`.

### `TC.Date`

Checks for `x instanceof Date`.

### `TC.Nonzero`

Checks `TC.Number(x)` and also asserts `x !== 0`.

### `TC.Any`

Performs no check on `x`. Always passes.

### `TC.Array(T)`

Checks that each item in `x` satisfies the type constraint `T`. Does not respect
sparse arrays.

### `TC.Object(T)`

Checks that each property in `x` satisfies the type constraint `T`. Only checks
own properties.
