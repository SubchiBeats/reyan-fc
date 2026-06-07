/* Reyan FC — app shell, router, bootstrap */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  const NAV = [
    { id: 'builder', label: 'Builder', icon: '⚽' },
    { id: 'packs', label: 'Packs', icon: '🎁' },
    { id: 'sbc', label: 'SBCs', icon: '🧩' },
    { id: 'season', label: 'Season', icon: '🏆' },
    { id: 'club', label: 'Club', icon: '👥' },
  ];

  /* ---------------- router with view-scoped subscriptions ---------------- */
  let viewUnsubs = [];
  RFC.viewOn = function (evt, fn) {
    viewUnsubs.push(RFC.on(evt, fn));
  };

  RFC.router = {
    current: null,
    go(id) {
      // tear down previous view's subscriptions
      viewUnsubs.forEach((u) => u());
      viewUnsubs = [];
      this.current = id;
      const view = RFC.views[id];
      const root = RFC.$('#view');
      root.scrollTop = 0;
      window.scrollTo(0, 0);
      root.innerHTML = '';
      if (view) view.render(root);
      // retrigger the enter animation
      root.classList.remove('view-anim');
      void root.offsetWidth;
      root.classList.add('view-anim');
      updateNav();
    },
  };

  function updateNav() {
    RFC.$$('.nav-item').forEach((b) => {
      b.classList.toggle('active', b.dataset.id === RFC.router.current);
    });
  }

  /* ---------------- shell ---------------- */
  function buildShell() {
    const app = RFC.$('#app');

    const coinChip = el('div', { class: 'coin-chip' }, [
      el('span', { class: 'coin-ico', text: '🪙' }),
      el('span', { class: 'coin-val', text: RFC.fmtCoins(RFC.state.coins) }),
    ]);

    const menuBtn = el('button', { class: 'icon-btn', title: 'Menu', text: '⋯' });
    menuBtn.addEventListener('click', openMenu);

    const topbar = el('header', { class: 'topbar' }, [
      el('div', { class: 'brand' }, [
        el('span', { class: 'brand-mark', text: 'R' }),
        el('div', { class: 'brand-text' }, [
          el('span', { class: 'brand-name', text: 'Reyan FC' }),
          el('span', { class: 'brand-tag', text: 'Squad Builder' }),
        ]),
      ]),
      el('div', { class: 'top-right' }, [coinChip, menuBtn]),
    ]);

    // desktop nav (in topbar area) + mobile bottom nav share the same items
    const navTop = el('nav', { class: 'nav nav-top' },
      NAV.map((n) => navItem(n)));
    const navBottom = el('nav', { class: 'nav nav-bottom' },
      NAV.map((n) => navItem(n)));

    const view = el('main', { id: 'view', class: 'view' });

    app.appendChild(topbar);
    app.appendChild(navTop);
    app.appendChild(view);
    app.appendChild(navBottom);

    // keep coins in sync everywhere
    RFC.on('coins', () => {
      RFC.$$('.coin-val').forEach((c) => (c.textContent = RFC.fmtCoins(RFC.state.coins)));
      if (RFC.router.current === 'packs') RFC.router.go('packs');
    });
  }

  function navItem(n) {
    const b = el('button', { class: 'nav-item', dataset: { id: n.id } }, [
      el('span', { class: 'nav-ico', text: n.icon }),
      el('span', { class: 'nav-lbl', text: n.label }),
    ]);
    b.addEventListener('click', () => RFC.router.go(n.id));
    return b;
  }

  /* ---------------- menu ---------------- */
  function openMenu() {
    const box = el('div', { class: 'menu-sheet' }, [
      el('h3', { text: 'Reyan FC' }),
      menuRow('📖 How to play', () => { m.close(); showIntro(); }),
      menuRow('💰 Add 50,000 coins', () => { RFC.addCoins(50000); RFC.toast('+50,000 coins', 'good'); m.close(); }),
      menuRow('🔄 Reset everything', () => {
        if (confirm('Reset your entire club, coins and progress? This cannot be undone.')) {
          RFC.resetSave(); m.close(); RFC.router.go('builder'); RFC.toast('Fresh start! 🌱', 'good');
        }
      }, 'danger'),
      menuRow('Close', () => m.close(), 'ghost'),
    ]);
    const m = RFC.modal(box, { cls: 'modal-menu' });
  }

  function menuRow(label, fn, cls) {
    const b = el('button', { class: 'btn menu-btn ' + (cls || ''), text: label });
    b.addEventListener('click', fn);
    return b;
  }

  /* ---------------- intro ---------------- */
  function showIntro() {
    const box = el('div', { class: 'intro' }, [
      el('div', { class: 'intro-logo', text: '⚽' }),
      el('h2', { text: 'Welcome to Reyan FC' }),
      el('p', { text: 'Build dream squads from real players, chase chemistry, rip open packs, conquer SBCs and win the league in Season mode.' }),
      el('ul', { class: 'intro-list' }, [
        liItem('⚽', 'Builder', 'Drop real players into any formation and watch your rating & chemistry climb.'),
        liItem('🎁', 'Packs', 'Spend coins on packs — chase walkouts and Icons for your club.'),
        liItem('🧩', 'SBCs', 'Submit squads from your club for coin & pack rewards. Players are consumed, so spend wisely.'),
        liItem('🏆', 'Season', 'Send your XI into an 8-team league and play for the title.'),
      ]),
      el('div', { class: 'intro-note', text: "You're starting with 55,000 coins and a club of players. Have fun!" }),
    ]);
    const startBtn = el('button', { class: 'btn btn-primary big', text: "Let's build →" });
    startBtn.addEventListener('click', () => { RFC.state.seenIntro = true; RFC.save(); m.close(); });
    box.appendChild(startBtn);
    const m = RFC.modal(box, { cls: 'modal-intro', noClose: RFC.state.seenIntro ? false : true });
  }

  function liItem(ico, title, text) {
    return el('li', {}, [
      el('span', { class: 'il-ico', text: ico }),
      el('div', {}, [el('b', { text: title + ' — ' }), el('span', { text })]),
    ]);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    RFC.load();
    RFC._buildPools();
    buildShell();
    RFC.router.go('builder');
    if (!RFC.state.seenIntro) showIntro();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.RFC);
