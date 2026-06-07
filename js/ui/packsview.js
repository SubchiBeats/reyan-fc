/* Reyan FC — Pack Store + opening experience */
window.RFC = window.RFC || {};
RFC.views = RFC.views || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  RFC.views.packs = {
    render(root) {
      root.innerHTML = '';
      const head = el('div', { class: 'view-head' }, [
        el('h2', { text: 'Pack Store' }),
        el('p', { class: 'view-sub', text: 'Spend coins, rip packs, build your club. Higher tiers mean better walkouts.' }),
      ]);
      const grid = el('div', { class: 'pack-grid' });
      RFC.PACKS.forEach((pack) => grid.appendChild(packCard(pack)));
      root.appendChild(head);
      root.appendChild(grid);
    },
  };

  function packCard(pack) {
    const afford = RFC.state.coins >= pack.price;
    const oddsTags = el('div', { class: 'pack-odds' },
      Object.entries(pack.odds).map(([k, v]) => el('span', { class: 'odds-tag tier-edge-' + tierKey(k), text: `${label(k)} ${v}%` })));

    const buy = el('button', {
      class: 'btn btn-primary pack-buy' + (afford ? '' : ' disabled'),
      text: `Open · ${RFC.fmtCoins(pack.price)} 🪙`,
    });
    buy.addEventListener('click', () => {
      if (!RFC.spendCoins(pack.price)) { RFC.toast('Not enough coins!', 'warn'); return; }
      const pulls = RFC.openPack(pack);
      RFC.state.stats.packsOpened++;
      RFC.state.stats.playersPacked += pulls.length;
      RFC.save();
      runOpening(pack, pulls);
    });

    const card = el('div', { class: 'pack-card' }, [
      el('div', { class: 'pack-shine', style: `--accent:${pack.accent}` }, [
        el('div', { class: 'pack-emoji', text: '🎁' }),
      ]),
      el('div', { class: 'pack-body' }, [
        el('div', { class: 'pack-name', text: pack.name }),
        el('div', { class: 'pack-desc', text: pack.desc }),
        el('div', { class: 'pack-size', text: `${pack.size} players` }),
        oddsTags,
        buy,
      ]),
    ]);
    card.style.setProperty('--accent', pack.accent);
    return card;
  }

  function tierKey(k) {
    return { bronze: 'bronze', silver: 'silver', gold: 'gold', goldRare: 'gold', elite: 'toty', special: 'totw', icon: 'icon' }[k] || 'gold';
  }
  function label(k) {
    return { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', goldRare: 'Rare', elite: 'Elite', special: 'Special', icon: 'Icon' }[k] || k;
  }

  /* ---------------- opening experience ---------------- */
  function runOpening(pack, pulls) {
    // add to club immediately (so nothing is lost), reveal for flair
    pulls.forEach((p) => RFC.addToClub(p));
    RFC.emit('club');
    RFC.save();

    const stage = el('div', { class: 'open-stage' });
    const tapHint = el('div', { class: 'open-hint', text: 'Tap to reveal' });
    stage.appendChild(tapHint);

    const overlay = RFC.modal(stage, { cls: 'modal-open', noClose: true }).overlay;

    let idx = 0;
    const cardHolder = el('div', { class: 'open-card-holder' });
    stage.appendChild(cardHolder);

    function showNext() {
      if (idx >= pulls.length) { return showSummary(); }
      const p = pulls[idx];
      const tier = RFC.playerTier(p);
      const walkout = ['elite', 'special', 'icon'].includes(tier);
      if (walkout) { RFC.state.stats.walkouts++; RFC.save(); }

      cardHolder.innerHTML = '';
      stage.classList.toggle('walkout', walkout);
      stage.classList.toggle('iconout', tier === 'icon');

      const flare = el('div', { class: 'open-flare' });
      const card = RFC.ui.playerCard(p, { size: 'pack' });
      card.classList.add('reveal-card');
      cardHolder.appendChild(flare);
      cardHolder.appendChild(card);

      const counter = el('div', { class: 'open-counter', text: `${idx + 1} / ${pulls.length}` });
      cardHolder.appendChild(counter);

      tapHint.textContent = idx + 1 < pulls.length ? 'Tap to continue' : 'Tap to finish';
      idx++;
    }

    function showSummary() {
      stage.classList.remove('walkout', 'iconout');
      const best = pulls[pulls.length - 1];
      const grid = el('div', { class: 'open-summary-grid' },
        pulls.slice().reverse().map((p) => RFC.ui.playerCard(p, { size: 'mini-card' })));
      const summary = el('div', { class: 'open-summary' }, [
        el('h3', { text: `${pack.name} opened!` }),
        el('div', { class: 'open-best', text: `Best pull: ${best.name} (${best.rating})` }),
        grid,
        el('div', { class: 'open-actions' }, [
          actionBtn('Open another', 'btn-primary', () => {
            done();
            if (RFC.spendCoins(pack.price)) {
              const more = RFC.openPack(pack);
              RFC.state.stats.packsOpened++; RFC.state.stats.playersPacked += more.length; RFC.save();
              runOpening(pack, more);
            } else { RFC.toast('Not enough coins!', 'warn'); RFC.router.go('packs'); }
          }),
          actionBtn('To my club', 'btn', () => { done(); RFC.router.go('club'); }),
          actionBtn('Close', 'btn ghost', () => { done(); RFC.router.go('packs'); }),
        ]),
      ]);
      cardHolder.innerHTML = '';
      tapHint.style.display = 'none';
      stage.appendChild(summary);
      stage._summary = true;
    }

    function done() {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    }

    stage.addEventListener('click', () => { if (!stage._summary) showNext(); });
    showNext();
  }

  function actionBtn(label, cls, fn) {
    const b = el('button', { class: 'btn ' + cls, text: label });
    b.addEventListener('click', (e) => { e.stopPropagation(); fn(); });
    return b;
  }

  /* grant a free pack (e.g. SBC reward) and show the reveal */
  RFC.grantPack = function (packId) {
    const pack = RFC.packById(packId);
    if (!pack) return;
    const pulls = RFC.openPack(pack);
    RFC.state.stats.packsOpened++;
    RFC.state.stats.playersPacked += pulls.length;
    RFC.save();
    runOpening(pack, pulls);
  };
})(window.RFC);
