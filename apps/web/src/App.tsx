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
  parseFeatureLines,
  parseProficiencyLines,
  parseSpellLines,
  removeLine,
} from "./builder";
import {
  fallbackBuilderOptions,
  loadBuilderOptions,
  type BuilderOptionsPayload,
} from "./builder-options";
import { DEMO_PRESETS } from "./demo-presets";
import { getFeatureSuggestions } from "./feature-suggestions";

const steps = [
  { id: "identity", label: "Identidad" },
  { id: "build", label: "Base" },
  { id: "abilities", label: "Atributos" },
  { id: "choices", label: "Elecciones" },
  { id: "magic", label: "Magia" },
  { id: "persona", label: "Persona" },
];

function HeroSection({
  datasetState,
  onExplore,
  onFocusSheet,
}: {
  datasetState: string;
  onExplore: () => void;
  onFocusSheet: () => void;
}) {
  return (
    <section className="hero hero-product">
      <div className="hero-content">
        <div className="eyebrow">Bertini&apos;s Vault</div>
        <h1>Builder de personajes D&amp;D 5e listo para mesa</h1>
        <p className="hero-copy">
          Modelo canónico propio, exportación directa a Foundry y fichas pensadas para
          compartir sin fricción.
        </p>

        <div className="hero-actions">
          <button className="primary-button" onClick={onExplore} type="button">
            Probar demo
          </button>
          <button className="secondary-button" onClick={onFocusSheet} type="button">
            Ver ficha
          </button>
          <span className="inline-status">{datasetState}</span>
        </div>

        <div className="hero-badges">
          <span>Modelo canónico</span>
          <span>Export a Foundry</span>
          <span>Snapshots claros</span>
        </div>
      </div>
    </section>
  );
}

