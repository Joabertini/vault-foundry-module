# Bertini's Vault - Plan Maestro Tecnico

## 1. Objetivo del producto

Construir una web app estable para crear personajes de Dungeons & Dragons 5e mediante un builder guiado, generar una character sheet visual de alta calidad y exportar el resultado a Foundry VTT mediante un modulo propio.

El producto final no debe depender de HTML reactivo suelto ni de llamadas constantes desde la UI a fuentes externas. La app debe trabajar sobre un modelo de datos propio, validado y reutilizable.

## 2. Estado actual detectado

Hoy existe un modulo de Foundry funcional que:

- abre un wizard de 9 pasos dentro de Foundry;
- junta datos del personaje;
- calcula parte de los derivados;
- construye un actor `dnd5e` directamente;
- usa una mezcla de data estatica, reglas y render en el frontend del modulo.

Archivos principales del estado actual:

- [README.md](./README.md)
- [scripts/vault-app.js](./scripts/vault-app.js)
- [scripts/character-builder.js](./scripts/character-builder.js)
- [scripts/data.js](./scripts/data.js)
- [templates/vault-creator.html](./templates/vault-creator.html)

## 3. Diagnostico

### Lo que si existe

- Un flujo de creacion validado a nivel prototipo.
- Una primera capa de reglas para stats, spell slots, equipamiento y actor payload.
- Un export directo a Foundry que ya demuestra viabilidad.

### Lo que falta para convertirlo en producto

- Un modelo canonico de personaje desacoplado de Foundry.
- Una web app real separada del modulo.
- Un backend intermedio para cachear, normalizar y servir datos.
- Persistencia de borradores y personajes.
- Testing serio de reglas y exportaciones.
- Una visual final de character sheet pensada como producto, no como resumen de formulario.

### Problemas de la arquitectura actual

- La UI, las reglas y el export estan mezclados.
- Gran parte de la data esta hardcodeada.
- Hay muchos campos basados en strings libres, fragiles para calcular y exportar.
- El modulo actual sirve para crear actores, pero no como base unica del ecosistema.
- Hay problemas de encoding visibles, lo que puede romper labels, matching y localizacion.

## 4. Vision recomendada

Separar el proyecto en capas claras:

1. `apps/web`
   Builder visual + character sheet + cuenta de usuario o almacenamiento de draft.

2. `apps/foundry-module`
   Modulo de Foundry enfocado en importar o sincronizar personajes desde el modelo canonico.

3. `apps/api`
   Backend/BFF para servir datos normalizados, cachear 5etools y exponer endpoints estables.

4. `packages/domain`
   Reglas de negocio puras del builder.

5. `packages/contracts`
   Schemas y tipos compartidos.

6. `packages/foundry-exporter`
   Transformacion de `CharacterBuild` a payload compatible con Foundry.

7. `packages/data-engine`
   Normalizacion de clases, especies, backgrounds, feats, spells, equipment y metadata.

## 5. Arquitectura objetivo

### Flujo ideal

1. El usuario usa la web app.
2. La web app consume datos estables desde tu API.
3. El builder guarda un objeto `CharacterBuild`.
4. La app calcula derivados desde `packages/domain`.
5. La character sheet visual renderiza un `CharacterSheetViewModel`.
6. El exportador genera un `FoundryActorPayload` o un archivo/import token.
7. El modulo de Foundry importa ese payload y crea el actor.

### Principio central

Foundry debe ser un destino de exportacion, no el corazon del sistema.

## 6. Modelo de datos canonico

Antes de rehacer la UI, hay que definir un schema central. Sugerencia:

