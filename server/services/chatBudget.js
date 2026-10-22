// A conservative per-process guard, not an account-wide/distributed quota.
// Provider rate limits remain authoritative across multiple function instances.
function createChatBudget({ limit = 6000, now = Date.now } = {}) {
  let active = false;
  let reservations = [];
  return {
    acquire(tokens) {
      const time = now();
      reservations = reservations.filter(r => time - r.time < 60000);
      if (active || reservations.reduce((n, r) => n + r.tokens, 0) + tokens > limit) return null;
      active = true;
      reservations.push({ time, tokens });
      return () => { active = false; };
    }
  };
}
module.exports = { createChatBudget };
