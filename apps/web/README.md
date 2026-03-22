# Bertini's Vault Web

Aplicacion web principal del builder y de la character sheet final.

Estado actual:

- scaffold inicial listo;
- base React + TypeScript creada en `src/`;
- primera pantalla de producto disponible como punto de partida;
- preview local disponible con Vite;
- siguiente paso: convertir esta base en builder por pasos consumiendo `packages/contracts`, `packages/domain` y `apps/api`.

Comandos utiles:

```bash
corepack pnpm install
corepack pnpm --filter @bertinis-vault/web dev
```

Preview local esperada:

- URL: `http://127.0.0.1:4173`
