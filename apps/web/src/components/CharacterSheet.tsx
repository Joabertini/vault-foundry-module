type CharacterSheetData = {
  name?: string;
  race?: string;
  className?: string;
  level?: number;
  stats?: Record<string, number>;
  hp?: number;
  ac?: number;
  speed?: string | number;
  features?: string[];
  spells?: string[];
  onExportJson?: () => void;
  onExportFoundry?: () => void;
};

export function CharacterSheet({ character }: { character: CharacterSheetData }) {
  const stats = character.stats || {};

  return (
    <div className="sheet">
      <div className="sheet-header">
        <h1>{character.name || "Nombre del personaje"}</h1>
        <div className="sheet-sub">
          {character.race || "Raza"} • {character.className || "Clase"} • Nivel{" "}
          {character.level || 1}
        </div>
      </div>

      <div className="sheet-main">
        <div className="sheet-left">
          <div className="stats-grid">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="stat-box">
                <div className="stat-value">{value}</div>
                <div className="stat-label">{key.toUpperCase()}</div>
              </div>
            ))}
          </div>

          <div className="secondary-stats">
            <div>HP: {character.hp ?? "-"}</div>
            <div>AC: {character.ac ?? "-"}</div>
            <div>Speed: {character.speed ?? "-"}</div>
          </div>
        </div>

        <div className="sheet-right">
          <div className="sheet-card">
            <h3>Habilidades</h3>
            <div className="tag-list">
              {(character.features || []).length ? (
                character.features?.map((feature) => (
                  <span key={feature} className="tag">
                    {feature}
                  </span>
                ))
              ) : (
                <span className="empty-note">Todavia no agregaste rasgos destacados.</span>
              )}
            </div>
          </div>

          <div className="sheet-card">
            <h3>Magia</h3>
            <div className="tag-list">
              {(character.spells || []).length ? (
                character.spells?.map((spell) => (
                  <span key={spell} className="tag">
                    {spell}
                  </span>
                ))
              ) : (
                <span className="empty-note">Esta build no depende de magia para la demo.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sheet-footer">
        <div>Snapshot listo para compartir</div>
        <div className="button-row">
          <button className="btn secondary" onClick={character.onExportJson} type="button">
            Exportar JSON
          </button>
          <button className="btn" onClick={character.onExportFoundry} type="button">
            Exportar a Foundry
          </button>
        </div>
      </div>
    </div>
  );
}
