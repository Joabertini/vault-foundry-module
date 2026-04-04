# Bertini's Vault — Character Builder Web

Builder de personajes D&D 5e 2014 hosteado en GitHub Pages.

**URL:** https://joabertini.github.io/vault-foundry-module/

## Stack

- HTML + CSS + JS vanilla — sin dependencias, sin build step
- Supabase — persistencia de borradores anónimos (session_id por browser)
- GitHub Pages — hosting estático

## Archivos

| Archivo | Descripción |
|---|---|
| `index.html` | Builder completo — 9 pasos, export JSON, autosave |

## Desarrollo

Para modificar el builder, editá `docs/index.html` directamente y hacé commit.
No hay build step — lo que commitás es lo que se sirve.

## Conexión con Foundry

El builder exporta un archivo `vault-char-v1.json` compatible con el módulo
**Bertini's Vault Importer** (en desarrollo — Fase 2 del roadmap).

Ver [ARCHITECTURE-PLAN.md](../ARCHITECTURE-PLAN.md) para el diseño completo.
