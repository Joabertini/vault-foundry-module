type CharacterSheetData = {
  name?: string;
  playerName?: string;
  alignment?: string;
  race?: string;
  className?: string;
  background?: string;
  feat?: string;
  level?: number;
  stats?: Record<string, number>;
  hp?: number;
  ac?: number;
  proficiencyBonus?: number;
  spellDc?: number;
  speed?: string | number;
  initiative?: number;
  proficiencies?: string[];
  features?: Array<{ name: string; type?: string; identifier?: string }>;
  spells?: Array<{
    name: string;
    level: number;
    identifier?: string;
    description?: string;
    school?: string;
    reference?: string;
  }>;
  equipment?: Array<{ name: string; type: string; identifier?: string; equipped?: boolean }>;
  trait?: string;
  ideal?: string;
  bond?: string;
  flaw?: string;
  notes?: string;
  onExportJson?: () => void;
  onExportFoundry?: () => void;
};

function abilityModifier(score = 10) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(score = 10) {
  const modifier = abilityModifier(score);
  return `${modifier >= 0 ? "+" : ""}${modifier}`;
}

export function CharacterSheet({ character }: { character: CharacterSheetData }) {
  const stats = character.stats || {};
  const orderedStats = ["str", "dex", "con", "int", "wis", "cha"] as const;
  const spells = character.spells || [];
  const features = character.features || [];
  const equipment = character.equipment || [];
  const proficiencies = character.proficiencies || [];
  const passivePerception = 10 + abilityModifier(stats.wis ?? 10) + (character.proficiencyBonus ?? 0);
  const equippedItems = equipment.filter((entry) => entry.equipped);
  const carriedItems = equipment.filter((entry) => !entry.equipped);

  return (
    <div className="sheet">
      <div className="sheet-banner">
        <div className="sheet-banner-copy">
          <span className="eyebrow sheet-eyebrow">Character Record</span>
          <h1>{character.name || "Nombre del personaje"}</h1>
          <div className="sheet-identity-line">
            <span>{character.race || "Raza"}</span>
            <span>{character.className || "Clase"}</span>
            <span>Nivel {character.level || 1}</span>
          </div>
          <div className="sheet-meta-line">
            <span>Jugador: {character.playerName || "Sin jugador"}</span>
            <span>Alineamiento: {character.alignment || "Sin alineamiento"}</span>
          </div>
        </div>

        <div className="sheet-banner-badges">
          <div className="sheet-banner-chip">
            <span>Background</span>
            <strong>{character.background || "Pendiente"}</strong>
          </div>
          <div className="sheet-banner-chip">
            <span>Feat</span>
            <strong>{character.feat || "Pendiente"}</strong>
          </div>
        </div>
      </div>

      <div className="sheet-main">
        <aside className="sheet-sidebar">
          <section className="sheet-panel sheet-panel-stats">
            <div className="sheet-panel-head">
              <span className="eyebrow">Abilities</span>
              <strong>Atributos base</strong>
            </div>
            <div className="sheet-abilities-grid">
              {orderedStats.map((key) => (
                <article key={key} className="sheet-ability-card">
                  <span>{key.toUpperCase()}</span>
                  <strong>{stats[key] ?? "-"}</strong>
                  <em>{formatModifier(stats[key] ?? 10)}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Combat</span>
              <strong>Resumen rapido</strong>
            </div>
            <div className="sheet-combat-grid">
              <div className="sheet-combat-card">
                <span>Armor Class</span>
                <strong>{character.ac ?? "-"}</strong>
              </div>
              <div className="sheet-combat-card">
                <span>Hit Points</span>
                <strong>{character.hp ?? "-"}</strong>
              </div>
              <div className="sheet-combat-card">
                <span>Initiative</span>
                <strong>
                  {(character.initiative ?? abilityModifier(stats.dex ?? 10)) >= 0 ? "+" : ""}
                  {character.initiative ?? abilityModifier(stats.dex ?? 10)}
                </strong>
              </div>
              <div className="sheet-combat-card">
                <span>Speed</span>
                <strong>{character.speed ?? "-"}</strong>
              </div>
              <div className="sheet-combat-card">
                <span>Proficiency</span>
                <strong>{character.proficiencyBonus ? `+${character.proficiencyBonus}` : "-"}</strong>
              </div>
              <div className="sheet-combat-card">
                <span>Passive Perception</span>
                <strong>{passivePerception}</strong>
              </div>
            </div>
          </section>

          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Proficiencies</span>
              <strong>Training y lenguajes</strong>
            </div>
            <div className="tag-list">
              {proficiencies.length ? (
                proficiencies.map((entry) => (
                  <span key={entry} className="sheet-tag">
                    {entry}
                  </span>
                ))
              ) : (
                <span className="empty-note">Sin proficiencias visibles.</span>
              )}
            </div>
          </section>
        </aside>

        <div className="sheet-content">
          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Features</span>
              <strong>Rasgos y capacidades</strong>
            </div>
            <div className="sheet-record-list">
              {features.length ? (
                features.map((feature) => (
                  <article
                    key={`${feature.identifier || feature.name}-${feature.type || "feature"}`}
                    className="sheet-record-row"
                  >
                    <div>
                      <strong>{feature.name}</strong>
                      <span>{feature.type || "feature"}</span>
                    </div>
                    <code>{feature.identifier || "sin-id"}</code>
                  </article>
                ))
              ) : (
                <span className="empty-note">Todavia no agregaste rasgos destacados.</span>
              )}
            </div>
          </section>

          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Inventory</span>
              <strong>Loadout e inventario</strong>
            </div>
            <div className="sheet-inventory-grid">
              <div className="sheet-inventory-column">
                <h3>Equipado</h3>
                <div className="sheet-record-list">
                  {equippedItems.length ? (
                    equippedItems.map((entry) => (
                      <article key={`${entry.type}-${entry.identifier || entry.name}`} className="sheet-record-row">
                        <div>
                          <strong>{entry.name}</strong>
                          <span>{entry.type}</span>
                        </div>
                        <code>{entry.identifier || "sin-id"}</code>
                      </article>
                    ))
                  ) : (
                    <span className="empty-note">Sin piezas equipadas.</span>
                  )}
                </div>
              </div>
              <div className="sheet-inventory-column">
                <h3>Mochila</h3>
                <div className="sheet-record-list">
                  {carriedItems.length ? (
                    carriedItems.map((entry) => (
                      <article key={`${entry.type}-${entry.identifier || entry.name}`} className="sheet-record-row">
                        <div>
                          <strong>{entry.name}</strong>
                          <span>{entry.type}</span>
                        </div>
                        <code>{entry.identifier || "sin-id"}</code>
                      </article>
                    ))
                  ) : (
                    <span className="empty-note">Sin inventario extra.</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Spellbook</span>
              <strong>Magia preparada y referencias</strong>
            </div>
            <div className="sheet-spellbook">
              {spells.length ? (
                spells.map((spell) => (
                  <article key={`${spell.identifier || spell.name}-${spell.level}`} className="sheet-spell-card">
                    <div className="sheet-spell-head">
                      <div>
                        <strong>{spell.name}</strong>
                        <span>{spell.school || "school?"}</span>
                      </div>
                      <span className="sheet-tag">Nivel {spell.level}</span>
                    </div>
                    <p>{spell.description || "Sin descripcion enriquecida."}</p>
                    <div className="sheet-spell-meta">
                      <code>{spell.identifier || "sin-id"}</code>
                      <span>{spell.reference || "sin referencia de compendio"}</span>
                    </div>
                  </article>
                ))
              ) : (
                <span className="empty-note">Esta build no depende de magia para la demo.</span>
              )}
            </div>
          </section>

          <section className="sheet-panel">
            <div className="sheet-panel-head">
              <span className="eyebrow">Biography</span>
              <strong>Persona y notas</strong>
            </div>
            <div className="sheet-biography-grid">
              <article className="sheet-biography-card">
                <span>Trait</span>
                <p>{character.trait || "Sin rasgo principal todavia."}</p>
              </article>
              <article className="sheet-biography-card">
                <span>Ideal</span>
                <p>{character.ideal || "Sin ideal cargado."}</p>
              </article>
              <article className="sheet-biography-card">
                <span>Bond</span>
                <p>{character.bond || "Sin bond cargado."}</p>
              </article>
              <article className="sheet-biography-card">
                <span>Flaw</span>
                <p>{character.flaw || "Sin flaw cargado."}</p>
              </article>
              <article className="sheet-biography-card sheet-biography-card-wide">
                <span>Notas</span>
                <p>{character.notes || "Sin notas adicionales."}</p>
              </article>
            </div>
          </section>
        </div>
      </div>

      <div className="sheet-footer">
        <div className="sheet-footer-text">Snapshot listo para compartir, revisar y exportar</div>
        <div className="sheet-actions">
          <button className="btn secondary" onClick={character.onExportJson} type="button">
            Exportar JSON
          </button>
          <button className="btn primary" onClick={character.onExportFoundry} type="button">
            Exportar a Foundry
          </button>
        </div>
      </div>
    </div>
  );
}
