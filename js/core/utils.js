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
   * Strategy (in order):
   *  1. Cache hit → return immediately.
   *  2. Try the direct Wikipedia article (overrides for disambiguated names; otherwise
   *     just the player's name with underscores).
   *  3. If that's a disambiguation page or has no thumbnail, fall back to the Wikipedia
   *     search API with "<name> footballer" — uses the first matching result's image.
   *  4. Cache the resolved URL (or '__null__' miss) in localStorage forever.
   */
  RFC.WIKI_OVERRIDES = {
    // Icons / Heroes
    'pele': 'Pelé', 'pelé': 'Pelé',
    'diego-maradona': 'Diego_Maradona',
    'johan-cruyff': 'Johan_Cruyff',
    'ronaldo-nazario': 'Ronaldo_(Brazilian_footballer)',
    'zinedine-zidane': 'Zinedine_Zidane',
    'ronaldinho': 'Ronaldinho',
    'thierry-henry': 'Thierry_Henry',
    'franz-beckenbauer': 'Franz_Beckenbauer',
    'paolo-maldini': 'Paolo_Maldini',
    'steven-gerrard': 'Steven_Gerrard',
    'patrick-vieira': 'Patrick_Vieira',
    'george-best': 'George_Best',
    'david-villa': 'David_Villa',
    'robin-van-persie': 'Robin_van_Persie',
    'yaya-toure': 'Yaya_Touré',
    'carlos-tevez': 'Carlos_Tevez',
    // Common disambiguations / accented names
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
    // Accented current players
    'antoine-griezmann': 'Antoine_Griezmann',
    'julian-alvarez': 'Julián_Álvarez',
    'thibaut-courtois': 'Thibaut_Courtois',
    'jules-kounde': 'Jules_Koundé',
    'ronald-araujo': 'Ronald_Araújo',
    'pau-cubarsi': 'Pau_Cubarsí',
    'serhou-guirassy': 'Serhou_Guirassy',
    'khvicha-kvaratskhelia': 'Khvicha_Kvaratskhelia',
    'cristian-romero': 'Cristian_Romero',
    'guglielmo-vicario': 'Guglielmo_Vicario',
    'gianluigi-donnarumma': 'Gianluigi_Donnarumma',
    'gregor-kobel': 'Gregor_Kobel',
    'aurelien-tchouameni': 'Aurélien_Tchouaméni',
    'federico-valverde': 'Federico_Valverde',
    'eduardo-camavinga': 'Eduardo_Camavinga',
    'dani-carvajal': 'Dani_Carvajal',
    'arda-guler': 'Arda_Güler',
    'lamine-yamal': 'Lamine_Yamal',
    'jude-bellingham': 'Jude_Bellingham',
    'phil-foden': 'Phil_Foden',
    'bernardo-silva': 'Bernardo_Silva',
    'ruben-dias': 'Rúben_Dias',
    'josko-gvardiol': 'Joško_Gvardiol',
    'mohamed-salah': 'Mohamed_Salah',
    'virgil-van-dijk': 'Virgil_van_Dijk',
    'alexander-isak': 'Alexander_Isak',
    'florian-wirtz': 'Florian_Wirtz',
    'ryan-gravenberch': 'Ryan_Gravenberch',
    'dominik-szoboszlai': 'Dominik_Szoboszlai',
    'ibrahima-konate': 'Ibrahima_Konaté',
    'cody-gakpo': 'Cody_Gakpo',
    'hugo-ekitike': 'Hugo_Ekitike',
    'conor-bradley': 'Conor_Bradley',
    'bukayo-saka': 'Bukayo_Saka',
    'martin-odegaard': 'Martin_Ødegaard',
    'declan-rice': 'Declan_Rice',
    'william-saliba': 'William_Saliba',
    'viktor-gyokeres': 'Viktor_Gyökeres',
    'gabriel-magalhaes': 'Gabriel_Magalhães',
    'martin-zubimendi': 'Martín_Zubimendi',
    'david-raya': 'David_Raya',
    'gabriel-martinelli': 'Gabriel_Martinelli',
    'kai-havertz': 'Kai_Havertz',
    'jurrien-timber': 'Jurriën_Timber',
    'cole-palmer': 'Cole_Palmer',
    'moises-caicedo': 'Moisés_Caicedo',
    'enzo-fernandez': 'Enzo_Fernández_(footballer)',
    'levi-colwill': 'Levi_Colwill',
    'nicolas-jackson': 'Nicolas_Jackson',
    'pedro-neto': 'Pedro_Neto',
    'reece-james': 'Reece_James_(footballer,_born_1999)',
    'matthijs-de-ligt': 'Matthijs_de_Ligt',
    'bryan-mbeumo': 'Bryan_Mbeumo',
    'matheus-cunha': 'Matheus_Cunha',
    'james-maddison': 'James_Maddison',
    'dejan-kulusevski': 'Dejan_Kulusevski',
    'micky-van-de-ven': 'Micky_van_de_Ven',
    'bruno-guimaraes': 'Bruno_Guimarães',
    'anthony-gordon': 'Anthony_Gordon',
    'nick-pope': 'Nick_Pope',
    'sandro-tonali': 'Sandro_Tonali',
    'ollie-watkins': 'Ollie_Watkins',
    'emiliano-martinez': 'Emiliano_Martínez',
    'morgan-rogers': 'Morgan_Rogers_(footballer,_born_2002)',
    'harry-kane': 'Harry_Kane',
    'jamal-musiala': 'Jamal_Musiala',
    'joshua-kimmich': 'Joshua_Kimmich',
    'michael-olise': 'Michael_Olise',
    'alphonso-davies': 'Alphonso_Davies',
    'manuel-neuer': 'Manuel_Neuer',
    'dayot-upamecano': 'Dayot_Upamecano',
    'serge-gnabry': 'Serge_Gnabry',
    'konrad-laimer': 'Konrad_Laimer',
    'granit-xhaka': 'Granit_Xhaka',
    'jeremie-frimpong': 'Jeremie_Frimpong',
    'karim-adeyemi': 'Karim_Adeyemi',
    'julian-brandt': 'Julian_Brandt',
    'benjamin-sesko': 'Benjamin_Šeško',
    'xavi-simons': 'Xavi_Simons',
    'lois-openda': 'Loïs_Openda',
    'ousmane-dembele': 'Ousmane_Dembélé',
    'nuno-mendes': 'Nuno_Mendes_(Portuguese_footballer)',
    'joao-neves': 'João_Neves_(footballer,_born_October_2004)',
    'marquinhos': 'Marquinhos',
    'achraf-hakimi': 'Achraf_Hakimi',
    'bradley-barcola': 'Bradley_Barcola',
    'lee-kang-in': 'Lee_Kang-in',
    'warren-zaire-emery': 'Warren_Zaïre-Emery',
    'lucas-chevalier': 'Lucas_Chevalier',
    'illia-zabarnyi': 'Illia_Zabarnyi',
    'nicolo-barella': 'Nicolò_Barella',
    'alessandro-bastoni': 'Alessandro_Bastoni',
    'federico-dimarco': 'Federico_Dimarco',
    'marcus-thuram': 'Marcus_Thuram',
    'rafael-leao': 'Rafael_Leão',
    'christian-pulisic': 'Christian_Pulisic',
    'mike-maignan': 'Mike_Maignan',
    'luka-modric': 'Luka_Modrić',
    'khephren-thuram': 'Khéphren_Thuram',
    'kenan-yildiz': 'Kenan_Yıldız',
    'dusan-vlahovic': 'Dušan_Vlahović',
    'federico-gatti': 'Federico_Gatti',
    'scott-mctominay': 'Scott_McTominay',
    'romelu-lukaku': 'Romelu_Lukaku',
    'alessandro-buongiorno': 'Alessandro_Buongiorno',
    'jan-oblak': 'Jan_Oblak',
    'robin-le-normand': 'Robin_Le_Normand',
    'nico-williams': 'Nico_Williams',
    'alex-baena': 'Álex_Baena',
    'mikel-oyarzabal': 'Mikel_Oyarzabal',
    'inaki-williams': 'Iñaki_Williams',
    'isco': 'Isco',
    'sadio-mane': 'Sadio_Mané',
    'karim-benzema': 'Karim_Benzema',
    'riyad-mahrez': 'Riyad_Mahrez',
    'ruben-neves': 'Rúben_Neves',
    'aleksandar-mitrovic': 'Aleksandar_Mitrović',
    'victor-osimhen': 'Victor_Osimhen',
    'mauro-icardi': 'Mauro_Icardi',
    'angel-di-maria': 'Ángel_Di_María',
    'vangelis-pavlidis': 'Vangelis_Pavlidis',
    'luuk-de-jong': 'Luuk_de_Jong',
    'yann-sommer': 'Yann_Sommer',
    'marc-cucurella': 'Marc_Cucurella',
    'pervis-estupinan': 'Pervis_Estupiñán',
    'wilfred-ndidi': 'Wilfred_Ndidi',
    'takefusa-kubo': 'Takefusa_Kubo',
    'kaoru-mitoma': 'Kaoru_Mitoma',
    'weston-mckennie': 'Weston_McKennie',
    'yunus-musah': 'Yunus_Musah',
    'brennan-johnson': 'Brennan_Johnson',
    'mohammed-kudus': 'Mohammed_Kudus',
    'ademola-lookman': 'Ademola_Lookman',
    'charles-de-ketelaere': 'Charles_De_Ketelaere',
    'franco-mastantuono': 'Franco_Mastantuono',
    'andres-garcia': 'Andrés_García_(footballer,_born_2003)',
    'antonee-robinson': 'Antonee_Robinson',
    'yves-bissouma': 'Yves_Bissouma',
    'rasmus-hojlund': 'Rasmus_Højlund',
    'joshua-zirkzee': 'Joshua_Zirkzee',
    'rico-lewis': 'Rico_Lewis',
    'nathan-ake': 'Nathan_Aké',
    'mateo-kovacic': 'Mateo_Kovačić',
    'joelinton': 'Joelinton',
    'patrik-schick': 'Patrik_Schick',
    'alejandro-grimaldo': 'Alejandro_Grimaldo',
    'amad-diallo': 'Amad_Diallo',
    'omar-marmoush': 'Omar_Marmoush',
    'frenkie-de-jong': 'Frenkie_de_Jong',
    'marc-andre-ter-stegen': 'Marc-André_ter_Stegen',
    'dani-olmo': 'Dani_Olmo',
    'marcus-rashford': 'Marcus_Rashford',
    'robert-lewandowski': 'Robert_Lewandowski',
    'raphinha': 'Raphinha',
    'erling-haaland': 'Erling_Haaland',
    'rodrygo': 'Rodrygo',
    'antonio-rudiger': 'Antonio_Rüdiger',
    'trent-alexander-arnold': 'Trent_Alexander-Arnold',
    'alisson': 'Alisson',
    'caoimhin-kelleher': 'Caoimhín_Kelleher',
    'mathys-tel': 'Mathys_Tel',
    'sekou-kone': 'Sékou_Koné',
    'chido-obi': 'Chido_Obi',
    'mikey-moore': 'Mikey_Moore',
    'ayden-heaven': 'Ayden_Heaven',
    'jacob-ramsey': 'Jacob_Ramsey',
    'tommy-doyle': 'Tommy_Doyle_(footballer,_born_2001)',
    'james-trafford': 'James_Trafford',
    'tyler-dibling': 'Tyler_Dibling',
    'lewis-miley': 'Lewis_Miley',
    'senne-lammens': 'Senne_Lammens',
    'evann-guessand': 'Evann_Guessand',
    'assane-diao': 'Assane_Diao',
    'kenan-komur': null, // skip - obscure
  };

  const FACE_CACHE_PREFIX = 'rfc.face.v3.';
  const inflight = {};

  function buildSummaryUrl(article) {
    const enc = encodeURIComponent(article).replace(/%2F/g, '/').replace(/%3A/g, ':');
    return `https://en.wikipedia.org/api/rest_v1/page/summary/${enc}?redirect=true`;
  }

  function buildSearchUrl(name) {
    const q = encodeURIComponent(name + ' footballer');
    return `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
      `&generator=search&gsrsearch=${q}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=400`;
  }

  function upgradeRes(src) {
    if (!src) return null;
    return src.replace(/\/(\d{2,4})px-/, '/500px-');
  }

  RFC.faceUrl = function (player) {
    const id = player.id;
    const key = FACE_CACHE_PREFIX + id;
    const hit = localStorage.getItem(key);
    if (hit !== null) return Promise.resolve(hit === '__null__' ? null : hit);
    if (inflight[id]) return inflight[id];

    // Explicit null override = skip lookup entirely
    if (RFC.WIKI_OVERRIDES[id] === null) {
      localStorage.setItem(key, '__null__');
      return Promise.resolve(null);
    }

    const article = RFC.WIKI_OVERRIDES[id] || player.name.replace(/ /g, '_');

    // 1) direct summary
    const tryDirect = fetch(buildSummaryUrl(article), { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || data.type === 'disambiguation') return null;
        return (data.thumbnail && data.thumbnail.source) || null;
      })
      .catch(() => null);

    // 2) search fallback (when direct misses)
    const trySearch = () =>
      fetch(buildSearchUrl(player.name), { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data || !data.query || !data.query.pages) return null;
          const pages = Object.values(data.query.pages).sort((a, b) => (a.index || 0) - (b.index || 0));
          for (const pg of pages) {
            if (pg.thumbnail && pg.thumbnail.source) return pg.thumbnail.source;
          }
          return null;
        })
        .catch(() => null);

    const p = tryDirect
      .then((src) => src || trySearch())
      .then((src) => {
        const better = upgradeRes(src);
        localStorage.setItem(key, better || '__null__');
        return better;
      });

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
