import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { API_BASE_URL } from '../config';
import { startPolling } from '../lib/resourcePolling';
import { createResourceStore } from '../lib/resourceStore';
const store = createResourceStore(async path => {
  // Explicit, client-only fault injection for the isolated PR preview.
  // This does not change the backend or affect other users or production.
  const diagnostic = new URLSearchParams(location.search);
  if (location.hostname.includes('-git-') && diagnostic.get('diagnostics') === '1' && diagnostic.get('sidebarFailure') === 'news' && path === '/api/news-headlines') {
    throw Error('Simulated news failure (preview diagnostics).');
  }
  const response = await fetch(`${API_BASE_URL}${path}`, { signal: AbortSignal.timeout(path.startsWith('/api/research-report') ? 45000 : 15000) });
  if (!response.ok) throw Error(`Request failed (${response.status}). Please retry.`);
  return response.json();
});
export function useResource<T>(path: string, ttl = 60000, enabled = true) {
  const subscribe = useCallback((fn: () => void) => store.subscribe(path, fn), [path]);
  const read = useCallback(() => store.read<T>(path), [path]);
  const state = useSyncExternalStore(subscribe, read);
  useEffect(() => {
    if (!enabled) return;
    const delay = () => {
      const status = store.read<{ status?: string }>(path).data?.status;
      return status === 'pending' || status === 'refreshing' ? 5000 : ttl;
    };
    const polling = startPolling(() => store.refresh(path, delay()), delay, {
      visible: () => !document.hidden,
      schedule: (fn, ms) => window.setTimeout(fn, ms), cancel: id => window.clearTimeout(id),
    });
    document.addEventListener('visibilitychange', polling.trigger);
    window.addEventListener('online', polling.trigger);
    return () => { polling.stop(); document.removeEventListener('visibilitychange', polling.trigger); window.removeEventListener('online', polling.trigger); };
  }, [path, ttl, enabled]);
  return { ...state, refresh: () => store.refresh(path, ttl, true) };
}
