# Foundry Import Handoff

## Contexto

Este reporte deja el estado real del bug de MVP al cierre de la jornada.
Los dos sintomas reportados por usuario siguen siendo:

1. la UI de magia a veces muestra `Sin dato` aunque la API y el catalogo local tengan metadata del spell;
2. el `.json` exportado por Vault todavia necesita validacion final dentro de Foundry despues de alinear mejor el shape del actor exportado.

## Que se verifico

- El documento tecnico `Bertinis-Foundry-Technical-Reference.docx` fue leido y usado como guia.
- La API local ya devuelve metadata rica para spells comunes.
- El catalogo local `packages/data-engine/src/spells.ts` ya contiene varios spells MVP enriquecidos.
- Se compararon `rambo.foundry-actor.json`, `rambo.foundry-actor2.json` y `fvtt-Actor-alpaca-L8nBWSEkSrHKABu3.json`.

## Hallazgos tecnicos

### 1. Problema de metadata visible en la UI

La lista de spells puede llegar con campos minimos o quedar desincronizada con la vista activa.
Para bajar ese riesgo, la UI ahora:

- resuelve metadata local y remota por `spellId`;
- mezcla `builderOptions`, fallback local y detalle puntual de `/spells/:id`;
- deja de depender solo del objeto resumido que viene en la grilla de seleccion.

Impacto esperado:

- si el dataset resumido llega pobre, al hacer click sobre un spell la UI igual deberia enriquecer la tarjeta;
- esto ataca directamente el caso `Fire Bolt`, `Hex`, `Magic Missile` y similares.

### 2. Problema del JSON para import en Foundry

El exporter estaba demasiado cerca de un payload para `Actor.create()` y no lo suficiente de un documento exportado/importable.
Este slice alinea varios campos con el actor nativo exportado por Foundry y con la referencia de Claude:

- actor root con `_id` y `sort`;
- `system.attributes.ac` usando `calc: "default"` y `flat: null`;
- `system.attributes.hp` con `min`, `temp`, `tempmax`, `bonuses`;
- `system.attributes.movement` y `system.attributes.senses` con shape mas compatible;
- `system.spells.spell1..spell9` usando `{ value, override: null }`.

## Lo que todavia hay que validar

1. Exportar un actor nuevo desde la web con este commit.
2. Intentar importarlo en Foundry otra vez.
3. Si vuelve a fallar, capturar el mensaje exacto de Foundry o la consola.
4. Comparar los `items` embebidos del actor exportado contra un actor nativo, porque ese es el siguiente sospechoso mas fuerte si el root ya esta alineado.

## Prioridad para el siguiente dev

1. Repetir el test con `rambo` regenerado desde este commit.
2. Si la UI sigue mostrando `Sin dato`, inspeccionar `network` para el `GET /spells/:id`.
3. Si el import sigue fallando, auditar shapes de items `class`, `spell` y `equipment` uno por uno contra export nativo.
4. Registrar el resultado en `docs/FOUNDRY-MANUAL-VALIDATION-REPORT.md`.

## Archivos tocados en este slice

- `apps/web/src/App.tsx`
- `packages/contracts/src/foundry.ts`
- `packages/foundry-exporter/src/index.ts`
- `packages/foundry-exporter/test/index.test.mjs`

## Estado

El riesgo principal ya no esta en la ausencia de datos de API.
Ahora esta concentrado en:

- que la UI realmente consuma el detalle enriquecido en runtime;
- y que el documento exportado quede lo bastante cercano al formato nativo de Foundry como para importar por archivo sin rechazo.
