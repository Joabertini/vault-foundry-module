// ============================================================
// Bertini's Vault - Character Builder Compatibility Wrapper
// Legacy entrypoint kept for compatibility while the active
// runtime uses the canonical build + preview pipeline directly.
// ============================================================

import {
  abilityMod,
  buildActorCreateData,
  calculateAC,
} from './foundry-pipeline.js';

export { abilityMod, calculateAC };

export function buildActor(formData) {
  const {
    canonicalBuild,
    canonicalFoundryPreview,
    canonicalPreflight,
    ...actorCreateData
  } = buildActorCreateData(formData);

  return actorCreateData;
}
