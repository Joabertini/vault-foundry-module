import {
  buildBackgroundsDataset,
  buildClassesDataset,
  buildEquipmentDataset,
  buildFeatsDataset,
  buildRacesDataset,
  buildDatasetMeta,
} from "./datasets.js";

export function buildBuilderOptionsPayload() {
  return {
    ...buildDatasetMeta(),
    classes: buildClassesDataset().items,
    races: buildRacesDataset().items,
    backgrounds: buildBackgroundsDataset().items,
    feats: buildFeatsDataset().items,
    equipment: {
      armor: buildEquipmentDataset().armor,
      weapons: buildEquipmentDataset().weapons,
    },
  };
}
