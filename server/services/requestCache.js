// Share concurrent requests; retain only successful results with bounded memory.
function createCache(limit, ttl) {
  const values = new Map();
  const pending = new Map();
  return async function cached(key, load) {
    const hit = values.get(key);
    if (hit && Date.now() - hit.time < ttl) return hit.data;
    if (pending.has(key)) return pending.get(key);
    const request = Promise.resolve().then(load).then(data => {
      values.delete(key);
      values.set(key, { data, time: Date.now() });
      while (values.size > limit) values.delete(values.keys().next().value);
      return data;
    }).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  };
}
module.exports = { createCache };
