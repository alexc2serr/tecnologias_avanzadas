/**
 * greeter.mjs — an ES module.
 *
 * ES modules are the JavaScript standard. They are resolved statically,
 * which is what allows tooling to tree-shake and type-check them.
 * The .mjs extension tells Node.js to treat this file as ESM even when
 * the nearest package.json does not say "type": "module".
 */

export function greet(name) {
  return `Hello, ${name}!`;
}

export function farewell(name) {
  return `Goodbye, ${name}.`;
}

// A module can also have one default export:
export default { greet, farewell };
