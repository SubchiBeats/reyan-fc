/* Reyan FC — utilities, constants, helpers */
window.RFC = window.RFC || {};

(function (RFC) {
  'use strict';

  /* ---------- DOM helpers ---------- */
  RFC.$ = (sel, root) => (root || document).querySelector(sel);
  RFC.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  RFC.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k === 'dataset') Object.assign(node.dataset, attrs[k]);
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null && attrs[k] !== false) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  };

  /* ---------- math / format ---------- */
  RFC.clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  RFC.rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  RFC.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  RFC.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  RFC.fmtCoins = (n) => (n || 0).toLocaleString('en-US');

  /* weighted pick: items = [{w:Number, ...}] */
  RFC.weightedPick = function (items) {
    const total = items.reduce((s, it) => s + it.w, 0);
    let r = Math.random() * total;
    for (const it of items) {
      r -= it.w;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  };

  /* ---------- card tiers ---------- */
  // Determines the visual card style from rating + special flag
  RFC.cardTier = function (player) {
    if (player.special === 'icon') return 'icon';
    if (player.special === 'hero') return 'hero';
    if (player.special === 'toty') return 'toty';
    if (player.special === 'totw') return 'totw';
    const r = player.rating;
    if (r >= 75) return 'gold';
    if (r >= 65) return 'silver';
    return 'bronze';
  };

  RFC.tierLabel = {
    icon: 'ICON',
    hero: 'HERO',
    toty: 'TOTY',
    totw: 'TOTW',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
  };

  /* ---------- nations → ISO codes for flag images ---------- */
  RFC.NATION_CODE = {
    France: 'fr', England: 'gb-eng', Norway: 'no', Brazil: 'br', Spain: 'es',
    Belgium: 'be', Portugal: 'pt', Germany: 'de', Argentina: 'ar',
    Netherlands: 'nl', Egypt: 'eg', Slovenia: 'si', Poland: 'pl',
    Croatia: 'hr', Uruguay: 'uy', Georgia: 'ge', Nigeria: 'ng', Italy: 'it',
    Scotland: 'gb-sct', Wales: 'gb-wls', Morocco: 'ma', Senegal: 'sn',
    Sweden: 'se', Denmark: 'dk', Austria: 'at', Serbia: 'rs', Colombia: 'co',
    Ecuador: 'ec', 'Ivory Coast': 'ci', Ghana: 'gh', Cameroon: 'cm',
    Japan: 'jp', 'South Korea': 'kr', USA: 'us', Canada: 'ca', Mexico: 'mx',
    Turkey: 'tr', Greece: 'gr', Switzerland: 'ch', Czechia: 'cz',
    Ukraine: 'ua', Hungary: 'hu', Algeria: 'dz', Gabon: 'ga',
    Slovakia: 'sk', 'Republic of Ireland': 'ie', Finland: 'fi',
    Mali: 'ml', Guinea: 'gn', 'DR Congo': 'cd', Paraguay: 'py',
    Chile: 'cl', Peru: 'pe', Venezuela: 've', Australia: 'au',
    Armenia: 'am', Albania: 'al', Montenegro: 'me', Zambia: 'zm',
    Jamaica: 'jm', Russia: 'ru',
  };

  RFC.flagUrl = function (nation) {
    const code = RFC.NATION_CODE[nation] || 'un';
    return `https://flagcdn.com/${code}.svg`;
  };

  /* ---------- player photos via Wikipedia (CC-licensed, async + cached) ----------
   * Strategy:
   *  - Try the player's Wikipedia article (overrides for disambiguated names, otherwise name → underscores)
   *  - Use REST summary endpoint which returns a thumbnail URL
   *  - Cache the resolved URL (or '__null__' miss) in localStorage forever
   */
  RFC.WIKI_OVERRIDES = {
    'bruno-fernandes': 'Bruno_Fernandes_(Portuguese_footballer)',
    'joao-pedro': 'João_Pedro_(footballer,_born_July_2001)',
    'vinicius-jr': 'Vinícius_Júnior',
    'estevao': 'Estêvão_Willian',
    'robert-sanchez': 'Robert_Sánchez_(footballer)',
    'pedri': 'Pedri',
    'gavi': 'Gavi_(footballer)',
    'rodri': 'Rodri',
    'casemiro': 'Casemiro',
    'savinho': 'Sávio_(footballer,_born_2004)',
    'endrick': 'Endrick',
    'fabian-ruiz': 'Fabián_Ruiz',
    'vitinha': 'Vitinha_(footballer,_born_2000)',
    'rafael-leao': 'Rafael_Leão',
    'lautaro-martinez': 'Lautaro_Martínez',
    'pelé': 'Pelé',
    'pele': 'Pelé',
    'ronaldo-nazario': 'Ronaldo_(Brazilian_footballer)',
    'ronaldinho': 'Ronaldinho',
    'kylian-mbappe': 'Kylian_Mbappé',
    'son-heung-min': 'Son_Heung-min',
    'lee-kang-in': 'Lee_Kang-in',
    'hwang-hee-chan': 'Hwang_Hee-chan',
    'cristiano-ronaldo': 'Cristiano_Ronaldo',
    'kevin-de-bruyne': 'Kevin_De_Bruyne',
    'wojciech-szczesny': 'Wojciech_Szczęsny',
    'pedro-goncalves': 'Pedro_Gonçalves_(footballer)',
    'goncalo-ramos': 'Gonçalo_Ramos',
    'andre-onana': 'André_Onana',
    'ngolo-kante': "N'Golo_Kanté",
    'archie-gray': 'Archie_Gray',
    'kobbie-mainoo': 'Kobbie_Mainoo',
    'tijjani-reijnders': 'Tijjani_Reijnders',
    'ferran-torres': 'Ferran_Torres',
    'jorrel-hato': 'Jorrel_Hato',
    'patrick-dorgu': 'Patrick_Dorgu',
    'leny-yoro': 'Leny_Yoro',
    'maghnes-akliouche': 'Maghnes_Akliouche',
    'desire-doue': 'Désiré_Doué',
    'eliesse-ben-seghir': 'Eliesse_Ben_Seghir',
  };

  const FACE_CACHE_PREFIX = 'rfc.face.v2.';
  const inflight = {};

  RFC.faceUrl = function (player) {
    const id = player.id;
    const key = FACE_CACHE_PREFIX + id;
    const hit = localStorage.getItem(key);
    if (hit !== null) return Promise.resolve(hit === '__null__' ? null : hit);
    if (inflight[id]) return inflight[id];

    const article = RFC.WIKI_OVERRIDES[id] || player.name.replace(/ /g, '_');
    // encodeURIComponent then put back colons/slashes that wikipedia accepts
    const enc = encodeURIComponent(article).replace(/%2F/g, '/').replace(/%3A/g, ':');
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${enc}?redirect=true`;

    const p = fetch(url, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return null;
        // Disambiguation pages have no useful thumbnail; bail
        if (data.type === 'disambiguation') return null;
        let src = (data.thumbnail && data.thumbnail.source) || null;
        // Bump to ~400px wide for crisp cards
        if (src) src = src.replace(/\/(\d{2,4})px-/, '/400px-');
        localStorage.setItem(key, src || '__null__');
        return src;
      })
      .catch(() => { localStorage.setItem(key, '__null__'); return null; });

    inflight[id] = p;
    p.finally(() => delete inflight[id]);
    return p;
  };

  RFC.playerInitials = function (player) {
    const parts = player.name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* ---------- league → short label ---------- */
  RFC.leagueShort = {
    'Premier League': 'EPL',
    'La Liga': 'La Liga',
    'Bundesliga': 'BUND',
    'Serie A': 'Serie A',
    'Ligue 1': 'Ligue 1',
    'Saudi Pro League': 'SPL',
    'Eredivisie': 'ERE',
    'Primeira Liga': 'POR',
    'MLS': 'MLS',
    'Süper Lig': 'TUR',
    'Icons': 'ICONS',
  };

  /* ---------- club color palette (for generated badges) ---------- */
  // [primary, secondary]
  RFC.CLUB_COLORS = {
    'Real Madrid': ['#FEBE10', '#00529F'],
    'Barcelona': ['#A50044', '#004D98'],
    'Manchester City': ['#6CABDD', '#1C2C5B'],
    'Liverpool': ['#C8102E', '#00B2A9'],
    'Arsenal': ['#EF0107', '#ffffff'],
    'Chelsea': ['#034694', '#ffffff'],
    'Manchester United': ['#DA291C', '#FBE122'],
    'Tottenham': ['#132257', '#ffffff'],
    'Newcastle': ['#241F20', '#ffffff'],
    'Bayern Munich': ['#DC052D', '#0066B2'],
    'Bayer Leverkusen': ['#E32221', '#000000'],
    'Borussia Dortmund': ['#FDE100', '#000000'],
    'RB Leipzig': ['#DD0741', '#001F47'],
    'Paris SG': ['#004170', '#DA291C'],
    'Inter': ['#0068A8', '#000000'],
    'AC Milan': ['#FB090B', '#000000'],
    'Juventus': ['#000000', '#ffffff'],
    'Napoli': ['#00A2E3', '#003C82'],
    'Atletico Madrid': ['#CB3524', '#272E61'],
    'Sporting CP': ['#008057', '#ffffff'],
    'Benfica': ['#E00000', '#ffffff'],
    'PSV': ['#ED1C24', '#ffffff'],
    'Ajax': ['#D2122E', '#ffffff'],
    'Al Nassr': ['#FECB00', '#0B0B5C'],
    'Al Hilal': ['#1A4FA0', '#ffffff'],
    'Galatasaray': ['#A90432', '#FBB917'],
    'Aston Villa': ['#670E36', '#95BFE5'],
    'LAFC': ['#000000', '#C39E6D'],
    'Icons': ['#E9C46A', '#2A2A2A'],
  };

  RFC.clubColors = function (club) {
    return RFC.CLUB_COLORS[club] || ['#3a4250', '#cbd5e1'];
  };

  RFC.clubInitials = function (club) {
    if (!club) return '??';
    const words = club.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
    return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
  };

  /* ---------- toast notifications ---------- */
  let toastWrap;
  RFC.toast = function (msg, type) {
    if (!toastWrap) {
      toastWrap = RFC.el('div', { class: 'toast-wrap' });
      document.body.appendChild(toastWrap);
    }
    const t = RFC.el('div', { class: 'toast toast-' + (type || 'info'), text: msg });
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 350);
    }, 2600);
  };

  /* ---------- simple modal ---------- */
  RFC.modal = function (contentNode, opts) {
    opts = opts || {};
    const overlay = RFC.el('div', { class: 'modal-overlay' });
    const box = RFC.el('div', { class: 'modal-box ' + (opts.cls || '') });
    box.appendChild(contentNode);
    overlay.appendChild(box);
    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    };
    if (!opts.noClose) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
    }
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
    return { overlay, box, close };
  };

  RFC.uid = () => Math.random().toString(36).slice(2, 10);

  /* short display name for cards (FC-style surname) */
  const NAME_SUFFIX = ['Jr', 'Jr.', 'Júnior', 'Jnr'];
  RFC.cardName = function (p) {
    const parts = p.name.split(' ');
    if (parts.length === 1) return p.name;
    if (NAME_SUFFIX.includes(parts[parts.length - 1])) return p.name; // keep "Vinícius Jr"
    return parts.slice(1).join(' ');
  };
})(window.RFC);
