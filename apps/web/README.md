# Bertini's Vault Web

Aplicacion web principal del builder y de la character sheet final.

Estado actual:

- builder web funcional por pasos;
- preview local disponible con Vite;
- demo visual orientada a financiadores en la pantalla principal;
- exportacion de snapshot canonico y actor Foundry desde la misma UI;
- vista tecnica opcional para exponer JSON y diagnostico sin contaminar la demo principal.

Objetivo inmediato:

- mantener la home de `apps/web` como superficie compartible;
- seguir reemplazando texto libre por elecciones estructuradas;
- evolucionar esta vista hacia una character sheet todavia mas fuerte para capturas y pitch.

Comandos utiles:

```bash
corepack pnpm install
corepack pnpm --filter @bertinis-vault/web dev
corepack pnpm web:typecheck
corepack pnpm web:build
```

Preview local esperada:

- URL: `http://127.0.0.1:4173`
