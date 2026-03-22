# Bertini's Vault - Implementation Log

## 2026-03-22

### Base architecture bootstrap

Se agrego la base inicial del monorepo sin romper el prototipo actual de Foundry.

Cambios principales:

- raiz con `package.json`, `pnpm-workspace.yaml` y `tsconfig.base.json`;
- estructura inicial de `apps/web`, `apps/api` y `apps/foundry-module`;
- `packages/contracts` con schema inicial `CharacterBuild`;
- `packages/domain` con calculos base para modificadores, progresion, HP y AC;
- documento maestro en `ARCHITECTURE-PLAN.md`;
- actualizacion de `README.md` para explicar la nueva direccion del repo.

Decision importante:

- el modulo actual de Foundry sigue siendo el prototipo de referencia;
- la nueva arquitectura se construye alrededor de el hasta que la logica deje de vivir en la raiz.

### Siguiente objetivo

Extraer reglas reales desde el prototipo hacia paquetes compartidos:

- spellcasting;
- hit dice y progresion;
- spell slots;
- primeras piezas del exportador a Foundry.

### Reglas y exportador extraidos

Se avanzo un paso mas en la separacion del dominio:

- se agrego `packages/domain/src/dnd5e-2014.ts` con:
  - hit dice por clase;
  - spellcasting ability por clase;
  - progresion de spell slots;
  - helper para normalizar `classId`;
- `packages/domain/src/derive.ts` ahora usa esas reglas compartidas;
- se agrego `packages/foundry-exporter` con un primer `buildFoundryActorPayload`;
- se creo esta bitacora en `docs/IMPLEMENTATION-LOG.md` para registrar avances de trabajo.

Estado del exportador:

- inicial;
- suficiente para mapear nombre, abilities, HP, AC y spellcasting base;
- ahora tambien genera items de clase, feats/features y spells desde `CharacterBuild`;
- todavia no migra armas, proficiencies, biography completa ni payload completo de actor `dnd5e`.

### Siguiente objetivo actualizado

- migrar mas reglas reales desde `scripts/character-builder.js`;
- crear `packages/data-engine` para ids y catálogos normalizados;
- empezar a conectar el modulo Foundry actual con `packages/foundry-exporter`.

### Exportador ampliado

Se actualizo `packages/foundry-exporter/src/index.ts` para:

- construir items de clase desde `classing.classes`;
- construir feats de background, feats elegidas y features de clase;
- parsear spells con formato `NvX: Nombre`;
- emitir un payload Foundry mas cercano al prototipo actual, aunque todavia parcial.

### Data engine inicial

Se agrego `packages/data-engine` como primera capa de normalizacion.

Incluye:

- catalogo inicial de clases con aliases en ingles y español;
- catalogo inicial de razas;
- catalogo inicial de backgrounds;
- helpers para resolver labels del prototipo a ids canonicos.

Impacto inmediato:

- `packages/domain` ahora puede resolver clases como `Bárbaro`, `Guerrero`, `Pícaro` y traducirlas a ids canonicos;
- eso reduce el riesgo de romper la migracion por el cambio entre labels del modulo actual y el modelo nuevo.

### Puente con el modulo actual

Se agrego `scripts/model-bridge.js` dentro del modulo Foundry actual.

Objetivo:

- producir un `CharacterBuild` canonico desde el `formData` legacy;
- guardar ese objeto dentro de `flags.bertinis-vault.canonicalBuild` al crear el actor;
- empezar a conectar el prototipo actual con la nueva arquitectura sin romper el flujo existente.

Estado:

- el actor todavia se construye con el builder legacy;
- pero ahora ya queda embebida una representacion canonica del personaje para la migracion futura.

### Preview export paralelo

Se agrego `scripts/foundry-export-bridge.js`.

Objetivo:

- derivar un payload Foundry-like desde `canonicalBuild`;
- guardarlo junto al actor legacy sin cambiar todavia el flujo de creacion real;
- poder comparar la salida vieja y la nueva durante la migracion.

Estado:

- el actor que se crea en Foundry sigue saliendo del builder viejo;
- pero ahora tambien se guarda `flags.bertinis-vault.canonicalFoundryPreview`;
- esa preview ya incluye abilities, HP, AC, clase, feats/features y spells derivadas del modelo canonico.

