/* A gróf asztalánál — no dependencies, no server, no network requests. */
'use strict';
(() => {
  const SAVE_KEY = 'grofi-vacsora.v1';
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
      title: 'Aranyló erőleves', subtitle: 'Az első benyomás', dish: 'soup',
      description: 'Az inas leteszi a gőzölgő tányért. A gróf egyetlen szót sem szól. Csak figyel.',
      rule: null,
      options: [
        { id: 'teaspoon', name: 'Teáskanál' },
        { id: 'soupspoon', name: 'Leveseskanál' },
        { id: 'dessertspoon', name: 'Desszertkanál' }
      ], correct: 'soupspoon',
      hints: ['Válassz egy kanalat a leveshez.', 'A mélyebb, nagyobb fejű kanál illik ehhez a fogáshoz.', 'A legnagyobb, széles ovális fejű kanalat keresd. A nyelén nincsen virág.'],
      explanation: 'A nagy, öblös leveseskanál való a leveshez. A két kisebb kanalat későbbre tartogatják.',
      success: 'A gróf alig észrevehetően bólint. Egyelőre elhiszi, hogy tudod, mit csinálsz.',
      failure: 'A gróf kivárja, amíg kiemeled a nevetségesen kis adag levest. „Nem sietünk sehová” — jegyzi meg.'
    },
    {
      title: 'Vajas pisztráng', subtitle: 'Ezüst és pikkelyek', dish: 'fish',
      description: 'A hal tökéletes. A teríték gyanúsan bonyolult. A bárónő már felemelte a villáját.',
      rule: null,
      options: [
        { id: 'dinnerfork', name: 'Húsvilla' },
        { id: 'dessertfork', name: 'Desszertvilla' },
        { id: 'fishfork', name: 'Halvilla' }
      ], correct: 'fishfork',
      hints: ['Három villa. Melyikkel ennél halat?', 'A halhoz szélesebb fejű villa illik. Nem a leghosszabb ágakat keresed.', 'A széles fejű, háromágú villát válaszd. Az egyik szélső ága rövidebb a többinél.'],
      explanation: 'A halvilla feje széles, ágai rövidebbek. Segít a puha halhús szétválasztásában.',
      success: 'A bárónő nem talál fogást rajtad. A halon viszont te igen.',
      failure: 'A bárónő a villádra néz, aztán rád. A kettő közül láthatóan téged ért kevésbé.'
    },
    {
      title: 'Rozmaringos sült', subtitle: 'Éles helyzet', dish: 'roast',
      description: 'Szaftos sült érkezik. Három kés vár előtted. Most melyikhez nyúlsz?',
      rule: null,
      options: [
        { id: 'fishknife', name: 'Halkés' },
        { id: 'dinnerknife', name: 'Asztali kés' },
        { id: 'butterknife', name: 'Vajkés' }
      ], correct: 'dinnerknife',
      hints: ['Válassz egy kést a sülthöz.', 'Keskeny, hosszú pengét keresel. A széles, lapátszerű eszköz másra való.', 'A hosszú, keskeny, enyhén hegyes pengéjű kést válaszd. Ne a rövid, kerek végűt, és ne a levél alakút.'],
      explanation: 'Az asztali kés való a sülthöz. A rövid, kerek végű a vajkés; a széles, levél alakú a halkés.',
      success: 'Egyetlen elegáns mozdulat. Az inas csendben újratölti a poharadat.',
      failure: 'A sült egy darabja megindul a szomszédod felé. Az inas úgy tesz, mintha ez a műsor része lenne.'
    },
    {
      title: 'Éjféli rózsasörbet', subtitle: 'A ház különös szokásai', dish: 'sorbet',
      description: 'Az óra tizenkettőt üt. Az inas három apró kanalat tesz eléd, mindegyik más díszt visel.',
      rule: '„Éjfélkor a birtok virága mutatja az utat.” — A Feketerózsa család házi szokása.',
      options: [
        { id: 'moonspoon', name: 'Holdas kiskanál' },
        { id: 'rosespoon', name: 'Rózsás kiskanál' },
        { id: 'starspoon', name: 'Csillagos kiskanál' }
      ], correct: 'rosespoon',
      hints: ['Válassz egy kanalat. Emlékezz a birtok nevére.', 'A nyél végén lévő dísz fontosabb, mint a kanál mérete.', 'A rózsával díszített kiskanalat keresd. A hold és a csillag ma este rossz társaság.'],
      explanation: 'A Feketerózsa birtokon az éjféli sörbethez rózsás kanál jár. Ez a gróf kitalált házi szabálya.',
      success: 'A gróf a címerére pillant, majd rád mosolyog. Ez valamiért sokkal nyugtalanítóbb, mint a hallgatása.',
      failure: '„A családunk hatszáz éve rózsát visel” — mondja a gróf. A sörbetnél is hidegebb lesz a szoba.'
    },
    {
      title: 'A gróf fekete tortája', subtitle: 'Az utolsó falat', dish: 'cake',
      description: 'Egy apró szelet csokoládétorta. Egy utolsó döntés. A gróf most már nyíltan figyel.',
      rule: '„Kis torta, nagy tisztelet: az utolsó fogáshoz a legnagyobb villa jár.” — A gróf szentül ragaszkodik hozzá.',
      options: [
        { id: 'dessertfork', name: 'Kis desszertvilla' },
        { id: 'servingfork', name: 'Nagy tálalóvilla' },
        { id: 'dinnerfork', name: 'Húsvilla' }
      ], correct: 'servingfork',
      hints: ['Válassz egy villát. Itt a házi szokás dönt.', 'Ma este a szokásos desszertvilla túlságosan szerény választás.', 'A leghosszabb és legszélesebb, négyágú villát válaszd. Igen, a nevetségesen nagyot.'],
      explanation: 'A gróf a legnagyobb villát várja. Ez szándékosan furcsa házi szokás: az apró tortához tálalóvillát követel.',
      success: 'A hatalmas villa, az apró falat és a tökéletes komolyságod végre meghozza a gróf elismerését.',
      failure: '„Apró villa. Apró tisztelet.” A gróf megcsóválja a fejét. Legalább a torta finom.'
    }
  ];

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
    return { version: 1, stage: 'roll', index: 0, score: 0, roll: null, risk: false,
      selected: null, usedExcuse: false, history: [], order: courses.map(c => shuffle(c.options.map(o => o.id))) };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!s || s.version !== 1 || !['roll', 'choose', 'result', 'end', 'surrender'].includes(s.stage)) return null;
      if (!Number.isInteger(s.index) || s.index < 0 || s.index >= courses.length || !Number.isInteger(s.score)) return null;
      if (typeof s.risk !== 'boolean' || typeof s.usedExcuse !== 'boolean') return null;
      if (!Array.isArray(s.history) || s.history.length > courses.length || !Array.isArray(s.order) || s.order.length !== courses.length) return null;
      if (!s.order.every((ids, i) => Array.isArray(ids) && ids.length === 3 && new Set(ids).size === 3 && ids.every(id => courses[i].options.some(o => o.id === id)))) return null;
      if (s.roll !== null && validRoll(s.roll) === null) return null;
      if (s.selected !== null && !s.order[s.index].includes(s.selected)) return null;
      const expectedHistory = s.stage === 'end' ? 5 : s.stage === 'result' ? s.index + 1 : s.index;
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
      const fish = type === 'fishfork'; const small = type === 'dessertfork'; const huge = type === 'servingfork';
      const xs = fish ? [24, 40, 56] : small ? [30, 40, 50] : huge ? [16, 32, 48, 64] : [25, 35, 45, 55];
      const top = huge ? 7 : small ? 45 : fish ? 28 : 20;
      const base = small ? 82 : 72;
      const width = huge ? 26 : fish ? 20 : small ? 13 : 17;
      shape = `${handle}<path d="M${40 - width} 62v13c0 13 17 14 17 31h6c0-17 ${width - 3}-18 ${width - 3}-31V62Z"/>${xs.map((x, i) => `<path d="M${x} ${top + (fish && i === 2 ? 10 : 0)}v${base - top - (fish && i === 2 ? 10 : 0)}" stroke="${fill}" stroke-width="${huge ? 7 : fish ? 7 : 5}" stroke-linecap="round"/>`).join('')}`;
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
  function heroArt(hands = false) {
    return `<svg class="hero-art" aria-hidden="true" viewBox="0 0 360 230"><defs><radialGradient id="porcelain"><stop stop-color="#f7efdb"/><stop offset=".8" stop-color="#dfddc6"/><stop offset="1" stop-color="#b7c5ae"/></radialGradient></defs><circle cx="180" cy="112" r="93" fill="#000" opacity=".2"/><circle cx="180" cy="108" r="91" fill="url(#porcelain)" stroke="#d8bd80" stroke-width="2"/><circle cx="180" cy="108" r="82" fill="none" stroke="#8d9b7f" stroke-width="1"/><circle cx="180" cy="108" r="65" fill="none" stroke="#a6ae91" stroke-width="1"/><circle cx="180" cy="108" r="61" fill="#ece8d1" opacity=".45"/>${rose(180, 98, hands ? '#8c4c40' : '#526b57', 1.6)}<path d="M151 153q29 12 58 0" fill="none" stroke="#899575"/><text x="180" y="166" fill="#62725c" font-size="7" text-anchor="middle" letter-spacing="3" font-family="Georgia,serif">FEKETERÓZSA</text><svg x="22" y="0" width="50" height="216" viewBox="0 0 80 240">${utensil('dinnerfork')}</svg><svg x="289" y="0" width="50" height="216" viewBox="0 0 80 240">${utensil('dinnerknife')}</svg><path d="M97 208q83 18 166 0" stroke="#d8bd8044" fill="none"/></svg>`;
  }
  function dishArt(kind) {
    const foods = {
      soup: '<circle cx="180" cy="78" r="43" fill="#ba8841"/><circle cx="180" cy="78" r="37" fill="#c7984e"/><path d="M158 62q29-10 43 9M151 87q23 16 51-2" fill="none" stroke="#edcc81" stroke-width="2" opacity=".6"/><g fill="#526b38"><ellipse cx="176" cy="68" rx="5" ry="2" transform="rotate(30 176 68)"/><ellipse cx="189" cy="91" rx="6" ry="2" transform="rotate(-35 189 91)"/><ellipse cx="167" cy="87" rx="3" ry="2"/></g>',
      fish: '<path d="M142 77q35-44 67-4l20-13-4 30-17-10q-32 29-66-3Z" fill="#bfaa7b" stroke="#8c7951"/><path d="m153 76 45-2m-33-12 5 13-7 13m17-28 4 14-7 15" stroke="#eddfae" fill="none"/><circle cx="149" cy="75" r="2" fill="#435542"/><circle cx="157" cy="103" r="11" fill="#d9bd55"/><circle cx="157" cy="103" r="8" fill="none" stroke="#efdfa1"/><path d="m201 98 17 10m-12-14 7 15m-3-18 8 19" stroke="#697d43" stroke-width="3"/>',
      roast: '<path d="M148 59q16-18 49-3 27 9 16 32-5 24-41 20-37-1-34-24Z" fill="#624236" stroke="#987354" stroke-width="3"/><path d="m154 68 43 25m-48-9 33 19m-13-43 36 22" stroke="#b58b68" stroke-width="3"/><path d="m208 55-26 57m11-49 10 5m-16 7 10 5m-15 6 9 5m-15 7 10 4" stroke="#71825b" stroke-width="2"/><circle cx="224" cy="88" r="8" fill="#b6a76c"/><circle cx="217" cy="104" r="6" fill="#d0b77a"/>',
      sorbet: '<ellipse cx="180" cy="102" rx="33" ry="12" fill="#b2c1b4"/><path d="M150 89q30 39 60 0" fill="#c6d5c1" stroke="#869f8c"/><circle cx="180" cy="71" r="27" fill="#a25d63"/><path d="M160 66q17-19 36-2m-38 13q16 8 40-2" fill="none" stroke="#c78485" stroke-width="3"/><path d="M188 44q8-12 17-8-6 13-17 8" fill="#667b48"/>',
      cake: '<path d="m150 91 9-42 55 42v15l-64-1Z" fill="#533d35"/><path d="m151 92 62 1m-60-8 48 1m-47-8 36 1" stroke="#aa896e" stroke-width="3"/><path d="m150 91 9-42 55 42Z" fill="#402f2c" stroke="#6e5040"/><circle cx="164" cy="67" r="7" fill="#a95452"/><path d="m167 59 7-6" stroke="#647a45" stroke-width="3"/><path d="m202 111 8 2m-44 5 8-1" stroke="#92795c" stroke-width="2"/>'
    };
    return `<svg class="dish-art" aria-hidden="true" viewBox="0 0 360 158"><circle cx="180" cy="79" r="70" fill="#e4e2ca" stroke="#cfb97d" stroke-width="2"/><circle cx="180" cy="79" r="63" fill="none" stroke="#91a184"/><circle cx="180" cy="79" r="50" fill="#d7dbc0" stroke="#afba99"/>${foods[kind]}</svg>`;
  }

  function intro() {
    state = null;
    const resumable = saved && !['end', 'surrender'].includes(saved.stage);
    showScreen(`<section class="intro"><p class="eyebrow">Vacsorameghívó kalandoroknak</p><h1>A gróf<br><em>asztalánál</em></h1><p class="intro-copy">A megfelelő villa ajtókat nyit.<br>A rossz villa… beszédtémát ad.</p>${heroArt()}<div class="ornament" aria-hidden="true">✦</div><div class="intro-meta"><span>5 fogás</span><span>1 húszoldalú kocka</span><span>Kétes modor</span></div><div class="resume-buttons">${resumable ? '<button class="primary" data-action="resume">Folytatom a vacsorát</button><button class="text-button" data-action="new">Új vacsorát kezdek</button>' : '<button class="primary" data-action="new">Helyet foglalok</button>'}</div><p class="fantasy-note">Viktoriánus hangulatú fantáziajáték.<br>Itt a gróf házi szokásai is számítanak.</p></section>`);
  }
  function header() {
    return `<div class="game-header"><p class="eyebrow">${state.index + 1}. fogás <span style="color:var(--muted)">/ 5</span></p><div class="score"><strong>${state.score}</strong> pont</div></div><div class="progress" aria-label="${state.index + 1}. fogás az ötből">${courses.map((_, i) => `<span class="${i < state.index ? 'done' : i === state.index ? 'current' : ''}"></span>`).join('')}</div>`;
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
  function result() {
    const c = courses[state.index]; const h = state.history[state.index];
    const answer = c.options.find(o => o.id === c.correct);
    const selected = c.options.find(o => o.id === h.selected);
    showScreen(`<section class="result ${h.correct ? '' : 'bad'}">${header()}<div class="result-emblem" aria-hidden="true">${h.correct ? '✦' : '!'}</div><p class="eyebrow">${h.correct ? 'Kifogástalan modor' : 'Kisebb társasági katasztrófa'}</p><h1>${h.correct ? 'A gróf elismerően bólint.' : 'Megáll a levegő.'}</h1><p class="points-change">${h.points > 0 ? '+' : h.points < 0 ? '−' : ''}${Math.abs(h.points)} pont</p><p class="result-narration">„${h.correct ? c.success : c.failure}”</p><div class="answer-box"><p class="eyebrow">Mi történt az asztalnál?</p><p>Ezt választottad: <strong>${selected.name}</strong></p><p>Helyes választás: <strong>${answer.name}</strong></p><p class="answer-detail">${c.explanation}</p>${h.risk ? '<p>Kockáztattál: jó választás +2, rossz választás −1 pont.</p>' : ''}</div><button class="primary" data-action="next">${state.index === courses.length - 1 ? 'A gróf ítélete' : 'Jöhet a következő fogás'}</button></section>`);
  }
  function next() {
    if (state?.stage !== 'result') return;
    if (state.index === courses.length - 1) state.stage = 'end';
    else { state.index++; state.stage = 'roll'; state.roll = null; state.selected = null; state.risk = false; }
    persist(); render();
  }
  function ending() {
    const surrendered = state.stage === 'surrender';
    const title = surrendered ? 'Illem helyett: jó étvágy.' : state.score >= 7 ? 'Született arisztokrata.' : state.score >= 3 ? 'Átmentél a vacsorapróbán.' : 'Emlékezetes vendég voltál.';
    const copy = surrendered ? 'Félretolod az ezüstöt. Innentől mindent kézzel eszel. Neked véget ért a próba; a többiek folytathatják.' : state.score >= 7 ? 'A gróf személyesen hív meg a következő bankettre. A családfádról bölcsen nem kérdez.' : state.score >= 3 ? 'Néhány bizonytalan mozdulat belefért. A gróf elfogad vendégként, és végre áttérhettek az üzletre.' : 'A gróf az etikett-tanárodat kéri számon. Egy ilyen belépő után legalább biztosan emlékeznek rád.';
    showScreen(`<section class="ending"><p class="eyebrow">${surrendered ? 'A parasztgyerek-befejezés' : 'A vacsora véget ért'}</p>${heroArt(surrendered)}<h1>${title}</h1><p class="ending-copy">${copy}</p>${surrendered ? '<blockquote>„A gróf monoklija a levesbe pottyan. Te közben már a következő marékért nyúlsz.”</blockquote>' : ''}<div class="final-score"><strong>${state.score} pont</strong><span>${surrendered ? `${state.history.length} teljesített fogás · a pontjaid megmaradtak` : '5 fogás · 3 ponttól sikeres a vacsorapróba'}</span></div>${state.history.length ? `<ul class="round-list" aria-label="A vacsora eredményei">${state.history.map(h => `<li><span>${courses[h.index].title}</span><span>${h.points > 0 ? '+' : h.points < 0 ? '−' : ''}${Math.abs(h.points)} pont${h.risk ? ' · tétre' : ''}</span></li>`).join('')}</ul>` : ''}<p class="end-note">Mutasd meg az eredményt a mesélődnek.</p><button class="primary" data-action="new">Új vacsorát kezdek</button></section>`);
  }
  function openModal(html) {
    lastFocus = document.activeElement;
    modalContent.innerHTML = html;
    if (!modal.open) modal.showModal();
  }
  function closeModal() { modal.close(); }
  function rules() {
    openModal('<p class="eyebrow">A vacsora rendje</p><h2 id="modal-title">Öt fogás. Maradj úriember.</h2><ol><li><strong>Dobj egy d20-szal, és írd be.</strong> 1–9: kevés segítség. 10–15: jobb utalás. 16–20: pontos leírás.</li><li><strong>Válaszd ki a tétet.</strong> Óvatosan: jó eszköz +1 pont, rossz 0. Kockáztatva: jó +2, rossz −1.</li><li><strong>Koppints egy evőeszközre, majd az „Ezzel eszem” gombra.</strong> A nagyobb dobás csak az utalást javítja, nem garantál helyes választást.</li></ol><p><strong>Kimagyarázom!</strong> Egyszer, választás előtt újradobhatsz. A jobb dobást tartjuk meg.</p><p><strong>Parasztgyerek-gomb:</strong> azonnal befejezed a saját játékodat, és ezután mindent kézzel eszel.</p><p><strong>3 ponttól sikerült a próba.</strong> A gróf furcsa házi szabályait is figyeld. A pontszám negatív is lehet.</p><p>Mindenki a saját telefonján játszik. A haladás ezen a böngészőn marad meg; közös szoba és bejelentkezés nincs.</p><button class="primary" data-action="close-modal">Értem, felség.</button>');
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
        openModal(`<p class="eyebrow">Egyszeri segítség</p><h2 id="modal-title">„Nálunk ez a szokás!”</h2><blockquote>A gróf felvonja a szemöldökét, de kapsz még egy esélyt összeszedni magad.</blockquote><p>A mostani dobásod: <strong>${state.roll}</strong>. Dobj újra egy pontosabb utalásért. A rosszabb dobást nem kell megtartanod.</p>${rollForm(true)}<button class="secondary" data-action="close-modal">Mégsem használom el</button>`);
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
    setRoll(new FormData(form).get('roll'), form.dataset.form === 'reroll');
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
