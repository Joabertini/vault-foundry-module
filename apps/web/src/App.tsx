import { buildFoundryActorPayload } from "@bertinis-vault/foundry-exporter";
import { useEffect, useState } from "react";
import {
  type BuilderState,
  abilityModifier,
  appendUniqueLine,
  builderDraftStorageKey,
  buildCanonicalSnapshot,
  coerceBuilderState,
  initialState,
  parseCantripLines,
  parseEquipmentLines,
  parseSpellLines,
  removeLine,
} from "./builder";
import {
  fallbackBuilderOptions,
  loadBuilderOptions,
  type BuilderOptionsPayload,
} from "./builder-options";

const steps = [
  { id: "identity", label: "Identidad" },
  { id: "build", label: "Base" },
  { id: "abilities", label: "Atributos" },
  { id: "choices", label: "Elecciones" },
  { id: "magic", label: "Magia" },
  { id: "persona", label: "Persona" },
];

export function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [builderOptions, setBuilderOptions] = useState<BuilderOptionsPayload>(
    fallbackBuilderOptions,
  );
  const [datasetState, setDatasetState] = useState("Usando catalogo local");
  const [state, setState] = useState<BuilderState>(() => {
    if (typeof window === "undefined") {
      return initialState;
    }

    const storedDraft = window.localStorage.getItem(builderDraftStorageKey);

    if (!storedDraft) {
      return initialState;
    }

    try {
      return coerceBuilderState(JSON.parse(storedDraft));
    } catch {
      return initialState;
    }
  });
  const [saveState, setSaveState] = useState("Borrador local activo");
  const [exportState, setExportState] = useState("Listo para exportar");
  const [foundryExportState, setFoundryExportState] = useState("Preview Foundry lista");

  const canonicalSnapshot = buildCanonicalSnapshot(state);
  const foundryPreview = buildFoundryActorPayload(canonicalSnapshot);
  const foundryItemCount = foundryPreview.items.length;
  const pb = canonicalSnapshot.derived.proficiencyBonus;
  const ac = canonicalSnapshot.derived.ac;
  const hp = canonicalSnapshot.derived.hp;
  const spellDc = canonicalSnapshot.derived.spellcasting?.saveDC ?? 0;
  const listedSpells = canonicalSnapshot.choices.spells;
  const listedFeatures = canonicalSnapshot.choices.features;
  const listedEquipment = canonicalSnapshot.choices.equipment;
  const classOptions = builderOptions.classes.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const raceOptions = builderOptions.races.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const backgroundOptions = builderOptions.backgrounds.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const featOptions = builderOptions.feats.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const weaponOptions = builderOptions.equipment.weapons.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const armorOptions = builderOptions.equipment.armor.map((entry) => ({
    value: entry.id,
    label: entry.label,
  }));
  const gearSuggestions = builderOptions.equipment.gear.slice(0, 10).map((entry) => entry.label);
  const spellSuggestions = builderOptions.spells.spells
    .slice(0, 10)
    .map((entry) => `Nv${entry.level}: ${entry.label}`);
  const cantripSuggestions = builderOptions.spells.cantrips
    .slice(0, 10)
    .map((entry) => entry.label);
  const selectedCantrips = parseCantripLines(state.cantripsText);
  const selectedExtraEquipment = parseEquipmentLines(state.extraEquipmentText);
  const selectedSpells = parseSpellLines(state.spellsText);

  function updateField<K extends keyof BuilderState>(key: K, value: BuilderState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function addCantrip(value: string) {
    updateField("cantripsText", appendUniqueLine(state.cantripsText, value));
  }

  function addSpell(value: string) {
    updateField("spellsText", appendUniqueLine(state.spellsText, value));
  }

  function removeCantrip(value: string) {
    updateField("cantripsText", removeLine(state.cantripsText, value));
  }

  function removeSpell(value: string) {
    updateField("spellsText", removeLine(state.spellsText, value));
  }

  function addExtraEquipment(value: string) {
    updateField("extraEquipmentText", appendUniqueLine(state.extraEquipmentText, value));
  }

  function removeExtraEquipment(value: string) {
    updateField("extraEquipmentText", removeLine(state.extraEquipmentText, value));
  }

  function resetDraft() {
    setState(initialState);
    setStepIndex(0);
    setSaveState("Borrador reiniciado");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(builderDraftStorageKey);
    }
  }

  async function copyJson(payload: string, onResult: (value: string) => void) {
    if (typeof window === "undefined" || !window.navigator?.clipboard) {
      onResult("Clipboard no disponible");
      return;
    }

    try {
      await window.navigator.clipboard.writeText(payload);
      onResult("JSON copiado al portapapeles");
    } catch {
      onResult("No se pudo copiar el JSON");
    }
  }

  function downloadJson(payload: string, fileName: string, onResult: (value: string) => void) {
    if (typeof window === "undefined" || typeof document === "undefined") {
      onResult("Descarga no disponible");
      return;
    }

    const blob = new Blob([payload], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
    onResult("JSON descargado");
  }

  async function copyCanonicalSnapshot() {
    await copyJson(JSON.stringify(canonicalSnapshot, null, 2), setExportState);
  }

  function downloadCanonicalSnapshot() {
    const fileNameBase = state.characterName.trim() || "bertinis-vault-character";
    const fileName = `${fileNameBase.toLowerCase().replace(/\s+/g, "-")}.canonical.json`;
    downloadJson(JSON.stringify(canonicalSnapshot, null, 2), fileName, setExportState);
  }

  async function copyFoundryPreview() {
    await copyJson(JSON.stringify(foundryPreview, null, 2), setFoundryExportState);
  }

  function downloadFoundryPreview() {
    const fileNameBase = state.characterName.trim() || "bertinis-vault-character";
    const fileName = `${fileNameBase.toLowerCase().replace(/\s+/g, "-")}.foundry-actor.json`;
    downloadJson(JSON.stringify(foundryPreview, null, 2), fileName, setFoundryExportState);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(builderDraftStorageKey, JSON.stringify(state));
    setSaveState("Guardado local automatico");
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    loadBuilderOptions()
      .then((payload) => {
        if (cancelled) {
          return;
        }

        setBuilderOptions(payload);
        setDatasetState(`API conectada: ${payload.source.mode}`);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setBuilderOptions(fallbackBuilderOptions);
        setDatasetState("Fallback local activo");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="eyebrow">Bertini's Vault</div>
        <h1>Primer builder web jugable</h1>
        <p className="hero-copy">
          Ya existe una base web separada de Foundry. Este primer paso convierte esa base
          en un builder inicial con estado real, pasos y preview de personaje.
        </p>
        <div className="hero-panels hero-panels-builder">
          <article className="panel panel-highlight">
            <h2>Motor del proyecto</h2>
            <p>
              La lógica ya está migrando a una arquitectura compartida. Esta UI es el primer
              punto de entrada real del builder fuera del módulo Foundry.
            </p>
            <div className="inline-status">{datasetState}</div>
          </article>
          <article className="panel">
            <h2>Qué prueba esta pantalla</h2>
            <p>
              Que podemos empezar a construir el flujo del personaje directamente en web,
              con preview inmediata y sin depender del HTML legacy.
            </p>
          </article>
        </div>
      </section>

      <section className="builder-layout">
        <section className="builder-panel">
          <div className="section-head">
            <span className="eyebrow">Builder Flow</span>
            <h2>Construcción inicial</h2>
          </div>

          <div className="step-row">
            {steps.map((step, index) => (
              <button
                className={`step-pill${index === stepIndex ? " active" : ""}`}
                key={step.id}
                onClick={() => setStepIndex(index)}
                type="button"
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.label}
              </button>
            ))}
          </div>

          <div className="builder-toolbar">
            <span className="save-pill">{saveState}</span>
            <button className="secondary-button" onClick={resetDraft} type="button">
              Reiniciar demo
            </button>
          </div>

          {stepIndex === 0 ? (
            <div className="form-grid">
              <label className="field">
                <span>Nombre del personaje</span>
                <input
                  value={state.characterName}
                  onChange={(event) => updateField("characterName", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Jugador</span>
                <input
                  value={state.playerName}
                  onChange={(event) => updateField("playerName", event.target.value)}
                />
              </label>
              <label className="field field-full">
                <span>Alineamiento</span>
                <input
                  value={state.alignment}
                  onChange={(event) => updateField("alignment", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Equipo extra seleccionado</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedExtraEquipment.length ? (
                      selectedExtraEquipment.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeExtraEquipment(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no agregaste equipo extra.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Notas de equipo extra</span>
                <textarea
                  rows={3}
                  value={state.extraEquipmentText}
                  onChange={(event) => updateField("extraEquipmentText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Sugerencias de equipo</span>
                <div className="tag-list">
                  {gearSuggestions.slice(0, 6).map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addExtraEquipment(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="form-grid">
              <label className="field">
                <span>Raza</span>
                <select
                  value={state.raceId}
                  onChange={(event) => updateField("raceId", event.target.value)}
                >
                  {raceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Clase</span>
                <select
                  value={state.classId}
                  onChange={(event) => updateField("classId", event.target.value)}
                >
                  {classOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field-full">
                <span>Nivel</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={state.level}
                  onChange={(event) => updateField("level", Number(event.target.value))}
                />
                <strong className="range-value">Nivel {state.level}</strong>
              </label>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="abilities-builder">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((abilityKey) => (
                <label className="ability-card" key={abilityKey}>
                  <span className="ability-key">{abilityKey.toUpperCase()}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={state[abilityKey]}
                    onChange={(event) =>
                      updateField(abilityKey, Number(event.target.value))
                    }
                  />
                  <span className="ability-mod">
                    {abilityModifier(state[abilityKey]) >= 0 ? "+" : ""}
                    {abilityModifier(state[abilityKey])}
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="form-grid">
              <label className="field">
                <span>Background</span>
                <select
                  value={state.backgroundId}
                  onChange={(event) => updateField("backgroundId", event.target.value)}
                >
                  {backgroundOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Feat destacada</span>
                <select
                  value={state.featId}
                  onChange={(event) => updateField("featId", event.target.value)}
                >
                  {featOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Arma principal</span>
                <select
                  value={state.weaponId}
                  onChange={(event) => updateField("weaponId", event.target.value)}
                >
                  {weaponOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Protección</span>
                <select
                  value={state.armorId}
                  onChange={(event) => updateField("armorId", event.target.value)}
                >
                  {armorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="field field-full">
                <span>Equipo extra seleccionado</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedExtraEquipment.length ? (
                      selectedExtraEquipment.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeExtraEquipment(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no agregaste equipo extra.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Notas de equipo extra</span>
                <textarea
                  rows={3}
                  value={state.extraEquipmentText}
                  onChange={(event) => updateField("extraEquipmentText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Sugerencias de equipo</span>
                <div className="tag-list">
                  {gearSuggestions.slice(0, 6).map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addExtraEquipment(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {stepIndex === 4 ? (
            <div className="form-grid">
              <div className="field field-full">
                <span>Cantrips seleccionados</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedCantrips.length ? (
                      selectedCantrips.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeCantrip(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no elegiste cantrips.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Cantrips</span>
                <textarea
                  rows={3}
                  value={state.cantripsText}
                  onChange={(event) => updateField("cantripsText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Spells seleccionados</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedSpells.length ? (
                      selectedSpells.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeSpell(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no elegiste spells con nivel.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Spells</span>
                <textarea
                  rows={4}
                  value={state.spellsText}
                  onChange={(event) => updateField("spellsText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Sugerencias rápidas</span>
                <div className="tag-list">
                  {cantripSuggestions.slice(0, 4).map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addCantrip(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                  {spellSuggestions.slice(0, 4).map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addSpell(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field field-full">
                <span>Features</span>
                <textarea
                  rows={3}
                  value={state.featuresText}
                  onChange={(event) => updateField("featuresText", event.target.value)}
                />
              </label>
            </div>
          ) : null}

          {stepIndex === 5 ? (
            <div className="form-grid">
              <label className="field field-full">
                <span>Trait</span>
                <textarea
                  rows={3}
                  value={state.trait}
                  onChange={(event) => updateField("trait", event.target.value)}
                />
              </label>
              <label className="field field-full">
                <span>Ideal</span>
                <textarea
                  rows={3}
                  value={state.ideal}
                  onChange={(event) => updateField("ideal", event.target.value)}
                />
              </label>
              <label className="field field-full">
                <span>Bond</span>
                <textarea
                  rows={3}
                  value={state.bond}
                  onChange={(event) => updateField("bond", event.target.value)}
                />
              </label>
              <label className="field field-full">
                <span>Flaw</span>
                <textarea
                  rows={3}
                  value={state.flaw}
                  onChange={(event) => updateField("flaw", event.target.value)}
                />
              </label>
              <label className="field field-full">
                <span>Notas</span>
                <textarea
                  rows={4}
                  value={state.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </label>
            </div>
          ) : null}
        </section>

        <aside className="sheet-preview">
          <div className="section-head">
            <span className="eyebrow">Live Preview</span>
            <h2>Resumen del personaje</h2>
          </div>

          <div className="sheet-card">
            <div className="sheet-banner">
              <div>
                <span className="eyebrow">Character</span>
                <h3>{state.characterName}</h3>
              </div>
              <div className="sheet-meta">
                <strong>{state.classId}</strong>
                <span>{state.raceId}</span>
              </div>
            </div>

            <div className="stat-strip">
              <div>
                <span>PB</span>
                <strong>+{pb}</strong>
              </div>
              <div>
                <span>AC</span>
                <strong>{ac}</strong>
              </div>
              <div>
                <span>HP</span>
                <strong>{hp}</strong>
              </div>
              <div>
                <span>Spell DC</span>
                <strong>{spellDc || "-"}</strong>
              </div>
            </div>

            <div className="ability-preview-grid">
              {(["str", "dex", "con", "int", "wis", "cha"] as const).map((abilityKey) => (
                <div className="ability-preview" key={abilityKey}>
                  <span>{abilityKey.toUpperCase()}</span>
                  <strong>{state[abilityKey]}</strong>
                </div>
              ))}
            </div>

            <div className="persona-card">
              <p>
                <strong>Trait:</strong> {state.trait}
              </p>
              <p>
                <strong>Ideal:</strong> {state.ideal}
              </p>
              <p>
                <strong>Bond:</strong> {state.bond}
              </p>
              <p>
                <strong>Flaw:</strong> {state.flaw}
              </p>
              <p>
                <strong>Notas:</strong> {state.notes}
              </p>
            </div>

            <div className="sheet-section">
              <div className="sheet-section-head">
                <span className="eyebrow">Build</span>
                <strong>Origen y equipo</strong>
              </div>
              <div className="tag-list">
                <span className="sheet-tag">{state.backgroundId}</span>
                <span className="sheet-tag">{state.featId}</span>
                {listedEquipment.map((item) => (
                  <span className="sheet-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="sheet-columns">
              <div className="sheet-section">
                <div className="sheet-section-head">
                  <span className="eyebrow">Spellbook</span>
                  <strong>Magia</strong>
                </div>
                <div className="list-stack">
                  {listedSpells.map((spell) => (
                    <div className="list-row" key={spell}>
                      <span className="list-bullet">*</span>
                      <span>{spell}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sheet-section">
                <div className="sheet-section-head">
                  <span className="eyebrow">Core Traits</span>
                  <strong>Features</strong>
                </div>
                <div className="list-stack">
                  {listedFeatures.map((feature) => (
                    <div className="list-row" key={feature}>
                      <span className="list-bullet">*</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="canonical-card">
              <div className="canonical-head">
                <span className="eyebrow">Canonical Build</span>
                <strong>Snapshot</strong>
              </div>
              <div className="export-toolbar">
                <span className="save-pill">{exportState}</span>
                <div className="button-row">
                  <button
                    className="secondary-button"
                    onClick={copyCanonicalSnapshot}
                    type="button"
                  >
                    Copiar JSON
                  </button>
                  <button
                    className="secondary-button secondary-button-accent"
                    onClick={downloadCanonicalSnapshot}
                    type="button"
                  >
                    Descargar JSON
                  </button>
                </div>
              </div>
              <pre>{JSON.stringify(canonicalSnapshot, null, 2)}</pre>
            </div>

            <div className="canonical-card foundry-card">
              <div className="canonical-head">
                <span className="eyebrow">Foundry Preview</span>
                <strong>Actor listo ({foundryItemCount} items)</strong>
              </div>
              <div className="export-toolbar">
                <span className="save-pill">{foundryExportState}</span>
                <div className="button-row">
                  <button
                    className="secondary-button"
                    onClick={copyFoundryPreview}
                    type="button"
                  >
                    Copiar actor
                  </button>
                  <button
                    className="secondary-button secondary-button-accent"
                    onClick={downloadFoundryPreview}
                    type="button"
                  >
                    Descargar actor
                  </button>
                </div>
              </div>
              <pre>{JSON.stringify(foundryPreview, null, 2)}</pre>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid-section">
        <div className="section-head">
          <span className="eyebrow">Builder Status</span>
          <h2>Qué ya valida este MVP web</h2>
        </div>
        <div className="milestone-grid">
          {[
            {
              title: "Estado Local",
              status: "Ready",
              text: "La app ya tiene estado vivo para identidad, build base, atributos, equipo, magia y personalidad.",
            },
            {
              title: "Preview Visual",
              status: "Live",
              text: "Cada cambio actualiza una vista de hoja resumida y un snapshot canónico del personaje.",
            },
            {
              title: "Salida Portable",
              status: "Ready",
              text: "La web ya produce JSON canonico y una preview inicial de actor para Foundry.",
            },
            {
              title: "Datasets Hibridos",
              status: "Live",
              text: "Clases, razas, backgrounds, feats, equipo y magia ya pueden venir del BFF con mezcla local/upstream.",
            },
          ].map((milestone) => (
            <article className="milestone-card" key={milestone.title}>
              <div className="status-chip">{milestone.status}</div>
              <h3>{milestone.title}</h3>
              <p>{milestone.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid-section">
        <div className="section-head">
          <span className="eyebrow">Next Build</span>
          <h2>Lo que sigue</h2>
        </div>
        <div className="roadmap-panel">
          {[
            "Usar el exportador Foundry compartido como puente real entre builder web y modulo.",
            "Expandir decisiones del personaje con opciones y validaciones mas cercanas a 5e real.",
            "Llevar esta preview hacia una character sheet visual exportable y mas pulida.",
          ].map((item) => (
            <div className="roadmap-item" key={item}>
              <span className="roadmap-index">+</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
