/* Reyan FC — Squad Building Challenges view */
window.RFC = window.RFC || {};
RFC.views = RFC.views || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  let work = null; // { sbcId, formation, slots:[iid|null] }

  RFC.views.sbc = {
    render(root) {
      root.innerHTML = '';
      if (work) renderBuilder(root);
      else renderList(root);
    },
  };

  /* ---------------- list ---------------- */
  function renderList(root) {
    root.appendChild(el('div', { class: 'view-head' }, [
      el('h2', { text: 'Squad Building Challenges' }),
      el('p', { class: 'view-sub', text: 'Submit squads from your club to earn coins & packs. Players you submit are consumed — completing challenges funds the next one.' }),
    ]));

    const grid = el('div', { class: 'sbc-grid' });
    RFC.SBCS.forEach((sbc) => grid.appendChild(sbcCard(sbc, root)));
    root.appendChild(grid);
  }

  function sbcCard(sbc, root) {
    const done = RFC.state.sbcCompleted[sbc.id] || 0;
    const locked = !sbc.repeatable && done > 0;

    const reqChips = el('div', { class: 'sbc-reqs' }, reqLabels(sbc).map((t) => el('span', { class: 'sbc-chip', text: t })));
    const rewardLine = el('div', { class: 'sbc-reward' }, [
      el('span', { class: 'sbc-reward-coins', text: `🪙 ${RFC.fmtCoins(sbc.reward.coins)}` }),
      sbc.reward.pack ? el('span', { class: 'sbc-reward-pack', text: `🎁 ${RFC.packById(sbc.reward.pack).name}` }) : null,
    ]);

    const cta = el('button', {
      class: 'btn ' + (locked ? 'ghost disabled' : 'btn-primary'),
      text: locked ? '✓ Completed' : (done ? `Submit again (done ×${done})` : 'Build & Submit'),
    });
    if (!locked) cta.addEventListener('click', () => { startWork(sbc); RFC.views.sbc.render(root); });

    return el('div', { class: 'sbc-card tier-edge-' + (sbc.tier === 'elite' ? 'toty' : sbc.tier) }, [
      el('div', { class: 'sbc-top' }, [
        el('div', { class: 'sbc-name', text: sbc.name }),
        el('span', { class: 'sbc-badge', text: sbc.repeatable ? 'Repeatable' : 'One-time' }),
      ]),
      el('p', { class: 'sbc-desc', text: sbc.desc }),
      reqChips,
      rewardLine,
      cta,
    ]);
  }

  function reqLabels(sbc) {
    const r = sbc.req, out = [];
    if (r.minRating) out.push(`Rating ${r.minRating}+`);
    if (r.minChem) out.push(`Chem ${r.minChem}+`);
    if (r.sameLeague) out.push(`${r.sameLeague.count}+ same league`);
    if (r.sameNation) out.push(`${r.sameNation.count}+ same nation`);
    if (r.sameClub) out.push(`${r.sameClub.count}+ same club`);
    if (r.ratedAtLeast) out.push(`${r.ratedAtLeast.count}× ${r.ratedAtLeast.rating}+`);
    return out;
  }

  /* ---------------- builder ---------------- */
  function startWork(sbc) {
    work = { sbcId: sbc.id, formation: '4-3-3', slots: new Array(11).fill(null) };
  }

  function usedIids() {
    return work.slots.filter(Boolean);
  }

  function workInfo() {
    const slots = RFC.FORMATIONS[work.formation];
    const pids = work.slots.map((iid) => {
      const inst = iid && RFC.clubInstance(iid);
      return inst ? inst.pid : null;
    });
    const filledPlayers = pids.map((pid) => RFC.playerById(pid)).filter(Boolean);
    const chem = RFC.computeChemistry(slots, pids);
    const rating = RFC.computeRating(pids);
    return { slots, pids, filledPlayers, chem, rating };
  }

  function renderBuilder(root) {
    const sbc = RFC.sbcById(work.sbcId);
    const { slots, pids, filledPlayers, chem, rating } = workInfo();

    const back = el('button', { class: 'btn ghost back-btn', text: '← Back to challenges' });
    back.addEventListener('click', () => { work = null; RFC.views.sbc.render(root); });

    root.appendChild(el('div', { class: 'view-head' }, [
      back,
      el('h2', { text: sbc.name }),
      el('p', { class: 'view-sub', text: sbc.desc }),
    ]));

    const wrap = el('div', { class: 'builder' });
    const pitchWrap = el('div', { class: 'pitch-wrap' });
    const side = el('div', { class: 'builder-side' });
    wrap.appendChild(pitchWrap); wrap.appendChild(side);
    root.appendChild(wrap);

    // pitch
    const pitch = el('div', { class: 'pitch' });
    pitch.appendChild(el('div', { class: 'pitch-lines' }, [
      el('div', { class: 'pl-circle' }), el('div', { class: 'pl-mid' }),
      el('div', { class: 'pl-box pl-box-top' }), el('div', { class: 'pl-box pl-box-bot' }),
    ]));
    slots.forEach((slot, i) => {
      const node = el('div', { class: 'slot', style: `left:${slot.x}%; top:${slot.y}%;` });
      const p = RFC.playerById(pids[i]);
      if (p) {
        const c = RFC.ui.playerCard(p, { size: 'pitch', chem: chem.perPlayer[i] });
        if (!chem.inPos[i]) c.classList.add('oop');
        c.addEventListener('click', () => pick(i, slot, root));
        node.appendChild(c);
        const rm = el('button', { class: 'slot-remove', text: '×' });
        rm.addEventListener('click', (e) => { e.stopPropagation(); work.slots[i] = null; RFC.views.sbc.render(root); });
        node.appendChild(rm);
      } else {
        const empty = el('button', { class: 'slot-empty' }, [
          el('span', { class: 'slot-plus', text: '+' }),
          el('span', { class: 'slot-pos', text: slot.pos }),
        ]);
        empty.addEventListener('click', () => pick(i, slot, root));
        node.appendChild(empty);
      }
      pitch.appendChild(node);
    });
    pitchWrap.appendChild(pitch);

    // side: formation + live requirement checklist
    const formSel = el('select', { class: 'form-select' },
      RFC.FORMATION_NAMES.map((n) => el('option', { value: n, text: n, selected: n === work.formation })));
    formSel.addEventListener('change', () => {
      work.formation = formSel.value;
      work.slots = new Array(RFC.FORMATIONS[work.formation].length).fill(null);
      RFC.views.sbc.render(root);
    });

    const tiles = el('div', { class: 'rate-tiles' }, [
      tile(rating || '–', 'RATING'),
      tile(`${chem.total}<small>/33</small>`, 'CHEMISTRY'),
      tile(`${filledPlayers.length}<small>/11</small>`, 'PLAYERS'),
    ]);

    const evalres = RFC.evaluateSBC(sbc, filledPlayers, chem.total, rating);
    const checklist = el('div', { class: 'sbc-checklist' },
      evalres.checks.map((c) => el('div', { class: 'sbc-check ' + (c.met ? 'met' : 'unmet') }, [
        el('span', { class: 'check-ico', text: c.met ? '✓' : '○' }),
        el('span', { class: 'check-lbl', text: c.label }),
        el('span', { class: 'check-val', text: c.val }),
      ])));

    const submit = el('button', {
      class: 'btn btn-primary big' + (evalres.pass ? '' : ' disabled'),
      text: evalres.pass ? '✅ Submit squad' : 'Requirements not met',
    });
    if (evalres.pass) submit.addEventListener('click', () => submitWork(sbc, root));

    const fillBtn = el('button', { class: 'btn', text: '⚡ Auto-fill from club' });
    fillBtn.addEventListener('click', () => { autoFillFromClub(sbc); RFC.views.sbc.render(root); });

    side.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'FORMATION' }), formSel, tiles,
    ]));
    side.appendChild(el('div', { class: 'side-card' }, [
      el('label', { class: 'side-label', text: 'REQUIREMENTS' }), checklist,
    ]));
    side.appendChild(el('div', { class: 'side-card' }, [fillBtn, submit]));
  }

  function tile(val, lbl) {
    return el('div', { class: 'rate-tile' }, [
      el('div', { class: 'rt-num', html: String(val) }),
      el('div', { class: 'rt-lbl', text: lbl }),
    ]);
  }

  function pick(i, slot, root) {
    if (RFC.state.club.length === 0) { RFC.toast('Your club is empty — open packs first!', 'warn'); return; }
    RFC.ui.openPlayerPicker({
      source: 'club',
      slotPos: slot.pos,
      excludeIids: usedIids().filter((x) => x !== work.slots[i]),
      title: `Pick a ${slot.pos} from your club`,
      onPick: (p, iid) => { work.slots[i] = iid; RFC.views.sbc.render(root); },
    });
  }

  function autoFillFromClub(sbc) {
    const slots = RFC.FORMATIONS[work.formation];
    const used = new Set();
    // try to honour a dominant league among owned players for chem
    const owned = RFC.state.club.map((c) => ({ iid: c.iid, p: RFC.playerById(c.pid) })).filter((x) => x.p);
    const lgCount = {};
    owned.forEach((o) => (lgCount[o.p.league] = (lgCount[o.p.league] || 0) + 1));
    const bestLeague = Object.entries(lgCount).sort((a, b) => b[1] - a[1])[0];
    const targetLeague = bestLeague ? bestLeague[0] : null;

    work.slots = slots.map((slot) => {
      const cands = owned
        .filter((o) => !used.has(o.iid) && RFC.inPosition(o.p, slot.pos))
        .sort((a, b) => {
          const al = a.p.league === targetLeague ? 6 : 0;
          const bl = b.p.league === targetLeague ? 6 : 0;
          return (b.p.rating + bl) - (a.p.rating + al);
        });
      // fallback: any owned not used (out of position) to fill the XI
      let pickChoice = cands[0] || owned.filter((o) => !used.has(o.iid)).sort((a, b) => b.p.rating - a.p.rating)[0];
      if (pickChoice) { used.add(pickChoice.iid); return pickChoice.iid; }
      return null;
    });
  }

  function submitWork(sbc, root) {
    const { filledPlayers, chem, rating } = workInfo();
    const res = RFC.evaluateSBC(sbc, filledPlayers, chem.total, rating);
    if (!res.pass) { RFC.toast('Requirements not met.', 'warn'); return; }

    // consume players
    RFC.removeFromClub(usedIids());
    RFC.state.sbcCompleted[sbc.id] = (RFC.state.sbcCompleted[sbc.id] || 0) + 1;
    RFC.state.stats.sbcsDone++;
    RFC.addCoins(sbc.reward.coins);
    RFC.emit('club');
    RFC.save();

    work = null;
    RFC.toast(`SBC complete! +${RFC.fmtCoins(sbc.reward.coins)} coins`, 'good');
    if (sbc.reward.pack) {
      RFC.grantPack(sbc.reward.pack, 'sbc');
    } else {
      RFC.router.go('sbc');
    }
  }
})(window.RFC);
