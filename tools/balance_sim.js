/* Balance simulator for War: The Long March.
   Load it in the browser console on the PC page (index.html), where the game rules are global:
     await fetch('tools/balance_sim.js').then(r => r.text()).then(eval)
   then run  SIM(1000)            -> careful player (smart route, burns, tonics, good picks)
             SIM(1000, 'casual')  -> same choices, but a random route through the map
             SIM(1000, 'random')  -> picks everything at random
   Targets (2026-10-05, TUNE hp 22 / hpStep 6.5): careful ~49% wins, casual ~39%, random ~2%.
   Every fight is played from a hand of 3 (2026-10-05): the careful bot plays the cheapest card that beats the enemy's next card,
   or dumps its weakest; in the Port Warden's hidden-hand fight it guesses from his card range. Random mode picks at random. */
window.SIM = function (N = 500, mode = 'smart') {
  const smart = mode !== 'random', smartRoute = mode === 'smart';
  const R = a => a[Math.floor(Math.random() * a.length)];
  const deckAvg = run => run.deck.reduce((s, c) => s + c.v, 0) / run.deck.length;
  const weakestC = run => [...run.deck].sort((a, b) => a.v - b.v)[0];
  const bestC = (run, f) => [...run.deck].filter(f || (() => true)).sort((a, b) => b.v - a.v)[0];
  const bestUnsealed = run => bestC(run, c => !c.sl) || bestC(run);
  let wins = 0, levels = 0; const deaths = { 0: 0, 1: 0, 2: 0 }, where = {};
  function fight(run, foe) {
    const b = newBattle(run, foe); let g = 0;
    while (!b.over && g++ < 400) {
      if (smart) {  // scripts first
        if (run.tonics.includes('fire') && b.eHp <= 10) useTonic(run, b, run.tonics.indexOf('fire'));
        if (b.over) break;
        if (run.hp < run.maxHp * .35 && run.tonics.includes('heal')) useTonic(run, b, run.tonics.indexOf('heal'));
        if (run.hp < run.maxHp * .3 && run.tonics.includes('iron') && !b.block) useTonic(run, b, run.tonics.indexOf('iron'));
      }
      if (!b.hand) { playRound(run, b); continue; }
      let hi = 0;
      if (smart) {  // play the cheapest card that wins; if none can, dump the weakest (or swap a bad hand)
        const sight = foeSight(run, b), idx = b.hand.map((c, i) => i).sort((x, y) => b.hand[x].v - b.hand[y].v);
        const ec = sight ? peek(b, 'e') : { v: Math.ceil((b.f.lo + b.f.hi) / 2) + 1, s: 'X' };
        const win = idx.find(i => compare(run, b, b.hand[i], ec, b.luck) === 1);
        if (win == null && b.burns > 0 && Math.max(...b.hand.map(c => c.v)) <= 6) { burn(run, b); if (b.over) break; continue; }
        hi = win != null ? win : idx[0];
        if (win != null && b.hand[win].v <= 6 && run.tonics.includes('luck') && !b.luck) useTonic(run, b, run.tonics.indexOf('luck'));
      } else hi = Math.floor(Math.random() * b.hand.length);
      playRound(run, b, hi);
    }
    return b;
  }
  const score = (run, n) => {
    if (!smartRoute) return Math.random();
    const hpf = run.hp / run.maxHp;
    const s = { recruit: 5, mercs: 5, suit: 5.5, blind: 4, trial: 4.5, rest: hpf < .6 ? 9 : 4, store: run.gold >= 45 ? 7 : 2, pack: run.tonics.length < 2 ? 5 : 2, altar: 4, carver: 5, fungi: 5, goo: 4, stones: 3, sealer: 5.5, event: 3.5, chest: 6, battle: 5, elite: hpf > .7 ? 5.5 : 1 };
    return (s[n.t] || 3) + Math.random();
  };
  function doEvent(run, E, n) {
    const st = {}; let guard = 0;
    while (guard++ < 5) {
      const cs = (typeof E.choices === 'function' ? E.choices(run, st) : E.choices).filter(c => (!c.can || c.can(run)) && (!c.pick || run.deck.filter(c.filter || (() => true)).length));
      if (!cs.length) return;
      let c;
      if (!smart) c = R(cs);
      else if (n.t === 'rest') c = st.times ? (cs.find(x => /Leave|Unplug/.test(x.l)) || cs[cs.length - 1]) : run.hp < run.maxHp * .7 ? cs[0] : cs[1] || cs[0];
      else c = cs.find(x => !/Leave|Walk|Refuse|Let them|leave|Unplug/i.test(x.l) && !/Lose \d+ HP/.test(x.d) && !/Offer blood|Rob|Strip them|Bet a card|Two 2s/.test(x.l + x.d)) || cs[cs.length - 1];
      const pool = run.deck.filter(c.filter || (() => true));
      const card = !c.pick ? null : !smart ? R(pool) : /Sacrifice|Melt|Move a charm|Delete for|Scrap a card|Move a mod/.test(c.l) ? [...pool].sort((a, b) => a.v - b.v)[0]
        : /Seal|Chip/.test(c.l) ? (pool.filter(x => !x.sl).sort((a, b) => b.v - a.v)[0] || pool[0])
        : /Sharpen|charm|Keen|copy|Boost|Overclock|mod|Turbo|patch/i.test(c.l + c.d) ? [...pool].filter(x => x.v < 14).sort((a, b) => b.v - a.v)[0] || pool[0] : pool[0];
      let res = c.go(run, card, st); if (typeof res === 'string') res = { text: res };
      if (res && res.offer) addCard(run, smart ? [...res.offer].sort((a, b) => b.v - a.v)[0] : R(res.offer));
      if (!res || !res.again) break;
    }
  }
  const CHEST = { choices: [{ l: 'Open', d: '', go: r => { const x = relicChoices(r, 1)[0]; if (!x) { r.gold += 50; return ''; } gainRelic(r, x); return ''; } }] };
  const takePerks = run => { while (run.lvlUp > 0) { run.lvlUp--; levels++; const ch = perkChoices(run); const p = smart ? ch[0] : R(ch); if (!p) break; gainPerk(run, p); if (p === 'sealer') bestUnsealed(run).sl = R(SEAL_IDS); } };
  for (let i = 0; i < N; i++) {
    const run = newRun(); let dead = false;
    while (!dead) {
      const ch = reachable(run), r = run.row + 1;
      const k = ch.reduce((best, k) => score(run, run.map[r][k]) > score(run, run.map[r][best]) ? k : best, ch[0]);
      const n = run.map[r][k]; run.row = r; run.col = k; run.path.push([r, k]);
      if (n.foe) {
        const b = fight(run, n.foe);
        if (b.over !== 'win') { dead = true; deaths[run.act]++; where[n.t] = (where[n.t] || 0) + 1; break; }
        winBattle(run, b);
        if (n.foe.final) { wins++; break; }
        if (n.t === 'boss') { const rc = relicChoices(run); if (rc[0]) gainRelic(run, smart ? rc[0] : R(rc)); nextAct(run); takePerks(run); continue; }
        if (n.t === 'elite') { const rc = relicChoices(run, 2); if (rc[0]) gainRelic(run, rc[0]); }
        else { const p = n.prize; if (p.k === 'charm') charmCard(run, bestC(run).id, p.ch); else if (p.k === 'seal') bestUnsealed(run).sl = p.sl; else applyPrize(run, p); }
        takePerks(run);
      } else if (n.t === 'store') {
        const st = makeStore(run), rank = { remove: 0, relic: 1, seal: 2, card: 3, charm: 4, tonic: 5 };
        (smart ? [...st].sort((a, b) => rank[a.k] - rank[b.k]) : st).forEach(it => { if (run.gold >= it.price && (!smart || it.k !== 'card' || it.c.v > deckAvg(run) + 2)) buyItem(run, it, it.k === 'remove' ? weakestC(run).id : it.k === 'seal' ? bestUnsealed(run).id : bestC(run).id); });
      } else if (['recruit', 'suit', 'blind', 'mercs'].includes(n.t)) {
        const cs = gainCards(run, n); const c = smart ? [...cs].sort((a, b) => b.v - a.v)[0] : R(cs);
        if (!smart || n.t === 'blind' || c.v > deckAvg(run)) addCard(run, c);
      } else {
        const E = n.t === 'event' ? EVENTS[n.ev] : n.t === 'chest' ? CHEST : n.t === 'trial' ? null : NODES[n.t];
        if (n.t === 'trial') { const res = runTrial(run, n.tr); if (res.pass) addCard(run, [...rareCards()].sort((a, b) => b.v - a.v)[0]); }
        else if (E) doEvent(run, E, n);
        if (run.hp <= 0) { dead = true; deaths[run.act]++; where[n.t] = (where[n.t] || 0) + 1; }
      }
    }
  }
  return { winPct: +(100 * wins / N).toFixed(1), avgLevels: +(levels / N).toFixed(1), deathsByAct: deaths, killedAt: where };
};
