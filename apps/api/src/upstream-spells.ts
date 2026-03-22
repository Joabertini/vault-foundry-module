import { resolveSpellId, spellCatalog } from "@bertinis-vault/data-engine";

export const defaultUpstreamSpellsPath =
  process.env.BERTINIS_5E_UPSTREAM_SPELLS_PATH ?? "/spells";

type SpellDatasetItem = {
  id: string;
  label: string;
  level: number;
};

function pickArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.spells, record.spell, record.results, record.items];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function parseLevel(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value));
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return 1;
    if (normalized === "cantrip" || normalized === "0") return 0;
    const parsed = Number.parseInt(normalized, 10);
    return Number.isNaN(parsed) ? 1 : Math.max(0, parsed);
  }

  return 1;
}

export function normalizeUpstreamSpellsPayload(payload: unknown) {
  const items = pickArrayPayload(payload)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return undefined;
      }

      const record = entry as Record<string, unknown>;
      const label = String(record.name ?? record.spell ?? record.title ?? "").trim();

      if (!label) {
        return undefined;
      }

      return {
        id: resolveSpellId(label),
        label,
        level: parseLevel(record.level ?? record.spellLevel),
      };
    })
    .filter((entry): entry is SpellDatasetItem => Boolean(entry));

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    cantrips: items.filter((entry) => entry.level === 0),
    spells: items.filter((entry) => entry.level > 0),
  };
}

export function buildHybridSpellsDataset(
  upstreamPayload: Pick<ReturnType<typeof normalizeUpstreamSpellsPayload>, "cantrips" | "spells">,
) {
  const merged = new Map<string, SpellDatasetItem>();

  for (const entry of spellCatalog) {
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label,
      level: entry.level,
    });
  }

  for (const entry of [...upstreamPayload.cantrips, ...upstreamPayload.spells]) {
    const current = merged.get(entry.id);
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label || current?.label || entry.id,
      level: entry.level ?? current?.level ?? 1,
    });
  }

  const items = Array.from(merged.values()).sort((left, right) =>
    left.label.localeCompare(right.label),
  );

  return {
    source: {
      mode: "hybrid-spells",
      upstream: "5etools-render",
    },
    cantrips: items.filter((entry) => entry.level === 0),
    spells: items.filter((entry) => entry.level > 0),
  };
}
