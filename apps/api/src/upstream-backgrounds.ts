import {
  backgroundCatalog,
  resolveBackgroundId,
  resolveFeatId,
} from "@bertinis-vault/data-engine";

export const defaultUpstreamBackgroundsPath =
  process.env.BERTINIS_5E_UPSTREAM_BACKGROUNDS_PATH ?? "/backgrounds";

type BackgroundDatasetItem = {
  id: string;
  label: string;
  source: string;
  grantedFeatIds: string[];
};

function pickArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.backgrounds, record.background, record.results, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeFeatIds(value: unknown): string[] {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  return values
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (entry && typeof entry === "object" && "name" in entry) {
        return String((entry as { name?: unknown }).name ?? "");
      }

      return "";
    })
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => resolveFeatId(entry));
}

export function normalizeUpstreamBackgroundsPayload(payload: unknown) {
  const items = pickArrayPayload(payload)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const label = String(record.name ?? record.background ?? record.title ?? "").trim();

      if (!label) {
        return undefined;
      }

      return {
        id: resolveBackgroundId(label),
        label,
        source: String(record.source ?? record.book ?? "upstream"),
        grantedFeatIds: normalizeFeatIds(
          record.feat ?? record.feats ?? record.grantedFeatIds,
        ),
      };
    })
    .filter((entry): entry is BackgroundDatasetItem => Boolean(entry));

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    items,
  };
}

export function buildHybridBackgroundsDataset(upstreamItems: BackgroundDatasetItem[]) {
  const merged = new Map<string, BackgroundDatasetItem>();

  for (const entry of backgroundCatalog) {
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label,
      source: entry.source,
      grantedFeatIds: entry.grantedFeatIds,
    });
  }

  for (const entry of upstreamItems) {
    const current = merged.get(entry.id);
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label || current?.label || entry.id,
      source: entry.source || current?.source || "upstream",
      grantedFeatIds: entry.grantedFeatIds.length
        ? entry.grantedFeatIds
        : current?.grantedFeatIds ?? [],
    });
  }

  return {
    source: {
      mode: "hybrid-backgrounds",
      upstream: "5etools-render",
    },
    items: Array.from(merged.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
  };
}
