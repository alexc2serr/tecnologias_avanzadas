/**
 * greeter.js — a CommonJS module.
 *
 * CommonJS is the original Node.js module system. It is synchronous:
 * require() reads, evaluates and returns the module right there and then.
 */

function greet(name) {
  return `Hello, ${name}!`;
}

function farewell(name) {
  return `Goodbye, ${name}.`;
}

// Everything you want to expose goes on module.exports.
module.exports = { greet, farewell };
