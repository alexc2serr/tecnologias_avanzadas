/**
 * 04-promisechaining.js — the same four steps as 02-callbackhell.js.
 *
 * Run it with:  node 04-promisechaining.js
 *
 * The key rule: whatever you RETURN from a .then() becomes the input of the
 * next .then(). Return a promise and the chain waits for it. Forget the
 * return and the chain moves on without the value — a classic bug.
 *
 * The code now grows downwards instead of rightwards, and there is one
 * error handler for the whole sequence instead of one per step.
 */

const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const findUser = (name) => delay(300, { id: 1, name });
const findOrdersOf = (user) => delay(300, [{ id: 'A-1', userId: user.id, total: 42 }]);
const findInvoiceOf = (order) => delay(300, { id: 'INV-7', orderId: order.id, paid: false });
const markAsPaid = (invoice) => delay(300, { ...invoice, paid: true });

findUser('Alice')
  .then((user) => findOrdersOf(user))
  .then((orders) => findInvoiceOf(orders[0]))
  .then((invoice) => markAsPaid(invoice))
  .then((paidInvoice) => console.log('done:', paidInvoice))
  .catch((err) => {
    console.error('the sequence failed:', err.message);
    process.exitCode = 1;
  });