```ts
type CharacterBuild = {
  meta: {
    rulesVersion: "5e-2014";
    sourceProfile: "vault-v1";
    createdAt: string;
    updatedAt: string;
  };
  identity: {
    characterName: string;
    playerName?: string;
    alignment?: string;
    biography?: {
      trait?: string;
      ideal?: string;
      bond?: string;
      flaw?: string;
      notes?: string;
    };
  };
  ancestry: {
    raceId: string;
    subraceId?: string;
  };
  classing: {
    classes: Array<{
      classId: string;
      subclassId?: string;
      level: number;
    }>;
  };
  background: {
    backgroundId: string;
    grantedFeatIds: string[];
  };
  abilities: {
    generationMethod: "roll" | "standard-array" | "point-buy" | "manual";
    rolledSets?: number[][];
    base: Record<string, number>;
    final: Record<string, number>;
  };
  choices: {
    feats: string[];
    proficiencies: string[];
    spells: string[];
    equipment: string[];
    features: string[];
  };
  derived: {
    proficiencyBonus: number;
    hp: number;
    ac: number;
    spellcasting?: {
      ability: string;
      attackBonus: number;
      saveDC: number;
      slots: Record<string, number>;
    };
  };
};
```

Toda pantalla, validacion y export debe salir de este modelo.

## 7. Stack recomendado

### Frontend

- React
- TypeScript
- Vite o Next.js si despues queres auth y rutas mas completas
- React Hook Form
- Zod
- Zustand para estado global del builder
- TanStack Query para datos del backend

### Backend

- Node.js
- Fastify o NestJS
- Zod para validar requests/responses
- Redis opcional para cache si el volumen crece
- PostgreSQL si vas a guardar usuarios, drafts y personajes

### Shared packages

- TypeScript en monorepo
- pnpm workspaces o Turborepo
- Vitest para tests unitarios

## 8. Estrategia de datos

Tu API de Render con 5etools no deberia ser consumida de forma cruda por el frontend para cada interaccion.

La estrategia recomendada es:

- crear un dataset normalizado propio;
- importar o sincronizar desde 5etools por jobs controlados;
- guardar una version del dataset;
- exponer endpoints ya filtrados para el builder;
- mantener compatibilidad explicita con D&D 5e 2014;
- decidir desde el backend que partes son oficiales, opcionales o experimentales.

### Beneficios

- Menos llamadas desde la UI.
- Menor fragilidad frente a cambios externos.
- Mayor velocidad y mejor experiencia.
- Reglas consistentes entre web y exportacion.

## 9. Repositorio recomendado

En vez de varios repos desconectados, recomiendo un monorepo:

```text
bertinis-vault/
  apps/
    web/
    api/
    foundry-module/
  packages/
    contracts/
    domain/
    data-engine/
    foundry-exporter/
    ui/
  docs/
```

### Responsabilidad de cada parte

- `apps/web`: experiencia del usuario final.
- `apps/api`: datos, drafts, sincronizacion y export endpoints.
- `apps/foundry-module`: importador/sincronizador para Foundry.
- `packages/contracts`: tipos y schemas.
- `packages/domain`: calculos y validaciones puras.
- `packages/data-engine`: transformacion de 5etools a tu formato.
- `packages/foundry-exporter`: adaptador a `dnd5e`.
- `packages/ui`: componentes reutilizables si hace falta.

## 10. Fases de ejecucion

### Fase 0 - Auditoria y congelamiento

Objetivo: cerrar el prototipo actual y usarlo solo como referencia.

Entregables:

- inventario de repos existentes;
- mapa de dependencias;
- listado de reglas ya implementadas;
- decision de que codigo se reutiliza y cual se descarta.

### Fase 1 - Contrato del dominio

Objetivo: definir el modelo canonico del personaje.

Entregables:

- `CharacterBuild` schema;
- ids estables para clase, raza, background, feat, spell y equipo;
- reglas base separadas de la UI;
- primeros tests unitarios.

### Fase 2 - Data engine

Objetivo: normalizar la data que hoy esta dispersa o hardcodeada.

Entregables:

- pipeline de normalizacion desde 5etools;
- estructura de datos versionada;
- endpoints estables para listas y detalle;
- cache local/controlada.

### Fase 3 - Builder web MVP

Objetivo: tener el builder web funcional y robusto.

Entregables:

- flujo por pasos;
- autosave local o en backend;
- validacion por paso;
- resumen lateral del personaje;
- calculos reactivos usando el dominio compartido.

### Fase 4 - Character sheet visual

