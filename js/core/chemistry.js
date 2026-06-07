/* Reyan FC — chemistry & rating engine (FC25/26 rules) ============================
 *
 * Per FC26:
 *  - Each player can earn 0-3 chem points; the team total caps at 33.
 *  - A player must be in their primary OR an alternate position to earn ANY chem
 *    AND to contribute to the team's club/league/nation counts.
 *  - Link thresholds (count → points): Club 2/4/7, League 3/5/8, Nation 2/5/8.
 *  - The three contributions stack but are capped at 3 per player.
 *  - ICON (in position) → automatically 3 chem; contributes +2 to its NATION
 *    count AND +1 to EVERY league count.
 *  - HERO (in position) → automatically 3 chem; contributes +2 to its LEAGUE
 *    count AND +1 to its HISTORICAL CLUB (specified by `player.heroClub`).
 *  - Out-of-position players: 0 chem, no team contribution at all.
 */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  const CLUB_T = [2, 4, 7];
  const LEAGUE_T = [3, 5, 8];
  const NATION_T = [2, 5, 8];

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

    // FIRST PASS — collect link counts ONLY from in-position players
    slots.forEach((slot, i) => {
      const p = RFC.playerById(squad[i]);
      const ok = p && RFC.inPosition(p, slot.pos);
      inPos[i] = ok;
      if (!ok) return;

      const sp = p.special;
      if (sp === 'icon') {
        // Icons: +2 to their nation, +1 to EVERY known league
        nation[p.nation] = (nation[p.nation] || 0) + 2;
        Object.keys(RFC.leagueShort).forEach((lg) => {
          if (lg === 'Icons') return;
          league[lg] = (league[lg] || 0) + 1;
        });
      } else if (sp === 'hero') {
        // Heroes: +2 to their league, +1 to historical club (if specified)
        league[p.league] = (league[p.league] || 0) + 2;
        if (p.heroClub) club[p.heroClub] = (club[p.heroClub] || 0) + 1;
      } else {
        // Regular gold/silver/bronze/special: +1 club, +1 league, +1 nation
        club[p.club] = (club[p.club] || 0) + 1;
        league[p.league] = (league[p.league] || 0) + 1;
        nation[p.nation] = (nation[p.nation] || 0) + 1;
      }
    });

    // SECOND PASS — compute per-player chem
    const perPlayer = [];
    let total = 0;
    slots.forEach((slot, i) => {
      const p = RFC.playerById(squad[i]);
      if (!p || !inPos[i]) { perPlayer[i] = 0; return; }

      // Icons & Heroes get auto-3 when in position (FC26 rule)
      if (p.special === 'icon' || p.special === 'hero') {
        perPlayer[i] = 3; total += 3; return;
      }

      const c = pointsFor(club[p.club] || 0, CLUB_T);
      const l = pointsFor(league[p.league] || 0, LEAGUE_T);
      const n = pointsFor(nation[p.nation] || 0, NATION_T);
      const chem = RFC.clamp(c + l + n, 0, 3);
      perPlayer[i] = chem;
      total += chem;
    });

    return { perPlayer, total, inPos, links: { club, league, nation } };
  };

  /* FC squad rating: average + surplus from above-average players (FC's formula) */
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
    return Math.round((sum + surplus) / n);
  };

  RFC.countFilled = (squad) => squad.filter((id) => !!RFC.playerById(id)).length;
})(window.RFC);
