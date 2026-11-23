'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
new vm.Script(source);
const instrumented = source.replace(/  intro\(\);\n\}\)\(\);\s*$/, `
  globalThis.game = { validRoll, hintTier, delta, freshGame, load, setRoll, select, eat, next,
    start, setRisk, courses, render, rules, ending,
    get state() { return state; }, set state(value) { state = value; }, get saved() { return saved; } };
})();`);
assert.notEqual(source, instrumented, 'The test entry point must be installed.');

function harness({ storageThrows = false, initialSaved = null } = {}) {
  const elements = new Map();
  const listeners = new Map();
  const storage = new Map();
  if (initialSaved) storage.set('grofi-vacsora.v1', JSON.stringify(initialSaved));
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', textContent: '', open: false, disabled: false, isConnected: true,
      dataset: {}, attributes: {}, focus() {},
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener() {}, showModal() { this.open = true; }, close() { this.open = false; }
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [], activeElement: element('focus'),
      addEventListener(name, fn) { listeners.set(name, fn); } },
    localStorage: {
      getItem(key) { if (storageThrows) throw new Error('Storage disabled'); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageThrows) throw new Error('Storage disabled'); storage.set(key, value); }
    },
    window: { scrollTo() {} }, console
  });
  vm.runInContext(instrumented, context);
  return { game: context.game, elements, storage, listeners };
}

