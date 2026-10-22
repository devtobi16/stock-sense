// Lifecycle logic separated from React for deterministic clock/visibility tests.
export function startPolling(refresh: () => Promise<void>, delay: () => number, environment: {
  visible: () => boolean; schedule: (fn: () => void, ms: number) => number; cancel: (id: number) => void;
}) {
  let stopped = false, generation = 0, timer: number | undefined;
  const trigger = async () => {
    if (stopped) return;
    const current = ++generation;
    if (timer !== undefined) environment.cancel(timer);
    if (environment.visible()) await refresh();
    if (!stopped && current === generation) timer = environment.schedule(() => { void trigger(); }, delay());
  };
  void trigger();
  return { trigger, stop() { stopped = true; generation++; if (timer !== undefined) environment.cancel(timer); } };
}