function PresetsBar({ onLoadPreset }: { onLoadPreset: (presetId: string) => void }) {
  return (
    <section className="presets">
      <div className="section-head section-head-compact">
        <span className="eyebrow">Ejemplos listos</span>
        <h2>Presets para demo</h2>
      </div>

      <div className="preset-list">
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className="preset-card"
            onClick={() => onLoadPreset(preset.id)}
            type="button"
          >
            <div className="preset-title">{preset.name}</div>
            <div className="preset-sub">{preset.subtitle}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function StoryBlock() {
  return (
    <section className="story">
      <div className="story-grid">
        <div>
          <h3>Modelo consistente</h3>
          <p>Toda la información del personaje sigue una estructura canónica única.</p>
        </div>

        <div>
          <h3>Integración real</h3>
          <p>Exportación directa a Foundry lista para usar, sin pasos intermedios.</p>
        </div>

        <div>
          <h3>Listo para compartir</h3>
          <p>Fichas claras, legibles y preparadas para snapshots o mesa.</p>
        </div>
      </div>
    </section>
  );
}

export function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [showTechnicalView, setShowTechnicalView] = useState(false);
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
  const featureSuggestions = getFeatureSuggestions(state).slice(0, 8);
  const selectedCantrips = parseCantripLines(state.cantripsText);
  const selectedExtraEquipment = parseEquipmentLines(state.extraEquipmentText);
  const selectedFeatures = parseFeatureLines(state.featuresText);
  const selectedSpells = parseSpellLines(state.spellsText);
  const selectedProficiencies = parseProficiencyLines(state.proficienciesText);
  const selectedLanguages = parseProficiencyLines(state.languagesText);
  const selectedClassLabel =
    classOptions.find((entry) => entry.value === state.classId)?.label ?? state.classId;
  const selectedRaceLabel =
    raceOptions.find((entry) => entry.value === state.raceId)?.label ?? state.raceId;
  const selectedBackgroundLabel =
    backgroundOptions.find((entry) => entry.value === state.backgroundId)?.label ?? state.backgroundId;
  const selectedFeatLabel =
    featOptions.find((entry) => entry.value === state.featId)?.label ?? state.featId;
  const selectedWeaponLabel =
    weaponOptions.find((entry) => entry.value === state.weaponId)?.label ?? state.weaponId;
  const selectedArmorLabel =
    armorOptions.find((entry) => entry.value === state.armorId)?.label ?? state.armorId;
  const presentationSpells = listedSpells.slice(0, 5);
  const presentationFeatures = listedFeatures.slice(0, 5);
  const presentationEquipment = [
    selectedWeaponLabel,
    selectedArmorLabel,
    ...selectedExtraEquipment,
  ].filter(Boolean);
  const proficiencySuggestions = [
    "Arcana",
    "Investigation",
    "Perception",
    "Stealth",
    "Thieves' Tools",
    "Herbalism Kit",
  ];
  const languageSuggestions = ["Common", "Elvish", "Dwarvish", "Draconic", "Infernal", "Sylvan"];

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

  function addFeature(value: string) {
    updateField("featuresText", appendUniqueLine(state.featuresText, value));
  }

  function removeFeature(value: string) {
    updateField("featuresText", removeLine(state.featuresText, value));
  }

  function addProficiency(value: string) {
    updateField("proficienciesText", appendUniqueLine(state.proficienciesText, value));
  }

  function removeProficiency(value: string) {
    updateField("proficienciesText", removeLine(state.proficienciesText, value));
  }

  function addLanguage(value: string) {
    updateField("languagesText", appendUniqueLine(state.languagesText, value));
  }

  function removeLanguage(value: string) {
    updateField("languagesText", removeLine(state.languagesText, value));
  }

  function resetDraft() {
    setState(initialState);
    setStepIndex(0);
    setSaveState("Borrador reiniciado");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(builderDraftStorageKey);
    }
  }

  function loadPreset(presetId: string) {
    const preset = DEMO_PRESETS.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    setState((current) => ({
      ...current,
      ...preset.data,
      createdAt: new Date().toISOString(),
    }));
    setStepIndex(0);
    setSaveState(`Preset cargado: ${preset.name}`);
    setExportState("Listo para exportar");
    setFoundryExportState("Preview Foundry lista");
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
      <HeroSection
        datasetState={datasetState}
        onExplore={() => {
          setStepIndex(0);
          if (typeof document !== "undefined") {
            document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onFocusSheet={() => {
          if (typeof document !== "undefined") {
            document.getElementById("sheet-preview")?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      <PresetsBar onLoadPreset={loadPreset} />

      <StoryBlock />

      <section className="hero hero-showcase">
        <div className="hero-copy-block">
          <div className="eyebrow">Bertini&apos;s Vault</div>
          <h1>Character builder web listo para mostrar</h1>
          <p className="hero-copy">
            Una experiencia web para crear personajes de D&amp;D 5e, visualizar una ficha clara
            y exportar el resultado hacia Foundry VTT desde un modelo canónico propio.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setStepIndex(0)} type="button">
              Explorar demo
            </button>
            <button
              className="secondary-button"
              onClick={() => setShowTechnicalView((current) => !current)}
              type="button"
            >
              {showTechnicalView ? "Ocultar vista técnica" : "Mostrar vista técnica"}
            </button>
            <span className="inline-status">{datasetState}</span>
          </div>
        </div>
        <div className="hero-preview-card">
          <span className="eyebrow">Investor Snapshot</span>
          <div className="hero-preview-head">
            <div>
              <h2>{state.characterName}</h2>
              <p>
                {selectedClassLabel} · {selectedRaceLabel} · Nivel {state.level}
              </p>
            </div>
            <div className="hero-preview-badge">Foundry Ready</div>
          </div>
          <div className="hero-preview-stats">
            <article>
              <span>PB</span>
              <strong>+{pb}</strong>
            </article>
            <article>
              <span>AC</span>
              <strong>{ac}</strong>
            </article>
            <article>
              <span>HP</span>
              <strong>{hp}</strong>
            </article>
            <article>
              <span>Items</span>
              <strong>{foundryItemCount}</strong>
            </article>
          </div>
          <div className="hero-preview-tags">
            <span className="sheet-tag">{selectedBackgroundLabel}</span>
            <span className="sheet-tag">{selectedFeatLabel}</span>
            <span className="sheet-tag">{selectedWeaponLabel}</span>
            <span className="sheet-tag">{selectedArmorLabel}</span>
          </div>
        </div>
        <div className="hero-highlights">
          {[
            {
              label: "Builder guiado",
              value: "6 pasos",
              text: "Flujo claro desde la idea del personaje hasta una ficha usable.",
            },
            {
              label: "Modelo",
              value: "Canonico",
              text: "Web, API y Foundry ya comparten la misma estructura base.",
            },
            {
              label: "Exportacion",
              value: "Lista",
              text: "La demo ya genera actor Foundry desde la capa compartida.",
            },
          ].map((item) => (
            <article className="highlight-card" key={item.label}>
              <span className="highlight-label">{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
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

      <section className="grid-section pitch-grid">
        <article className="pitch-card">
          <span className="eyebrow">Producto</span>
          <h2>De builder tecnico a experiencia compartible</h2>
          <p>
            Esta demo ya presenta el producto como una experiencia navegable: elecciones
            guiadas, preview inmediata de ficha y salida compatible con el ecosistema de
            Foundry.
          </p>
        </article>
        <article className="pitch-card pitch-card-accent">
          <span className="eyebrow">Ventaja</span>
          <h2>Una sola fuente de verdad</h2>
          <p>
            El personaje existe primero como objeto canonico. Eso permite que la web, la
            exportacion y la futura persistencia evolucionen sin rehacer la logica en cada
            superficie.
          </p>
        </article>
      </section>

      <section className="builder-layout" id="builder">
        <section className="builder-panel">
          <div className="section-head">
            <span className="eyebrow">Builder Flow</span>
            <h2>Demo interactiva del builder</h2>
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
              <div className="field field-full">
                <span>Competencias y tools</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedProficiencies.length ? (
                      selectedProficiencies.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeProficiency(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no agregaste skills o tools.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Skills y tools</span>
                <textarea
                  rows={3}
                  value={state.proficienciesText}
                  onChange={(event) => updateField("proficienciesText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Sugerencias de competencias</span>
                <div className="tag-list">
                  {proficiencySuggestions.map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addProficiency(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field field-full">
                <span>Lenguajes</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedLanguages.length ? (
                      selectedLanguages.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeLanguage(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no agregaste lenguajes.</span>
                    )}
                  </div>
                </div>
              </div>
              <label className="field field-full">
                <span>Lista de lenguajes</span>
                <textarea
                  rows={2}
                  value={state.languagesText}
                  onChange={(event) => updateField("languagesText", event.target.value)}
                />
              </label>
              <div className="field field-full">
                <span>Sugerencias de lenguajes</span>
                <div className="tag-list">
                  {languageSuggestions.map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addLanguage(entry)}
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
              <div className="field field-full">
                <span>Features seleccionadas</span>
                <div className="selection-card">
                  <div className="tag-list">
                    {selectedFeatures.length ? (
                      selectedFeatures.map((entry) => (
                        <button
                          className="sheet-tag removable-tag"
                          key={entry}
                          onClick={() => removeFeature(entry)}
                          type="button"
                        >
                          {entry}
                          <strong>x</strong>
                        </button>
                      ))
                    ) : (
                      <span className="empty-note">Todavia no agregaste features.</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="field field-full">
                <span>Sugerencias de features</span>
                <div className="tag-list">
                  {featureSuggestions.map((entry) => (
                    <button
                      className="sheet-tag"
                      key={entry}
                      onClick={() => addFeature(entry)}
                      type="button"
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
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

        <aside className="sheet-preview" id="sheet-preview">
          <div className="section-head">
            <span className="eyebrow">Character Sheet</span>
            <h2>Vista compartible del personaje</h2>
          </div>

          <div className="sheet-card">
            <div className="sheet-banner">
              <div>
                <span className="eyebrow">Character</span>
                <h3>{state.characterName}</h3>
                <p className="sheet-banner-copy">
                  Una lectura inmediata del personaje para mostrar la propuesta del producto
                  sin exponer el detalle técnico del builder.
                </p>
              </div>
              <div className="sheet-meta">
                <strong>{selectedClassLabel}</strong>
                <span>{selectedRaceLabel}</span>
                <span>Nivel {state.level}</span>
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
                <strong>Origen y loadout</strong>
              </div>
              <div className="tag-list">
                <span className="sheet-tag">{selectedBackgroundLabel}</span>
                <span className="sheet-tag">{selectedFeatLabel}</span>
                {presentationEquipment.map((item) => (
                  <span className="sheet-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="sheet-section">
              <div className="sheet-section-head">
                <span className="eyebrow">Training</span>
                <strong>Skills, tools y lenguajes</strong>
              </div>
              <div className="tag-list">
                {selectedProficiencies.map((entry) => (
                  <span className="sheet-tag" key={entry}>
                    {entry}
                  </span>
                ))}
                {selectedLanguages.map((entry) => (
                  <span className="sheet-tag" key={entry}>
                    {entry}
                  </span>
                ))}
              </div>
            </div>

            <div className="sheet-columns">
              <div className="sheet-section">
                <div className="sheet-section-head">
                  <span className="eyebrow">Spellbook</span>
                  <strong>Magia destacada</strong>
                </div>
                <div className="list-stack">
                  {presentationSpells.map((spell) => (
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
                  <strong>Features visibles</strong>
                </div>
                <div className="list-stack">
                  {presentationFeatures.map((feature) => (
                    <div className="list-row" key={feature}>
                      <span className="list-bullet">*</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="delivery-card">
              <div className="canonical-head">
                <span className="eyebrow">Deliverables</span>
                <strong>Salida lista para demo</strong>
              </div>
              <div className="delivery-grid">
                <article>
                  <span>Modelo canónico</span>
                  <strong>{exportState}</strong>
                  <p>La demo genera un snapshot estable para persistencia, API y evolución futura.</p>
                </article>
                <article>
                  <span>Foundry actor</span>
                  <strong>{foundryExportState}</strong>
                  <p>El export comparte la misma base y ya produce un actor con {foundryItemCount} items.</p>
                </article>
              </div>
              <div className="button-row">
                <button className="secondary-button" onClick={copyCanonicalSnapshot} type="button">
                  Copiar JSON canónico
                </button>
                <button
                  className="secondary-button secondary-button-accent"
                  onClick={downloadFoundryPreview}
                  type="button"
                >
                  Descargar actor Foundry
                </button>
              </div>
            </div>

            {showTechnicalView ? (
              <>
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
              </>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="grid-section">
        <div className="section-head">
          <span className="eyebrow">Product Signals</span>
          <h2>Lo que esta demo ya puede demostrar</h2>
        </div>
        <div className="milestone-grid">
          {[
            {
              title: "Flujo guiado",
              status: "Live",
              text: "La demo ya convierte el armado del personaje en un recorrido navegable y entendible fuera de Foundry.",
            },
            {
              title: "Preview visual",
              status: "Ready",
              text: "Cada decisión actualiza una ficha clara, útil para compartir la propuesta con usuarios o inversores.",
            },
            {
              title: "Salida portable",
              status: "Ready",
              text: "El mismo personaje se serializa como modelo canónico y como actor para Foundry, sin duplicar la base.",
            },
            {
              title: "Arquitectura compartida",
              status: "Active",
              text: "Web, datasets y exportador ya trabajan sobre piezas comunes, lo que acelera producto y reduce retrabajo.",
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
          <span className="eyebrow">Prioridades</span>
          <h2>El siguiente tramo de producción</h2>
        </div>
        <div className="roadmap-panel">
          {[
            "Cerrar una demo visual lista para financiadores con narrativa de producto y capturas compartibles.",
            "Estructurar mejor spells, features y equipment para depender menos de texto libre en el builder.",
            "Usar el exportador compartido como puente definitivo entre web, API y módulo Foundry.",
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
