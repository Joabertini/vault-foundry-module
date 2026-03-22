import {
  armorCatalog,
  resolveArmorId,
  resolveWeaponId,
  weaponCatalog,
} from "@bertinis-vault/data-engine";

export const defaultUpstreamEquipmentPath =
  process.env.BERTINIS_5E_UPSTREAM_EQUIPMENT_PATH ?? "/items";

type ArmorDatasetItem = {
  id: string;
  label: string;
  armorFormula: string | undefined;
  grantsShieldBonus: boolean | undefined;
};

type WeaponDatasetItem = {
  id: string;
  label: string;
  damage: string | undefined;
  damageType: string | undefined;
  attackType: string | undefined;
};

function withOptionalProps<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function pickArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates = [record.items, record.item, record.results];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function readLabel(record: Record<string, unknown>) {
  return String(record.name ?? record.item ?? record.title ?? "").trim();
}

function classifyItem(record: Record<string, unknown>) {
  const typeLabel = String(
    record.type ?? record.itemType ?? record.category ?? record.gearCategory ?? "",
  ).toLowerCase();
  const label = readLabel(record).toLowerCase();

  if (typeLabel.includes("armor") || typeLabel.includes("shield") || label.includes("armor")) {
    return "armor";
  }

  if (
    typeLabel.includes("weapon") ||
    typeLabel.includes("simple") ||
    typeLabel.includes("martial") ||
    label.includes("bow") ||
    label.includes("sword") ||
    label.includes("dagger") ||
    label.includes("mace")
  ) {
    return "weapon";
  }

  return "other";
}

function normalizeArmorFormula(record: Record<string, unknown>) {
  const direct = record.armorFormula ?? record.acFormula ?? record.ac;

  if (typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  if (typeof direct === "number") {
    return String(direct);
  }

  return undefined;
}

function normalizeWeaponDamage(record: Record<string, unknown>) {
  const damage = asRecord(record.damage);

  if (damage) {
    const dice = String(damage.dice ?? "").trim();
    const type = String(damage.type ?? damage.damageType ?? "").trim().toLowerCase();

    return {
      damage: dice || undefined,
      damageType: type || undefined,
    };
  }

  return {
    damage: typeof record.damage === "string" ? record.damage.trim() || undefined : undefined,
    damageType:
      typeof record.damageType === "string"
        ? record.damageType.trim().toLowerCase() || undefined
        : undefined,
  };
}

export function normalizeUpstreamEquipmentPayload(payload: unknown) {
  const armor: ArmorDatasetItem[] = [];
  const weapons: WeaponDatasetItem[] = [];

  for (const entry of pickArrayPayload(payload)) {
    const record = asRecord(entry);

    if (!record) {
      continue;
    }

    const label = readLabel(record);

    if (!label) {
      continue;
    }

    const kind = classifyItem(record);

    if (kind === "armor") {
      armor.push(
        withOptionalProps({
          id: resolveArmorId(label),
          label,
          armorFormula: normalizeArmorFormula(record),
          grantsShieldBonus:
            label.toLowerCase().includes("shield") ||
            String(record.type ?? "").toLowerCase().includes("shield"),
        }),
      );
      continue;
    }

    if (kind === "weapon") {
      const damage = normalizeWeaponDamage(record);
      weapons.push(
        withOptionalProps({
          id: resolveWeaponId(label),
          label,
          damage: damage.damage,
          damageType: damage.damageType,
          attackType: String(
            record.attackType ?? record.rangeType ?? "",
          ).toLowerCase().includes("range")
            ? "ranged"
            : "melee",
        }),
      );
    }
  }

  return {
    source: {
      mode: "upstream-normalized",
      upstream: "5etools-render",
    },
    armor,
    weapons,
  };
}

export function buildHybridEquipmentDataset(
  upstreamPayload: Pick<ReturnType<typeof normalizeUpstreamEquipmentPayload>, "armor" | "weapons">,
) {
  const mergedArmor = new Map<string, ArmorDatasetItem>();
  const mergedWeapons = new Map<string, WeaponDatasetItem>();

  for (const entry of armorCatalog) {
    mergedArmor.set(entry.id, {
      id: entry.id,
      label: entry.label,
      armorFormula: entry.armorFormula,
      grantsShieldBonus: Boolean(entry.grantsShieldBonus),
    });
  }

  for (const entry of weaponCatalog) {
    mergedWeapons.set(entry.id, {
      id: entry.id,
      label: entry.label,
      damage: entry.damage,
      damageType: entry.damageType,
      attackType: entry.attackType,
    });
  }

  for (const entry of upstreamPayload.armor) {
    const current = mergedArmor.get(entry.id);
    mergedArmor.set(
      entry.id,
      withOptionalProps({
        id: entry.id,
        label: entry.label || current?.label || entry.id,
        armorFormula: entry.armorFormula ?? current?.armorFormula,
        grantsShieldBonus: entry.grantsShieldBonus ?? current?.grantsShieldBonus,
      }),
    );
  }

  for (const entry of upstreamPayload.weapons) {
    const current = mergedWeapons.get(entry.id);
    mergedWeapons.set(
      entry.id,
      withOptionalProps({
        id: entry.id,
        label: entry.label || current?.label || entry.id,
        damage: entry.damage ?? current?.damage,
        damageType: entry.damageType ?? current?.damageType,
        attackType: entry.attackType ?? current?.attackType,
      }),
    );
  }

  return {
    source: {
      mode: "hybrid-equipment",
      upstream: "5etools-render",
    },
    armor: Array.from(mergedArmor.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
    weapons: Array.from(mergedWeapons.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    ),
  };
}
