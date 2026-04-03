// ============================================================
// Bertini's Vault - UUID Resolver
// Resolves canonical slugs/names against Foundry compendiums
// before Actor.create() so the importer can reuse live docs.
// ============================================================

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/-]/g, "")
    .trim()
    .replace(/[\s/]+/g, "-");
}

function duplicateWithoutMeta(documentData) {
  const clone = foundry.utils.deepClone(documentData);
  delete clone._id;
  delete clone._stats;
  delete clone.sort;
  return clone;
}

function mergeResolvedClassItem(originalItem, resolvedData) {
  const nextItem = foundry.utils.deepClone(resolvedData);
  const originalSystem = originalItem.system || {};
  const nextSystem = nextItem.system || {};

  nextItem.system = foundry.utils.mergeObject(
    nextSystem,
    {
      levels: originalSystem.levels ?? nextSystem.levels ?? 1,
      hd: originalSystem.hd ?? nextSystem.hd,
      spellcasting: foundry.utils.mergeObject(
        nextSystem.spellcasting || {},
        originalSystem.spellcasting || {},
        { inplace: false, recursive: true },
      ),
      primaryAbility: originalSystem.primaryAbility ?? nextSystem.primaryAbility,
    },
    { inplace: false, recursive: true },
  );

  return nextItem;
}

async function getPackIndex(pack) {
  try {
    return await pack.getIndex({ fields: ["name", "system.identifier"] });
  } catch (_error) {
    return await pack.getIndex();
  }
}

function matchIndexEntry(index, lookupValue) {
  const lookupSlug = slugify(lookupValue);
  return index.find((entry) => {
    const identifier = entry.system?.identifier ? slugify(entry.system.identifier) : "";
    const nameSlug = slugify(entry.name);
    return identifier === lookupSlug || nameSlug === lookupSlug;
  }) ?? null;
}

async function resolveFromPack(packId, lookupValue) {
  const pack = game.packs.get(packId);
  if (!pack) return null;

  const index = await getPackIndex(pack);
  const entry = matchIndexEntry(index, lookupValue);
  if (!entry) return null;

  const document = await pack.getDocument(entry._id);
  if (!document) return null;

  return {
    uuid: document.uuid,
    data: duplicateWithoutMeta(document.toObject()),
    packId,
    name: document.name,
  };
}

async function resolveAcrossItemPacks(lookupValue) {
  for (const pack of game.packs) {
    if (pack.documentName !== "Item") continue;

    const index = await getPackIndex(pack);
    const entry = matchIndexEntry(index, lookupValue);
    if (!entry) continue;

    const document = await pack.getDocument(entry._id);
    if (!document) continue;

    return {
      uuid: document.uuid,
      data: duplicateWithoutMeta(document.toObject()),
      packId: pack.collection,
      name: document.name,
    };
  }

  return null;
}

function stripCreateOnlyMeta(actorCreateData) {
  const sanitized = foundry.utils.deepClone(actorCreateData);

  delete sanitized._id;
  delete sanitized._stats;
  delete sanitized.sort;

  sanitized.items = (sanitized.items || []).map((item) => {
    const nextItem = foundry.utils.deepClone(item);
    delete nextItem._id;
    delete nextItem._stats;
    delete nextItem.sort;
    return nextItem;
  });

  return sanitized;
}

export async function resolveActorCreateData(actorCreateData) {
  const sanitized = stripCreateOnlyMeta(actorCreateData);
  const resolution = {
    race: null,
    background: null,
    originalClass: null,
    resolvedClassItems: [],
    unresolvedClassItems: [],
    resolvedSpellItems: [],
    unresolvedSpellItems: [],
  };

  const detailTargets = [
    ["race", "dnd5e.races"],
    ["background", "dnd5e.backgrounds"],
    ["originalClass", "dnd5e.classes"],
  ];

  for (const [detailKey, packId] of detailTargets) {
    const currentValue = sanitized.system?.details?.[detailKey];
    if (!currentValue) {
      sanitized.system.details[detailKey] = null;
      continue;
    }

    const resolved = await resolveFromPack(packId, currentValue);
    if (resolved) {
      sanitized.system.details[detailKey] = resolved.uuid;
      resolution[detailKey] = resolved;
    } else {
      sanitized.system.details[detailKey] = null;
    }
  }

  const nextItems = [];
  for (const item of sanitized.items || []) {
    if (item.type === "class") {
      const lookupValue = item.system?.identifier || item.name;
      const resolved = await resolveFromPack("dnd5e.classes", lookupValue);

      if (resolved) {
        nextItems.push(mergeResolvedClassItem(item, resolved.data));
        resolution.resolvedClassItems.push({
          requested: item.name,
          resolvedName: resolved.name,
          packId: resolved.packId,
          uuid: resolved.uuid,
        });
      } else {
        nextItems.push(item);
        resolution.unresolvedClassItems.push(item.name);
      }
      continue;
    }

    if (item.type !== "spell") {
      nextItems.push(item);
      continue;
    }

    const lookupValue = item.system?.identifier || item.name;
    const resolved = (await resolveFromPack("dnd5e.spells", lookupValue)) ?? (await resolveAcrossItemPacks(lookupValue));

    if (resolved) {
      nextItems.push(resolved.data);
      resolution.resolvedSpellItems.push({
        requested: item.name,
        resolvedName: resolved.name,
        packId: resolved.packId,
        uuid: resolved.uuid,
      });
    } else {
      nextItems.push(item);
      resolution.unresolvedSpellItems.push(item.name);
    }
  }

  sanitized.items = nextItems;
  sanitized.flags = foundry.utils.mergeObject(
    sanitized.flags || {},
    {
      "bertinis-vault": {
        resolution,
      },
    },
    { inplace: false, recursive: true },
  );

  return {
    actorCreateData: sanitized,
    resolution,
  };
}