Objetivo: transformar el build en una sheet visual de producto.

Entregables:

- layout final de character sheet;
- vista responsive;
- modo imprimir/exportar;
- estado final consistente con el builder.

### Fase 5 - Export Foundry

Objetivo: export estable y verificable.

Entregables:

- `FoundryActorPayload` estable;
- importador en modulo propio;
- compatibilidad probada con `dnd5e` target;
- errores claros si un campo no se puede mapear.

### Fase 6 - Persistencia y cuenta

Objetivo: que el producto deje de ser sesion efimera.

Entregables:

- drafts;
- personajes guardados;
- versionado de builds;
- opcion de duplicar, editar y reexportar.

### Fase 7 - Hardening

Objetivo: estabilidad real.

Entregables:

- tests de regresion;
- matrices de compatibilidad;
- observabilidad minima;
- manejo de errores y estados vacios.

## 11. MVP realista

El MVP que recomiendo no es "todo D&D 5e completo". Recomiendo:

- solo reglas 2014;
- solo personajes de una clase al inicio;
- export a una version objetivo concreta de Foundry + `dnd5e`;
- lista priorizada de clases, razas, backgrounds y feats;
- spells y equipment con normalizacion suficiente para el export principal.

### Qué debe incluir el MVP

- builder web estable;
- guardado de draft;
- sheet visual final;
- export a Foundry para casos comunes;
- tests para los caminos mas usados.

### Qué puede esperar

- multiclass;
- especies raras o edge cases complejos;
- reglas 2024;
- integraciones sociales;
- homebrew avanzado.

## 12. Riesgos principales

### Riesgo 1 - Acoplamiento a Foundry

Si el modelo nace desde Foundry, todo el producto queda atado a un formato ajeno.

Mitigacion:
- modelo canonico propio;
- exportadores separados.

### Riesgo 2 - Dependencia excesiva de 5etools

Si la UI depende de llamadas externas o estructuras inestables, la experiencia se rompe facil.

Mitigacion:
- cache y normalizacion propia;
- versionado del dataset.

### Riesgo 3 - Reglas mezcladas con UX

Cuando una regla vive adentro del componente visual, cualquier cambio rompe la interfaz.

Mitigacion:
- dominio puro y testeado.

### Riesgo 4 - Scope explosion

D&D 5e tiene muchas excepciones.

Mitigacion:
- MVP acotado;
- ids y reglas versionadas;
- soporte incremental.

## 13. Decisiones tecnicas que recomiendo tomar ya

1. Congelar el modulo actual como prototipo, no seguir escalandolo como nucleo.
2. Pasar a TypeScript.
3. Crear un schema canonico antes de rehacer interfaces.
4. Separar builder web, API y exportador Foundry.
5. Consumir 5etools solo a traves de una capa propia.
6. Definir una version objetivo de Foundry y `dnd5e`.

## 14. Orden exacto de trabajo recomendado

1. Inventariar los repos y flujos existentes.
2. Definir monorepo destino.
3. Diseñar `CharacterBuild` y `FoundryActorPayload`.
4. Extraer reglas del modulo actual a `packages/domain`.
5. Normalizar data base en `packages/data-engine`.
6. Levantar `apps/api`.
7. Construir `apps/web` con builder MVP.
8. Construir la character sheet visual.
9. Implementar export/import con `apps/foundry-module`.
10. Agregar persistencia, tests y hardening.

## 15. Criterio de exito

El proyecto va bien encaminado cuando:

- la web app puede crear un personaje sin depender de Foundry;
- el personaje existe como objeto valido aunque no se exporte;
- la sheet visual sale del mismo modelo que usa el export;
- Foundry solo importa un payload ya resuelto;
- cambiar una regla no obliga a rehacer la UI.

## 16. Proxima accion sugerida

El siguiente paso tecnico correcto es construir la base del monorepo y definir formalmente el schema `CharacterBuild` en TypeScript + Zod.

Ese paso desbloquea todo lo demas:

- builder web;
- API;
- exportador;
- tests;
- migracion del prototipo actual.
