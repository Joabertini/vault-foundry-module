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

Notas de integración:

- `GET /datasets/classes?source=local|upstream|hybrid`
- `GET /datasets/backgrounds?source=local|upstream|hybrid`
- `GET /datasets/feats?source=local|upstream|hybrid`
- `upstreamPath` es configurable por query string
- variables soportadas: `BERTINIS_5E_UPSTREAM_CLASSES_PATH`, `BERTINIS_5E_UPSTREAM_BACKGROUNDS_PATH` y `BERTINIS_5E_UPSTREAM_FEATS_PATH`

Comandos útiles:

```bash
corepack pnpm install
corepack pnpm --filter @bertinis-vault/api dev
```
