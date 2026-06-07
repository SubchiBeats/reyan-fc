/* Reyan FC — My Club (collection) view */
window.RFC = window.RFC || {};
RFC.views = RFC.views || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  const SELL = { bronze: 50, silver: 150, gold: 400, goldRare: 1500, elite: 6000, special: 12000, icon: 40000 };
  RFC.sellValue = (p) => SELL[RFC.playerTier(p)] || 100;

  const filters = { q: '', league: '', nation: '', pos: '', sort: 'rating' };

  RFC.views.club = {
    render(root) {
      root.innerHTML = '';
      drawHeader(root);
      drawControls(root);
      const grid = el('div', { class: 'club-grid' });
      root.appendChild(grid);
      drawGrid(grid);

      RFC.viewOn('club', () => {
        drawGrid(RFC.$('.club-grid', root));
        drawHeaderStats(root);
      });
    },
  };

  function groupOwned() {
    const map = {};
    RFC.state.club.forEach((c) => {
      const p = RFC.playerById(c.pid);
      if (!p) return;
      if (!map[c.pid]) map[c.pid] = { p, iids: [] };
      map[c.pid].iids.push(c.iid);
    });
    return Object.values(map);
  }

  function drawHeader(root) {
    const head = el('div', { class: 'view-head club-head' }, [
      el('h2', { text: 'My Club' }),
      el('div', { class: 'club-stats-row' }),
    ]);
    root.appendChild(head);
    drawHeaderStats(root);
  }

  function drawHeaderStats(root) {
    const row = RFC.$('.club-stats-row', root);
    if (!row) return;
    const groups = groupOwned();
    const total = RFC.state.club.length;
    const value = RFC.state.club.reduce((s, c) => s + RFC.sellValue(RFC.playerById(c.pid)), 0);
    const top = groups.map((g) => g.p).sort((a, b) => b.rating - a.rating)[0];
    const st = RFC.state.stats;
    row.innerHTML = '';
    [
      [String(total), 'PLAYERS'],
      [RFC.fmtCoins(value), 'CLUB VALUE'],
      [top ? `${top.rating}` : '–', 'TOP RATED'],
      [String(st.packsOpened), 'PACKS OPENED'],
      [String(st.walkouts), 'WALKOUTS'],
      [String(st.sbcsDone), 'SBCs DONE'],
    ].forEach(([v, l]) => row.appendChild(el('div', { class: 'club-stat' }, [
      el('div', { class: 'cs-num', text: v }), el('div', { class: 'cs-lbl', text: l }),
    ])));
  }

  function drawControls(root) {
    const search = el('input', { class: 'club-search', type: 'search', placeholder: 'Search your club…', value: filters.q });
    const lg = sel(['', ...RFC.LEAGUES], 'All leagues', filters.league);
    const nat = sel(['', ...RFC.NATIONS], 'All nations', filters.nation);
    const pos = sel(['', 'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'], 'All positions', filters.pos);
    const sort = sel2([['rating', 'Sort: Rating'], ['name', 'Sort: Name'], ['value', 'Sort: Value']], filters.sort);

    search.addEventListener('input', () => { filters.q = search.value; refresh(root); });
    lg.addEventListener('change', () => { filters.league = lg.value; refresh(root); });
    nat.addEventListener('change', () => { filters.nation = nat.value; refresh(root); });
    pos.addEventListener('change', () => { filters.pos = pos.value; refresh(root); });
    sort.addEventListener('change', () => { filters.sort = sort.value; refresh(root); });

    root.appendChild(el('div', { class: 'club-controls' }, [search, lg, nat, pos, sort]));
  }

  function refresh(root) { drawGrid(RFC.$('.club-grid', root)); }

  function sel(values, allLabel, current) {
    return el('select', { class: 'picker-sel' }, values.map((v) =>
      el('option', { value: v, text: v || allLabel, selected: v === current })));
  }
  function sel2(pairs, current) {
    return el('select', { class: 'picker-sel' }, pairs.map(([v, l]) =>
      el('option', { value: v, text: l, selected: v === current })));
  }

  function drawGrid(grid) {
    if (!grid) return;
    grid.innerHTML = '';
    let groups = groupOwned();

    groups = groups.filter(({ p }) => {
      if (filters.q && !p.name.toLowerCase().includes(filters.q.trim().toLowerCase())) return false;
      if (filters.league && p.league !== filters.league) return false;
      if (filters.nation && p.nation !== filters.nation) return false;
      if (filters.pos && !(p.pos === filters.pos || (p.alt && p.alt.indexOf(filters.pos) >= 0))) return false;
      return true;
    });

    groups.sort((a, b) => {
      if (filters.sort === 'name') return a.p.name.localeCompare(b.p.name);
      if (filters.sort === 'value') return RFC.sellValue(b.p) - RFC.sellValue(a.p);
      return b.p.rating - a.p.rating;
    });

    if (!groups.length) {
      grid.appendChild(el('div', { class: 'empty-note', html: 'No players here yet.<br>Open packs or complete SBCs to grow your club!' }));
      return;
    }

    groups.forEach(({ p, iids }) => {
      const holder = el('div', { class: 'club-card-holder' });
      const card = RFC.ui.playerCard(p, { size: 'club' });
      if (iids.length > 1) holder.appendChild(el('div', { class: 'dup-badge', text: '×' + iids.length }));
      card.addEventListener('click', () => cardMenu(p, iids));
      holder.appendChild(card);
      grid.appendChild(holder);
    });
  }

  function cardMenu(p, iids) {
    const val = RFC.sellValue(p);
    const box = el('div', { class: 'mini-menu' }, [
      el('div', { class: 'mini-menu-name', text: `${p.name} · ${p.rating}` }),
      el('div', { class: 'mini-menu-sub', text: `You own ${iids.length} · sells for ${RFC.fmtCoins(val)} each` }),
      menuBtn(`Quick sell 1 (🪙 ${RFC.fmtCoins(val)})`, () => { sell([iids[0]], val); m.close(); }),
      iids.length > 1 ? menuBtn(`Quick sell all ${iids.length} (🪙 ${RFC.fmtCoins(val * iids.length)})`, () => { sell(iids, val * iids.length); m.close(); }) : null,
      menuBtn('Cancel', () => m.close(), 'ghost'),
    ]);
    const m = RFC.modal(box, { cls: 'modal-mini' });
  }

  function sell(iids, total) {
    RFC.removeFromClub(iids);
    RFC.addCoins(total);
    RFC.save();
    RFC.emit('club');
    RFC.toast(`Sold for 🪙 ${RFC.fmtCoins(total)}`, 'good');
  }

  function menuBtn(label, fn, cls) {
    const b = el('button', { class: 'btn ' + (cls || 'btn-sm'), text: label });
    b.addEventListener('click', fn);
    return b;
  }
})(window.RFC);
