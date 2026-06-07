/* Reyan FC — Squad Builder view (Free Build + Ultimate Team modes) */
window.RFC = window.RFC || {};
RFC.views = RFC.views || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  RFC.views.builder = {
    render(root) {
      root.innerHTML = '';
      const wrap = el('div', { class: 'builder' });
      const pitchWrap = el('div', { class: 'pitch-wrap' });
      const sidebar = el('div', { class: 'builder-side' });
      wrap.appendChild(pitchWrap);
      wrap.appendChild(sidebar);
      root.appendChild(wrap);

      const draw = () => {
        drawPitch(pitchWrap);
        drawSide(sidebar);
      };
      draw();

      RFC.viewOn('squad', draw);
      RFC.viewOn('club', draw);   // UT mode reflects club changes
    },
  };

  function squadInfo() {
    const sq = RFC.state.activeSquad;
    const slots = RFC.FORMATIONS[sq.formation];
    const chem = RFC.computeChemistry(slots, sq.slots);
    const rating = RFC.computeRating(sq.slots);
    return { sq, slots, chem, rating };
  }

  function isUT() { return RFC.state.activeSquad.mode === 'ut'; }

  function drawPitch(container) {
    container.innerHTML = '';
    const { sq, slots, chem } = squadInfo();
    const pitch = el('div', { class: 'pitch' });

    pitch.appendChild(el('div', { class: 'pitch-lines' }, [
      el('div', { class: 'pl-circle' }),
      el('div', { class: 'pl-mid' }),
      el('div', { class: 'pl-box pl-box-top' }),
      el('div', { class: 'pl-box pl-box-bot' }),
    ]));

    slots.forEach((slot, i) => {
      const node = el('div', { class: 'slot', style: `left:${slot.x}%; top:${slot.y}%;` });
      const pid = sq.slots[i];
      const p = RFC.playerById(pid);

      if (p) {
        const c = RFC.ui.playerCard(p, { size: 'pitch', chem: chem.perPlayer[i] });
        if (!chem.inPos[i]) c.classList.add('oop');
        c.addEventListener('click', () => slotMenu(i, slot));
        node.appendChild(c);
        const rm = el('button', { class: 'slot-remove', title: 'Remove', text: '×' });
        rm.addEventListener('click', (e) => { e.stopPropagation(); RFC.clearSlot(i); });
        node.appendChild(rm);
      } else {
        const empty = el('button', { class: 'slot-empty' }, [
          el('span', { class: 'slot-plus', text: '+' }),
          el('span', { class: 'slot-pos', text: slot.pos }),
        ]);
        empty.addEventListener('click', () => openPick(i, slot));
        node.appendChild(empty);
      }
      pitch.appendChild(node);
    });

    container.appendChild(pitch);
  }

  function usedIids() {
    return RFC.state.activeSquad.iids.filter((x) => !!x);
  }

  function openPick(i, slot) {
    if (isUT()) {
      if (!RFC.state.club.length) {
        RFC.toast('Your club is empty — open packs first!', 'warn');
        return;
      }
      RFC.ui.openPlayerPicker({
        source: 'club',
        slotPos: slot.pos,
        excludeIids: usedIids().filter((x) => x !== RFC.state.activeSquad.iids[i]),
        title: `Add a ${slot.pos} from your club`,
        onPick: (p, iid) => RFC.setSlot(i, p.id, iid),
      });
    } else {
      RFC.ui.openPlayerPicker({
        source: 'db',
        slotPos: slot.pos,
        title: `Add a ${slot.pos}`,
        onPick: (p) => RFC.setSlot(i, p.id, null),
      });
    }
  }

  function slotMenu(i, slot) {
    const p = RFC.playerById(RFC.state.activeSquad.slots[i]);
    const box = el('div', { class: 'mini-menu' }, [
      el('div', { class: 'mini-menu-name', text: p ? p.name : '' }),
      menuBtn('Swap player', () => { m.close(); openPick(i, slot); }),
      menuBtn('Remove', () => { m.close(); RFC.clearSlot(i); }),
      menuBtn('Cancel', () => m.close(), 'ghost'),
    ]);
    const m = RFC.modal(box, { cls: 'modal-mini' });
  }

  function menuBtn(label, fn, cls) {
    const b = el('button', { class: 'btn ' + (cls || 'btn-sm'), text: label });
    b.addEventListener('click', fn);
    return b;
  }

  function drawSide(container) {
    container.innerHTML = '';
    const { sq, slots, chem, rating } = squadInfo();
    const filled = RFC.countFilled(sq.slots);
    const ut = isUT();

    /* MODE TOGGLE */
    const modeWrap = el('div', { class: 'mode-toggle' }, [
      makeModeBtn('free', '🌐 Free Build', 'Build with any player in the game'),
      makeModeBtn('ut', '⭐ Ultimate Team', 'Only players you own from packs & rewards'),
    ]);

    /* FORMATION + STATS */
    const formSel = el('select', { class: 'form-select' },
      RFC.FORMATION_NAMES.map((n) => el('option', { value: n, text: n, selected: n === sq.formation })));
    formSel.addEventListener('change', () => RFC.setFormation(formSel.value));

    const tiles = el('div', { class: 'rate-tiles' }, [
      el('div', { class: 'rate-tile' }, [
        el('div', { class: 'rt-num', text: String(rating || '–') }),
        el('div', { class: 'rt-lbl', text: 'RATING' }),
      ]),
      el('div', { class: 'rate-tile' }, [
        el('div', { class: 'rt-num', html: `${chem.total}<small>/33</small>` }),
        el('div', { class: 'rt-lbl', text: 'CHEMISTRY' }),
      ]),
      el('div', { class: 'rate-tile' }, [
        el('div', { class: 'rt-num', html: `${filled}<small>/11</small>` }),
        el('div', { class: 'rt-lbl', text: 'PLAYERS' }),
      ]),
    ]);

    const chemBar = el('div', { class: 'chem-bar' }, [
      el('div', { class: 'chem-bar-fill', style: `width:${(chem.total / 33) * 100}%` }),
    ]);

    /* UT panel: club-size hint + auto-fill from club */
    let utPanel = null;
    if (ut) {
      const ownedCount = RFC.state.club.length;
      utPanel = el('div', { class: 'ut-hint' }, [
        el('span', { class: 'ut-hint-ico', text: '⭐' }),
        el('span', { class: 'ut-hint-text', html:
          `Ultimate Team mode — picking from your <b>${ownedCount}</b> owned player${ownedCount === 1 ? '' : 's'}.` }),
      ]);
    }

    const meta = squadBreakdown(sq.slots);

    /* ACTIONS */
    const actions = el('div', { class: 'side-actions' }, [
      btn(ut ? '⚡ Auto-fill from club' : '🎲 Auto-fill best XI', 'btn-primary', () => autoFill(ut)),
      btn('💾 Save squad', 'btn', () => saveSquad()),
      btn('📂 Load squad', 'btn', () => loadSquad()),
      btn('🏆 Send to Season', 'btn', () => sendToSeason()),
      btn('🧹 Clear', 'btn ghost', () => { if (confirm('Clear the whole squad?')) RFC.clearSquad(); }),
    ]);

    container.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'BUILD MODE' }),
      modeWrap,
      utPanel,
    ].filter(Boolean)));

    container.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'FORMATION' }),
      formSel,
      tiles,
      chemBar,
      buildChemHelp(chem, slots, sq.slots),
    ]));

    container.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'SQUAD' }),
      actions,
    ]));

    if (meta) container.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'BREAKDOWN' }),
      meta,
    ]));
  }

  function makeModeBtn(key, label, tip) {
    const active = RFC.state.activeSquad.mode === key;
    const b = el('button', { class: 'mode-btn' + (active ? ' on' : ''), title: tip }, [
      el('div', { class: 'mode-lbl', text: label }),
      el('div', { class: 'mode-sub', text: tip }),
    ]);
    b.addEventListener('click', () => {
      if (active) return;
      if (RFC.countFilled(RFC.state.activeSquad.slots) > 0 &&
          !confirm('Switching mode will clear your current squad. Continue?')) return;
      RFC.setBuildMode(key);
      RFC.toast(key === 'ut' ? '⭐ Ultimate Team mode' : '🌐 Free Build mode', 'good');
    });
    return b;
  }

  /* Chemistry help panel — shows current league/nation/club counts vs thresholds */
  function buildChemHelp(chem, slots, squad) {
    // Find top-counted entity per category, then show progress
    const links = chem.links;
    const rows = [];
    const topOf = (obj, thresholds, label) => {
      const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
      if (!entries.length) return;
      const [name, count] = entries[0];
      const next = thresholds.find((t) => count < t);
      const goal = next || thresholds[thresholds.length - 1];
      rows.push(el('div', { class: 'chem-row' }, [
        el('span', { class: 'chem-row-lbl', text: label }),
        el('span', { class: 'chem-row-name', text: name }),
        el('span', { class: 'chem-row-count', text: next ? `${count}/${next}` : `${count} ✓` }),
      ]));
    };
    topOf(links.club, [2, 4, 7], 'Top club');
    topOf(links.league, [3, 5, 8], 'Top league');
    topOf(links.nation, [2, 5, 8], 'Top nation');
    if (!rows.length) return null;
    return el('div', { class: 'chem-help' }, [
      el('div', { class: 'chem-help-title', text: 'CHEM PROGRESS' }),
      ...rows,
    ]);
  }

  function btn(label, cls, fn) {
    const b = el('button', { class: 'btn ' + cls, text: label });
    b.addEventListener('click', fn);
    return b;
  }

  function squadBreakdown(slots) {
    const filled = slots.map((id) => RFC.playerById(id)).filter(Boolean);
    if (!filled.length) return null;
    const top = (key) => {
      const c = {};
      filled.forEach((p) => (c[p[key]] = (c[p[key]] || 0) + 1));
      return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3);
    };
    const line = (title, entries) => el('div', { class: 'bd-line' }, [
      el('span', { class: 'bd-title', text: title }),
      el('span', { class: 'bd-vals', text: entries.map(([k, v]) => `${k} (${v})`).join(' · ') }),
    ]);
    return el('div', { class: 'breakdown' }, [
      line('Leagues', top('league')),
      line('Nations', top('nation')),
      line('Clubs', top('club')),
    ]);
  }

  /* ---- auto fill ---- */
  function autoFill(ut) {
    const sq = RFC.state.activeSquad;
    const slots = RFC.FORMATIONS[sq.formation];

    if (ut) {
      // pick the best owned player per slot, prefer dominant league
      const owned = RFC.state.club.map((c) => ({ iid: c.iid, p: RFC.playerById(c.pid) })).filter((x) => x.p);
      if (owned.length < slots.length) {
        RFC.toast(`You only own ${owned.length} players — get ${slots.length - owned.length} more!`, 'warn');
      }
      const lgCount = {};
      owned.forEach((o) => (lgCount[o.p.league] = (lgCount[o.p.league] || 0) + 1));
      const top = Object.entries(lgCount).sort((a, b) => b[1] - a[1])[0];
      const targetLeague = top ? top[0] : null;
      const usedIids = new Set();
      const newSlots = []; const newIids = [];
      slots.forEach((slot) => {
        const inPosCands = owned.filter((o) => !usedIids.has(o.iid) && RFC.inPosition(o.p, slot.pos));
        const fallback = owned.filter((o) => !usedIids.has(o.iid));
        const cands = (inPosCands.length ? inPosCands : fallback).sort((a, b) => {
          const al = a.p.league === targetLeague ? 8 : 0;
          const bl = b.p.league === targetLeague ? 8 : 0;
          return (b.p.rating + bl) - (a.p.rating + al);
        });
        const pick = cands[0];
        if (pick) { usedIids.add(pick.iid); newSlots.push(pick.p.id); newIids.push(pick.iid); }
        else { newSlots.push(null); newIids.push(null); }
      });
      sq.slots = newSlots; sq.iids = newIids;
    } else {
      const leagueScore = {};
      RFC.PLAYERS.forEach((p) => { leagueScore[p.league] = (leagueScore[p.league] || 0) + p.rating; });
      const bestLeague = Object.entries(leagueScore).sort((a, b) => b[1] - a[1])[0][0];
      const used = new Set();
      sq.slots = slots.map((slot) => {
        const pool = RFC.PLAYERS
          .filter((p) => RFC.inPosition(p, slot.pos) && !used.has(p.id))
          .sort((a, b) => {
            const al = a.league === bestLeague ? 8 : 0;
            const bl = b.league === bestLeague ? 8 : 0;
            return (b.rating + bl) - (a.rating + al);
          });
        const choice = pool[0];
        if (choice) used.add(choice.id);
        return choice ? choice.id : null;
      });
      sq.iids = new Array(slots.length).fill(null);
    }
    RFC.save();
    RFC.emit('squad');
    RFC.toast('Auto-filled ⚡', 'good');
  }

  function saveSquad() {
    const sq = RFC.state.activeSquad;
    if (RFC.countFilled(sq.slots) === 0) { RFC.toast('Build a squad first.', 'warn'); return; }
    const name = prompt('Name this squad:', 'My XI ' + (RFC.state.savedSquads.length + 1));
    if (!name) return;
    RFC.state.savedSquads.push({
      name, mode: sq.mode, formation: sq.formation,
      slots: sq.slots.slice(), iids: sq.iids.slice(),
    });
    RFC.save();
    RFC.toast('Squad saved 💾', 'good');
  }

  function loadSquad() {
    if (!RFC.state.savedSquads.length) { RFC.toast('No saved squads yet.', 'warn'); return; }
    const list = el('div', { class: 'load-list' });
    RFC.state.savedSquads.forEach((s, idx) => {
      const rating = RFC.computeRating(s.slots);
      const modeTag = s.mode === 'ut' ? ' · ⭐ UT' : '';
      const row = el('div', { class: 'load-row' }, [
        el('div', {}, [
          el('div', { class: 'load-name', text: s.name }),
          el('div', { class: 'load-sub', text: `${s.formation} · Rating ${rating}${modeTag}` }),
        ]),
        el('div', { class: 'load-btns' }, [
          actBtn('Load', () => {
            RFC.state.activeSquad = {
              mode: s.mode || 'free',
              formation: s.formation,
              slots: s.slots.slice(),
              iids: (s.iids || new Array(s.slots.length).fill(null)).slice(),
            };
            RFC.save(); RFC.emit('squad'); m.close(); RFC.toast('Squad loaded.', 'good');
          }),
          actBtn('✕', () => {
            RFC.state.savedSquads.splice(idx, 1); RFC.save(); m.close(); loadSquad();
          }, 'ghost'),
        ]),
      ]);
      list.appendChild(row);
    });
    const box = el('div', { class: 'load-box' }, [el('h3', { text: 'Saved squads' }), list]);
    const m = RFC.modal(box, { cls: 'modal-load' });
  }

  function actBtn(label, fn, cls) {
    const b = el('button', { class: 'btn btn-sm ' + (cls || ''), text: label });
    b.addEventListener('click', fn);
    return b;
  }

  function sendToSeason() {
    const sq = RFC.state.activeSquad;
    if (RFC.countFilled(sq.slots) < 11) { RFC.toast('Fill all 11 spots to start a season.', 'warn'); return; }
    RFC.pendingSeasonSquad = { formation: sq.formation, slots: sq.slots.slice() };
    RFC.toast('Squad sent to Season ⚽ — open the Season tab.', 'good');
    RFC.router.go('season');
  }
})(window.RFC);