### Sustitucion progresiva del payload legacy

Se empezo a reutilizar la preview derivada del modelo canonico dentro de `scripts/character-builder.js`.

Partes que ahora salen del camino nuevo:

- `system.abilities`;
- `system.spells`;
- `system.attributes.ac`;
- `system.attributes.hp`;
- `system.attributes.spellcasting`;
- `system.details.alignment`;
- `system.details.biography`;
- `system.details.race`;
- `system.details.background`;
- `system.details.originalClass`;
- `system.details.trait`;
- `system.details.ideal`;
- `system.details.bond`;
- `system.details.flaw`;
- `system.traits.weaponProf`;
- `system.traits.armorProf`;
- items de tipo `class`;
- items de tipo `feat`;
- items de tipo `spell`;
- item de arma principal cuando puede resolverse desde la preview.

Partes que siguen en legacy por ahora:

- partes mas finas del `system`;
- secciones detalladas restantes de traits y token.

Motivo:

- mover primero las piezas mas seguras;
- reducir duplicacion;
- mantener el riesgo bajo mientras comparamos salidas.

### Inicio del frontend web

Se creo el scaffold inicial de `apps/web`.

Incluye:

- `package.json` y `tsconfig.json` propios;
- `index.html`;
- `src/main.tsx`;
- `src/App.tsx`;
- `src/styles.css`.

Estado:

- ya existe una base real para la web app fuera de Foundry;
- por ahora funciona como pantalla de producto y de estado del proyecto;
- el siguiente paso sera convertirla en builder por pasos conectado a `contracts` y `domain`.

### Primer builder web interactivo

Se transformo `apps/web` desde una pantalla estatica a un builder inicial con estado local.

Incluye:

- pasos navegables;
- datos de identidad;
- raza, clase y nivel;
- atributos editables;
- personalidad basica;
- preview viva de character summary.

Estado:

- ya no es solo scaffold;
- ya existe una primera experiencia real de builder web;
- el siguiente paso sera conectarlo al modelo canonico compartido y ampliar opciones del personaje.

### Snapshot canónico en web

Se agrego `apps/web/src/builder.ts` para derivar un snapshot canonico desde el estado del builder.

Impacto:

- la web ya no solo edita campos visuales;
- ahora tambien muestra una representacion estructurada del personaje;
- eso acerca la UI web al `CharacterBuild` que ya usa la arquitectura nueva.

### Ampliacion del builder web

Se agregaron decisiones nuevas al flujo web:

- background;
- feat destacada;
- arma principal;
- proteccion/armor.

Impacto:

- el builder ya se parece mas a un creador real de personaje;
- el snapshot canonico web ahora incluye mas decisiones relevantes;
- la siguiente capa natural sera spells, features y una sheet visual mas completa.

### Magia y features en web

Se agregaron al builder web:

- cantrips;
- spells por linea;
- features por linea.

Impacto:

- el flujo web ya cubre una porcion mucho mas realista del personaje;
- el snapshot canonico ahora incluye magia y rasgos editables;
- el siguiente paso natural es convertir la preview en una sheet visual mas parecida al producto final.

### Preview elevada a character sheet

Se mejoro la preview lateral del builder web para que se parezca mas a una sheet final.

Ahora incluye:

- seccion de build;
- tags de background, feat y equipo;
- bloques de magia;
- bloques de features;
- distribucion mas cercana a una hoja visual de personaje.

### Persistencia local del builder web

Se agrego guardado automatico del borrador del builder web en el navegador.

Ahora incluye:

- restauracion del personaje al recargar la pagina;
- guardado local automatico al cambiar campos;
- reinicio rapido del borrador desde la interfaz.

Impacto:

- la web ya no se siente como una demo descartable;
- permite iterar un personaje sin perder progreso al refrescar;
- deja lista una base simple para futuras capas de autosave real o cuentas de usuario.

### Export inicial desde la web

Se agrego una primera salida util del personaje directamente desde el builder web.

Ahora incluye:

- copia del snapshot canonico al portapapeles;
- descarga del personaje como archivo `.canonical.json`;
- estado visual simple para confirmar si la exportacion salio bien.

Impacto:

