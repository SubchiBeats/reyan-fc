/* Reyan FC — Squad Building Challenges */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  /* Each SBC requires an 11-player squad built from OWNED players.
   * On submit the players are consumed and the reward is granted.
   * req fields (all optional):
   *   minRating, minChem,
   *   sameLeague:{count}, sameNation:{count}, sameClub:{count},
   *   ratedAtLeast:{rating, count}
   */
  RFC.SBCS = [
    {
      id: 'bronze-beginnings', name: 'Bronze Beginnings', tier: 'bronze',
      desc: 'Everyone starts somewhere. Field a full XI to learn the ropes.',
      repeatable: true,
      req: { minRating: 62, minChem: 12 },
      reward: { coins: 1500, pack: 'silver' },
    },
    {
      id: 'silver-lining', name: 'Silver Lining', tier: 'silver',
      desc: 'A tidy silver-grade squad with a bit of chemistry.',
      repeatable: true,
      req: { minRating: 72, minChem: 20 },
      reward: { coins: 4000, pack: 'gold' },
    },
    {
      id: 'gold-standard', name: 'Gold Standard', tier: 'gold',
      desc: 'Show some quality — an all-gold side that gels.',
      repeatable: true,
      req: { minRating: 80, minChem: 26 },
      reward: { coins: 11000, pack: 'premium' },
    },
    {
      id: 'league-loyalty', name: 'League Loyalty', tier: 'gold',
      desc: 'Stack a single league. Min 7 players from one competition.',
      repeatable: true,
      req: { minRating: 79, minChem: 24, sameLeague: { count: 7 } },
      reward: { coins: 9000, pack: 'rare' },
    },
    {
      id: 'national-pride', name: 'National Pride', tier: 'gold',
      desc: 'Wave the flag — at least 5 players from one nation.',
      repeatable: true,
      req: { minRating: 81, minChem: 28, sameNation: { count: 5 } },
      reward: { coins: 16000, pack: 'rare' },
    },
    {
      id: 'elite-eleven', name: 'Elite Eleven', tier: 'elite',
      desc: 'Only the best. A high-rated XI on full song.',
      repeatable: true,
      req: { minRating: 86, minChem: 30, ratedAtLeast: { rating: 84, count: 8 } },
      reward: { coins: 40000, pack: 'ultimate' },
    },
    {
      id: 'icon-quest', name: 'Icon Quest', tier: 'icon',
      desc: 'The ultimate test. Submit a world-class side for an Icon.',
      repeatable: false,
      req: { minRating: 88, minChem: 33, ratedAtLeast: { rating: 87, count: 3 } },
      reward: { coins: 50000, pack: 'icon' },
    },
  ];

  RFC.sbcById = (id) => RFC.SBCS.find((s) => s.id === id);

  // squad = array of player objects (filled slots only); chemTotal & rating precomputed
  RFC.evaluateSBC = function (sbc, squad, chemTotal, rating) {
    const req = sbc.req;
    const checks = [];
    const filled = squad.length;

    checks.push({ label: '11 players in the squad', met: filled === 11, val: `${filled}/11` });

    if (req.minRating != null) {
      checks.push({ label: `Squad rating ≥ ${req.minRating}`, met: rating >= req.minRating, val: String(rating) });
    }
    if (req.minChem != null) {
      checks.push({ label: `Team chemistry ≥ ${req.minChem}`, met: chemTotal >= req.minChem, val: `${chemTotal}` });
    }
    if (req.sameLeague) {
      const c = topCount(squad, 'league');
      checks.push({ label: `≥ ${req.sameLeague.count} from one league`, met: c >= req.sameLeague.count, val: String(c) });
    }
    if (req.sameNation) {
      const c = topCount(squad, 'nation');
      checks.push({ label: `≥ ${req.sameNation.count} from one nation`, met: c >= req.sameNation.count, val: String(c) });
    }
    if (req.sameClub) {
      const c = topCount(squad, 'club');
      checks.push({ label: `≥ ${req.sameClub.count} from one club`, met: c >= req.sameClub.count, val: String(c) });
    }
    if (req.ratedAtLeast) {
      const c = squad.filter((p) => p.rating >= req.ratedAtLeast.rating).length;
      checks.push({ label: `≥ ${req.ratedAtLeast.count} players rated ${req.ratedAtLeast.rating}+`, met: c >= req.ratedAtLeast.count, val: String(c) });
    }

    const pass = filled === 11 && checks.every((c) => c.met);
    return { pass, checks };
  };

  function topCount(squad, key) {
    const counts = {};
    let best = 0;
    squad.forEach((p) => {
      counts[p[key]] = (counts[p[key]] || 0) + 1;
      if (counts[p[key]] > best) best = counts[p[key]];
    });
    return best;
  }
})(window.RFC);
