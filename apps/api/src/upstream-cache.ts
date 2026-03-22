type CacheEntry = {
  expiresAt: number;
  payload: unknown;
};

export function createUpstreamCache(ttlMs = 1000 * 60 * 5) {
  const store = new Map<string, CacheEntry>();

  return {
    get(key: string) {
      const entry = store.get(key);

      if (!entry) {
        return undefined;
      }

      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }

      return entry.payload;
    },
    set(key: string, payload: unknown) {
      store.set(key, {
        payload,
        expiresAt: Date.now() + ttlMs,
      });
    },
    stats() {
      return {
        size: store.size,
        ttlMs,
      };
    },
  };
}
