/**
 * lib/api.js — a fake remote service, promise style.
 *
 * Used in block 4, where we enrich each device with data that only the
 * "manufacturer API" has. Nothing here touches the network: it waits and
 * then answers, so the session works in a classroom with no internet.
 *
 * Every call takes about 250 ms. Device 'dev-404' is unknown and rejects.
 * Device 'dev-slow' never answers in under three seconds — that is the one
 * you point an AbortSignal at.
 */

const PROFILES = {
  'dev-101': { deviceId: 'dev-101', model: 'SF-Kids-3',   firmware: '4.2.1' },
  'dev-102': { deviceId: 'dev-102', model: 'SF-Fleet-X',  firmware: '3.9.0' },
  'dev-103': { deviceId: 'dev-103', model: 'SF-Pet-Mini', firmware: '4.0.7' },
  'dev-104': { deviceId: 'dev-104', model: 'SF-Bike-2',   firmware: '4.2.1' },
  'dev-105': { deviceId: 'dev-105', model: 'SF-Case-1',   firmware: '2.8.4' },
  'dev-106': { deviceId: 'dev-106', model: 'SF-Fleet-X',  firmware: '3.9.0' },
};

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });

async function fetchDeviceProfile(deviceId, { signal } = {}) {
  await sleep(deviceId === 'dev-slow' ? 3000 : 250, signal);

  const profile = PROFILES[deviceId];
  if (!profile) {
    const error = new Error(`no profile for ${deviceId}`);
    error.code = 'ENOPROFILE';
    throw error;
  }
  return { ...profile };
}

module.exports = { fetchDeviceProfile, PROFILES };
