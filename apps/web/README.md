# Bertini's Vault Web

Frontend del builder de 9 pasos para crear personajes de D&D 5e 2014 y exportarlos a Foundry.

## Estado actual

La UI visual ya esta aceptable y la prioridad paso a ser la **funcionalidad guiada del builder**.

En esta pasada se corrigio lo siguiente:

- se mantuvo el frontend oscuro de 9 pasos basado en `vault-character-form-v2.html`;
- se agrego soporte de **subrazas** en el estado del builder y en el snapshot canonico;
- las **feats del trasfondo** ahora se aplican automaticamente cuando el background las otorga;
- se elimino la duplicacion entre `background.grantedFeatIds` y `choices.feats`;
- el paso de **raza** ahora permite elegir idiomas extra cuando la raza lo habilita;
- el paso de **skills e idiomas** ya no deja seleccionar libremente cualquier cosa:
  - el trasfondo aplica sus competencias bloqueadas;
  - la clase limita la cantidad de picks;
  - los idiomas quedan gobernados por la regla racial;
- el paso de **equipo** filtra armas y armaduras por clase;
- el boton `Tirar 4d6 x6` ahora se puede usar **una sola vez** por borrador;
- el exporter deduplica feats como segunda red de seguridad para no volver a romper el actor.
- el bloque de **magia** ya no recorta artificialmente la lista visible de spells por un limite duro del frontend;
- la seleccion de spells sigue filtrada por clase y nivel maximo disponible, pero muestra todas las opciones que existan en el dataset;
- el detalle activo de spell ahora intenta mostrar escuela, lanzamiento, alcance, duracion, componentes y descripcion;
- el loader de datasets de spells ahora rellena esos campos desde el catalogo local si la API responde incompleta o con strings vacios.

## Motivo de estos cambios

El problema principal del producto no era visual sino de **coherencia de decisiones**:

- la UI permitia combinaciones incompatibles;
- el snapshot canonico repetia feats;
- el JSON resultante podia salir incoherente y fallar o importar mal en Foundry.

Esta ronda priorizo que el builder responda a:

- raza y subraza;
- clase y subclase;
- trasfondo;
- disponibilidad real de idioma, skill y equipo.

## Archivos clave tocados

- `apps/web/src/App.tsx`
  - reglas del wizard;
  - subrazas;
  - idiomas de raza;
  - feat automatica de trasfondo;
  - skills limitadas por clase;
  - equipo filtrado por clase;
  - 4d6 x6 de un solo uso.
- `apps/web/src/builder.ts`
  - `subraceId` en `BuilderState`;
  - snapshot canonico sin duplicar feats;
  - `ancestry.subraceId` cuando exista.
- `packages/foundry-exporter/src/index.ts`
  - deduplicacion defensiva de feats exportadas.

## Comandos utiles

```bash
corepack pnpm install
corepack pnpm api:dev
corepack pnpm web:dev
corepack pnpm web:typecheck
corepack pnpm web:build
corepack pnpm --filter @bertinis-vault/foundry-exporter test
```

## Validacion hecha en esta sesion

- `corepack pnpm web:typecheck`
- `corepack pnpm web:build`
- `corepack pnpm --filter @bertinis-vault/foundry-exporter test`

## Lo que debe hacer la siguiente instancia

No rehacer el frontend. Continuar sobre esta base.

Prioridades reales:

1. convertir los mapas embebidos de `App.tsx` en datasets/versionado compartido;
2. modelar **subrazas** y **reglas de idioma** desde `packages/data-engine` y `apps/api`;
3. reemplazar los filtros manuales de equipo por elecciones de loadout mas fieles por clase;
4. restringir tambien cantrips/spells/features por nivel y por slots/picks, no solo por clase;
5. ampliar el catalogo de spells y dejarlo alineado con listas reales por clase, porque el dataset actual sigue siendo chico para un wizard completo;
6. tomar uno o dos JSON reales que importen bien en Foundry y usarlos como baseline automatizado;
7. agregar test del builder/snapshot para:
   - feat automatica no duplicada;
   - idiomas raciales;
   - picks maximos de skill;
   - tirada 4d6 bloqueada tras el primer uso.

## Advertencias para no romperlo otra vez

- no volver a permitir texto libre como eje para skills, idiomas o feats;
- no duplicar una feat entre `background.grantedFeatIds` y `choices.feats`;
- no volver a mostrar todas las armas/armaduras a cualquier clase;
- no reintroducir rerolls infinitos en `4d6 x6`;
- si se toca exportacion Foundry, probar siempre contra un actor real importable.