let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS ${name}`); }

check('Only integer d20 results from 1 through 20 are accepted', () => {
  const { game } = harness();
  for (let n = 1; n <= 20; n++) assert.equal(game.validRoll(String(n)), n);
  for (const value of ['', ' ', '0', '21', '-1', '1.5', '1e1', 'NaN', 'Infinity', '20x']) assert.equal(game.validRoll(value), null, value);
});
check('Hint boundaries give the promised three levels', () => {
  const { game } = harness();
  assert.equal(game.hintTier(1), 0); assert.equal(game.hintTier(9), 0);
  assert.equal(game.hintTier(10), 1); assert.equal(game.hintTier(15), 1);
  assert.equal(game.hintTier(16), 2); assert.equal(game.hintTier(20), 2);
});
check('Safe and risky scoring includes a real negative penalty', () => {
  const { game } = harness();
  assert.equal(game.delta(true, false), 1); assert.equal(game.delta(false, false), 0);
  assert.equal(game.delta(true, true), 2); assert.equal(game.delta(false, true), -1);
});
check('Each shuffled course keeps all three distinct choices and one valid answer', () => {
  const { game } = harness();
  for (let n = 0; n < 50; n++) {
    const fresh = game.freshGame();
    fresh.order.forEach((ids, i) => {
      assert.equal(new Set(ids).size, 3);
      assert.ok(ids.includes(game.courses[i].correct));
    });
  }
});
check('A bad roll can still earn points for a correct answer', () => {
  const { game } = harness(); game.start(); game.setRoll('1');
  game.select(game.courses[0].correct); game.eat();
  assert.equal(game.state.score, 1); assert.equal(game.state.stage, 'result');
});
check('A perfect roll cannot rescue a wrong risky answer', () => {
  const { game } = harness(); game.start(); game.setRoll('20'); game.setRisk(true);
  game.select(game.courses[0].options.find(o => o.id !== game.courses[0].correct).id); game.eat();
  assert.equal(game.state.score, -1); assert.equal(game.state.stage, 'result');
  game.eat(); assert.equal(game.state.score, -1, 'Repeated submissions must not award points twice');
});
check('Invalid and cancelled excuses do not consume the single use', () => {
  const { game } = harness(); game.start(); game.setRoll('9'); game.setRoll('21', true);
  assert.equal(game.state.usedExcuse, false); assert.equal(game.state.roll, 9);
});
check('The one-use excuse keeps the better roll and persists across courses', () => {
  const { game } = harness(); game.start(); game.setRoll('16'); game.setRoll('4', true);
  assert.equal(game.state.roll, 16); assert.equal(game.state.usedExcuse, true);
  game.setRoll('20', true); assert.equal(game.state.roll, 16, 'A second excuse is ignored');
  game.select(game.courses[0].correct); game.eat(); game.next();
  assert.equal(game.state.usedExcuse, true); assert.equal(game.state.roll, null); assert.equal(game.state.risk, false);
});
check('Better excuse results unlock more detailed help', () => {
  const { game } = harness(); game.start(); game.setRoll('3'); game.setRoll('19', true);
  assert.equal(game.state.roll, 19); assert.equal(game.hintTier(game.state.roll), 2);
});
check('An entire game finishes at 10 points, without a sixth course', () => {
  const { game } = harness(); game.start();
  for (let i = 0; i < 5; i++) {
    assert.equal(game.state.index, i); game.setRoll('12'); game.setRisk(true);
    game.select(game.courses[i].correct); game.eat();
    assert.ok(game.load(), 'A completed course must have a valid saved state'); game.next();
  }
  assert.equal(game.state.stage, 'end'); assert.equal(game.state.score, 10);
  assert.equal(game.state.history.length, 5); assert.ok(game.load());
  game.next(); assert.equal(game.state.score, 10);
});
check('All wrong risky choices finish at minus five, not clamped to zero', () => {
  const { game } = harness(); game.start();
  for (let i = 0; i < 5; i++) {
    game.setRoll('20'); game.setRisk(true);
    game.select(game.courses[i].options.find(o => o.id !== game.courses[i].correct).id); game.eat(); game.next();
  }
  assert.equal(game.state.score, -5); assert.equal(game.state.stage, 'end'); assert.ok(game.load());
});
check('Reloading preserves the roll, selection, risk, and randomized order', () => {
  const { game } = harness(); game.start(); game.setRoll('13'); game.setRisk(true);
  game.select(game.state.order[0][2]);
  assert.deepEqual(JSON.parse(JSON.stringify(game.load())), JSON.parse(JSON.stringify(game.state)));
  const reboot = harness({ initialSaved: game.state });
  assert.ok(reboot.game.saved, 'The initial page load must find the saved game after the course definitions exist');
  assert.deepEqual(JSON.parse(JSON.stringify(reboot.game.saved)), JSON.parse(JSON.stringify(game.state)));
});
check('Corrupt or incompatible saved games are safely rejected', () => {
  const { game, storage } = harness();
  storage.set('grofi-vacsora.v1', 'broken JSON'); assert.equal(game.load(), null);
  const cases = [
    s => { s.index = 42; }, s => { s.order[0] = ['soupspoon', 'soupspoon', 'soupspoon']; },
    s => { s.score = 300; }, s => { s.stage = 'choose'; s.roll = null; },
    s => { s.version = 999; }, s => { s.history = [{}]; }
  ];
  for (const mutate of cases) {
    const s = game.freshGame(); mutate(s); storage.set('grofi-vacsora.v1', JSON.stringify(s));
    assert.equal(game.load(), null);
  }
});
check('Surrender ends only this game and preserves the existing score', () => {
  const { game, listeners } = harness(); game.start(); game.setRoll('10');
  game.select(game.courses[0].correct); game.eat(); game.next();
  const button = { disabled: false, dataset: { action: 'confirm-quit' } };
  listeners.get('click')({ target: { closest: selector => selector === '[data-action]' ? button : null } });
  assert.equal(game.state.stage, 'surrender'); assert.equal(game.state.score, 1); assert.ok(game.load());
  game.setRoll('20'); game.eat(); game.next();
  assert.equal(game.state.stage, 'surrender'); assert.equal(game.state.score, 1);
});
check('The game remains playable when browser storage is unavailable', () => {
  const { game } = harness({ storageThrows: true }); game.start(); game.setRoll('10');
  game.select(game.courses[0].correct); game.eat(); assert.equal(game.state.score, 1);
});
console.log(`\n${checks} checks passed.`);
