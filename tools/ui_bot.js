/* UI test bot for War: The Long March. Plays the real game through its buttons (PC page or phone page) and logs
   errors and stuck screens. Load it in the browser console:
     await fetch('tools/ui_bot.js').then(r => r.text()).then(eval)        (PC page)
     await fetch('../tools/ui_bot.js').then(r => r.text()).then(eval)     (phone page)
   then  await BOT.run(40000)   plays for 40 seconds and returns a report; call again to keep going.
   BOT.log holds what it did, BOT.errs any errors. It clicks quickly, so set the game speed to Fast first. */
window.BOT = window.BOT || (() => {
  const $ = id => document.getElementById(id), w = ms => new Promise(r => setTimeout(r, ms));
  const errs = [], log = [], seen = {};
  addEventListener('error', e => errs.push('error: ' + e.message + ' @' + (e.lineno || '')));
  addEventListener('unhandledrejection', e => errs.push('promise: ' + (e.reason && e.reason.message || e.reason)));
  const vis = el => el && !el.hidden && el.offsetParent !== null;
  const screen = () => { const s = [...document.querySelectorAll('.screen')].find(x => !x.hidden); return s ? s.id : '?'; };
  const RANK = { Ace: 14, King: 13, Queen: 12, Jack: 11 };
  const rankOf = label => { const m = /(Ace|King|Queen|Jack|\d+) of/.exec(label || ''); return m ? (RANK[m[1]] || +m[1]) : null; };
  const click = el => { if (!el) return false; el.click(); return true; };
  let lastSig = '', sameFor = 0, runs = 0, wins = 0, deaths = 0;
  async function step() {
    const fx = document.querySelector('.fx-overlay');
    if (fx) { const ok = fx.querySelector('.fx-ok'); if (ok) ok.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); else fx.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return 'fx'; }
    const pick = $('picker') && !$('picker').hidden ? $('picker') : $('charmSheet') && !$('charmSheet').hidden ? $('charmSheet') : null;
    if (pick) { const c = pick.querySelector('.pick-card, .pickcard'); if (c) { c.click(); return 'pick card'; } }
    const sc = screen();
    if (sc === 'sTitle') { click($('newRunBtn')); return 'new run'; }
    if (sc === 'sSlots') { const s = document.querySelector('#slotList .slot:not(:disabled)'); click(s); return 'slot'; }
    if (sc === 'sPack') { if (vis($('packGo'))) { click($('packGo')); return 'pack go'; } click($('packBtn')); return 'open pack'; }
    if (sc === 'sMap') {
      const choice = document.querySelector('#nextFoe .choice');                      // PC
      if (choice) { choice.click(); await w(150); const go = document.querySelector('[data-go]') || $('fightBtn'); click(go); return 'map ' + (choice.innerText.split('\n')[0] || ''); }
      const node = document.querySelector('.node.can');                              // phone
      if (node) { node.click(); await w(120); click($('goBtn')); return 'map ' + node.getAttribute('aria-label'); }
      return 'map?';
    }
    if (sc === 'sBattle') {
      const hand = [...document.querySelectorAll('#handRow .hand-card:not(:disabled)')];
      if (hand.length) {
        const foe = document.querySelector('#foePeek .card'), ev = foe ? rankOf(foe.getAttribute('aria-label')) : 8;
        const cs = hand.map(b => ({ b, v: rankOf(b.getAttribute('aria-label')) || 0 })).sort((a, b) => a.v - b.v);
        const best = cs.find(c => c.v > ev) || cs[0]; best.b.click(); return 'play ' + best.v + ' vs ' + ev;
      }
      if (vis($('flipBtn')) && !$('flipBtn').disabled) { click($('flipBtn')); return 'flip'; }
      return 'battle wait';
    }
    if (sc === 'sReward') { const o = document.querySelector('#offers .offer'); if (o) { o.click(); return 'reward'; } click($('skipBtn')); return 'skip'; }
    if (sc === 'sEvent') {
      if (vis($('evGo'))) { click($('evGo')); return 'event go'; }
      const c = [...document.querySelectorAll('#evChoices button')].find(b => !b.disabled); if (c) { c.click(); return 'event ' + c.innerText.split('\n')[0]; }
      return 'event?';
    }
    if (sc === 'sStore') {
      const item = [...document.querySelectorAll('.store-item:not(:disabled):not(.sold), .ware:not(:disabled):not(.sold):not(.poor)')].find(b => !b.classList.contains('poor'));
      if (item && Math.random() < .5) { item.click(); return 'buy'; }
      click($('storeLeave') || $('leaveBtn')); return 'leave store';
    }
    if (sc === 'sEnd') { runs++; if (/fried|down|won/i.test($('endTitle').textContent)) wins++; else deaths++; click($('againBtn')); return 'END: ' + $('endTitle').textContent + ' | ' + $('endSub').textContent; }
    return 'unknown ' + sc;
  }
  async function run(ms = 40000) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      let a; try { a = await step(); } catch (e) { errs.push('bot: ' + e.message); a = 'bot error'; }
      const sig = screen() + '|' + a + '|' + (document.getElementById('bMsg') ? $('bMsg').textContent : '');
      sameFor = sig === lastSig ? sameFor + 1 : 0; lastSig = sig;
      if (sameFor === 40) errs.push('stuck? ' + sig.slice(0, 160));
      if (a !== 'battle wait' && a !== 'fx') { log.push(a); seen[screen()] = (seen[screen()] || 0) + 1; }
      await w(a === 'battle wait' ? 150 : 220);
    }
    return { runs, wins, deaths, errs: errs.slice(-12), screens: seen, last: log.slice(-6) };
  }
  return { run, step, log, errs };
})();
