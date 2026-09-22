/**
 * 06-asyncawait.js — the same four steps again, in the style you will use.
 *
 * Run it with:  node 06-asyncawait.js
 *
 * async/await is syntax over promises. Nothing new happens at runtime:
 *   - an async function always returns a promise
 *   - await pauses THAT function, not the thread
 *   - errors become ordinary exceptions, so try/catch works
 */

const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const findUser = (name) => delay(300, { id: 1, name });
const findOrdersOf = (user) => delay(300, [{ id: 'A-1', userId: user.id, total: 42 }]);
const findInvoiceOf = (order) => delay(300, { id: 'INV-7', orderId: order.id, paid: false });
const markAsPaid = (invoice) => delay(300, { ...invoice, paid: true });

async function settleInvoiceOf(name) {
  const user = await findUser(name);
  const orders = await findOrdersOf(user);
  const invoice = await findInvoiceOf(orders[0]);
  return markAsPaid(invoice);
}

async function main() {
  try {
    const paidInvoice = await settleInvoiceOf('Alice');
    console.log('done:', paidInvoice);
  } catch (err) {
    console.error('the sequence failed:', err.message);
    process.exitCode = 1;
  }
}

main();

/* A mistake worth making once, on purpose:
 *
 *   const a = await slowThing();   // 1 s
 *   const b = await otherThing();  // 1 s   -> total 2 s
 *
 * Those two do not depend on each other, so awaiting them one after the
 * other wastes a second. See 10-combinators.js for the fix.
 */
