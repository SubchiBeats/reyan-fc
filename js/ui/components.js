/* Reyan FC — shared UI components: cards, badges, player picker */
window.RFC = window.RFC || {};
RFC.ui = RFC.ui || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  RFC.ui.flag = function (nation) {
    const img = el('img', {
      class: 'flag', src: RFC.flagUrl(nation), alt: nation, title: nation, loading: 'lazy',
    });
    img.addEventListener('error', () => { img.style.display = 'none'; });
    return img;
  };

  RFC.ui.clubBadge = function (club) {
    const [a, b] = RFC.clubColors(club);
    const badge = el('div', {
      class: 'club-badge', title: club,
      style: `background:linear-gradient(135deg, ${a}, ${b});`,
    }, RFC.clubInitials(club));
    // contrast text
    badge.style.color = needsDark(a) ? '#10131a' : '#fff';
    return badge;
  };

  function needsDark(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), bl = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + bl * 114) / 1000 > 150;
  }

  const GK_LABELS = ['DIV', 'HAN', 'KIC', 'REF', 'SPD', 'POS'];
  const OUT_LABELS = ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'];

  function statValues(p) {
    return [p.pace, p.shooting, p.passing, p.dribbling, p.defending, p.physical];
  }

  RFC.ui.face = function (p) {
    const fallback = el('div', { class: 'pcard-face-fallback', text: RFC.playerInitials(p) });
    const wrap = el('div', { class: 'pcard-face-wrap loading' }, [
      el('div', { class: 'pcard-face-bg' }),
      fallback,
    ]);
    RFC.faceUrl(p).then((src) => {
      wrap.classList.remove('loading');
      if (!src) { wrap.classList.add('noface'); return; }
      const img = el('img', { class: 'pcard-face', src, alt: p.name, loading: 'lazy' });
      const markLoaded = () => wrap.classList.add('loaded');
      const markError = () => wrap.classList.add('noface');
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markError);
      wrap.appendChild(img);
      // browser-cached images may finish before listeners attach
      if (img.complete) { (img.naturalWidth > 0 ? markLoaded : markError)(); }
    });
    return wrap;
  };

  // Determine name-size class based on character length, so cards never truncate
  function nameLenClass(text) {
    const n = text.length;
    if (n <= 5) return 'pn-s';
    if (n <= 7) return 'pn-m';
    if (n <= 9) return 'pn-l';
    if (n <= 11) return 'pn-xl';
    return 'pn-xxl';
  }

  /* player card — used on pitch, in packs, club grid and summaries */
  RFC.ui.playerCard = function (p, opts) {
    opts = opts || {};
    const tier = RFC.cardTier(p);
    const size = opts.size || 'default';
    const isPitch = size === 'pitch';
    const labels = p.pos === 'GK' ? GK_LABELS : OUT_LABELS;
    const vals = statValues(p);
    const showStats = !isPitch;          // pitch stays compact (FC-style)
    const showLeague = !isPitch;          // league chip lives off-pitch only

    const stats = showStats ? el('div', { class: 'pcard-stats' },
      vals.map((v, i) => el('div', { class: 'stat' }, [
        el('span', { class: 'stat-v', text: String(v) }),
        el('span', { class: 'stat-l', text: labels[i] }),
      ]))
    ) : null;

    const league = showLeague ? el('div', { class: 'pcard-league' }, [
      el('span', { class: 'pcard-league-dot' }),
      el('span', { class: 'pcard-league-name', text: RFC.leagueShort[p.league] || p.league }),
    ]) : null;

    const displayName = RFC.cardName(p).toUpperCase();

    const card = el('div', { class: `pcard tier-${tier} pcard-${size} ${nameLenClass(displayName)}` }, [
      el('div', { class: 'pcard-glow' }),
      el('div', { class: 'pcard-shine' }),
      el('div', { class: 'pcard-rt' }, [
        el('span', { class: 'pcard-rating', text: String(p.rating) }),
        el('span', { class: 'pcard-pos', text: p.pos }),
      ]),
      el('div', { class: 'pcard-badges' }, [
        RFC.ui.flag(p.nation),
        RFC.ui.clubBadge(p.club),
      ]),
      RFC.ui.face(p),
      el('div', { class: 'pcard-name', text: displayName, title: p.name }),
      league,
      stats,
      opts.chem != null ? RFC.ui.chemDots(opts.chem) : null,
    ]);

    if (opts.onClick) {
      card.classList.add('clickable');
      card.addEventListener('click', opts.onClick);
    }
    return card;
  };

  RFC.ui.chemDots = function (n) {
    const wrap = el('div', { class: 'chem-dots chem-' + n });
    for (let i = 0; i < 3; i++) wrap.appendChild(el('span', { class: 'cdot' + (i < n ? ' on' : '') }));
    return wrap;
  };

  /* compact list row */
  RFC.ui.miniRow = function (p, opts) {
    opts = opts || {};
    const tier = RFC.cardTier(p);
    const row = el('div', { class: `mrow tier-edge-${tier}` }, [
      el('div', { class: 'mrow-rt', text: String(p.rating) }),
      el('div', { class: 'mrow-pos', text: p.pos }),
      el('div', { class: 'mrow-id' }, [
        el('div', { class: 'mrow-name', text: p.name }),
        el('div', { class: 'mrow-sub' }, [
          RFC.ui.flag(p.nation),
          RFC.ui.clubBadge(p.club),
          el('span', { text: `${p.club} · ${RFC.leagueShort[p.league] || p.league}` }),
        ]),
      ]),
      opts.right || null,
    ]);
    if (opts.onClick) { row.classList.add('clickable'); row.addEventListener('click', opts.onClick); }
    return row;
  };

  /* ---------------- player picker modal ---------------- */
  /* opts: { source:'db'|'club', slotPos, title, onPick(player, iid) } */
  RFC.ui.openPlayerPicker = function (opts) {
    opts = opts || {};
    const isClub = opts.source === 'club';

    const search = el('input', { class: 'picker-search', type: 'search', placeholder: 'Search players…' });
    const posFilter = el('select', { class: 'picker-sel' }, [el('option', { value: '', text: 'All positions' })]
      .concat(['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF']
        .map((p) => el('option', { value: p, text: p }))));
    const lgFilter = el('select', { class: 'picker-sel' }, [el('option', { value: '', text: 'All leagues' })]
      .concat(RFC.LEAGUES.map((l) => el('option', { value: l, text: l }))));
    const natFilter = el('select', { class: 'picker-sel' }, [el('option', { value: '', text: 'All nations' })]
      .concat(RFC.NATIONS.map((n) => el('option', { value: n, text: n }))));

    if (opts.slotPos) posFilter.value = opts.slotPos;

    const list = el('div', { class: 'picker-list' });
    const head = el('div', { class: 'picker-head' }, [
      el('div', { class: 'picker-title', text: opts.title || (isClub ? 'Pick from your club' : 'Add a player') }),
      search,
      el('div', { class: 'picker-filters' }, [posFilter, lgFilter, natFilter]),
    ]);
    const content = el('div', { class: 'picker' }, [head, list]);
    const m = RFC.modal(content, { cls: 'modal-picker' });

    const exclude = new Set(opts.excludeIids || []);
    function eligible() {
      if (isClub) {
        // unique by instance, but display grouped player objects with iid
        return RFC.state.club.map((c) => ({ p: RFC.playerById(c.pid), iid: c.iid }))
          .filter((x) => x.p && !exclude.has(x.iid));
      }
      return RFC.PLAYERS.map((p) => ({ p, iid: null }));
    }

    function render() {
      const q = search.value.trim().toLowerCase();
      const pos = posFilter.value, lg = lgFilter.value, nat = natFilter.value;
      let items = eligible().filter(({ p }) => {
        if (q && !p.name.toLowerCase().includes(q)) return false;
        if (pos && !(p.pos === pos || (p.alt && p.alt.indexOf(pos) >= 0))) return false;
        if (lg && p.league !== lg) return false;
        if (nat && p.nation !== nat) return false;
        return true;
      });
      // rank: in-position first if slotPos given, then rating
      items.sort((a, b) => {
        if (opts.slotPos) {
          const ai = RFC.inPosition(a.p, opts.slotPos) ? 1 : 0;
          const bi = RFC.inPosition(b.p, opts.slotPos) ? 1 : 0;
          if (ai !== bi) return bi - ai;
        }
        return b.p.rating - a.p.rating;
      });

      list.innerHTML = '';
      if (!items.length) {
        list.appendChild(el('div', { class: 'picker-empty', text: isClub ? 'No matching players in your club. Open some packs!' : 'No players match.' }));
        return;
      }
      items.slice(0, 120).forEach(({ p, iid }) => {
        const off = opts.slotPos && !RFC.inPosition(p, opts.slotPos);
        const right = off ? el('span', { class: 'mrow-tag warn', text: 'OOP' })
          : (opts.slotPos ? el('span', { class: 'mrow-tag ok', text: '✓' }) : null);
        list.appendChild(RFC.ui.miniRow(p, {
          right,
          onClick: () => { m.close(); opts.onPick(p, iid); },
        }));
      });
      if (items.length > 120) {
        list.appendChild(el('div', { class: 'picker-more', text: `Showing top 120 of ${items.length} — refine your search.` }));
      }
    }

    [search, posFilter, lgFilter, natFilter].forEach((c) => c.addEventListener('input', render));
    render();
    setTimeout(() => search.focus(), 50);
  };
})(window.RFC);
