/* Reyan FC — formations.
 * Each slot: { pos, x, y } where x/y are 0..100 on the pitch.
 * y: 8 = attack (top), 92 = own goal (GK at bottom). x: 6 = left, 94 = right.
 * Positions are tuned so 15-16% wide pitch cards never overlap.
 */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  RFC.FORMATIONS = {
    '4-3-3': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LB', x: 13, y: 73 },
      { pos: 'CB', x: 35, y: 76 },
      { pos: 'CB', x: 65, y: 76 },
      { pos: 'RB', x: 87, y: 73 },
      { pos: 'CM', x: 22, y: 50 },
      { pos: 'CM', x: 50, y: 54 },
      { pos: 'CM', x: 78, y: 50 },
      { pos: 'LW', x: 16, y: 22 },
      { pos: 'ST', x: 50, y: 14 },
      { pos: 'RW', x: 84, y: 22 },
    ],
    '4-2-3-1': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LB', x: 13, y: 73 },
      { pos: 'CB', x: 35, y: 76 },
      { pos: 'CB', x: 65, y: 76 },
      { pos: 'RB', x: 87, y: 73 },
      { pos: 'CDM', x: 32, y: 58 },
      { pos: 'CDM', x: 68, y: 58 },
      { pos: 'LM', x: 14, y: 34 },
      { pos: 'CAM', x: 50, y: 38 },
      { pos: 'RM', x: 86, y: 34 },
      { pos: 'ST', x: 50, y: 13 },
    ],
    '4-4-2': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LB', x: 12, y: 73 },
      { pos: 'CB', x: 35, y: 76 },
      { pos: 'CB', x: 65, y: 76 },
      { pos: 'RB', x: 88, y: 73 },
      { pos: 'LM', x: 13, y: 46 },
      { pos: 'CM', x: 37, y: 50 },
      { pos: 'CM', x: 63, y: 50 },
      { pos: 'RM', x: 87, y: 46 },
      { pos: 'ST', x: 36, y: 17 },
      { pos: 'ST', x: 64, y: 17 },
    ],
    '4-1-2-1-2': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LB', x: 12, y: 73 },
      { pos: 'CB', x: 35, y: 76 },
      { pos: 'CB', x: 65, y: 76 },
      { pos: 'RB', x: 88, y: 73 },
      { pos: 'CDM', x: 50, y: 60 },
      { pos: 'CM', x: 22, y: 44 },
      { pos: 'CM', x: 78, y: 44 },
      { pos: 'CAM', x: 50, y: 30 },
      { pos: 'ST', x: 36, y: 14 },
      { pos: 'ST', x: 64, y: 14 },
    ],
    '3-5-2': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'CB', x: 26, y: 76 },
      { pos: 'CB', x: 50, y: 78 },
      { pos: 'CB', x: 74, y: 76 },
      { pos: 'LM', x: 10, y: 50 },
      { pos: 'CM', x: 32, y: 54 },
      { pos: 'CM', x: 50, y: 58 },
      { pos: 'CM', x: 68, y: 54 },
      { pos: 'RM', x: 90, y: 50 },
      { pos: 'ST', x: 36, y: 18 },
      { pos: 'ST', x: 64, y: 18 },
    ],
    '5-3-2': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LWB', x: 10, y: 62 },
      { pos: 'CB', x: 30, y: 76 },
      { pos: 'CB', x: 50, y: 78 },
      { pos: 'CB', x: 70, y: 76 },
      { pos: 'RWB', x: 90, y: 62 },
      { pos: 'CM', x: 28, y: 46 },
      { pos: 'CM', x: 50, y: 50 },
      { pos: 'CM', x: 72, y: 46 },
      { pos: 'ST', x: 36, y: 17 },
      { pos: 'ST', x: 64, y: 17 },
    ],
    '3-4-3': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'CB', x: 26, y: 76 },
      { pos: 'CB', x: 50, y: 78 },
      { pos: 'CB', x: 74, y: 76 },
      { pos: 'LM', x: 12, y: 50 },
      { pos: 'CM', x: 37, y: 54 },
      { pos: 'CM', x: 63, y: 54 },
      { pos: 'RM', x: 88, y: 50 },
      { pos: 'LW', x: 18, y: 20 },
      { pos: 'ST', x: 50, y: 13 },
      { pos: 'RW', x: 82, y: 20 },
    ],
    '4-3-3 (Attack)': [
      { pos: 'GK', x: 50, y: 92 },
      { pos: 'LB', x: 13, y: 73 },
      { pos: 'CB', x: 35, y: 76 },
      { pos: 'CB', x: 65, y: 76 },
      { pos: 'RB', x: 87, y: 73 },
      { pos: 'CDM', x: 50, y: 58 },
      { pos: 'CAM', x: 28, y: 40 },
      { pos: 'CAM', x: 72, y: 40 },
      { pos: 'LW', x: 16, y: 20 },
      { pos: 'ST', x: 50, y: 13 },
      { pos: 'RW', x: 84, y: 20 },
    ],
  };

  RFC.FORMATION_NAMES = Object.keys(RFC.FORMATIONS);
  RFC.DEFAULT_FORMATION = '4-3-3';
})(window.RFC);
