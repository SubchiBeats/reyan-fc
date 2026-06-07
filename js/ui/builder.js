/* Reyan FC — Squad Builder view */
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

      // re-render on squad changes (view-scoped: auto-cleaned on navigation)
      RFC.viewOn('squad', draw);
    },
  };

  function squadInfo() {
    const sq = RFC.state.activeSquad;
    const slots = RFC.FORMATIONS[sq.formation];
    const chem = RFC.computeChemistry(slots, sq.slots);
    const rating = RFC.computeRating(sq.slots);
    return { sq, slots, chem, rating };
  }

  function drawPitch(container) {
    container.innerHTML = '';
    const { sq, slots, chem } = squadInfo();
    const pitch = el('div', { class: 'pitch' });

    // decorative pitch markings
    pitch.appendChild(el('div', { class: 'pitch-lines' }, [
      el('div', { class: 'pl-circle' }),
      el('div', { class: 'pl-mid' }),
      el('div', { class: 'pl-box pl-box-top' }),
      el('div', { class: 'pl-box pl-box-bot' }),
    ]));

    slots.forEach((slot, i) => {
      const node = el('div', {
        class: 'slot',
        style: `left:${slot.x}%; top:${slot.y}%;`,
      });
      const pid = sq.slots[i];
      const p = RFC.playerById(pid);

      if (p) {
        const c = RFC.ui.playerCard(p, { size: 'pitch', chem: chem.perPlayer[i] });
        if (!chem.inPos[i]) c.classList.add('oop');
        c.addEventListener('click', () => slotMenu(i, slot));
        node.appendChild(c);
        const rm = el('button', { class: 'slot-remove', title: 'Remove', text: '×' });
        rm.addEventListener('click', (e) => { e.stopPropagation(); RFC.setSlot(i, null); });
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

  function openPick(i, slot) {
    RFC.ui.openPlayerPicker({
      source: 'db',
      slotPos: slot.pos,
      title: `Add a ${slot.pos}`,
      onPick: (p) => RFC.setSlot(i, p.id),
    });
  }

  function slotMenu(i, slot) {
    const p = RFC.playerById(RFC.state.activeSquad.slots[i]);
    const box = el('div', { class: 'mini-menu' }, [
      el('div', { class: 'mini-menu-name', text: p ? p.name : '' }),
      menuBtn('Swap player', () => { m.close(); openPick(i, slot); }),
      menuBtn('Remove', () => { m.close(); RFC.setSlot(i, null); }),
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

    // formation selector
    const formSel = el('select', { class: 'form-select' },
      RFC.FORMATION_NAMES.map((n) => el('option', { value: n, text: n, selected: n === sq.formation })));
    formSel.addEventListener('change', () => RFC.setFormation(formSel.value));

    // ratings tiles
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

    // chem bar
    const chemBar = el('div', { class: 'chem-bar' }, [
      el('div', { class: 'chem-bar-fill', style: `width:${(chem.total / 33) * 100}%` }),
    ]);

    // squad meta breakdown (top league/nation)
    const meta = squadBreakdown(sq.slots);

    // actions
    const actions = el('div', { class: 'side-actions' }, [
      btn('🎲 Auto-fill best XI', 'btn-primary', () => autoFill()),
      btn('💾 Save squad', 'btn', () => saveSquad()),
      btn('📂 Load squad', 'btn', () => loadSquad()),
      btn('🏆 Send to Season', 'btn', () => sendToSeason()),
      btn('🧹 Clear', 'btn ghost', () => { if (confirm('Clear the whole squad?')) RFC.clearSquad(); }),
    ]);

    container.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'FORMATION' }),
      formSel,
      tiles,
      chemBar,
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

  /* ---- auto fill: pick best in-position players to maximize chem-friendly XI ---- */
  function autoFill() {
    const { sq, slots } = squadInfo();
    // strategy: choose a dominant league, fill each slot with best in-position player from that league,
    // fallback to best overall in position.
    const leagueScore = {};
    RFC.PLAYERS.forEach((p) => { leagueScore[p.league] = (leagueScore[p.league] || 0) + p.rating; });
    const bestLeague = Object.entries(leagueScore).sort((a, b) => b[1] - a[1])[0][0];

    const used = new Set();
    const slotsAssigned = slots.map((slot) => {
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
    RFC.state.activeSquad.slots = slotsAssigned;
    RFC.save();
    RFC.emit('squad');
    RFC.toast('Auto-filled a strong XI ⚡', 'good');
  }

  function saveSquad() {
    const { sq } = squadInfo();
    if (RFC.countFilled(sq.slots) === 0) { RFC.toast('Build a squad first.', 'warn'); return; }
    const name = prompt('Name this squad:', 'My XI ' + (RFC.state.savedSquads.length + 1));
    if (!name) return;
    RFC.state.savedSquads.push({
      name, formation: sq.formation, slots: sq.slots.slice(),
    });
    RFC.save();
    RFC.toast('Squad saved 💾', 'good');
  }

  function loadSquad() {
    if (!RFC.state.savedSquads.length) { RFC.toast('No saved squads yet.', 'warn'); return; }
    const list = el('div', { class: 'load-list' });
    RFC.state.savedSquads.forEach((s, idx) => {
      const rating = RFC.computeRating(s.slots);
      const row = el('div', { class: 'load-row' }, [
        el('div', {}, [
          el('div', { class: 'load-name', text: s.name }),
          el('div', { class: 'load-sub', text: `${s.formation} · Rating ${rating}` }),
        ]),
        el('div', { class: 'load-btns' }, [
          actBtn('Load', () => {
            RFC.state.activeSquad = { formation: s.formation, slots: s.slots.slice() };
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
    const { sq } = squadInfo();
    if (RFC.countFilled(sq.slots) < 11) { RFC.toast('Fill all 11 spots to start a season.', 'warn'); return; }
    RFC.pendingSeasonSquad = { formation: sq.formation, slots: sq.slots.slice() };
    RFC.toast('Squad sent to Season ⚽ — open the Season tab.', 'good');
    RFC.router.go('season');
  }
})(window.RFC);
