const milestones = [
  {
    title: "Builder Web",
    status: "In progress",
    text: "Base del producto web separada de Foundry, con pasos claros y estado propio.",
  },
  {
    title: "Modelo Canonico",
    status: "Working",
    text: "El personaje ya se puede representar en un formato comun que no depende del modulo.",
  },
  {
    title: "Export Foundry",
    status: "Bridged",
    text: "El modulo actual ya convive con una salida nueva para comparar y migrar sin romper el flujo.",
  },
];

const roadmap = [
  "Cerrar derivacion de traits, proficiencies y mapeos faltantes en Foundry.",
  "Construir el builder por pasos consumiendo contracts y domain compartidos.",
  "Agregar character sheet visual final y capa de export estable.",
];

export function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="eyebrow">Bertini's Vault</div>
        <h1>El builder web ya tiene base propia</h1>
        <p className="hero-copy">
          El proyecto dejo de depender solo del modulo de Foundry. Esta app sera el hogar
          del builder, de la character sheet visual y del flujo estable de exportacion.
        </p>
        <div className="hero-panels">
          <article className="panel panel-highlight">
            <h2>Estado actual</h2>
            <p>
              Estamos en transicion desde un prototipo funcional hacia un producto real con
              arquitectura compartida.
            </p>
          </article>
          <article className="panel">
            <h2>Objetivo inmediato</h2>
            <p>
              Levantar el builder web sobre el modelo canonico ya existente para dejar de
              depender del HTML reactivo suelto.
            </p>
          </article>
        </div>
      </section>

      <section className="grid-section">
        <div className="section-head">
          <span className="eyebrow">Project Map</span>
          <h2>Donde estamos parados</h2>
        </div>
        <div className="milestone-grid">
          {milestones.map((milestone) => (
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
          {roadmap.map((item) => (
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
