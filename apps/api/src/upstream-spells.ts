import { resolveSpellId, spellCatalog } from "@bertinis-vault/data-engine";

export const defaultUpstreamSpellsPath =
  process.env.BERTINIS_5E_UPSTREAM_SPELLS_PATH ?? "/spells";

type SpellDatasetItem = {
  id: string;
  label: string;
  level: number;
  classes: string[];
  school: string | null;
  summary: string;
  castingTimeLabel: string;
  rangeLabel: string;
  durationLabel: string;
  componentsLabel: string;
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

function pickString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function joinComponents(record: Record<string, unknown>) {
  const directArray = Array.isArray(record.components)
    ? record.components
    : Array.isArray(record.component)
      ? record.component
      : null;

  if (directArray) {
    return directArray
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean)
      .join(", ");
  }

  const flags = [
    record.v ? "V" : "",
    record.s ? "S" : "",
    record.m ? "M" : "",
  ].filter(Boolean);

  return flags.join(", ");
}

function parseClasses(record: Record<string, unknown>) {
  const directArray = Array.isArray(record.classes)
    ? record.classes
    : Array.isArray(record.classList)
      ? record.classList
      : null;

  if (!directArray) {
    return [];
  }

  return directArray
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim().toLowerCase();
      }

      if (entry && typeof entry === "object") {
        const candidate = entry as Record<string, unknown>;
        return pickString(candidate.id ?? candidate.name ?? candidate.class ?? "").toLowerCase();
      }

      return "";
    })
    .filter(Boolean);
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
        classes: parseClasses(record),
        school: pickString(record.school ?? record.schoolCode) || null,
        summary: pickString(record.summary ?? record.entries ?? record.description ?? record.desc),
        castingTimeLabel: pickString(
          record.castingTimeLabel ?? record.castingTime ?? record.time ?? record.activation,
        ),
        rangeLabel: pickString(record.rangeLabel ?? record.range),
        durationLabel: pickString(record.durationLabel ?? record.duration),
        componentsLabel: joinComponents(record),
      };
    })
    .filter((entry): entry is SpellDatasetItem => entry !== undefined);

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
      classes: entry.classes ?? [],
      school: entry.school ?? null,
      summary: entry.summary ?? "",
      castingTimeLabel: entry.castingTime?.label ?? "",
      rangeLabel: entry.range?.label ?? "",
      durationLabel: entry.duration?.label ?? "",
      componentsLabel: entry.components?.join(", ") ?? "",
    });
  }

  for (const entry of [...upstreamPayload.cantrips, ...upstreamPayload.spells]) {
    const current = merged.get(entry.id);
    merged.set(entry.id, {
      id: entry.id,
      label: entry.label || current?.label || entry.id,
      level: entry.level ?? current?.level ?? 1,
      classes: entry.classes?.length ? entry.classes : current?.classes ?? [],
      school: entry.school || current?.school || null,
      summary: entry.summary || current?.summary || "",
      castingTimeLabel: entry.castingTimeLabel || current?.castingTimeLabel || "",
      rangeLabel: entry.rangeLabel || current?.rangeLabel || "",
      durationLabel: entry.durationLabel || current?.durationLabel || "",
      componentsLabel: entry.componentsLabel || current?.componentsLabel || "",
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
