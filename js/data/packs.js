/* Reyan FC — pack definitions & opening logic */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  // tier of a player for pack pulls
  RFC.playerTier = function (p) {
    if (p.special === 'icon') return 'icon';
    if (p.special) return 'special'; // hero/toty/totw
    if (p.rating >= 87) return 'elite';
    if (p.rating >= 84) return 'goldRare';
    if (p.rating >= 75) return 'gold';
    if (p.rating >= 65) return 'silver';
    return 'bronze';
  };

  // precompute pools
  const POOLS = { bronze: [], silver: [], gold: [], goldRare: [], elite: [], special: [], icon: [] };
  RFC._buildPools = function () {
    Object.keys(POOLS).forEach((k) => (POOLS[k] = []));
    RFC.PLAYERS.forEach((p) => POOLS[RFC.playerTier(p)].push(p));
  };

  RFC.PACKS = [
    {
      id: 'bronze', name: 'Bronze Pack', price: 750, size: 3, accent: '#a06a3c',
      desc: '3 players. Mostly bronze, slim silver chance.',
      odds: { bronze: 80, silver: 18, gold: 2 },
    },
    {
      id: 'silver', name: 'Silver Pack', price: 2500, size: 4, accent: '#c9ccd4',
      desc: '4 players. Silvers with a shot at gold.',
      odds: { bronze: 25, silver: 60, gold: 15 },
    },
    {
      id: 'gold', name: 'Gold Pack', price: 7500, size: 5, accent: '#e8c349',
      desc: '5 gold players guaranteed.',
      odds: { gold: 86, goldRare: 12, elite: 2 },
    },
    {
      id: 'premium', name: 'Premium Gold', price: 15000, size: 6, accent: '#f0d35a',
      desc: '6 golds with improved rare odds.',
      odds: { gold: 72, goldRare: 22, elite: 5, special: 1 },
    },
    {
      id: 'rare', name: 'Rare Players Pack', price: 30000, size: 5, accent: '#34d399',
      desc: '5 rare golds. Real elite & special chance.',
      odds: { gold: 45, goldRare: 38, elite: 15, special: 2 },
      guarantee: { goldRare: 2 },
    },
    {
      id: 'ultimate', name: 'Ultimate Pack', price: 60000, size: 7, accent: '#a855f7',
      desc: '7 players. Stacked with elites & specials.',
      odds: { gold: 25, goldRare: 38, elite: 30, special: 7 },
      guarantee: { elite: 2 },
    },
    {
      id: 'icon', name: 'Icon Pack', price: 175000, size: 5, accent: '#fbbf24',
      desc: 'Guaranteed Icon + 4 elite-tier players.',
      odds: { goldRare: 30, elite: 65, special: 5 },
      guarantee: { icon: 1 },
    },
  ];

  RFC.packById = (id) => RFC.PACKS.find((p) => p.id === id);

  function pullFromTier(tier) {
    let pool = POOLS[tier];
    if (!pool || !pool.length) {
      // graceful fallback down the tiers
      const order = ['icon', 'special', 'elite', 'goldRare', 'gold', 'silver', 'bronze'];
      for (const t of order) if (POOLS[t] && POOLS[t].length) { pool = POOLS[t]; break; }
    }
    return RFC.pick(pool);
  }

  function rollTier(odds) {
    const items = Object.keys(odds).map((k) => ({ w: odds[k], tier: k }));
    return RFC.weightedPick(items).tier;
  }

  // returns array of player objects (the canonical DB entries)
  RFC.openPack = function (pack) {
    if (!POOLS.gold.length) RFC._buildPools();
    const results = [];
    const need = Object.assign({}, pack.guarantee || {});

    // fulfil guarantees first
    Object.keys(need).forEach((tier) => {
      for (let i = 0; i < need[tier]; i++) results.push(pullFromTier(tier));
    });

    while (results.length < pack.size) {
      const tier = rollTier(pack.odds);
      results.push(pullFromTier(tier));
    }

    // sort by rating desc so the best walks out last (built in UI)
    return results.slice(0, pack.size).sort((a, b) => a.rating - b.rating);
  };
})(window.RFC);
