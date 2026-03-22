import { featCatalog, resolveFeatId } from "@bertinis-vault/data-engine";

export const defaultUpstreamFeatsPath =
  process.env.BERTINIS_5E_UPSTREAM_FEATS_PATH ?? "/feats";

type FeatDatasetItem = {
  id: string;
  label: string;
};

function pickArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.feats, record.feat, record.results, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function normalizeUpstreamFeatsPayload(payload: unknown) {
  const items = pickArrayPayload(payload)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const label = String(record.name ?? record.feat ?? record.title ?? "").trim();

      if (!label) {
        return undefined;
      }

      return {
        id: resolveFeatId(label),
        label,
      };
    })
    .filter((entry): entry is FeatDatasetItem => Boolean(entry));

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    items,
  };
}

export function buildHybridFeatsDataset(upstreamItems: FeatDatasetItem[]) {
  const merged = new Map<string, FeatDatasetItem>();

  for (const entry of featCatalog) {
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label,
    });
  }

  for (const entry of upstreamItems) {
    const current = merged.get(entry.id);
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label || current?.label || entry.id,
    });
  }

  return {
    source: {
      mode: "hybrid-feats",
      upstream: "5etools-render",
    },
    items: Array.from(merged.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
  };
}