- el builder web ya produce una salida portable;
- acerca la web al flujo real de exportacion futura hacia Foundry;
- deja una base simple para agregar exportadores mas adelante sin rehacer la UI.

### Preview Foundry desde la web

Se conecto el builder web con el exportador Foundry compartido del workspace.

Ahora incluye:

- snapshot web mas alineado al contrato canonico del proyecto;
- generacion de preview de actor Foundry desde la misma UI;
- copia y descarga del payload inicial de actor.

Impacto:

- la web ya no exporta solo el formato interno;
- acerca mucho mas el builder al flujo final de Foundry;
- reduce la distancia entre la experiencia web y el modulo actual.

### Payload Foundry mas rico en la capa compartida

Se reforzo el exportador Foundry compartido para producir un actor mas completo.

Ahora incluye:

- biografia y detalles descriptivos dentro de `system.details`;
- proficiencias de armas y armaduras dentro de `system.traits`;
- arma principal reconocida como item de tipo `weapon`.

Impacto:

- la preview Foundry web se parece mas al actor real esperado;
- el exportador compartido absorbe logica que antes vivia solo en el puente legacy;
- prepara mejor el terreno para reemplazar piezas del modulo actual con la capa nueva.

### Biografia completa en el builder web

Se completo la captura de personalidad y notas dentro del builder web.

Ahora incluye:

- bond;
- flaw;
- notes;
- y reflejo de esos campos en la preview de personaje.

Impacto:

- el `CharacterBuild` web alimenta mejor la biografia canonica;
- la salida hacia Foundry ya puede aprovechar mas campos narrativos;
- la sheet web empieza a sentirse mas cercana a una character sheet real.

### Preview local lista para web

Se preparo `apps/web` para levantarse con un preview local real usando Vite.

Ahora incluye:

- script `dev` para desarrollo local;
- script `preview` para revisar el build;
- configuracion `vite.config.ts`;
- comandos documentados en el README del frontend.

Impacto:

- ya no dependemos de imaginar la UI solo leyendo codigo;
- el equipo puede abrir la web localmente mucho mas rapido;
- acelera validacion visual y futuras iteraciones de diseño.

### Aliases de workspace para preview web

Se ajusto Vite para resolver los paquetes internos del monorepo directo desde `src` en desarrollo.

Ahora incluye:

- alias para `@bertinis-vault/contracts`;
- alias para `@bertinis-vault/domain`;
- alias para `@bertinis-vault/foundry-exporter`.

Impacto:

- la web puede levantar en modo dev sin exigir builds previos de cada paquete;
- reduce friccion para revisar la UI localmente;
- mejora el flujo diario de trabajo del proyecto.

### Calculo de AC mas realista en la capa compartida

Se mejoro la derivacion del personaje para que tenga en cuenta mejor la proteccion elegida.

Ahora incluye:

- catalogo inicial de armaduras compartido en `data-engine`;
- deteccion de armadura y escudo desde `choices.equipment`;
- uso de `derived.ac` dentro de la sheet web.

Impacto:

- la web y Foundry quedan mas alineados en defensa real del personaje;
- el dominio deja de asumir siempre `10 + DEX`;
- seguimos moviendo reglas concretas al motor compartido del proyecto.

### Catalogo de armas compartido

Se movio la informacion basica de armas a `data-engine` para evitar duplicacion.

Ahora incluye:

- catalogo inicial de armas reutilizable;
- resolucion y busqueda compartida de armas;
- uso del catalogo desde la UI web y desde el exportador Foundry.

Impacto:

- web y exportador comparten la misma fuente de verdad para armas;
- baja el riesgo de que una opcion exista en la UI pero no se exporte bien;
- seguimos consolidando reglas y datos fuera de capas aisladas.

### Base inicial de `apps/api`

Se abrio la base del backend/BFF para empezar a formalizar la relacion con 5etools.

Ahora incluye:

- scaffold del servicio API;
- endpoint de salud;
- endpoint de opciones del builder usando datasets compartidos;
- cliente base configurado para la API de 5etools en Render.

Impacto:

- la estrategia de datos deja de ser solo conceptual;
- empezamos a materializar el BFF que va a desacoplar web y fuentes externas;
- prepara el camino para sincronizaciones y proxies mas selectivos contra 5etools.
