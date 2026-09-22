/**
 * 02-callbackhell.js — why callbacks do not scale.
 *
 * Run it with:  node 02-callbackhell.js
 *
 * Four steps that each depend on the previous one. Nothing here is wrong,
 * and that is the point: correct callback code still drifts rightwards, and
 * the error handling is repeated at every level.
 *
 * Compare this file with 04-promisechaining.js and 06-asyncawait.js, which
 * do exactly the same work.
 */

function findUser(name, callback) {
  setTimeout(() => callback(null, { id: 1, name }), 300);
}

function findOrdersOf(user, callback) {
  setTimeout(() => callback(null, [{ id: 'A-1', userId: user.id, total: 42 }]), 300);
}

function findInvoiceOf(order, callback) {
  setTimeout(() => callback(null, { id: 'INV-7', orderId: order.id, paid: false }), 300);
}

function markAsPaid(invoice, callback) {
  setTimeout(() => callback(null, { ...invoice, paid: true }), 300);
}

// The pyramid. Read it from the inside out — that is the problem.
findUser('Alice', (err, user) => {
  if (err) return console.error(err);

  findOrdersOf(user, (err, orders) => {
    if (err) return console.error(err);

    findInvoiceOf(orders[0], (err, invoice) => {
      if (err) return console.error(err);

      markAsPaid(invoice, (err, paidInvoice) => {
        if (err) return console.error(err);

        console.log('done:', paidInvoice);
      });
    });
  });
});
