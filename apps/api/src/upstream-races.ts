import { raceCatalog, resolveRaceId } from "@bertinis-vault/data-engine";

export const defaultUpstreamRacesPath =
  process.env.BERTINIS_5E_UPSTREAM_RACES_PATH ?? "/races";

type RaceDatasetItem = {
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
  const candidates = [record.races, record.race, record.results, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function normalizeUpstreamRacesPayload(payload: unknown) {
  const items = pickArrayPayload(payload)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const label = String(record.name ?? record.race ?? record.title ?? "").trim();

      if (!label) {
        return undefined;
      }

      return {
        id: resolveRaceId(label),
        label,
      };
    })
    .filter((entry): entry is RaceDatasetItem => Boolean(entry));

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    items,
  };
}

export function buildHybridRacesDataset(upstreamItems: RaceDatasetItem[]) {
  const merged = new Map<string, RaceDatasetItem>();

  for (const entry of raceCatalog) {
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
      mode: "hybrid-races",
      upstream: "5etools-render",
    },
    items: Array.from(merged.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
  };
}
