// Opt-in, local-only diagnostics. No telemetry or chat contents leave the browser.
export function installPerformanceDiagnostics() {
  if (new URLSearchParams(location.search).get('diagnostics') !== '1') return;
  const output = document.createElement('output');
  output.setAttribute('aria-label', 'Performance diagnostics');
  output.style.cssText = 'position:fixed;bottom:0;left:0;z-index:9999;background:#111;color:#fff;padding:8px;font:12px monospace;max-width:100%;white-space:pre-wrap';
  document.body.append(output);
  let lcp = 0;
  const render = () => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const requests = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const api = requests.filter(entry => entry.name.includes('/api/')).slice(-6);
    output.textContent = `Browser diagnostics (ms) | TTFB ${Math.round(nav?.responseStart ?? 0)} | LCP ${Math.round(lcp)}\n` + api.map(entry => `${new URL(entry.name).pathname}: ${Math.round(entry.duration)}`).join(' | ');
  };
  if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
    new PerformanceObserver(list => { lcp = list.getEntries().at(-1)?.startTime ?? lcp; render(); }).observe({ type: 'largest-contentful-paint', buffered: true });
  }
  new PerformanceObserver(render).observe({ type: 'resource', buffered: true });
  window.addEventListener('load', render, { once: true });
  render();
}
