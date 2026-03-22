import { classCatalog, resolveClassId } from "@bertinis-vault/data-engine";

export const defaultUpstreamClassesPath =
  process.env.BERTINIS_5E_UPSTREAM_CLASSES_PATH ?? "/classes";

type ClassDatasetItem = {
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
  const candidates = [record.classes, record.class, record.results, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export function normalizeUpstreamClassesPayload(payload: unknown) {
  const items = pickArrayPayload(payload)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const label = String(record.name ?? record.class ?? record.title ?? "").trim();

      if (!label) {
        return undefined;
      }

      return {
        id: resolveClassId(label),
        label,
      };
    })
    .filter((entry): entry is ClassDatasetItem => Boolean(entry));

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    items,
  };
}

export function buildHybridClassesDataset(upstreamItems: ClassDatasetItem[]) {
  const merged = new Map<string, ClassDatasetItem>();

  for (const entry of classCatalog) {
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
      mode: "hybrid-classes",
      upstream: "5etools-render",
    },
    items: Array.from(merged.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
  };
}
