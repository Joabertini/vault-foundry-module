# Bertini's Vault API

Backend/BFF del proyecto.

Responsabilidades previstas:

- normalizar y exponer datos del builder;
- cachear y versionar datasets provenientes de 5etools;
- servir drafts, personajes y exportaciones;
- desacoplar el frontend de fuentes externas y de formatos de Foundry.

Estado actual:

- scaffold inicial del servicio listo;
- endpoint `GET /health`;
- endpoints semánticos de datasets (`/datasets/classes`, `/datasets/races`, `/datasets/backgrounds`, `/datasets/feats`, `/datasets/equipment`);
- endpoint `GET /datasets/builder-options` usando catálogos compartidos del workspace;
- cliente base preparado para la API externa de 5etools en Render;
- proxy selectivo `GET /upstream/json?path=...` con caché en memoria.

Comandos útiles:

```bash
corepack pnpm install
corepack pnpm --filter @bertinis-vault/api dev
```
