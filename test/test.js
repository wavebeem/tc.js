var TC = require('../')
var assert = require('chai').assert

describe("tc.js", function() {
    describe("TC.Number()", function() {
        it("should assert its argument has typeof 'number'", function() {
            assert.strictEqual(TC.Number("5"), false)
            assert.strictEqual(TC.Number(5), true)
            assert.strictEqual(TC.Number(NaN), true)
        })
    })
    describe("TC()", function() {
        var add = TC()
            .Takes([TC.Number, TC.Number])
            .Returns(TC.Number)
            .By(function(a, b) { return a + b })
        var divide = TC()
            .Takes([TC.Number, TC.Nonzero])
            .Returns(TC.Number)
            .By(function(a, b) { return a / b })
        var sum = TC()
            .Takes([TC.Array(TC.Number)])
            .Returns(TC.Number)
            .By(function(xs) { return xs.reduce(add, 0) })
        // var myParseInt = TC()
        //     .Takes([TC.String, TC.Optional(TC.Natural)])
        //     .Returns(TC.Integer)
        //     .By(parseInt)
        var charCount = TC()
            .Takes([TC.String])
            .Returns(TC.Map(null, TC.Number))
            .By(function charCount(s) {
                return s
                    .split('')
                    .reduce(function(obj, c) {
                        obj[c] = 1 + (c in obj ? obj[c] : 0)
                        return obj
                    }, Object.create(null))
            })
        var TPerson = TC.Object(null, {
            name: TC.String,
            age: TC.Nonzero,
            nickname: TC.Optional(null, TC.String),
        })
        var personSummary = TC()
            .Takes([TPerson])
            .Returns(TC.String)
            .By(function personSummary(p) {
                return p.name
                    + (p.nickname ? ('"' + p.nickname + '"') : '')
                    + '(' + p.age + ')'
            })
        it("should check arity", function() {
            assert.throws(function() { add(1) })
            assert.throws(function() { sum([1, 2, "3"]) })
        })
        it("should check argument types", function() {
            assert.throws(function() { add(1, "2") })
            assert.throws(function() { sum([1, 2, "3"]) })
            assert.throws(function() { divide(1, 0) })
            assert.throws(function() { personSummary({}) })
            assert.doesNotThrow(function() {
                personSummary({
                    name: "Brian",
                    age: 25,
                })
            })
            assert.doesNotThrow(function() {
                personSummary({
                    name: "Potato",
                    age: 46,
                    nickname: "The Potato"
                })
            })
            // assert.doesNotThrow(function() { myParseInt('10', 16) })
        })
        it("should check return type", function() {
            assert.throws(function() { add(1, "2") })
            assert.throws(function() { sum([1, 2, "3"]) })
            assert.doesNotThrow(function() { charCount("a-bb-CCC-dddd") })
        })
        it("intermediate steps should be reusable", function() {
            var fromNumber = TC().Takes([TC.Number])
            var fromNumberToString = fromNumber.Returns(TC.String)
            var fromNumberToNumber = fromNumber.Returns(TC.Number)
            var toString = fromNumberToString.By(function(x) { return '' + x })
            var negate = fromNumberToNumber.By(function(x) { return -x })
            assert.doesNotThrow(function() { negate(4) })
            assert.doesNotThrow(function() { toString(4) })
            assert.throws(function() { negate("-x") })
            assert.throws(function() { toString([]) })
        })
    })
})
