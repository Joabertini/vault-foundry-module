import { type CharacterBuild, characterBuildSchema } from "@bertinis-vault/contracts";
import { getArmorCatalogEntry } from "@bertinis-vault/data-engine";
import { abilityModifierMap } from "./abilities.js";
import { calculateArmorClass, calculateEstimatedHitPoints } from "./combat.js";
import {
  getHitDieForClass,
  getSpellAbilityForClass,
  getSpellSlotsForClassLevel,
  normalizeClassId,
} from "./dnd5e-2014.js";
import { getCharacterLevel, getProficiencyBonus } from "./progression.js";

export function deriveCharacterBuild(
  input: Omit<CharacterBuild, "derived">,
): CharacterBuild {
  const level = getCharacterLevel(input.classing.classes.map((entry) => entry.level));
  const proficiencyBonus = getProficiencyBonus(level);
  const modifiers = abilityModifierMap(input.abilities.final);
  const primaryClassId = normalizeClassId(input.classing.classes[0]?.classId ?? "");
  const primaryClassLevel = input.classing.classes[0]?.level ?? 1;
  const hitDie = getHitDieForClass(primaryClassId);
  const spellAbility = getSpellAbilityForClass(primaryClassId);

  const hp = calculateEstimatedHitPoints({
    hitDie,
    level,
    constitutionModifier: modifiers.con,
  });

  const armorEntry = input.choices.equipment
    .map((entry) => getArmorCatalogEntry(entry))
    .find((entry) => Boolean(entry));
  const hasShield = input.choices.equipment
    .map((entry) => getArmorCatalogEntry(entry))
    .some((entry) => entry?.grantsShieldBonus);

  const ac = calculateArmorClass({
    armorFormula: armorEntry?.armorFormula ?? "10+DEX",
    dexModifier: modifiers.dex,
    hasShield,
  });

  const spellcasting = spellAbility
      ? {
          ability: spellAbility,
          attackBonus: proficiencyBonus + modifiers[spellAbility],
          saveDC: 8 + proficiencyBonus + modifiers[spellAbility],
          slots: getSpellSlotsForClassLevel(primaryClassId, primaryClassLevel),
        }
      : undefined;

  const build: CharacterBuild = {
    ...input,
    derived: {
      proficiencyBonus,
      hp,
      ac,
      ...(spellcasting ? { spellcasting } : {}),
    },
  };

  return characterBuildSchema.parse(build);
}
