# Bertini's Vault Foundry Module

Este directorio representa el destino del modulo de Foundry dentro de la arquitectura nueva.

Por ahora, el prototipo funcional sigue viviendo en la raiz del repo:

- [module.json](../../module.json)
- [scripts/vault-app.js](../../scripts/vault-app.js)
- [scripts/character-builder.js](../../scripts/character-builder.js)

La migracion correcta sera:

1. extraer reglas y contratos compartidos;
2. reconstruir el import/export sobre esos contratos;
3. mover el modulo a este workspace cuando deje de ser el origen de la logica.

Como referencia procedural para esa reconstruccion, usar tambien:

- [`docs/DDIMPORT-COMPARISON.md`](../../docs/DDIMPORT-COMPARISON.md)

La leccion principal de esa comparativa es que este modulo no solo debe "importar un payload".

Tambien deberia orquestar:

1. preflight de compatibilidad;
2. import/sync como job explicito;
3. reporte de warnings y bloqueos;
4. persistencia de preferencias del operador.
