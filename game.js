/* A grófnő asztalánál — static game, bundled illustrations and QR library, no backend. */
'use strict';
(() => {
  const SAVE_KEY = 'grofi-vacsora.v2';
  const app = document.querySelector('#app');
  const modal = document.querySelector('#modal');
  const modalContent = document.querySelector('#modal-content');
  const letters = ['A', 'B', 'C'];
  let svgId = 0;
  let state = null;
  let saved = null;
  let lastFocus = null;

  const visualDescriptions = {
    teaspoon: 'kis, ovális fejű kanál, egyszerű nyéllel',
    soupspoon: 'a legnagyobb kanál, széles ovális fejjel, egyszerű nyéllel',
    dessertspoon: 'közepes méretű, ovális fejű kanál, egyszerű nyéllel',
    dinnerfork: 'hosszú, keskeny villa négy ággal',
    dessertfork: 'kis villa három rövid ággal',
    fishfork: 'széles fejű villa három ággal; a jobb szélső ág rövidebb',
    cheesefork: 'keskeny villa két hosszú ággal',
    servingfork: 'a leghosszabb és legszélesebb villa, négy vastag ággal',
    dinnerknife: 'hosszú, keskeny, enyhén hegyes pengéjű kés',
    butterknife: 'rövid, kerek végű kés',
    fishknife: 'széles, levél alakú pengéjű kés',
    rosespoon: 'rózsával díszített kiskanál',
    moonspoon: 'félholddal díszített kiskanál',
    starspoon: 'csillaggal díszített kiskanál'
  };

  const courses = [
  {
    "title": "Aranyló erőleves",
    "subtitle": "Az első benyomás",
    "dish": "soup",
    "description": "Helena Valcourt grófnő int, és megérkezik a leves. Körülötted nemesek ülnek. Mindegyiküknek gyanúsan sok ideje van a te kezedet figyelni.",
    "rule": null,
    "options": [
      {
        "id": "teaspoon",
        "name": "Teáskanál"
      },
      {
        "id": "soupspoon",
        "name": "Leveseskanál"
      },
      {
        "id": "dessertspoon",
        "name": "Desszertkanál"
      }
    ],
    "correct": "soupspoon",
    "hints": [
      "Válassz egy kanalat a leveshez. Mindhárom annak látszik. Ez a probléma.",
      "A nagyobb, mélyebb fej most többet ér a kecses kis méretnél.",
      "A legnagyobb, széles, ovális fejű kanalat keresd. A leveseskanalat."
    ],
    "explanation": "A nagy, öblös leveseskanál illik a leveshez. A kiskanál bájos, de itt egészen hajnalig tartana vele a vacsora.",
    "success": "A grófnő elégedetten biccent. Egy báró csalódottan leteszi a monokliját: már nagyon készült a hibádra.",
    "failure": "Egy arisztokrata monoklija a levesbe pottyan. Az inas kihalássza, megtörli, majd úgy tesz, mintha ez volna a következő fogás."
  },
  {
    "title": "Meleg zsemle, hideg tekintetek",
    "subtitle": "Vajon melyikkel?",
    "dish": "bread",
    "description": "Vajat kínálnak a zsemléhez. A szomszédod olyan ünnepélyesen ken, mintha épp békeszerződést írna alá.",
    "rule": null,
    "options": [
      {
        "id": "fishknife",
        "name": "Halkés"
      },
      {
        "id": "butterknife",
        "name": "Vajkés"
      },
      {
        "id": "dinnerknife",
        "name": "Asztali kés"
      }
    ],
    "correct": "butterknife",
    "hints": [
      "A vajhoz válassz egy kést. A zsemlével ma nincs párbaj.",
      "Rövid, tompa, kerek végű pengét keresel.",
      "A rövid, kerek végű vajkést válaszd. Nem a hosszú húsos kést vagy a levél alakú halkést."
    ],
    "explanation": "A vajhoz a rövid, tompa vajkés való. A zsemléből kézzel törsz falatot; most csak a vaj felkenéséhez választasz eszközt.",
    "success": "A vaj a helyére kerül. Egy bárónő elismerően súgja: „Határozott kéz.” Még soha nem volt ilyen jó sajtód egy zsemle miatt.",
    "failure": "Úgy támadsz a vajra, mintha tartozna neked. Az egyik nemes ösztönösen a másik oldalára húzza az örökösét."
  },
  {
    "title": "Vajas pisztráng",
    "subtitle": "Ezüst és pikkelyek",
    "dish": "fish",
    "description": "A pisztráng már nem tiltakozik. A bárónő valószínűleg fog, ha rossz villát választasz.",
    "rule": null,
    "options": [
      {
        "id": "dinnerfork",
        "name": "Húsvilla"
      },
      {
        "id": "dessertfork",
        "name": "Desszertvilla"
      },
      {
        "id": "fishfork",
        "name": "Halvilla"
      }
    ],
    "correct": "fishfork",
    "hints": [
      "Válassz egy villát a halhoz. Három jelölt, egy jó döntés.",
      "Szélesebb fejet és rövidebb ágakat keress, ne a hosszú, keskeny húsvillát.",
      "A széles fejű, háromágú halvillát válaszd. A jobb szélső ága rövidebb."
    ],
    "explanation": "A halvilla széles feje és rövidebb ágai a puha halhúshoz illenek.",
    "success": "A bárónő bólint. A szemközti nemes úgy tesz, mintha ő is ezt választotta volna. Gyorsan villát cserél az asztal alatt.",
    "failure": "A bárónő a villádra néz, majd a halra. „Érdekes haditerv.” A halnak hirtelen részvéte támadna, ha tudna."
  },
  {
    "title": "Rozmaringos sült",
    "subtitle": "Éles társasági helyzet",
    "dish": "roast",
    "description": "Megérkezik a sült. Egy ősz nemes szerint ez a család büszkesége. Egyelőre nem világos, a húsról beszél-e vagy a késről.",
    "rule": null,
    "options": [
      {
        "id": "fishknife",
        "name": "Halkés"
      },
      {
        "id": "dinnerknife",
        "name": "Asztali kés"
      },
      {
        "id": "butterknife",
        "name": "Vajkés"
      }
    ],
    "correct": "dinnerknife",
    "hints": [
      "A sült felvágásához válassz egy kést.",
      "Hosszú, keskeny pengét keress. A lapát alakú eszköznek ma más dolga van.",
      "A hosszú, keskeny, enyhén hegyes asztali kést válaszd. Ne a rövid vajkést vagy a széles halkést."
    ],
    "explanation": "A sülthöz az asztali kés illik. A vajkés hősiesen próbálkozna; a halkés udvariasan felmondana.",
    "success": "Szépen levágsz egy falatot. Egy nemesúr a saját késére pillant, mintha az hibás lenne, amiért ő még nem kapott ilyen elismerő tekintetet.",
    "failure": "Egy húsdarab diplomáciai küldetésre indul a szomszéd tányérjára. Az inas közli: „A fogás ma kivételesen házhoz megy.”"
  },
  {
    "title": "Spárga hollandi mártással",
    "subtitle": "Zöld veszedelem",
    "dish": "asparagus",
    "description": "A tányéron három spárga fekszik tökéletes rendben. A körülötted ülő nemesek ennél kevésbé rendezettek, de jobban titkolják.",
    "rule": null,
    "options": [
      {
        "id": "fishfork",
        "name": "Halvilla"
      },
      {
        "id": "dinnerfork",
        "name": "Húsvilla"
      },
      {
        "id": "dessertfork",
        "name": "Desszertvilla"
      }
    ],
    "correct": "dinnerfork",
    "hints": [
      "Válassz egy villát a spárgához.",
      "Most a hosszabb, keskeny, négyágú villa ad biztosabb fogást.",
      "A hosszú, keskeny, négyágú húsvillát keresd. Nem a kis desszertvillát vagy a széles halvillát."
    ],
    "explanation": "Ezen a vacsorán a spárgát a hosszú, négyágú asztali villával eszik. A mártás megköveteli a fegyelmet.",
    "success": "A spárga engedelmeskedik. Helena grófnő arckifejezése szerint ez már vezetői képességnek számít.",
    "failure": "A spárga lecsúszik, és a mártás új családi címert fest az abroszra. Egy nemes halkan megkérdezi, lehet-e ezt örökölni."
  },
  {
    "title": "Citromos szájfrissítő",
    "subtitle": "A savanyú rész",
    "dish": "lemon",
    "description": "Egy apró pohár citromkrém érkezik. A savanyú arcok alapján a társaság fele már előre megkóstolta.",
    "rule": null,
    "options": [
      {
        "id": "soupspoon",
        "name": "Leveseskanál"
      },
      {
        "id": "dessertspoon",
        "name": "Desszertkanál"
      },
      {
        "id": "teaspoon",
        "name": "Teáskanál"
      }
    ],
    "correct": "dessertspoon",
    "hints": [
      "Válassz egy kanalat a pohárban tálalt krémhez.",
      "A közepes kanál pont elég: a legnagyobb túl sok, a legkisebb túl kevés.",
      "A közepes méretű, ovális fejű desszertkanalat válaszd. Nem a nagy leveseskanalat és nem a kis teáskanalat."
    ],
    "explanation": "A pohárdesszerthez itt a közepes desszertkanalat készítették ki. A leveseskanál már önálló expedíciónak számítana.",
    "success": "A grófnő mosolyog. A citrom összehúzza a szádat, de valahogy ezt is arisztokratikus tartásnak nézik.",
    "failure": "A kanál és a pohár rövid tárgyalás után nem jut egyezségre. Egy vikomtné együttérzően súgja: „Nekem az első házasságom volt ilyen.”"
  },
  {
    "title": "Éjféli rózsasörbet",
    "subtitle": "Helena különös szokása",
    "dish": "sorbet",
    "description": "Az óra tizenkettőt üt. A nemesek egyszerre vesznek fel fontos arckifejezést. Az inas három díszes kiskanalat tesz eléd.",
    "rule": "„A rózsasörbethez rózsás kanál jár. A csillagászatot majd vacsora után.” — Helena grófnő.",
    "options": [
      {
        "id": "moonspoon",
        "name": "Holdas kiskanál"
      },
      {
        "id": "rosespoon",
        "name": "Rózsás kiskanál"
      },
      {
        "id": "starspoon",
        "name": "Csillagos kiskanál"
      }
    ],
    "correct": "rosespoon",
    "hints": [
      "Válassz egy kanalat, és figyeld a grófnő házi szokását.",
      "A nyél dísze számít. Helena kedvenc virágára gondolj.",
      "A rózsával díszített kiskanalat válaszd. A hold és a csillag ma más műszakban van."
    ],
    "explanation": "Helena a rózsasörbethez rózsás kanalat vár. Ez személyes házi szokás; a Valcourt névhez nem tartozik rózsás családi címer ebben a játékban.",
    "success": "A grófnő láthatóan örül, hogy figyeltél rá. Egy báró látványosan megszagolja a kanalát, hátha ő is rájön valamire.",
    "failure": "Helena a kanálra pillant. „Rózsasörbet.” Majd még egyszer rád néz. „Rózsa.” Az inas együttérzésből úgy tesz, mintha megsüketült volna."
  },
  {
    "title": "Kéksajt, fehér kesztyű",
    "subtitle": "Két ág, egy ítélet",
    "dish": "cheese",
    "description": "A sajt tekintélyes illattal jelenti be magát. Egy nemesúr sértetten kér körülötte szót: eddig ő volt a terem legerősebb jelenléte.",
    "rule": "„Sajthoz két ág. A többi fölösleges személyzet.” — A grófnő asztali szabálya.",
    "options": [
      {
        "id": "dinnerfork",
        "name": "Húsvilla"
      },
      {
        "id": "cheesefork",
        "name": "Kétágú sajtvilla"
      },
      {
        "id": "servingfork",
        "name": "Nagy tálalóvilla"
      }
    ],
    "correct": "cheesefork",
    "hints": [
      "Válassz egy villát a sajthoz. Itt megint a házi szokás dönt.",
      "Kevesebb ág. Több sajt. A grófnő ebben hajthatatlan.",
      "A keskeny, két hosszú ágú sajtvillát keresd. Kettő. Nem három vagy négy."
    ],
    "explanation": "A kétágú sajtvilla itt Helena házi előírása. Az illatot ettől még senki nem tudja elegánsan kikerülni.",
    "success": "A sajt a villán marad, a méltóságod is a helyén. Az inas arca szerint ma este ez már ritka kettős siker.",
    "failure": "A sajt elmenekül a villáról. Egy báró úgy húzódik félre előle, mintha kiderült volna, hogy pénzt kér kölcsön."
  },
  {
    "title": "Vörösboros körte",
    "subtitle": "Égi segítség",
    "dish": "pear",
    "description": "A körte borban fürdött, és ezt jobban viseli, mint néhány körülötted ülő vendég. Újabb díszes kanalak következnek.",
    "rule": "„A boros körtére nálam csak a hold vigyáz. A csillagok túl pletykásak.” — Helena grófnő.",
    "options": [
      {
        "id": "rosespoon",
        "name": "Rózsás kiskanál"
      },
      {
        "id": "starspoon",
        "name": "Csillagos kiskanál"
      },
      {
        "id": "moonspoon",
        "name": "Holdas kiskanál"
      }
    ],
    "correct": "moonspoon",
    "hints": [
      "Válassz egy kanalat a körtéhez. Gondolj Helena esti szabályára.",
      "Nem a virág és nem a csillag vigyáz ma este a gyümölcsre.",
      "A félholddal díszített kiskanalat válaszd. A nyél végén egy jól látható sarló van."
    ],
    "explanation": "A holdas kanál a grófnő boros körtéhez kapcsolódó, teljesen kitalált házi szokása.",
    "success": "Helena elégedetten bólint. A szomszéd nemes azt súgja: „Én ezt már a holdállásból tudtam.” Fogalma sem volt.",
    "failure": "A grófnő egyetlen szemöldököt mozdít. A terem három nemese önként bocsánatot kér, pedig most kivételesen te hibáztál."
  },
  {
    "title": "A grófnő fekete tortája",
    "subtitle": "A végső falat",
    "dish": "cake",
    "description": "Egy apró tortaszelet érkezik. Helena a társaságra néz, majd rátok. A beszélgetésnek hamarosan fontosabb témája is lesz a villáknál.",
    "rule": "„Kis torta, nagy tisztelet: az utolsó falathoz a legnagyobb villa jár.” — Helena grófnő.",
    "options": [
      {
        "id": "dessertfork",
        "name": "Desszertvilla"
      },
      {
        "id": "servingfork",
        "name": "Nagy tálalóvilla"
      },
      {
        "id": "dinnerfork",
        "name": "Húsvilla"
      }
    ],
    "correct": "servingfork",
    "hints": [
      "Válassz egy villát. Az utolsó házi szokás sem teljesen észszerű.",
      "Ma este a szokásos desszertvilla túlságosan szerény gesztus.",
      "A leghosszabb és legszélesebb, négy vastag ágú tálalóvillát válaszd. Igen, a nevetségesen nagyot."
    ],
    "explanation": "Helena az utolsó fogáshoz a legnagyobb villát várja. A torta kicsi, a tisztelet látványosan túlméretezett.",
    "success": "Hatalmas villa, apró falat, rezzenéstelen arc. A nemesek áhítattal nézik. Most már bármit hagyománynak tudnál eladni nekik.",
    "failure": "„Kis villa?” — kérdezi Helena. Az egyik báró sietve hatalmasnak nevezi a sajátját. Senki nem néz rá."
  }
];
  const PASS_SCORE = 6;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function randomInt(max) {
    if (globalThis.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      const limit = Math.floor(4294967296 / max) * max;
      do { crypto.getRandomValues(values); } while (values[0] >= limit);
      return values[0] % max;
    }
    return Math.floor(Math.random() * max);
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(i + 1); [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function delta(correct, risk) { return correct ? (risk ? 2 : 1) : (risk ? -1 : 0); }
  function hintTier(roll) { return roll <= 9 ? 0 : roll <= 15 ? 1 : 2; }
  function validRoll(raw) {
    if (!/^\d{1,2}$/.test(String(raw).trim())) return null;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 1 && n <= 20 ? n : null;
  }
  function freshGame() {
    return { version: 2, stage: 'roll', index: 0, score: 0, roll: null, risk: false,
      selected: null, usedExcuse: false, history: [], order: courses.map(c => shuffle(c.options.map(o => o.id))) };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s || s.version !== 2 || !['roll', 'choose', 'result', 'end', 'surrender'].includes(s.stage)) return null;
      if (!Number.isInteger(s.index) || s.index < 0 || s.index >= courses.length || !Number.isInteger(s.score)) return null;
      if (typeof s.risk !== 'boolean' || typeof s.usedExcuse !== 'boolean') return null;
      if (!Array.isArray(s.history) || s.history.length > courses.length || !Array.isArray(s.order) || s.order.length !== courses.length) return null;
      if (!s.order.every((ids, i) => Array.isArray(ids) && ids.length === 3 && new Set(ids).size === 3 && ids.every(id => courses[i].options.some(o => o.id === id)))) return null;
      if (s.roll !== null && validRoll(s.roll) === null) return null;
      if (s.selected !== null && !s.order[s.index].includes(s.selected)) return null;
      const expectedHistory = s.stage === 'end' ? courses.length : s.stage === 'result' ? s.index + 1 : s.index;
      if (s.history.length !== expectedHistory) return null;
      if (!s.history.every((h, i) => h.index === i && typeof h.risk === 'boolean' && typeof h.correct === 'boolean' && validRoll(h.roll) !== null && courses[i].options.some(o => o.id === h.selected) && h.correct === (h.selected === courses[i].correct) && h.points === delta(h.correct, h.risk))) return null;
      if (s.score !== s.history.reduce((total, h) => total + h.points, 0)) return null;
      if (['choose', 'result', 'end'].includes(s.stage) && s.roll === null) return null;
      return s;
    } catch { return null; }
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* Private mode may disable saving. */ }
    saved = state;
  }
  function announce(text) { document.querySelector('#announcement').textContent = text; }
  function showScreen(html, { focus = true } = {}) {
    app.innerHTML = `<div class="new-screen">${html}</div>`;
    if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); app.focus({ preventScroll: true }); }
  }

  function dieIcon() {
    return '<svg aria-hidden="true" viewBox="0 0 40 44" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M20 2 38 13v20L20 43 2 33V13Z M20 2 10 17l10 18 10-18ZM2 13l8 4-8 16m36-20-8 4 8 16M2 33l18 2 18-2M20 35v8"/></svg>';
  }
  function rose(cx, cy, color = '#9c6e67', scale = 1) {
    return `<g transform="translate(${cx} ${cy}) scale(${scale})" fill="none" stroke="${color}" stroke-width="1.5"><path d="M0-12C5-17 12-11 10-5c9 1 9 11 1 13-1 9-12 9-14 2-8 4-14-4-10-10-7-6 1-15 7-11C-4-17-1-16 0-12Z"/><path d="M-3-8c9-5 13 8 5 10-7 4-12-5-5-10Zm5 10c2 6-3 10-8 5M0 11v13m0-4c-9 1-10-6-10-6 7-2 10 6 10 6m0-4c8 1 10-6 10-6-7-2-10 6-10 6"/></g>`;
  }
  function utensil(type, extra = '') {
    const id = `metal-${++svgId}`;
    const fill = `url(#${id})`;
    const handle = '<path d="M37 91h6l-1 74c0 21 8 39 7 51-1 14-17 14-18 0-1-12 7-30 7-51Z"/>';
    let shape = ''; let motif = '';
    const spoons = ['teaspoon', 'soupspoon', 'dessertspoon', 'moonspoon', 'rosespoon', 'starspoon'];
    if (spoons.includes(type)) {
      const large = type === 'soupspoon'; const medium = type === 'dessertspoon';
      const rx = large ? 25 : medium ? 19 : 14;
      const ry = large ? 39 : medium ? 30 : 24;
      const cy = large ? 47 : medium ? 55 : 61;
      shape = `${handle}<path d="M37 68h6v36h-6Z"/><ellipse cx="40" cy="${cy}" rx="${rx}" ry="${ry}"/><ellipse cx="40" cy="${cy}" rx="${rx - 5}" ry="${ry - 6}" fill="#627772" opacity=".3"/><path d="M${40 - rx + 6} ${cy}c-2-18 12-29 ${rx} ${-ry + 9}" fill="none" stroke="#fff" opacity=".4" stroke-width="1.4"/>`;
      if (type === 'rosespoon') motif = rose(40, 207, '#596454', .8);
      if (type === 'moonspoon') motif = '<path d="M43 197a10 10 0 1 0 0 20 11 11 0 0 1 0-20" fill="#64766a"/>';
      if (type === 'starspoon') motif = '<path d="m40 196 3 7 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z" fill="#64766a"/>';
    } else if (type.includes('fork')) {
      // Each fork is one closed silhouette: tines, shoulder, neck and handle.
      // No independently stroked tines, overlaps or disconnected neck segments.
      const fish = type === 'fishfork';
      const small = type === 'dessertfork';
      const huge = type === 'servingfork';
      const cheese = type === 'cheesefork';
      const xs = cheese ? [29, 51] : fish ? [24, 40, 56] : small ? [29, 40, 51] : huge ? [15, 32, 48, 65] : [23, 34, 46, 57];
      const tineWidth = huge || fish ? 7 : 6;
      const top = huge ? 8 : small ? 43 : fish ? 26 : 17;
      const shoulder = small ? 87 : 78;
      const slot = small ? 70 : 61;
      const left = xs[0] - tineWidth / 2;
      const right = xs[xs.length - 1] + tineWidth / 2;
      let outline = `M${left} ${shoulder}`;
      xs.forEach((x, i) => {
        const tip = top + (fish && i === xs.length - 1 ? 12 : 0);
        outline += `V${tip + 2}Q${x - tineWidth / 2} ${tip} ${x - tineWidth / 2 + 2} ${tip}H${x + tineWidth / 2 - 2}Q${x + tineWidth / 2} ${tip} ${x + tineWidth / 2} ${tip + 2}`;
        if (i < xs.length - 1) outline += `V${slot}H${xs[i + 1] - tineWidth / 2}`;
      });
      outline += `V${shoulder}Q${right} 94 43 106L42 165C41 188 49 201 49 216C49 233 31 233 31 216C31 201 39 188 38 165L37 106Q${left} 94 ${left} ${shoulder}Z`;
      shape = `<path class="fork-silhouette" d="${outline}"/>`;
    } else {
      const blade = type === 'fishknife'
        ? 'M48 7C8 29 4 66 10 90l28 15h10V7Z'
        : type === 'butterknife'
          ? 'M44 37C19 34 17 48 22 80l16 20h8Z'
          : 'M45 10C27 18 24 62 25 94l13 8h8Z';
      shape = `${handle}<path d="${blade}"/>`;
    }
    return `<svg ${extra} class="utensil" aria-hidden="true" viewBox="0 0 80 240"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="70" y2="0"><stop stop-color="#82968b"/><stop offset=".28" stop-color="#dce2d3"/><stop offset=".48" stop-color="#faf4df"/><stop offset=".64" stop-color="#b4c3b3"/><stop offset="1" stop-color="#738b7d"/></linearGradient></defs><g fill="${fill}" stroke="#c7d0bd" stroke-width=".55">${shape}</g><path d="M40 113v62m0 8v8" stroke="#607c68" fill="none" opacity=".5"/>${motif}</svg>`;
  }
  function heroArt() {
    return `<svg class="hero-art" aria-hidden="true" viewBox="0 0 360 230"><defs><radialGradient id="porcelain"><stop stop-color="#f7efdb"/><stop offset=".8" stop-color="#dfddc6"/><stop offset="1" stop-color="#b7c5ae"/></radialGradient></defs><circle cx="180" cy="112" r="93" fill="#000" opacity=".2"/><circle cx="180" cy="108" r="91" fill="url(#porcelain)" stroke="#d8bd80" stroke-width="2"/><circle cx="180" cy="108" r="82" fill="none" stroke="#8d9b7f"/><circle cx="180" cy="108" r="65" fill="none" stroke="#a6ae91"/><circle cx="180" cy="108" r="61" fill="#ece8d1" opacity=".45"/><text x="180" y="124" fill="#526b57" font-size="64" text-anchor="middle" font-family="Georgia,serif">V</text><path d="m162 65-5-15 13 7 10-15 10 15 13-7-5 15Z" fill="none" stroke="#8b966f" stroke-width="1.5"/><text x="180" y="161" fill="#62725c" font-size="8" text-anchor="middle" letter-spacing="3" font-family="Georgia,serif">VALCOURT</text>${utensil('dinnerfork', 'x="22" y="0" width="50" height="216"')}${utensil('dinnerknife', 'x="289" y="0" width="50" height="216"')}<path d="M97 208q83 18 166 0" stroke="#d8bd8044" fill="none"/></svg>`;
  }
  function dishArt(kind) {
    const foods = {
      soup: '<circle cx="180" cy="78" r="43" fill="#ba8841"/><circle cx="180" cy="78" r="37" fill="#c7984e"/><path d="M158 62q29-10 43 9M151 87q23 16 51-2" fill="none" stroke="#edcc81" stroke-width="2" opacity=".6"/><g fill="#526b38"><ellipse cx="176" cy="68" rx="5" ry="2" transform="rotate(30 176 68)"/><ellipse cx="189" cy="91" rx="6" ry="2" transform="rotate(-35 189 91)"/><ellipse cx="167" cy="87" rx="3" ry="2"/></g>',
      fish: '<path d="M142 77q35-44 67-4l20-13-4 30-17-10q-32 29-66-3Z" fill="#bfaa7b" stroke="#8c7951"/><path d="m153 76 45-2m-33-12 5 13-7 13m17-28 4 14-7 15" stroke="#eddfae" fill="none"/><circle cx="149" cy="75" r="2" fill="#435542"/><circle cx="157" cy="103" r="11" fill="#d9bd55"/><circle cx="157" cy="103" r="8" fill="none" stroke="#efdfa1"/><path d="m201 98 17 10m-12-14 7 15m-3-18 8 19" stroke="#697d43" stroke-width="3"/>',
      roast: '<path d="M148 59q16-18 49-3 27 9 16 32-5 24-41 20-37-1-34-24Z" fill="#624236" stroke="#987354" stroke-width="3"/><path d="m154 68 43 25m-48-9 33 19m-13-43 36 22" stroke="#b58b68" stroke-width="3"/><path d="m208 55-26 57m11-49 10 5m-16 7 10 5m-15 6 9 5m-15 7 10 4" stroke="#71825b" stroke-width="2"/><circle cx="224" cy="88" r="8" fill="#b6a76c"/><circle cx="217" cy="104" r="6" fill="#d0b77a"/>',
      sorbet: '<ellipse cx="180" cy="102" rx="33" ry="12" fill="#b2c1b4"/><path d="M150 89q30 39 60 0" fill="#c6d5c1" stroke="#869f8c"/><circle cx="180" cy="71" r="27" fill="#a25d63"/><path d="M160 66q17-19 36-2m-38 13q16 8 40-2" fill="none" stroke="#c78485" stroke-width="3"/><path d="M188 44q8-12 17-8-6 13-17 8" fill="#667b48"/>',
      cake: '<path d="m150 91 9-42 55 42v15l-64-1Z" fill="#533d35"/><path d="m151 92 62 1m-60-8 48 1m-47-8 36 1" stroke="#aa896e" stroke-width="3"/><path d="m150 91 9-42 55 42Z" fill="#402f2c" stroke="#6e5040"/><circle cx="164" cy="67" r="7" fill="#a95452"/><path d="m167 59 7-6" stroke="#647a45" stroke-width="3"/><path d="m202 111 8 2m-44 5 8-1" stroke="#92795c" stroke-width="2"/>'
    };
    foods.bread = '<ellipse cx="177" cy="77" rx="37" ry="26" fill="#bb8545" stroke="#e4bb72" stroke-width="3"/><path d="m160 59 9 29m9-33 7 33m10-27 5 21" stroke="#e6c68c" stroke-width="3"/><rect x="202" y="98" width="23" height="14" rx="3" fill="#e8cc78"/>';
    foods.asparagus = '<g fill="none" stroke="#76934a" stroke-width="7" stroke-linecap="round"><path d="m153 105 22-55m-7 59 19-55m-3 55 18-55"/></g><path d="m163 76 32 10m-35 1 31 11" stroke="#e4cb80" stroke-width="7" stroke-linecap="round"/>';
    foods.lemon = '<path d="M153 64h54l-8 42h-38Z" fill="#d6d6b9" stroke="#849986"/><ellipse cx="180" cy="65" rx="27" ry="11" fill="#e0c76e"/><path d="M180 107v11m-17 0h34" stroke="#8a9c84" stroke-width="3"/><path d="M185 50a14 14 0 0 1 23 9l-23-9Z" fill="#ebd470" stroke="#f1e2a4"/>';
    foods.cheese = '<path d="m145 94 16-40 52 30v22l-68 3Z" fill="#d8bb72" stroke="#ab965e"/><path d="m145 94 68-10-52-30Z" fill="#e4d291"/><g stroke="#6b8976" stroke-width="2"><path d="m161 83 10-9 7 3m3 17 9-7m8 10 8-7m-51 11 7-4"/></g>';
    foods.pear = '<path d="M178 44c-13 0-9 20-23 33-21 26 3 39 28 37 28-2 39-22 18-42-12-11-9-28-23-28Z" fill="#9b4c4c" stroke="#713b39"/><path d="m180 44 4-13" stroke="#746643" stroke-width="3"/><path d="M187 42q11-13 20-6-7 12-20 6" fill="#6b8052"/><path d="M164 80q-6 13 1 20" fill="none" stroke="#c27f6e" stroke-width="3"/>';
    return `<svg class="dish-art" aria-hidden="true" viewBox="0 0 360 158"><circle cx="180" cy="79" r="70" fill="#e4e2ca" stroke="#cfb97d" stroke-width="2"/><circle cx="180" cy="79" r="63" fill="none" stroke="#91a184"/><circle cx="180" cy="79" r="50" fill="#d7dbc0" stroke="#afba99"/>${foods[kind]}</svg>`;
  }

  function intro() {
    state = null;
    const resumable = saved && !['end', 'surrender'].includes(saved.stage);
    showScreen(`<section class="intro"><p class="eyebrow">Vacsorameghívó kalandoroknak</p><h1>A grófnő<br><em>asztalánál</em></h1><p class="intro-copy">Tíz fogás. Egy grófnő. Túl sok villa.<br>A társaság már most rólad suttog.</p>${heroArt()}<div class="ornament" aria-hidden="true">✦</div><div class="intro-meta"><span>${courses.length} fogás</span><span>1 húszoldalú kocka</span><span>Kétes modor</span></div><div class="resume-buttons">${resumable ? '<button class="primary" data-action="resume">Folytatom a vacsorát</button><button class="text-button" data-action="new">Új vacsorát kezdek</button>' : '<button class="primary" data-action="new">Helyet foglalok</button>'}</div><button class="text-button share-link" data-action="share">Meghívó a többieknek · QR-kód</button><p class="fantasy-note">Viktoriánus hangulatú fantáziajáték.<br>Itt a grófnő házi szokásai is számítanak.</p></section>`);
  }
  function header() {
    return `<div class="game-header"><p class="eyebrow">${state.index + 1}. fogás <span style="color:var(--muted)">/ ${courses.length}</span></p><div class="score"><strong>${state.score}</strong> pont</div></div><div class="progress" aria-label="${state.index + 1}. fogás a ${courses.length}-ből">${courses.map((_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}"></span>`).join('')}</div>`;
  }
  function quitButton() { return '<div class="quit-wrap"><button class="text-button quit-button" data-action="quit">Lássák csak, milyen parasztgyerek vagyok!</button></div>'; }
  function rollForm(reroll = false) {
    const prefix = reroll ? 'reroll' : 'roll';
    return `<form data-form="${prefix}" novalidate><label for="${prefix}-value">${reroll ? 'Írd be az új dobásodat' : 'Mennyit dobtál a d20-szal?'}</label><p class="subcopy">${reroll ? 'A jobb eredmény marad. Ezt egyszer teheted meg.' : 'Nagyobb dobásért pontosabb utalás jár.'}</p><div class="roll-entry"><div class="die-input">${dieIcon()}<input id="${prefix}-value" name="roll" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="1–20" aria-describedby="${prefix}-error" required></div><button class="primary" type="submit">${reroll ? 'Új utalást kérek' : 'Utalást kérek'}</button></div><p class="error" id="${prefix}-error" role="alert"></p><button class="text-button" type="button" data-action="${reroll ? 'digital-reroll' : 'digital-roll'}">Nincs nálam kocka. Dobok itt.</button></form>`;
  }
  function render() {
    if (!state) return intro();
    if (state.stage === 'end' || state.stage === 'surrender') return ending();
    if (state.stage === 'result') return result();
    const c = courses[state.index];
    const heading = `<div class="course-heading"><p class="eyebrow">${c.subtitle}</p><h1>${c.title}</h1><p class="description">${c.description}</p></div>`;
    const houseRule = c.rule ? `<aside class="house-rule"><span aria-hidden="true">❧</span><div>${c.rule}</div></aside>` : '';
    if (state.stage === 'roll') {
      showScreen(`<section>${header()}${heading}${dishArt(c.dish)}${houseRule}<div class="roll-panel">${rollForm()}</div>${quitButton()}</section>`);
    } else {
      const tier = hintTier(state.roll);
      showScreen(`<section class="choose">${header()}${heading}${dishArt(c.dish)}${houseRule}<aside class="hint"><div class="hint-meta"><span class="die-badge">d20 · ${state.roll}</span><span>${['HALVÁNY SEJTÉS', 'EGY KIS SEGÍTSÉG', 'BIZTOS TÁMPONT'][tier]}</span></div><p>${c.hints[tier]}</p></aside><p class="section-label">Mennyire vagy biztos magadban?</p><div class="risk-options" role="group" aria-label="Tét kiválasztása"><button class="risk-button" aria-pressed="${!state.risk}" data-action="safe">Óvatosan eszem<span>Jó: +1 pont · Rossz: 0</span></button><button class="risk-button" aria-pressed="${state.risk}" data-action="risk">Kockáztatok<span>Jó: +2 pont · Rossz: −1</span></button></div><p class="section-label" id="choice-label">Melyiket használod?</p><div class="utensils" role="group" aria-labelledby="choice-label">${state.order[state.index].map((id, i) => `<button class="utensil-card" data-option="${id}" aria-label="${letters[i]} evőeszköz: ${visualDescriptions[id]}" aria-pressed="${state.selected === id}">${utensil(id)}<span class="utensil-letter">${letters[i]}</span></button>`).join('')}</div><button class="primary" data-action="eat" ${state.selected ? '' : 'disabled'}>${state.selected ? `${letters[state.order[state.index].indexOf(state.selected)]} eszközzel eszem` : 'Válassz egy evőeszközt'}</button><div class="helpers"><button data-action="excuse" ${state.usedExcuse ? 'disabled' : ''}>${state.usedExcuse ? '✓ A kimagyarázást már elhasználtad' : '✦ Kimagyarázom! · 1 alkalom'}</button></div>${quitButton()}</section>`);
    }
  }
  function setRoll(raw, reroll = false) {
    if (!state || state.stage !== (reroll ? 'choose' : 'roll') || (reroll && state.usedExcuse)) return;
    const n = validRoll(raw);
    if (n === null) {
      const prefix = reroll ? 'reroll' : 'roll';
      document.querySelector(`#${prefix}-error`).textContent = '1 és 20 közötti egész számot írj be.';
      const input = document.querySelector(`#${prefix}-value`);
      input.setAttribute('aria-invalid', 'true'); input.focus(); return;
    }
    if (reroll) { state.roll = Math.max(state.roll, n); state.usedExcuse = true; closeModal(); }
    else { state.roll = n; state.stage = 'choose'; }
    persist(); render();
    announce(`A dobásod ${n}. ${courses[state.index].hints[hintTier(state.roll)]}`);
  }
  function setRisk(value) {
    if (state?.stage !== 'choose') return;
    state.risk = value;
    document.querySelector('[data-action="safe"]').setAttribute('aria-pressed', String(!value));
    document.querySelector('[data-action="risk"]').setAttribute('aria-pressed', String(value));
    persist();
  }
  function select(id) {
    if (state?.stage !== 'choose' || !state.order[state.index].includes(id)) return;
    state.selected = id;
    document.querySelectorAll('[data-option]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.option === id)));
    const button = document.querySelector('[data-action="eat"]');
    button.disabled = false; button.textContent = `${letters[state.order[state.index].indexOf(id)]} eszközzel eszem`;
    persist();
  }
  function eat() {
    if (state?.stage !== 'choose' || !state.selected) return;
    const correct = state.selected === courses[state.index].correct;
    const points = delta(correct, state.risk);
    state.history.push({ index: state.index, selected: state.selected, correct, risk: state.risk, roll: state.roll, points });
    state.score += points; state.stage = 'result'; persist(); render();
  }
  const reactionImages = {
    approval: { file: 'elismeres.webp', alt: 'Helena grófnő és több nemes elismerően mosolyog; egy vikomt látványosan féltékeny.' },
    trust: { file: 'bizalom.webp', alt: 'Helena Valcourt grófnő megkönnyebbülten mosolyog, keze mellett egy lezárt levél.' },
    monocle: { file: 'monokli.webp', alt: 'Egy döbbent arisztokrata monoklija a levesbe esik, egy nemeshölgy alig bírja visszatartani a nevetést.' },
    doubt: { file: 'ketely.webp', alt: 'Helena kétkedve néz, egy arisztokrata óvatosan elhúzza előled az ezüstöt.' }
  };
  function reactionArt(key) {
    const image = reactionImages[key];
    return `<figure class="reaction-art"><img src="./assets/${image.file}" alt="${image.alt}" width="1536" height="1024" decoding="async"></figure>`;
  }
  function result() {
    const c = courses[state.index]; const h = state.history[state.index];
    const answer = c.options.find(o => o.id === c.correct);
    const selected = c.options.find(o => o.id === h.selected);
    const successTitles = ['Ezt most mindenki látta.', 'A társaság elismerően hümmög.', 'Méltóság: megőrizve.', 'Helena szája sarkában mosoly.'];
    const failTitles = ['Az ezüst is zavarba jön.', 'Valaki nagyon lassan pislog.', 'A csendnek most súlya van.', 'Ezt holnap is mesélik.'];
    const image = h.correct ? (state.index % 2 ? 'trust' : 'approval') : (state.index % 3 === 0 ? 'monocle' : 'doubt');
    showScreen(`<section class="result ${h.correct ? '' : 'bad'}">${header()}${reactionArt(image)}<p class="eyebrow">${h.correct ? 'Társasági siker' : 'Az etikett rövid időre elhagyta a termet'}</p><h1>${(h.correct ? successTitles : failTitles)[state.index % 4]}</h1><p class="points-change">${h.points > 0 ? '+' : h.points < 0 ? '−' : ''}${Math.abs(h.points)} pont</p><p class="result-narration">${h.correct ? c.success : c.failure}</p><div class="answer-box"><p class="eyebrow">A helyes ezüst</p><p>Ezt választottad: <strong>${selected.name}</strong></p><p>Ide ez illett: <strong>${answer.name}</strong></p><p class="answer-detail">${c.explanation}</p>${h.risk ? '<p>Kockáztattál: jó választás +2, rossz választás −1 pont.</p>' : ''}</div><button class="primary" data-action="next">${state.index === courses.length - 1 ? 'A grófnő ítélete' : 'Jöhet a következő fogás'}</button></section>`);
  }
  function next() {
    if (state?.stage !== 'result') return;
    if (state.index === courses.length - 1) state.stage = 'end';
    else { state.index++; state.stage = 'roll'; state.roll = null; state.selected = null; state.risk = false; }
    persist(); render();
  }
  function ending() {
    const surrendered = state.stage === 'surrender';
    const passed = state.score >= PASS_SCORE;
    const title = surrendered ? 'Illem helyett: jó étvágy.' : passed ? 'Jó kezekben.' : 'Hát… nem is tudom.';
    const copy = surrendered
      ? 'Félretolod az ezüstöt. Innentől mindent kézzel eszel. Neked véget ért a próba; a többiek folytathatják. Egy báró először elborzad, aztán irigykedve nézi, mennyivel gyorsabban haladsz.'
      : passed
        ? 'Helena Valcourt grófnő válla lassan ellazul. Már nem az evőeszközeiteket figyeli, hanem rátok néz. Látszólag biztonságban érzi magát veletek: amit rátok szeretne bízni, jó kezekben lesz. Az inas diszkréten közelebb lép. A vacsora igazi oka most következik.'
        : 'Helena Valcourt grófnő mosolya udvarias. A tekintete kevésbé. Láthatóan mérlegeli, hogy amit rátok szeretne bízni, valóban jó kezekben lenne-e. A körülöttetek ülő nemesek hirtelen nagyon elfoglaltak a poharukkal. Az inas egyelőre távolabb húzza az ezüstöt.';
    showScreen(`<section class="ending"><p class="eyebrow">${surrendered ? 'A parasztgyerek-befejezés' : 'Helena Valcourt ítélete'}</p>${reactionArt(surrendered ? 'monocle' : passed ? 'trust' : 'doubt')}<h1>${title}</h1><p class="ending-copy">${copy}</p>${surrendered ? '<blockquote>„Egy arisztokrata monoklija a levesbe pottyan. Te közben már a következő marékért nyúlsz.”</blockquote>' : ''}<div class="final-score"><strong>${state.score} pont</strong><span>${surrendered ? `${state.history.length} teljesített fogás · a pontjaid megmaradtak` : `${courses.length} fogás · ${PASS_SCORE} ponttól bizalmat ébresztesz`}</span></div>${state.history.length ? `<ul class="round-list" aria-label="A vacsora eredményei">${state.history.map(h => `<li><span>${courses[h.index].title}</span><span>${h.points > 0 ? '+' : h.points < 0 ? '−' : ''}${Math.abs(h.points)} pont${h.risk ? ' · tétre' : ''}</span></li>`).join('')}</ul>` : ''}<p class="end-note">Mutasd meg az eredményt a mesélődnek.</p><button class="primary" data-action="new">Új vacsorát kezdek</button><button class="text-button" data-action="share">Meghívó a többieknek · QR-kód</button></section>`);
  }
  function openModal(html) {
    lastFocus = document.activeElement;
    modalContent.innerHTML = html;
    if (!modal.open) modal.showModal();
  }
  function closeModal() { modal.close(); }
  let invitationQR = null;
  function publicGameURL(raw) {
    try {
      const url = new URL(raw);
      if (!['http:', 'https:'].includes(url.protocol) || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return null;
      url.hash = ''; url.search = '';
      return url.href;
    } catch { return null; }
  }
  function share() {
    const current = publicGameURL(window.location.href) || '';
    invitationQR = null;
    openModal(`<p class="eyebrow">Helena Valcourt meghívója</p><h2 id="modal-title">Terítsünk a többieknek is.</h2><p>Olvassátok be a kódot a telefon kamerájával. Mindenki a saját vacsoráját kezdi el.</p><form data-form="qr" novalidate><label for="share-url">A játék nyilvános címe</label><input id="share-url" class="share-url" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://felhasznalo.github.io/reponev/" value="${escapeHTML(current)}"><p class="subcopy">${current ? 'Ez a megnyitott játék címe. Másik linket is megadhatsz.' : 'Az éles GitHub Pages-linket írd ide. A helyi előnézet címe más telefonon nem működne.'}</p><button class="primary" type="submit">QR-kód készítése</button><p id="qr-error" class="error" role="alert"></p></form><div id="qr-output"></div><button class="secondary" data-action="close-modal">Vissza a vacsorához</button>`);
    if (current) makeInvitation(current);
  }
  function makeInvitation(raw) {
    const url = publicGameURL(raw);
    const error = document.querySelector('#qr-error');
    if (!url || url.length > 1000) {
      error.textContent = 'Teljes, nyilvánosan elérhető http vagy https címet adj meg, ne helyi előnézetet.';
      return;
    }
    try {
      const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
      const count = qr.getModuleCount();
      const size = count + 8;
      let blocks = '';
      for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) blocks += `M${col + 4} ${row + 4}h1v1h-1z`;
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 ${size} ${size}" role="img" aria-label="Meghívó a Valcourt-vacsorára" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${blocks}" fill="#000"/></svg>`;
      invitationQR = { svg, url };
      error.textContent = '';
      document.querySelector('#qr-output').innerHTML = `<div class="qr-code">${svg}</div><p class="qr-address">${escapeHTML(url)}</p><button class="primary" data-action="download-qr">QR-kód letöltése (SVG)</button>`;
    } catch {
      error.textContent = 'Nem sikerült elkészíteni a QR-kódot. Ellenőrizd, hogy a vendor mappát is feltöltötted-e.';
    }
  }
  function downloadInvitation() {
    if (!invitationQR) return;
    const blob = new Blob([invitationQR.svg], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = href; link.download = 'valcourt-vacsora-qr.svg';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  function rules() {
    openModal('<p class="eyebrow">A vacsora rendje</p><h2 id="modal-title">Tíz fogás. Őrizd a méltóságod.</h2><ol><li><strong>Dobj egy d20-szal, és írd be.</strong> 1–9: kevés segítség. 10–15: jobb utalás. 16–20: pontos leírás.</li><li><strong>Válaszd ki a tétet.</strong> Óvatosan: jó eszköz +1 pont, rossz 0. Kockáztatva: jó +2, rossz −1.</li><li><strong>Koppints egy evőeszközre, majd az „Ezzel eszem” gombra.</strong> A nagyobb dobás csak az utalást javítja, nem garantál helyes választást.</li></ol><p><strong>Kimagyarázom!</strong> Egyszer, választás előtt újradobhatsz. A jobb dobást tartjuk meg.</p><p><strong>Parasztgyerek-gomb:</strong> azonnal befejezed a saját játékodat, és ezután mindent kézzel eszel.</p><p><strong>6 ponttól sikerült a próba.</strong> A grófnő furcsa házi szabályait is figyeld. A pontszám negatív is lehet.</p><p>Mindenki a saját telefonján játszik. A haladás ezen a böngészőn marad meg; közös szoba és bejelentkezés nincs.</p><button class="primary" data-action="close-modal">Értem, felség.</button>');
  }
  function requestNew() {
    const active = state || saved;
    if (active && !['end', 'surrender'].includes(active.stage)) {
      openModal('<h2 id="modal-title">Új meghívás?</h2><p>Az eddigi vacsorád és a pontjaid törlődnek ezen a telefonon.</p><button class="primary" data-action="confirm-new">Újrakezdem</button><button class="secondary" data-action="close-modal">Maradok a mostaninál</button>');
    } else start();
  }
  function start() { if (modal.open) closeModal(); state = freshGame(); persist(); render(); }

  document.addEventListener('click', event => {
    const option = event.target.closest('[data-option]');
    if (option) { select(option.dataset.option); return; }
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    switch (button.dataset.action) {
      case 'rules': rules(); break;
      case 'share': share(); break;
      case 'download-qr': downloadInvitation(); break;
      case 'new': requestNew(); break;
      case 'confirm-new': start(); break;
      case 'resume': state = saved; render(); break;
      case 'safe': setRisk(false); break;
      case 'risk': setRisk(true); break;
      case 'eat': eat(); break;
      case 'next': next(); break;
      case 'digital-roll': setRoll(randomInt(20) + 1); break;
      case 'digital-reroll': setRoll(randomInt(20) + 1, true); break;
      case 'close-modal': closeModal(); break;
      case 'excuse':
        if (state?.stage !== 'choose' || state.usedExcuse) break;
        openModal(`<p class="eyebrow">Egyszeri segítség</p><h2 id="modal-title">„Nálunk ez a szokás!”</h2><blockquote>Helena grófnő felvonja a szemöldökét, de kapsz még egy esélyt összeszedni magad.</blockquote><p>A mostani dobásod: <strong>${state.roll}</strong>. Dobj újra egy pontosabb utalásért. A rosszabb dobást nem kell megtartanod.</p>${rollForm(true)}<button class="secondary" data-action="close-modal">Mégsem használom el</button>`);
        break;
      case 'quit':
        if (!state || !['roll', 'choose'].includes(state.stage)) break;
        openModal('<p class="eyebrow">Ezüst? Ugyan már.</p><h2 id="modal-title">Jöhet kézzel?</h2><p>Ez lezárja a te minijátékodat. A megszerzett pontjaid megmaradnak, a többiek játszhatnak tovább.</p><button class="danger" data-action="confirm-quit">Lássák csak, milyen parasztgyerek vagyok!</button><button class="secondary" data-action="close-modal">Inkább megfogom azt a villát</button>');
        break;
      case 'confirm-quit':
        if (!state || !['roll', 'choose'].includes(state.stage)) break;
        closeModal(); state.stage = 'surrender'; persist(); render(); break;
    }
  });
  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form) return;
    event.preventDefault();
    if (form.dataset.form === 'qr') makeInvitation(new FormData(form).get('url'));
    else setRoll(new FormData(form).get('roll'), form.dataset.form === 'reroll');
  });
  document.addEventListener('input', event => {
    if (event.target.name !== 'roll') return;
    event.target.removeAttribute('aria-invalid');
    const error = event.target.closest('form')?.querySelector('.error');
    if (error) error.textContent = '';
  });
  modal.addEventListener('close', () => {
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeModal();
  });
  document.querySelector('.brand').addEventListener('click', event => { event.preventDefault(); intro(); });
  saved = load();
  intro();
})();
