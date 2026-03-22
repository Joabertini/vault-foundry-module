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
- endpoint `GET /datasets/builder-options` usando catálogos compartidos del workspace;
- cliente base preparado para la API externa de 5etools en Render.

Comandos útiles:

```bash
corepack pnpm install
corepack pnpm --filter @bertinis-vault/api dev
```
