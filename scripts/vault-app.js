// ============================================================
// Bertini's Vault — VaultCreatorApp
// Foundry Application class — renders the character creation
// form inside a Foundry window and handles all form logic
// ============================================================

import {
  SUBCLASSES, SUBRACES, BACKGROUNDS, CLASS_PROFS,
  ARMOR_OPTIONS, WEAPON_OPTIONS, FEAT_ASI_LEVELS,
  FEATS_NO_PREREQ, ALL_FEATS, PB_COST, PB_MAX_POINTS,
  PB_MIN, PB_MAX
} from './data.js';
import { buildActor } from './character-builder.js';
import { createCanonicalCharacterBuild } from './model-bridge.js';
import {
  buildFoundryPreflightPreview,
  formatPreflightIssues,
} from './preflight-bridge.js';

const TOTAL_STEPS = 9;

export class VaultCreatorApp extends Application {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'vault-creator',
      title: game.i18n.localize('VAULT.Title'),
      template: 'modules/bertinis-vault/templates/vault-creator.html',
      width: 620,
      height: 680,
      resizable: true,
      classes: ['vault-app'],
    });
  }

  constructor(...args) {
    super(...args);
    this._step = 1;
    this._formData = {};
    this._rollSets = [];
    this._chosenSet = null;
    this._setsRolled = false;
    this._selectedRollIdx = null;
    this._selectedArrayChip = null;
    this._currentMethod = 'roll';
    this._pbVals = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    this._createdActor = null;
  }

  getData() {
    return {
      step: this._step,
      total: TOTAL_STEPS,
      subclasses: SUBCLASSES,
      subraces: SUBRACES,
      backgrounds: BACKGROUNDS,
      armorOptions: ARMOR_OPTIONS,
      weaponOptions: WEAPON_OPTIONS,
      featsNoPrereq: FEATS_NO_PREREQ,
      allFeats: ALL_FEATS,
      formData: this._formData,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Navigation
    html.on('click', '.vault-btn-next',   () => this._nextStep(html));
    html.on('click', '.vault-btn-back',   () => this._prevStep(html));
    html.on('click', '.vault-btn-create', () => this._createCharacter(html));

    // Option highlight (radio/checkbox)
    html.on('change', 'input[type=radio]', e => {
      const name = e.target.name;
      html.find(`input[name="${name}"]`).closest('.vault-opt').removeClass('selected');
      $(e.target).closest('.vault-opt').addClass('selected');
    });
    html.on('change', 'input[type=checkbox]', e => {
      $(e.target).closest('.vault-opt').toggleClass('selected', e.target.checked);
    });

    // Step 2 — class selects subclass
    html.on('change', 'input[name="cls"]', e => this._onClassChange(html, e.target.value));

    // Step 3 — race selects subrace
    html.on('change', 'input[name="race"]', e => this._onRaceChange(html, e.target.value));

    // Step 4 — background shows feat
    html.on('change', '#vault-background', () => this._onBgChange(html));

    // Step 5 — dice methods
    html.on('click', '.vault-tab', e => this._switchDiceMethod(html, e.currentTarget.dataset.method));
    html.on('click', '#vault-roll-btn', () => this._rollThreeSets(html));
    html.on('click', '.vault-btn-choose-set', e => this._chooseSet(html, parseInt(e.currentTarget.dataset.set)));
    html.on('click', '.vault-die', e => this._selectDie(html, e.currentTarget));
    html.on('click', '.vault-stat-input', e => this._assignDie(html, e.currentTarget.dataset.stat));
    html.on('click', '.vault-array-chip', e => this._selectArrayChip(html, e.currentTarget));
    html.on('click', '.vault-arr-stat', e => this._assignArray(html, e.currentTarget.dataset.stat));
    html.on('click', '.vault-pb-btn', e => this._pbAdj(html, e.currentTarget.dataset.stat, parseInt(e.currentTarget.dataset.delta)));

    // Modifiers live update
    html.on('input', '.vault-stat-manual', e => this._calcMod(html, e.target.dataset.stat));

    // Step 6 — DM feat toggle
    html.on('change', 'input[name="dmfeat"]', e => {
      html.find('#vault-dmfeat-field').toggle(e.target.value === 'si');
    });

    // Result — open sheet
    html.on('click', '.vault-btn-open', () => this._openSheet());

    // Init progress dots
    this._updateProgress(html);
  }

  // ── Navigation ─────────────────────────────────────────────────

  _nextStep(html) {
    if (this._step === 5) this._syncStats(html);
    if (this._step === 5) this._buildEquipmentGrid(html);
    this._saveStepData(html);
    if (this._step < TOTAL_STEPS) {
      this._step++;
      if (this._step === 6) this._buildFeatSection(html);
      if (this._step === 8) this._buildEquipmentGrid(html);
      this._showStep(html);
    }
  }

  _prevStep(html) {
    if (this._step > 1) {
      this._step--;
      this._showStep(html);
    }
  }

  _showStep(html) {
    html.find('.vault-step').removeClass('active');
    html.find(`#vault-step-${this._step}`).addClass('active');
    this._updateProgress(html);
    // Scroll to top
    html.find('.vault-body').scrollTop(0);
  }

  _updateProgress(html) {
    html.find('.vault-progress-dot').each((i, el) => {
      const n = i + 1;
      $(el).removeClass('active done');
      if (n < this._step) $(el).addClass('done');
      if (n === this._step) $(el).addClass('active');
    });
  }

  // ── Step-specific logic ────────────────────────────────────────

  _onClassChange(html, cls) {
    const subs = SUBCLASSES[cls] || [];
    const sel  = html.find('#vault-subclass');
    sel.empty().append(subs.map(s => `<option value="${s}">${s}</option>`).join(''));
    html.find('#vault-subclass-field').toggle(subs.length > 0);
  }

  _onRaceChange(html, race) {
    const subs = SUBRACES[race] || [];
    const sel  = html.find('#vault-subrace');
    if (subs.length <= 1) { html.find('#vault-subrace-field').hide(); return; }
    sel.empty()
       .append('<option value="">— elegí —</option>')
       .append(subs.map(s => `<option value="${s}">${s}</option>`).join(''));
    html.find('#vault-subrace-field').show();
  }

  _onBgChange(html) {
    const sel  = html.find('#vault-background')[0];
    const opt  = sel.options[sel.selectedIndex];
    const feat = opt?.dataset?.feat || '';
    const box  = html.find('#vault-bg-feat-auto');
    const custom = html.find('#vault-bg-feat-custom');
    if (feat) {
      box.html(`<b>✦ Este trasfondo otorga:</b> ${feat}`).show();
      custom.hide();
    } else if (sel.value.includes('personalizado')) {
      box.hide(); custom.show();
    } else {
      box.hide(); custom.hide();
    }
  }

  // ── Dice roller — 3 sets ──────────────────────────────────────

  _roll4d6() {
    const dice = Array.from({ length: 4 }, () => Math.ceil(Math.random() * 6));
    dice.sort((a, b) => b - a);
    return { total: dice[0] + dice[1] + dice[2], dice };
  }

  _rollThreeSets(html) {
    if (this._setsRolled) return;
    this._setsRolled = true;

    const btn = html.find('#vault-roll-btn');
    btn.prop('disabled', true).text('✓ SETS GENERADOS').css({ opacity: 0.4, cursor: 'not-allowed' });
    btn.off('click');

    this._rollSets = [];
    for (let s = 0; s < 3; s++) {
      const set = Array.from({ length: 6 }, (_, i) => ({ ...this._roll4d6(), assigned: null, idx: i }));
      this._rollSets.push(set);
      const sum = set.reduce((acc, r) => acc + r.total, 0);
      const container = html.find(`#vault-set-dice-${s}`).empty();
      set.forEach((r, i) => {
        const die = $(`
          <div class="vault-die rolling" data-set="${s}" data-idx="${i}">
            <span class="die-val">${r.total}</span>
            <span class="die-sub">[${r.dice.slice(0,3).join(',')}] -${r.dice[3]}</span>
            <span class="die-stat"></span>
          </div>`);
        container.append(die);
        setTimeout(() => die.removeClass('rolling'), 400 + i * 60);
      });
      html.find(`#vault-set-sum-${s}`).text(`Suma: ${sum}`);
      html.find(`#vault-choose-set-${s}`).show();
    }
  }

  _chooseSet(html, setIdx) {
    this._chosenSet = setIdx;
    for (let s = 0; s < 3; s++) {
      const setEl  = html.find(`#vault-roll-set-${s}`);
      const btn    = html.find(`#vault-choose-set-${s}`);
      if (s === setIdx) {
        setEl.addClass('chosen').removeClass('disabled');
        btn.text('✓ ELEGIDO').addClass('chosen-mark');
      } else {
        setEl.addClass('disabled').removeClass('chosen');
        btn.hide();
      }
    }
    // Reset assignments
    ['str','dex','con','int','wis','cha'].forEach(s => {
      html.find(`[data-stat="${s}"].vault-stat-input`).val('');
      html.find(`[data-stat="${s}"].vault-stat-mod`).text('');
    });
    this._rollSets[setIdx].forEach(r => { r.assigned = null; });
    this._selectedRollIdx = null;
    html.find('#vault-assign-section').show();
  }

  _selectDie(html, el) {
    const $el = $(el);
    const setIdx = parseInt($el.data('set'));
    if (this._chosenSet === null || setIdx !== this._chosenSet) return;
    const idx = parseInt($el.data('idx'));
    if (this._rollSets[setIdx][idx].assigned) return;
    html.find('.vault-die').removeClass('selected');
    $el.addClass('selected');
    this._selectedRollIdx = idx;
  }

  _assignDie(html, stat) {
    if (this._selectedRollIdx === null || this._chosenSet === null) return;
    const rv = this._rollSets[this._chosenSet][this._selectedRollIdx];
    if (rv.assigned) return;
    // Remove previous assignment for this stat
    const prev = this._rollSets[this._chosenSet].find(r => r.assigned === stat);
    if (prev) {
      prev.assigned = null;
      html.find(`[data-set="${this._chosenSet}"][data-idx="${prev.idx}"].vault-die`).removeClass('used').find('.die-stat').text('');
    }
    rv.assigned = stat.toUpperCase();
    html.find(`[data-stat="${stat}"].vault-stat-input`).val(rv.total);
    this._calcMod(html, stat);
    html.find(`[data-set="${this._chosenSet}"][data-idx="${this._selectedRollIdx}"].vault-die`)
      .addClass('used').removeClass('selected').find('.die-stat').text(stat.toUpperCase());
    this._selectedRollIdx = null;
    html.find('.vault-die').removeClass('selected');
  }

  // ── Standard Array ─────────────────────────────────────────────

  _selectArrayChip(html, el) {
    const $el = $(el);
    if ($el.hasClass('used')) return;
    html.find('.vault-array-chip').removeClass('selected').css('outline', '');
    $el.addClass('selected');
    this._selectedArrayChip = $el;
  }

  _assignArray(html, stat) {
    if (!this._selectedArrayChip) return;
    const val = parseInt(this._selectedArrayChip.data('val'));
    // Remove prev assignment for this stat
    html.find(`.vault-array-chip[data-assigned="${stat}"]`).removeClass('used selected').removeData('assigned');
    html.find(`[data-stat="${stat}"].vault-arr-stat-input`).val(val);
    this._calcModGen(html, stat, `arr`);
    this._selectedArrayChip.addClass('used').data('assigned', stat).removeClass('selected');
    this._selectedArrayChip = null;
  }

  // ── Point Buy ──────────────────────────────────────────────────

  _pbSpent() {
    return Object.values(this._pbVals).reduce((acc, v) => acc + (PB_COST[v] || 0), 0);
  }

  _pbAdj(html, stat, delta) {
    const newVal = this._pbVals[stat] + delta;
    if (newVal < PB_MIN || newVal > PB_MAX) return;
    const tentative = { ...this._pbVals, [stat]: newVal };
    if (Object.values(tentative).reduce((a, v) => a + (PB_COST[v] || 0), 0) > PB_MAX_POINTS) return;
    this._pbVals[stat] = newVal;
    const mod = Math.floor((newVal - 10) / 2);
    html.find(`#vault-pb-val-${stat}`).text(newVal);
    html.find(`#vault-pb-mod-${stat}`).text((mod >= 0 ? '+' : '') + mod);
    html.find('#vault-pb-total').html(`Puntos disponibles: <b>${PB_MAX_POINTS - this._pbSpent()}</b> / ${PB_MAX_POINTS}`);
  }

  // ── Stats sync ─────────────────────────────────────────────────

  _syncStats(html) {
    const stats = ['str','dex','con','int','wis','cha'];
    if (this._currentMethod === 'array') {
      stats.forEach(s => {
        const v = html.find(`[data-stat="${s}"].vault-arr-stat-input`).val();
        html.find(`[data-stat="${s}"].vault-stat-input`).val(v);
        this._calcMod(html, s);
      });
    } else if (this._currentMethod === 'pb') {
      stats.forEach(s => {
        html.find(`[data-stat="${s}"].vault-stat-input`).val(this._pbVals[s]);
        this._calcMod(html, s);
      });
    } else if (this._currentMethod === 'manual') {
      stats.forEach(s => {
        const v = html.find(`[data-stat="${s}"].vault-stat-manual`).val();
        html.find(`[data-stat="${s}"].vault-stat-input`).val(v);
        this._calcMod(html, s);
      });
    }
  }

  _switchDiceMethod(html, method) {
    this._currentMethod = method;
    html.find('.vault-tab').removeClass('active');
    html.find(`[data-method="${method}"]`).addClass('active');
    html.find('.vault-panel').removeClass('active');
    html.find(`#vault-panel-${method}`).addClass('active');
  }

  _calcMod(html, stat) {
    const v = parseInt(html.find(`[data-stat="${stat}"].vault-stat-input`).val()) || 0;
    const m = Math.floor((v - 10) / 2);
    html.find(`[data-stat="${stat}"].vault-stat-mod`).text(v > 0 ? (m >= 0 ? '+' : '') + m : '');
  }

  _calcModGen(html, stat, suffix) {
    const v = parseInt(html.find(`[data-stat="${stat}"].vault-${suffix}-stat-input`).val()) || 0;
    const m = Math.floor((v - 10) / 2);
    html.find(`[data-stat="${stat}"].vault-${suffix}-stat-mod`).text(v > 0 ? (m >= 0 ? '+' : '') + m : '');
  }

  // ── Feats section ──────────────────────────────────────────────

  _buildFeatSection(html) {
    const cls = html.find('input[name="cls"]:checked').val() || '';
    const lv  = parseInt(html.find('#vault-level').val()) || 1;
    const asiLevels = (FEAT_ASI_LEVELS[cls] || []).filter(l => l <= lv);
    const info = html.find('#vault-feat-info');

    if (asiLevels.length) {
      info.text(`Con ${cls} nivel ${lv} tenés ${asiLevels.length} ASI disponible(s) (niveles ${asiLevels.join(', ')}). Podés convertir cada ASI en una feat.`);
      const section = html.find('#vault-level-feats-section').show();
      const grid = section.find('#vault-level-feat-grid').empty();
      asiLevels.forEach((lvl, i) => {
        const sel = $(`<select class="vault-level-feat-sel" data-asi="${i}" data-level="${lvl}">
          <option value="ASI (+2 a un stat o +1 a dos)">ASI: +2 stat o +1/+1</option>
          ${ALL_FEATS.map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>`);
        grid.append($(`<div class="vault-field"><label>Nivel ${lvl}</label></div>`).append(sel));
      });
    } else {
      info.text(`${cls} nivel ${lv}: sin ASIs disponibles todavía.`);
      html.find('#vault-level-feats-section').hide();
    }
  }

  // ── Equipment grid ─────────────────────────────────────────────

  _buildEquipmentGrid(html) {
    const cls   = this._formData.cls || html.find('input[name="cls"]:checked').val() || '';
    const profs = CLASS_PROFS[cls] || { armor: [], weapons: [] };
    const hasMartial = profs.weapons.includes('martial');
    const hasSimple  = profs.weapons.includes('simple');
    const specific   = profs.weapons.filter(w => !['simple','martial'].includes(w));

    // Armor
    const armorGrid = html.find('#vault-armor-grid').empty();
    ARMOR_OPTIONS.forEach(a => {
      const allowed = a.types.length === 0 ||
        a.types.some(t => profs.armor.includes(t));
      if (!allowed && !a.special) return;
      const lbl = $(`<label class="vault-opt"><input type="radio" name="armor" value="${a.name}"> ${a.name}</label>`);
      armorGrid.append(lbl);
    });

    // Shield
    html.find('#vault-shield-yes').toggle(profs.armor.includes('shields'));

    // Weapons
    const weaponGrid = html.find('#vault-weapon-grid').empty();
    WEAPON_OPTIONS.forEach(w => {
      const allowed = (hasSimple && w.types.includes('simple')) ||
        (hasMartial && w.types.includes('martial')) ||
        specific.some(s => w.name.toLowerCase().includes(s));
      if (!allowed) return;
      const lbl = $(`<label class="vault-opt"><input type="radio" name="weapon" value="${w.name} (${w.dmg})"> ${w.name} <span style="font-size:11px;opacity:0.6;margin-left:4px">${w.dmg}</span></label>`);
      weaponGrid.append(lbl);
    });

    // Re-bind option highlights for dynamically added items
    html.find('#vault-armor-grid input, #vault-weapon-grid input').off('change').on('change', e => {
      const name = e.target.name;
      html.find(`input[name="${name}"]`).closest('.vault-opt').removeClass('selected');
      $(e.target).closest('.vault-opt').addClass('selected');
    });
  }

  // ── Save form data ─────────────────────────────────────────────

  _saveStepData(html) {
    const collect = (selector) => html.find(selector).val() || '';
    const radio   = (name) => {
      const el = html.find(`input[name="${name}"]:checked`);
      return el.length ? el.val() : '';
    };
    const checks = (name) => html.find(`input[name="${name}"]:checked`).map((_, el) => el.value).get().join(', ');

    Object.assign(this._formData, {
      charName:    collect('#vault-char-name'),
      playerName:  collect('#vault-player-name'),
      level:       collect('#vault-level'),
      alignment:   collect('#vault-alignment'),
      cls:         radio('cls'),
      subclass:    collect('#vault-subclass'),
      race:        radio('race'),
      subrace:     collect('#vault-subrace'),
      background:  collect('#vault-background'),
      bgFeat:      (() => {
        const sel = html.find('#vault-background')[0];
        const opt = sel?.options[sel.selectedIndex];
        return opt?.dataset?.feat || collect('#vault-bg-feat-custom-input');
      })(),
      str: collect('[data-stat="str"].vault-stat-input') || '10',
      dex: collect('[data-stat="dex"].vault-stat-input') || '10',
      con: collect('[data-stat="con"].vault-stat-input') || '10',
      int: collect('[data-stat="int"].vault-stat-input') || '10',
      wis: collect('[data-stat="wis"].vault-stat-input') || '10',
      cha: collect('[data-stat="cha"].vault-stat-input') || '10',
      dmFeat: (() => {
        const checked = html.find('input[name="dmfeat"]:checked').val();
        return checked === 'si' ? collect('#vault-dmfeat-select') : 'Ninguna';
      })(),
      levelFeats: (() => {
        const parts = [];
        html.find('.vault-level-feat-sel').each((_, el) => {
          parts.push(`Nivel ${$(el).data('level')}: ${$(el).val()}`);
        });
        return parts.join(', ');
      })(),
      cantrips:   collect('#vault-cantrips'),
      spells:     collect('#vault-spells'),
      features:   collect('#vault-features'),
      armor:      radio('armor'),
      shield:     radio('shield'),
      weapon:     radio('weapon'),
      weaponCustom: collect('#vault-weapon-custom'),
      notes:      collect('#vault-notes'),
      trait:      collect('#vault-trait'),
      ideal:      collect('#vault-ideal'),
      bond:       collect('#vault-bond'),
      flaw:       collect('#vault-flaw'),
    });
  }

  // ── Create character ───────────────────────────────────────────

  async _createCharacter(html) {
    this._saveStepData(html);

    const canonicalBuild = createCanonicalCharacterBuild(this._formData, {});
    const preflight = buildFoundryPreflightPreview(canonicalBuild);

    if (!preflight.ok) {
      const blockerSummary = formatPreflightIssues(preflight);
      const blockerMessage = blockerSummary
        ? `Preflight bloqueado: ${blockerSummary}`
        : 'Preflight bloqueado por validaciones previas al export.';

      ui.notifications.error(blockerMessage);
      html.find('#vault-error').show().find('#vault-error-msg').text(blockerMessage);
      return;
    }

    if (preflight.summary.warnings > 0) {
      const warningSummary = formatPreflightIssues(preflight);
      ui.notifications.warn(
        warningSummary
          ? `Vault preflight: ${warningSummary}`
          : 'Vault preflight detecto advertencias en esta build.',
      );
    }

    // Show loading state
    html.find('#vault-step-9').hide();
    html.find('.vault-footer').hide();
    html.find('#vault-creating').show();

    try {
      const actorData = buildActor(this._formData);
      this._createdActor = await Actor.create(actorData);

      // Show success
      html.find('#vault-creating').hide();
      html.find('#vault-success').show();
      html.find('#vault-created-name').text(this._createdActor.name);

      ui.notifications.info(
        `✦ ${game.i18n.localize('VAULT.Success')}: ${this._createdActor.name}`
      );
    } catch (err) {
      console.error('Vault | Error creating character:', err);
      html.find('#vault-creating').hide();
      html.find('#vault-error').show().find('#vault-error-msg').text(err.message);
    }
  }

  _openSheet() {
    if (this._createdActor) {
      this._createdActor.sheet.render(true);
      this.close();
    }
  }
}
