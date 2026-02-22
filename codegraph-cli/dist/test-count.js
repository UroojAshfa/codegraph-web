"use strict";
// test-count.ts
function topLevel() { }
const arrow = () => { };
class MyClass {
    method() { }
}
function outer() {
    function inner() { } // Nested - does parser catch this?
}
const callback = setTimeout(() => { }, 100); // Anonymous - caught?
