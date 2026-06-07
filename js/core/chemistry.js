/* Reyan FC — chemistry & rating engine (FC24+ style, simplified) */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  // thresholds: [count→1pt, count→2pt, count→3pt]
  const CLUB_T = [2, 4, 7];
  const NATION_T = [2, 5, 8];
  const LEAGUE_T = [3, 5, 8];

  function pointsFor(count, t) {
    if (count >= t[2]) return 3;
    if (count >= t[1]) return 2;
    if (count >= t[0]) return 1;
    return 0;
  }

  RFC.inPosition = function (player, slotPos) {
    if (!player) return false;
    return player.pos === slotPos || (player.alt && player.alt.indexOf(slotPos) >= 0);
  };

  /* slots: formation array; squad: array of playerId|null aligned with slots */
  RFC.computeChemistry = function (slots, squad) {
    const club = {}, league = {}, nation = {};
    const inPos = [];

    slots.forEach((slot, i) => {
      const p = RFC.playerById(squad[i]);
      const ok = p && RFC.inPosition(p, slot.pos);
      inPos[i] = ok;
      if (!p || !ok) return;

      const sp = p.special;
      if (sp === 'icon') {
        nation[p.nation] = (nation[p.nation] || 0) + 2;
        // icons lift every league by 1
        Object.keys(RFC.leagueShort).forEach((lg) => {
          league[lg] = (league[lg] || 0) + 1;
        });
      } else if (sp === 'hero') {
        nation[p.nation] = (nation[p.nation] || 0) + 1;
        league[p.league] = (league[p.league] || 0) + 2;
      } else {
        club[p.club] = (club[p.club] || 0) + 1;
        league[p.league] = (league[p.league] || 0) + 1;
        nation[p.nation] = (nation[p.nation] || 0) + 1;
      }
    });

    const perPlayer = [];
    let total = 0;
    slots.forEach((slot, i) => {
      const p = RFC.playerById(squad[i]);
      if (!p) { perPlayer[i] = 0; return; }
      if (!inPos[i]) { perPlayer[i] = 0; return; }
      if (p.special === 'icon' || p.special === 'hero') {
        perPlayer[i] = 3; total += 3; return;
      }
      const c = pointsFor(club[p.club] || 0, CLUB_T);
      const n = pointsFor(nation[p.nation] || 0, NATION_T);
      const l = pointsFor(league[p.league] || 0, LEAGUE_T);
      const chem = RFC.clamp(c + n + l, 0, 3);
      perPlayer[i] = chem;
      total += chem;
    });

    return { perPlayer, total, inPos };
  };

  /* FC squad rating: average + surplus from above-average players */
  RFC.computeRating = function (squad) {
    const ratings = [];
    squad.forEach((id) => {
      const p = RFC.playerById(id);
      if (p) ratings.push(p.rating);
    });
    if (!ratings.length) return 0;
    const n = ratings.length;
    const sum = ratings.reduce((a, b) => a + b, 0);
    const avg = sum / n;
    let surplus = 0;
    ratings.forEach((r) => { if (r > avg) surplus += r - avg; });
    // scale surplus relative to a full 11-man side
    return Math.round((sum + surplus) / n);
  };

  RFC.countFilled = (squad) => squad.filter((id) => !!RFC.playerById(id)).length;
})(window.RFC);
