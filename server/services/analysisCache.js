// Never hold quote responses behind an AI request. Coalesce enrichment and back off failures.
function createAnalysisCache({ ttl = 300000, retryMs = 30000, limit = 100, now = Date.now } = {}) {
  const entries = new Map();
  return function analysis(key, load) {
    let entry = entries.get(key);
    if (!entry) {
      if (entries.size >= limit) {
        const victim = [...entries].find(([, v]) => !v.pending);
        if (!victim) return { status: 'busy', data: null };
        entries.delete(victim[0]);
      }
      entry = { data: null, expires: 0, retryAt: 0, pending: false, failed: false };
      entries.set(key, entry);
    }
    if (!entry.pending && now() >= entry.expires && now() >= entry.retryAt) {
      entry.pending = true;
      Promise.resolve().then(load).then(data => {
        if (data == null) throw Error('Analysis unavailable');
        entry.data = data; entry.expires = now() + ttl; entry.failed = false;
      }).catch(() => { entry.failed = true; entry.retryAt = now() + retryMs; })
        .finally(() => { entry.pending = false; });
    }
    return { status: entry.pending ? (entry.data ? 'refreshing' : 'pending') : entry.failed ? 'unavailable' : 'ready', data: entry.data };
  };
}
module.exports = { createAnalysisCache };
