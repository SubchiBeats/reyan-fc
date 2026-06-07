/* Reyan FC — Season Simulation view */
window.RFC = window.RFC || {};
RFC.views = RFC.views || {};

(function (RFC) {
  'use strict';
  const { el } = RFC;

  const AI_NAMES = [
    'Northgate United', 'Crimson Athletic', 'Vermont City', 'Atletico Bay',
    'Real Solaris', 'Iron Harbour FC', 'Sporting Verde', 'Golden Vale',
    'Phoenix Rovers', 'Marauders SC', 'Riverton Town', 'Onyx Wanderers',
  ];

  RFC.views.season = {
    render(root) {
      root.innerHTML = '';
      if (RFC.state.season) renderSeason(root);
      else renderSetup(root);
    },
  };

  /* ---------------- setup ---------------- */
  function renderSetup(root) {
    root.appendChild(el('div', { class: 'view-head' }, [
      el('h2', { text: 'Season Mode' }),
      el('p', { class: 'view-sub', text: 'Take your built XI through an 8-team league. Win the title for the biggest rewards.' }),
    ]));

    const src = RFC.pendingSeasonSquad || RFC.state.activeSquad;
    const filled = RFC.countFilled(src.slots);
    const rating = RFC.computeRating(src.slots);
    const chem = RFC.computeChemistry(RFC.FORMATIONS[src.formation], src.slots).total;

    if (filled < 11) {
      root.appendChild(el('div', { class: 'season-setup' }, [
        el('div', { class: 'empty-note', html: 'You need a full XI to start a season.<br>Head to the <b>Builder</b>, fill all 11 spots, then hit <b>Send to Season</b>.' }),
        navBtn('Go to Builder', () => RFC.router.go('builder')),
      ]));
      return;
    }

    const nameInput = el('input', { class: 'season-name-input', value: 'Reyan FC', maxlength: 22 });
    let difficulty = 'pro';
    const diffWrap = el('div', { class: 'diff-row' },
      [['easy', 'Amateur'], ['pro', 'Professional'], ['legend', 'Legendary']].map(([k, lbl]) => {
        const b = el('button', { class: 'diff-btn' + (k === difficulty ? ' on' : ''), text: lbl });
        b.addEventListener('click', () => {
          difficulty = k;
          RFC.$$('.diff-btn', diffWrap).forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
        });
        return b;
      }));

    const startBtn = navBtn('🏁 Kick off the season', () => startSeason(nameInput.value.trim() || 'Reyan FC', src, difficulty));
    startBtn.classList.add('btn-primary', 'big');

    root.appendChild(el('div', { class: 'season-setup' }, [
      el('div', { class: 'setup-card' }, [
        el('label', { class: 'side-label', text: 'YOUR CLUB NAME' }),
        nameInput,
        el('div', { class: 'setup-stats' }, [
          tile(rating, 'SQUAD RATING'),
          tile(`${chem}/33`, 'CHEMISTRY'),
          tile(src.formation, 'FORMATION'),
        ]),
        el('label', { class: 'side-label', text: 'DIFFICULTY' }),
        diffWrap,
        startBtn,
      ]),
    ]));
  }

  function startSeason(teamName, src, difficulty) {
    const myRating = RFC.computeRating(src.slots);
    const myChem = RFC.computeChemistry(RFC.FORMATIONS[src.formation], src.slots).total;
    const offset = difficulty === 'easy' ? -4 : difficulty === 'legend' ? 5 : 0;

    const teams = [{ name: teamName, rating: myRating, chem: myChem, you: true }];
    const names = RFC.shuffle(AI_NAMES).slice(0, 7);
    names.forEach((n) => {
      teams.push({
        name: n,
        rating: RFC.clamp(myRating + offset + RFC.rand(-6, 6), 62, 96),
        chem: RFC.rand(20, 33),
        you: false,
      });
    });

    RFC.state.season = {
      teamName, difficulty,
      formation: src.formation,
      slots: src.slots.slice(),
      teams,
      table: teams.map((t, i) => ({ i, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 })),
      fixtures: buildSchedule(teams.length),
      round: 0,
      log: [],
      finished: false,
      claimed: false,
    };
    RFC.pendingSeasonSquad = null;
    RFC.save();
    RFC.router.go('season');
  }

  // circle-method round robin → array of rounds, each round = [[home,away],...]
  function buildSchedule(n) {
    const ids = Array.from({ length: n }, (_, i) => i);
    const rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const round = [];
      for (let i = 0; i < n / 2; i++) {
        const home = ids[i], away = ids[n - 1 - i];
        // alternate home/away for fairness
        round.push(r % 2 === 0 ? [home, away] : [away, home]);
      }
      rounds.push(round);
      // rotate (keep first fixed)
      ids.splice(1, 0, ids.pop());
    }
    return rounds;
  }

  /* ---------------- match engine ---------------- */
  function poisson(lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  }

  function strength(team, home) {
    const chemBonus = (team.chem / 33) * 4;
    return team.rating + chemBonus + (home ? 3 : 0);
  }

  function simMatch(home, away) {
    const sh = strength(home, true), sa = strength(away, false);
    const lh = RFC.clamp(1.35 + (sh - sa) * 0.05, 0.18, 5.5);
    const la = RFC.clamp(1.05 + (sa - sh) * 0.05, 0.12, 5);
    return [poisson(lh), poisson(la)];
  }

  /* ---------------- season screen ---------------- */
  function renderSeason(root) {
    const s = RFC.state.season;
    const myIdx = s.teams.findIndex((t) => t.you);

    const back = el('button', { class: 'btn ghost back-btn', text: '⟲ Abandon season' });
    back.addEventListener('click', () => {
      if (confirm('Abandon this season? Progress will be lost.')) { RFC.state.season = null; RFC.save(); RFC.router.go('season'); }
    });

    root.appendChild(el('div', { class: 'view-head' }, [
      back,
      el('h2', { text: `${s.teamName} · Season` }),
      el('p', { class: 'view-sub', text: `${s.formation} · ${diffLabel(s.difficulty)} · Matchday ${Math.min(s.round + 1, s.fixtures.length)} of ${s.fixtures.length}` }),
    ]));

    const layout = el('div', { class: 'season-layout' });

    /* table */
    const sorted = s.table.slice().sort(tableSort);
    const tbl = el('table', { class: 'league-table' }, [
      el('thead', {}, el('tr', {}, ['#', 'Club', 'P', 'W', 'D', 'L', 'GD', 'Pts'].map((h) => el('th', { text: h })))),
      el('tbody', {}, sorted.map((row, pos) => {
        const t = s.teams[row.i];
        return el('tr', { class: t.you ? 'you-row' : '' }, [
          el('td', { text: String(pos + 1) }),
          el('td', { class: 'club-cell', text: t.name }),
          el('td', { text: String(row.P) }),
          el('td', { text: String(row.W) }),
          el('td', { text: String(row.D) }),
          el('td', { text: String(row.L) }),
          el('td', { text: (row.GF - row.GA > 0 ? '+' : '') + (row.GF - row.GA) }),
          el('td', { class: 'pts-cell', text: String(row.Pts) }),
        ]);
      })),
    ]);

    /* right column: next match / results / rewards */
    const right = el('div', { class: 'season-right' });

    if (!s.finished) {
      const round = s.fixtures[s.round];
      const myFix = round.find((f) => f[0] === myIdx || f[1] === myIdx);
      const iAmHome = myFix[0] === myIdx;
      const oppIdx = iAmHome ? myFix[1] : myFix[0];

      right.appendChild(el('div', { class: 'next-match' }, [
        el('div', { class: 'nm-label', text: 'NEXT MATCH' }),
        el('div', { class: 'nm-teams' }, [
          el('span', { class: 'nm-home' + (iAmHome ? ' you' : ''), text: s.teams[myFix[0]].name }),
          el('span', { class: 'nm-vs', text: 'vs' }),
          el('span', { class: 'nm-away' + (!iAmHome ? ' you' : ''), text: s.teams[myFix[1]].name }),
        ]),
        el('div', { class: 'nm-sub', text: `${iAmHome ? 'Home' : 'Away'} · Opponent rating ${s.teams[oppIdx].rating}` }),
      ]));

      const playBtn = el('button', { class: 'btn btn-primary big', text: '▶ Play matchday' });
      playBtn.addEventListener('click', () => { playRound(); RFC.router.go('season'); });
      right.appendChild(playBtn);

      const simAll = el('button', { class: 'btn', text: '⏩ Simulate to end' });
      simAll.addEventListener('click', () => { while (!s.finished) playRound(); RFC.save(); RFC.router.go('season'); });
      right.appendChild(simAll);
    } else {
      right.appendChild(finishedPanel(s, myIdx));
    }

    /* results log */
    if (s.log.length) {
      const log = el('div', { class: 'match-log' }, [el('div', { class: 'log-title', text: 'Recent results' })]);
      s.log.slice(-6).reverse().forEach((m) => {
        const youInvolved = m.h === myIdx || m.a === myIdx;
        log.appendChild(el('div', { class: 'log-row' + (youInvolved ? ' mine' : '') }, [
          el('span', { class: 'log-t', text: s.teams[m.h].name }),
          el('span', { class: 'log-score', text: `${m.hg} - ${m.ag}` }),
          el('span', { class: 'log-t right', text: s.teams[m.a].name }),
        ]));
      });
      right.appendChild(log);
    }

    layout.appendChild(el('div', { class: 'table-wrap' }, [el('div', { class: 'log-title', text: 'League table' }), tbl]));
    layout.appendChild(right);
    root.appendChild(layout);
  }

  function playRound() {
    const s = RFC.state.season;
    if (s.finished) return;
    const round = s.fixtures[s.round];
    round.forEach(([h, a]) => {
      const [hg, ag] = simMatch(s.teams[h], s.teams[a]);
      applyResult(s, h, a, hg, ag);
      s.log.push({ h, a, hg, ag });
    });
    s.round++;
    if (s.round >= s.fixtures.length) s.finished = true;
    RFC.save();
  }

  function applyResult(s, h, a, hg, ag) {
    const th = s.table[h], ta = s.table[a];
    th.P++; ta.P++; th.GF += hg; th.GA += ag; ta.GF += ag; ta.GA += hg;
    if (hg > ag) { th.W++; ta.L++; th.Pts += 3; }
    else if (hg < ag) { ta.W++; th.L++; ta.Pts += 3; }
    else { th.D++; ta.D++; th.Pts++; ta.Pts++; }
  }

  function tableSort(a, b) {
    return b.Pts - a.Pts || (b.GF - b.GA) - (a.GF - a.GA) || b.GF - a.GF;
  }

  function finishedPanel(s, myIdx) {
    const sorted = s.table.slice().sort(tableSort);
    const pos = sorted.findIndex((r) => r.i === myIdx) + 1;
    const myRow = s.table[myIdx];

    const reward = positionReward(pos, s.teams.length);
    const panel = el('div', { class: 'finished-panel' }, [
      el('div', { class: 'trophy', text: pos === 1 ? '🏆' : pos <= 3 ? '🥇' : pos <= 5 ? '🎖️' : '⚽' }),
      el('h3', { text: pos === 1 ? 'CHAMPIONS!' : `Finished ${ordinal(pos)}` }),
      el('div', { class: 'final-record', text: `${myRow.W}W ${myRow.D}D ${myRow.L}L · ${myRow.GF}-${myRow.GA} · ${myRow.Pts} pts` }),
      el('div', { class: 'reward-line', text: `Reward: 🪙 ${RFC.fmtCoins(reward.coins)}${reward.pack ? ` + ${RFC.packById(reward.pack).name}` : ''}` }),
    ]);

    if (!s.claimed) {
      const claim = el('button', { class: 'btn btn-primary big', text: '🎁 Claim rewards' });
      claim.addEventListener('click', () => {
        s.claimed = true;
        RFC.state.stats.seasonsPlayed++;
        RFC.addCoins(reward.coins);
        RFC.save();
        RFC.toast(`+${RFC.fmtCoins(reward.coins)} coins!`, 'good');
        if (reward.pack) RFC.grantPack(reward.pack);
        else RFC.router.go('season');
      });
      panel.appendChild(claim);
    } else {
      panel.appendChild(el('div', { class: 'claimed-note', text: '✓ Rewards claimed' }));
      const again = el('button', { class: 'btn', text: 'Start a new season' });
      again.addEventListener('click', () => { RFC.state.season = null; RFC.save(); RFC.router.go('season'); });
      panel.appendChild(again);
    }
    return panel;
  }

  function positionReward(pos, n) {
    if (pos === 1) return { coins: 60000, pack: 'ultimate' };
    if (pos <= 3) return { coins: 30000, pack: 'rare' };
    if (pos <= n / 2) return { coins: 14000, pack: 'premium' };
    return { coins: 6000, pack: 'gold' };
  }

  function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
  function diffLabel(d) { return d === 'easy' ? 'Amateur' : d === 'legend' ? 'Legendary' : 'Professional'; }

  function tile(val, lbl) {
    return el('div', { class: 'rate-tile' }, [
      el('div', { class: 'rt-num', text: String(val) }),
      el('div', { class: 'rt-lbl', text: lbl }),
    ]);
  }
  function navBtn(label, fn) {
    const b = el('button', { class: 'btn', text: label });
    b.addEventListener('click', fn);
    return b;
  }
})(window.RFC);
