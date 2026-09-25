/**
 * lib/report.js — the boring part: turning summary rows into text.
 * Not the point of the session, so it lives here instead of on the projector.
 */

function formatReport(rows, { title = 'Readings report' } = {}) {
  const lines = [
    title,
    '='.repeat(title.length),
    '',
    'region      readings   avg battery   min battery',
    '-------------------------------------------------',
  ];

  for (const row of rows) {
    lines.push(
      row.region.padEnd(12) +
      String(row.readings).padStart(8) +
      String(Number(row.avg_battery).toFixed(1)).padStart(14) +
      String(row.min_battery).padStart(14),
    );
  }

  lines.push('', `generated at ${new Date().toISOString()}`, '');
  return lines.join('\n');
}

module.exports = { formatReport };
