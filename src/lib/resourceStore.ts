export type ResourceState<T> = { data?: T; error?: string; loading: boolean; updatedAt?: number };
type Entry = { state: ResourceState<unknown>; listeners: Set<() => void>; pending?: Promise<void>; retryAt: number; failures: number; usedAt: number };
// Framework-independent so caching, expiry, and race handling can be tested without a browser.
export function createResourceStore(load: (url: string) => Promise<unknown>, now = Date.now, limit = 100) {
  const entries = new Map<string, Entry>();
  function entry(url: string) {
    let value = entries.get(url);
    if (!value) {
      if (entries.size >= limit) {
        const victim = [...entries].filter(([, e]) => !e.pending && !e.listeners.size).sort((a,b) => a[1].usedAt-b[1].usedAt)[0];
        if (victim) entries.delete(victim[0]);
      }
      value = { state: { loading: false }, listeners: new Set(), retryAt: 0, failures: 0, usedAt: now() };
      entries.set(url, value);
    }
    value.usedAt = now();
    return value;
  }
  function publish(e: Entry, state: ResourceState<unknown>) { e.state = state; e.listeners.forEach(fn => fn()); }
  return {
    read<T>(url: string) { return entry(url).state as ResourceState<T>; },
    subscribe(url: string, fn: () => void) { const e = entry(url); e.listeners.add(fn); return () => { e.listeners.delete(fn); }; },
    async refresh(url: string, ttl: number, force = false) {
      const e = entry(url);
      if (e.pending) return e.pending;
      if (!force && (now() < e.retryAt || (e.state.updatedAt !== undefined && now() - e.state.updatedAt < ttl))) return;
      publish(e, { ...e.state, loading: true });
      e.pending = Promise.resolve().then(() => load(url)).then(data => {
        e.failures = 0; e.retryAt = 0;
        publish(e, { data, loading: false, updatedAt: now() });
      }).catch(error => {
        e.retryAt = now() + Math.min(300000, 30000 * 2 ** e.failures++);
        publish(e, { ...e.state, loading: false, error: error instanceof Error ? error.message : 'Request failed' });
      }).finally(() => { e.pending = undefined; });
      return e.pending;
    },
  };
}
