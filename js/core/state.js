/* Reyan FC — game state, persistence, economy, club inventory */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  const KEY = 'reyanfc.save.v1';

  const DEFAULT = () => ({
    coins: 0,
    club: [],            // [{iid, pid}]
    activeSquad: {
      mode: 'free',                          // 'free' | 'ut'
      formation: RFC.DEFAULT_FORMATION,
      slots: new Array(11).fill(null),       // pid|null (always present)
      iids:  new Array(11).fill(null),       // iid|null (only used in 'ut' mode)
    },
    savedSquads: [],     // [{name, mode, formation, slots, iids?}]
    sbcCompleted: {},    // {sbcId: count}
    season: null,        // active season object
    stats: { packsOpened: 0, playersPacked: 0, sbcsDone: 0, walkouts: 0, seasonsPlayed: 0 },
    seenIntro: false,
  });

  RFC.state = DEFAULT();

  /* ---- event bus (RFC.on returns an unsubscribe fn) ---- */
  const listeners = {};
  RFC.on = (evt, fn) => {
    (listeners[evt] = listeners[evt] || []).push(fn);
    return () => {
      const arr = listeners[evt];
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    };
  };
  RFC.emit = (evt, data) => { (listeners[evt] || []).slice().forEach((fn) => fn(data)); };

  /* ---- persistence ---- */
  RFC.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(RFC.state)); } catch (e) { /* storage full / blocked */ }
  };

  RFC.load = function () {
    let loaded = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) loaded = JSON.parse(raw);
    } catch (e) { loaded = null; }

    if (loaded) {
      RFC.state = Object.assign(DEFAULT(), loaded);
      // make sure nested shapes exist
      RFC.state.activeSquad = Object.assign(DEFAULT().activeSquad, loaded.activeSquad || {});
      RFC.state.stats = Object.assign(DEFAULT().stats, loaded.stats || {});
    } else {
      RFC.state = DEFAULT();
      seedNewSave();
      RFC.save();
    }
  };

  RFC.resetSave = function () {
    RFC.state = DEFAULT();
    seedNewSave();
    RFC.save();
    RFC.emit('coins'); RFC.emit('club'); RFC.emit('state');
  };

  /* ---- economy ---- */
  RFC.addCoins = function (n) {
    RFC.state.coins = Math.max(0, RFC.state.coins + n);
    RFC.save();
    RFC.emit('coins');
  };
  RFC.spendCoins = function (n) {
    if (RFC.state.coins < n) return false;
    RFC.state.coins -= n;
    RFC.save();
    RFC.emit('coins');
    return true;
  };

  /* ---- club inventory ---- */
  RFC.addToClub = function (player) {
    const inst = { iid: RFC.uid(), pid: player.id };
    RFC.state.club.push(inst);
    return inst;
  };
  RFC.clubInstance = (iid) => RFC.state.club.find((c) => c.iid === iid);
  RFC.removeFromClub = function (iids) {
    const set = new Set(iids);
    RFC.state.club = RFC.state.club.filter((c) => !set.has(c.iid));
  };
  // owned count per pid (for "duplicates" display)
  RFC.ownedCount = function (pid) {
    return RFC.state.club.filter((c) => c.pid === pid).length;
  };

  /* ---- starter seed ---- */
  function seedNewSave() {
    RFC.state.coins = 55000;
    // seed a playable club: lots of Premier League + a spread, plus low-rated for early SBCs
    const pool = RFC.PLAYERS;
    const epl = pool.filter((p) => p.league === 'Premier League' && p.rating >= 74 && p.rating <= 86);
    const laliga = pool.filter((p) => p.league === 'La Liga' && p.rating >= 78 && p.rating <= 86);
    const lows = pool.filter((p) => p.rating >= 60 && p.rating <= 73);

    const starters = []
      .concat(RFC.shuffle(epl).slice(0, 11))
      .concat(RFC.shuffle(laliga).slice(0, 5))
      .concat(RFC.shuffle(lows).slice(0, 6));

    starters.forEach((p) => RFC.addToClub(p));
    RFC.state.stats.playersPacked = starters.length;
  }

  /* ---- squad helpers (active builder squad) ---- */
  RFC.setFormation = function (name) {
    const sq = RFC.state.activeSquad;
    const n = RFC.FORMATIONS[name].length;
    sq.formation = name;
    sq.slots = new Array(n).fill(null);
    sq.iids  = new Array(n).fill(null);
    RFC.save();
    RFC.emit('squad');
  };
  RFC.setSlot = function (i, pid, iid) {
    const sq = RFC.state.activeSquad;
    sq.slots[i] = pid || null;
    sq.iids[i]  = iid || null;
    RFC.save();
    RFC.emit('squad');
  };
  RFC.clearSlot = function (i) { RFC.setSlot(i, null, null); };
  RFC.clearSquad = function () {
    const sq = RFC.state.activeSquad;
    const n = RFC.FORMATIONS[sq.formation].length;
    sq.slots = new Array(n).fill(null);
    sq.iids  = new Array(n).fill(null);
    RFC.save();
    RFC.emit('squad');
  };
  RFC.setBuildMode = function (mode) {
    const sq = RFC.state.activeSquad;
    if (sq.mode === mode) return;
    sq.mode = mode;
    // Clear when switching — pids/iids semantics differ
    const n = RFC.FORMATIONS[sq.formation].length;
    sq.slots = new Array(n).fill(null);
    sq.iids  = new Array(n).fill(null);
    RFC.save();
    RFC.emit('squad');
  };
})(window.RFC);
