// ============================================================
// Bertini's Vault — Main Entry Point
// Registers the module with Foundry VTT
// ============================================================

import { VaultCreatorApp } from './vault-app.js';

// ── Module hooks ───────────────────────────────────────────────

Hooks.once('init', () => {
  console.log("Vault | Initializing Bertini's Vault module");

  // Register module settings
  game.settings.register('bertinis-vault', 'onlyGM', {
    name: 'Vault | Solo GM puede crear personajes',
    hint: 'Si está activo, solo el Game Master puede abrir el creador.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('bertinis-vault', 'defaultFolder', {
    name: 'Vault | Carpeta por defecto para actores',
    hint: 'Nombre de la carpeta donde se crearán los personajes (opcional).',
    scope: 'world',
    config: true,
    type: String,
    default: '',
  });
});

Hooks.once('ready', () => {
  console.log("Vault | Ready — Bertini's Vault loaded");

  // Expose API for macros / other modules
  game.vault = {
    open: () => new VaultCreatorApp().render(true),
    version: '0.1.0',
  };
});

// ── Add button to Actors Directory ───────────────────────────

Hooks.on('renderActorDirectory', (app, html) => {
  // Check permissions
  const onlyGM = game.settings.get('bertinis-vault', 'onlyGM');
  if (onlyGM && !game.user.isGM) return;

  const button = $(`
    <button class="vault-open-btn" title="Crear personaje con Vault">
      <i class="fas fa-hat-wizard"></i>
      ${game.i18n.localize('VAULT.ButtonLabel')}
    </button>
  `);

  button.on('click', () => {
    new VaultCreatorApp().render(true);
  });

  // Insert after the existing Create Actor button
  const header = html.find('.directory-header .action-buttons');
  if (header.length) {
    header.prepend(button);
  } else {
    // Fallback: add before the filter bar
    html.find('.directory-footer').prepend(button);
  }
});

// ── Add button to Actor sheet header (optional convenience) ──

Hooks.on('getActorSheetHeaderButtons', (sheet, buttons) => {
  // Not adding here to keep it clean — use the directory button
});

// ── Utility: create actor from data (callable from macros) ───

Hooks.on('renderActorDirectory', () => {
  // Register a chat command for quick access
  // /vault — opens the creator
});

// ── CSS for the directory button ──────────────────────────────
// (injected here to avoid needing a separate file for a 3-line rule)
const style = document.createElement('style');
style.textContent = `
  .vault-open-btn {
    background: rgba(201,168,76,0.12);
    border: 1px solid #7a5f28;
    color: #c9a84c;
    font-family: inherit;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .vault-open-btn:hover {
    background: rgba(201,168,76,0.22);
  }
  .vault-open-btn i { margin-right: 4px; }
`;
document.head.appendChild(style);
