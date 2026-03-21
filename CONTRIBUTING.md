# Contributing to Bertini's Vault

## Architecture

```
scripts/
  vault.js              ← Entry point. Hooks only. No logic here.
  vault-app.js          ← Application class. UI/UX and form state.
  character-builder.js  ← Pure functions. Data in → Foundry actor out.
  data.js               ← Static D&D data only. No Foundry API calls.
styles/
  vault.css             ← All styles. BEM-ish: .vault-[component]-[element]
templates/
  vault-creator.html    ← Handlebars template. No logic, only structure.
lang/
  es.json / en.json     ← Localization keys prefixed VAULT.*
```

## Key rules

1. `character-builder.js` must be pure — no DOM, no Foundry API, no side effects.
   Input: plain JS object. Output: plain JS object. Testable without Foundry.

2. `data.js` is the single source of truth for all D&D content.
   Never hardcode class names, subclasses, or game data anywhere else.

3. The Application renders from `getData()` + Handlebars template.
   Don't manipulate DOM directly except in `activateListeners()`.

4. All user-visible strings must go through `game.i18n.localize('VAULT.Key')`.

## Foundry API used

- `Actor.create(data)` — creates the actor
- `game.settings.register/get` — module settings
- `Application` class — window management
- `Hooks.on/once` — event system
- `game.i18n.localize` — localization
- `ui.notifications.info/error` — toast messages

## Schema target

dnd5e system version: 5.2.5
Foundry core version: 13.351
Actor type: character
All items follow the dnd5e 5.x Activities schema.

## Testing

1. Copy module to `{FoundryData}/Data/modules/bertinis-vault/`
2. Restart Foundry
3. Enable module
4. Click "✦ Vault: Crear Personaje" in Actors directory
5. Complete form → verify actor created with correct data

## Known limitations (v0.1.0)

- Skill proficiency selection not yet implemented (all skills start at 0)
- Race ability score bonuses not applied automatically (user enters final values)
- Spell descriptions are empty (no compendium lookup yet)
- Weapon attack rolls not yet fully wired to Activities
