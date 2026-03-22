import { useState } from "react";

type BuilderState = {
  characterName: string;
  playerName: string;
  alignment: string;
  raceId: string;
  classId: string;
  level: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  trait: string;
  ideal: string;
};

const initialState: BuilderState = {
  characterName: "Seraphina Vale",
  playerName: "Martin",
  alignment: "Neutral Bueno",
  raceId: "human",
  classId: "wizard",
  level: 3,
  str: 8,
  dex: 14,
  con: 13,
  int: 17,
  wis: 12,
  cha: 10,
  trait: "Siempre toma notas, incluso en medio del peligro.",
  ideal: "El conocimiento es la mejor defensa contra el caos.",
};

const classOptions = [
  { value: "barbarian", label: "Barbarian" },
  { value: "bard", label: "Bard" },
  { value: "cleric", label: "Cleric" },
  { value: "druid", label: "Druid" },
  { value: "fighter", label: "Fighter" },
  { value: "monk", label: "Monk" },
  { value: "paladin", label: "Paladin" },
  { value: "ranger", label: "Ranger" },
  { value: "rogue", label: "Rogue" },
  { value: "sorcerer", label: "Sorcerer" },
  { value: "warlock", label: "Warlock" },
  { value: "wizard", label: "Wizard" },
  { value: "artificer", label: "Artificer" },
];

const raceOptions = [
  { value: "human", label: "Human" },
  { value: "elf", label: "Elf" },
  { value: "half-elf", label: "Half-Elf" },
  { value: "dwarf", label: "Dwarf" },
  { value: "halfling", label: "Halfling" },
  { value: "half-orc", label: "Half-Orc" },
  { value: "gnome", label: "Gnome" },
  { value: "tiefling", label: "Tiefling" },
  { value: "dragonborn", label: "Dragonborn" },
  { value: "aasimar", label: "Aasimar" },
];

const steps = [
  { id: "identity", label: "Identidad" },
  { id: "build", label: "Base" },
  { id: "abilities", label: "Atributos" },
  { id: "persona", label: "Persona" },
];

function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

function proficiencyBonus(level: number) {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function App() {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<BuilderState>(initialState);

  const pb = proficiencyBonus(state.level);
  const intMod = abilityModifier(state.int);
  const dexMod = abilityModifier(state.dex);
  const conMod = abilityModifier(state.con);
  const ac = 10 + dexMod;
  const hp = 6 + conMod + Math.max(state.level - 1, 0) * (4 + conMod);

  function updateField<K extends keyof BuilderState>(key: K, value: BuilderState[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

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
                <strong>{8 + pb + intMod}</strong>
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
              text: "La app ya tiene estado vivo para identidad, build base, atributos y personalidad.",
            },
            {
              title: "Preview Visual",
              status: "Live",
              text: "Cada cambio actualiza una vista de hoja resumida, acercándonos a la future character sheet.",
            },
            {
              title: "Siguiente Capa",
              status: "Next",
              text: "El siguiente paso es conectar esta UI al modelo canónico y al export real.",
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
            "Conectar esta UI al CharacterBuild real del workspace compartido.",
            "Agregar selección de background, feats y equipamiento.",
            "Llevar esta preview hacia una character sheet visual exportable.",
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
