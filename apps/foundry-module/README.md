# Bertini's Vault Foundry Module

Este directorio representa el destino del modulo de Foundry dentro de la arquitectura nueva.

Por ahora, el prototipo funcional sigue viviendo en la raiz del repo:

- [module.json](C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/module.json)
- [scripts/vault-app.js](C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/scripts/vault-app.js)
- [scripts/character-builder.js](C:/Users/CodexSandboxOffline/.codex/.sandbox/cwd/2ccd18d90a51fd7a/bertinis-vault/scripts/character-builder.js)

La migracion correcta sera:

1. extraer reglas y contratos compartidos;
2. reconstruir el import/export sobre esos contratos;
3. mover el modulo a este workspace cuando deje de ser el origen de la logica.

Como referencia procedural para esa reconstruccion, usar tambien:

- [`docs/DDIMPORT-COMPARISON.md`](/D:/Users/Martin/Desktop/RESPALDO/D&D%205e/Documents/web%20builder/bertinis-vault-github-ready/bertinis-vault/docs/DDIMPORT-COMPARISON.md)

La leccion principal de esa comparativa es que este modulo no solo debe "importar un payload".

Tambien deberia orquestar:

1. preflight de compatibilidad;
2. import/sync como job explicito;
3. reporte de warnings y bloqueos;
4. persistencia de preferencias del operador.
