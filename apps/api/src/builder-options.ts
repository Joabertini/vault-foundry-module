import {
  buildBackgroundsDataset,
  buildClassesDataset,
  buildEquipmentDataset,
  buildFeatsDataset,
  buildRacesDataset,
  buildDatasetMeta,
  buildSpellsDataset,
  buildSubclassDataset,
} from "./datasets.js";

export function buildBuilderOptionsPayload() {
  const equipment = buildEquipmentDataset();
  const spells = buildSpellsDataset();
  const classes = buildClassesDataset().items;
  const subclasses = buildSubclassDataset().items;

  return {
    ...buildDatasetMeta(),
    classes,
    subclasses: Object.fromEntries(
      classes.map((classEntry) => [
        classEntry.id,
        subclasses
          .filter((entry) => entry.classId === classEntry.id)
          .map((entry) => ({ id: entry.id, label: entry.label })),
      ]),
    ),
    races: buildRacesDataset().items,
    backgrounds: buildBackgroundsDataset().items,
    feats: buildFeatsDataset().items,
    spells: {
      cantrips: spells.cantrips,
      spells: spells.spells,
    },
    equipment: {
      gear: equipment.gear,
      armor: equipment.armor,
      weapons: equipment.weapons,
    },
  };
}
