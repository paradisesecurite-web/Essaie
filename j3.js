'use strict';
/* Porte III — Le 10 000 des Ombres (2 novembre) */
(async () => {
  if (!gate(3)) return;
  $('#headSeal').innerHTML = sealSVG();
  const h = hero();
  $('#content').innerHTML = `
    <section id="story"><div class="sec-head"><span class="sec-num">I</span><h2>La Fable</h2><p>Une taverne glaciale, et un vieil ami qui chauffe.</p></div>
      <div id="storyRoot"></div><div id="replayRow" class="btn-row hidden" style="margin-top:14px"><button class="btn dark small" id="replayBtn">Revivre la Fable</button></div></section>
    <section id="diceSec" class="hidden"><div class="sec-head"><span class="sec-num">II</span><h2>Le 10 000 des Ombres</h2><p>Toi contre Françoise et Jean-François. Stanley arbitre.</p></div>
      <div class="panel dice-board" id="board"></div>
      <p class="hint"><b>RÈGLES</b> — 5 dés · 1 = 100 · 5 = 50 · brelan = 100 × la valeur (trois 1 = 1 000) · suite 1-2-3-4-5 ou 2-3-4-5-6 = 1 500 · <b>main pleine</b> (les 5 dés marquent) = on rejoue les 5 d'office. Il faut <b>500 points en un tour pour ouvrir</b> son score. Touche les dés qui rapportent pour les garder, puis relance le reste ou mets à l'abri. Un lancer sans rien = tour perdu.</p>
      <div class="parch epilogue hidden" id="epi"></div>
    </section>
    ${doorFooter(3)}`;

  const SCENES = [
    {
      title: 'La Taverne de Stanley',
      text: () => `Le vent des Royaumes de l'Est siffle sous la porte de la taverne. Il fait un froid à geler un troll. Tout le monde grelotte… sauf dans un coin.\n\nLà, posé sur ses pieds de fer, trône un élémentaire de feu trapu, carré, jaune et noir. Sur sa carapace, une plaque gravée : [[STANLEY]]. Chaque fois que tu entres, il chauffe un peu plus fort. On dit qu'il ne ronronne que pour toi.\n\nYohann est déjà là, les pieds tendus vers lui. « Il t'attendait », dit-il. « Moi aussi, un peu. »`,
      choices: () => [
        { label: 'Faire un câlin à Stanley.', sub: 'De loin. Il chauffe.', tag: 'calin' },
        { label: 'Lui raconter ta semaine.', sub: 'Il écoute mieux que personne.', tag: 'confid' },
        { label: 'Présenter Yohann comme « mon deuxième meilleur ami ».', sub: 'Stanley reste numéro un.', tag: 'second' }
      ]
    },
    {
      title: 'Le Défi',
      onShow: () => { if (!$('#storyRoot .rivals')) $('#storyRoot .fable-text').insertAdjacentHTML('afterend', `<div class="rivals rivals-parch" style="margin-top:16px"><img src="parents.jpg?v=2" alt="Françoise et Jean-François" width="120" height="120"><p><b>Françoise & Jean-François</b><br>Maîtres du 10 000</p></div>`); },
      text: s => ({
        calin: 'Tu ouvres grand les bras. Stanley passe en position maximale. C\'est sa façon de dire « moi aussi ».',
        confid: 'Tu lui racontes tout : les clients, les objectifs, les ventes dont personne ne parle. Stanley ne dit rien, mais il chauffe juste ce qu\'il faut. Le meilleur des confidents.',
        second: 'Yohann s\'étrangle avec sa bière. Stanley, lui, rayonne. Littéralement.'
      })[s.tags[0]] + `\n\nLa porte de la taverne s'ouvre dans un courant d'air glacé. Deux silhouettes entrent, bien emmitouflées : [[Françoise]] et [[Jean-François]], les parents de Yohann. Ceux qui t'ont appris le [[10 000]], autour de leur table, il y a des années.\n\nJean-François pose cinq dés sur la table. Françoise sourit : « Alors, Aurélien. On va voir si l'élève a progressé. »\n\nYohann se penche vers toi : « Le fragment de la carte, ce sont eux qui l'ont. Pour l'avoir, il faut les battre. Et je te préviens : ils ne font pas de cadeaux. »\n\nFrançoise ajoute, l'œil malicieux : « Et surtout : [[aucun changement de règle]] en cours de partie. On te connaît. »`,
      choices: () => [
        { label: '« Promis. »', sub: 'Tu croises les doigts dans ton dos.' },
        { label: '« On verra. »', sub: 'Honnête, au moins.' },
        { label: '« Les règles, c\'est pour les paladins. »', sub: 'Stanley approuve en grésillant.' }
      ]
    }
  ];

  /* ---------- Le 10 000 ---------- */
  const RULES = [
    ['twos', 'Les 2 valent 20 points chacun. « Parce que pourquoi pas. »'],
    ['stanley', 'Stanley chauffe les dés : +50 points chaque fois qu\'on garde des dés qui rapportent.'],
    ['triple3', 'Trois 3 valent 600. Socrate trouve que le 3 est sous-coté.'],
    ['pair6', 'Une paire de 6 vaut 200 points. Comme le niveau 60, en plus petit.'],
    ['noopen', 'Plus besoin de 500 points pour ouvrir. Socrate trouve ça trop lent.']
  ];
  const RAGE = ['Jean-François : « Ah non, pas encore ! »', 'Françoise : « Il fait ça à chaque fois. »', 'Jean-François : « Chez nous, c\'est pas comme ça. »', 'Françoise : « Bon. Mais on note tout. »', 'Jean-François : « Stanley, tu l\'as vu comme moi ? »', 'Yohann : « Je vous avais prévenus. »'];
  const BANK = ['« Ça, c\'est du 10 000. »', '« On n\'est pas pressés. »', '« Tranquille. »', '« Comme à la maison. »'];
  const SPK = () => (G.yoTurns % 2 ? 'Jean-François' : 'Françoise');
  let G = null;
  const board = $('#board');

  function counts(vals) { const c = [0, 0, 0, 0, 0, 0, 0]; vals.forEach(v => c[v]++); return c; }
  function isStraight(vals) { if (vals.length !== 5) return false; const k = vals.slice().sort().join(''); return k === '12345' || k === '23456'; }
  function single(f, n) { // valeur de n dés isolés de la face f (hors brelan), ou -1 si interdit
    const R = G.rules;
    if (f === 1) return 100 * n; if (f === 5) return 50 * n;
    if (f === 2 && R.twos) return 20 * n;
    if (f === 6 && n === 2 && R.pair6) return 200;
    return n ? -1 : 0;
  }
  function scoreOf(vals) {
    if (!vals.length) return 0;
    if (isStraight(vals)) return 1500;
    const c = counts(vals), R = G.rules; let t = 0;
    for (let f = 1; f <= 6; f++) {
      let n = c[f]; if (!n) continue;
      if (n >= 3) { t += f === 1 ? 1000 : (f === 3 && R.triple3) ? 600 : f * 100; n -= 3; }
      const v = single(f, n); if (v < 0) return 0; t += v;
    }
    return t;
  }
  function pickBest(vals) {
    if (isStraight(vals)) return vals.map((_, i) => i);
    const c = counts(vals), take = [0, 0, 0, 0, 0, 0, 0];
    for (let f = 1; f <= 6; f++) {
      let n = c[f]; if (n >= 3) { take[f] = 3; n -= 3; }
      if (n && single(f, n) > 0) take[f] += n;
    }
    return vals.map((v, i) => i).filter(i => take[vals[i]]-- > 0);
  }
  const canScore = vals => pickBest(vals).length > 0;
  const free = () => G.dice.filter(d => !d.kept);
  const selected = () => G.dice.filter(d => d.sel);
  const selScore = () => scoreOf(selected().map(d => d.v));

  const needOpen = who => !G.open[who] && !G.rules.noopen;
  const canBank = (who, extra) => !needOpen(who) || G.turn + (extra ? extra + (G.rules.stanley ? 50 : 0) : 0) >= 500;
  function setup() {
    board.innerHTML = `<div class="rivals"><img src="parents.jpg?v=2" alt="Françoise et Jean-François" width="120" height="120"><p><b>Françoise & Jean-François</b><br>Maîtres du 10 000 · Gardiens du Fragment III</p></div>
      <h3>Choisis ta partie</h3><p style="text-align:center;margin:8px 0 16px">Stanley a déjà réchauffé les dés.</p>
      <div class="btn-row"><button class="btn gold" data-t="5000">Partie express · 5 000</button><button class="btn dark" data-t="10000">Partie de famille · 10 000</button></div>`;
    $$('[data-t]', board).forEach(b => b.addEventListener('click', () => { Sound.init(); Sound.click(); start(+b.dataset.t); }));
  }
  function start(target) {
    G = { target, open: { me: false, yo: false }, yoTurns: 0, me: 0, yo: 0, who: 'me', dice: [], turn: 0, rolled: false, rules: {}, ruleCount: 0, busy: false, over: false, ruleOrder: RULES.slice().sort(() => Math.random() - .5) };
    board.innerHTML = `<div class="scorebox"><div id="boxMe"><small>${esc(h.name)}</small><b id="scMe">0</b></div><div id="boxYo"><img class="avatar" src="parents.jpg?v=2" alt="Françoise et Jean-François" width="56" height="56"><small>Françoise & J.-F.</small><b id="scYo">0</b></div></div>
      <p class="turn-info" style="margin-top:10px">Objectif : <b>${target.toLocaleString('fr-FR')}</b> · Tour : <b id="turnPts">0</b> · Sélection : <b id="selPts">0</b></p>
      <p class="dlog" id="openInfo" style="min-height:0;margin-top:2px;font-size:14px"></p><div class="tray" id="tray"></div><div class="kept" id="kept"></div><p class="dlog" id="dlog"></p>
      <div class="dice-actions"><button class="btn gold" id="btnRoll">Lancer</button><button class="btn dark" id="btnBank">Mettre à l'abri</button></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn ink small" id="btnRules"><span class="stanley">🎲</span> Changer les règles</button></div><ul class="rules-list" id="rulesList"></ul>`;
    $('#btnRoll').addEventListener('click', playerRoll);
    $('#btnBank').addEventListener('click', playerBank);
    $('#btnRules').addEventListener('click', changeRule);
    newTurn('me');
  }
  function log(t) { $('#dlog').textContent = t; }
  function newTurn(who) {
    G.who = who; G.turn = 0; G.rolled = false; G.dice = Array.from({ length: 5 }, () => ({ v: 1 + Math.floor(Math.random() * 6), kept: false, sel: false, fresh: false }));
    render();
    if (who === 'yo') { G.yoTurns++; log('Au tour de ' + SPK() + '…'); setTimeout(yoTurn, 900); } else log('À toi. Lance les dés.');
  }
  function dieEl(d, small) {
    const b = document.createElement('button'); b.className = 'die v' + d.v + (d.sel ? ' sel' : '') + (d.fresh ? ' roll' : '');
    b.innerHTML = '<i></i>'.repeat(9); b.setAttribute('aria-label', 'Dé ' + d.v + (d.sel ? ', gardé' : ''));
    if (!small) b.addEventListener('click', () => {
      if (G.who !== 'me' || !G.rolled || G.busy || G.over) return;
      d.sel = !d.sel; Sound.tone(700 + d.v * 60, .06, { type: 'triangle', g: .1 }); render();
    });
    return b;
  }
  function render() {
    $('#scMe').textContent = G.me.toLocaleString('fr-FR'); $('#scYo').textContent = G.yo.toLocaleString('fr-FR');
    $('#boxMe').classList.toggle('turn', G.who === 'me'); $('#boxYo').classList.toggle('turn', G.who === 'yo');
    $('#turnPts').textContent = G.turn; const ss = selScore(); $('#selPts').textContent = selected().length ? (ss || '✘') : 0;
    const tray = $('#tray'), kept = $('#kept'); tray.innerHTML = ''; kept.innerHTML = '';
    G.dice.forEach(d => { if (d.kept) kept.appendChild(dieEl(d, true)); else if (G.rolled) tray.appendChild(dieEl(d)); });
    if (!G.rolled) tray.innerHTML = '<p style="color:var(--parch3);font-style:italic;align-self:center">Les dés attendent dans le gobelet…</p>';
    G.dice.forEach(d => d.fresh = false);
    const mine = G.who === 'me' && !G.busy && !G.over, valid = ss > 0;
    $('#btnRoll').disabled = !(mine && (!G.rolled || valid));
    const full = G.rolled && valid && free().every(d => d.sel);
    $('#btnRoll').textContent = !G.rolled ? 'Lancer' : full ? 'Main pleine ! Rejouer les 5' : 'Garder et relancer';
    $('#btnBank').disabled = !(mine && G.rolled && valid && canBank('me', ss));
    $('#openInfo').textContent = needOpen('me') ? 'Ouverture : il te faut 500 points en un tour pour marquer.' : '';
  }
  function commit() {
    const ss = selScore(); if (!ss) return false;
    G.turn += ss + (G.rules.stanley ? 50 : 0);
    G.dice.forEach(d => { if (d.sel) { d.kept = true; d.sel = false; } });
    if (G.dice.every(d => d.kept)) {
      G.dice.forEach(d => d.kept = false); G.hot = true;
      log('Main pleine ! Les 5 dés marquent : on rejoue les 5 d\'office');
      Sound.chime();
    }
    return true;
  }
  async function roll() {
    G.busy = true;
    free().forEach(d => { d.v = 1 + Math.floor(Math.random() * 6); d.fresh = true; });
    G.rolled = true;
    for (let i = 0; i < 4; i++) Sound.noise(.05, { t: i * .07, g: .2, type: 'bandpass', f: 1800 + Math.random() * 1200, q: 2 });
    render(); await sleep(520); G.busy = false;
    if (!canScore(free().map(d => d.v))) {
      log(`Rien ! ${G.who === 'me' ? 'Tu perds' : SPK() + ' perd'} les ${G.turn} points du tour.` + (G.who === 'yo' ? ' « C\'est le gobelet. »' : ' Stanley compatit.'));
      Sound.hurt(); G.turn = 0; G.busy = true; render();
      await sleep(1700); G.busy = false;
      newTurn(G.who === 'me' ? 'yo' : 'me'); return false;
    }
    render(); return true;
  }
  async function playerRoll() {
    if (G.who !== 'me' || G.busy) return;
    Sound.click();
    if (G.rolled && !commit()) return;
    const hot = G.hot; G.hot = false;
    const ok = await roll(); if (ok) log(hot ? 'Main pleine ! Tu rejoues les 5 dés d\'office. Touche ceux qui rapportent.' : 'Touche les dés qui rapportent pour les garder.');
  }
  function bank(who) {
    G.open[who] = true;
    if (who === 'me') G.me += G.turn; else G.yo += G.turn;
    Sound.coin();
    const sc = who === 'me' ? G.me : G.yo;
    if (sc >= G.target) { G.over = true; render(); return finish(who); }
    return false;
  }
  async function playerBank() {
    if (G.who !== 'me' || G.busy || !canBank('me', selScore())) return;
    if (!commit()) return;
    log(`Tu mets ${G.turn} points à l'abri.`);
    if (bank('me')) return;
    G.busy = true; render(); await sleep(1100); G.busy = false; newTurn('yo');
  }
  async function yoTurn() {
    if (G.over) return;
    G.busy = true;
    while (true) {
      G.busy = false; const ok = await roll();
      if (!ok) return;
      G.busy = true;
      const vals = G.dice.map(d => d.v), fr = G.dice.map((d, i) => i).filter(i => !G.dice[i].kept);
      const pick = pickBest(fr.map(i => vals[i])).map(k => fr[k]);
      pick.forEach(i => G.dice[i].sel = true); render(); await sleep(800);
      const n = pick.length; commit();
      const left = free().length, total = G.yo + G.turn;
      if ((total >= G.target || G.turn >= 650 || (G.turn >= 300 && left <= 2)) && canBank('yo', 0)) {
        log(`${SPK()} met ${G.turn} points à l'abri. ${BANK[Math.floor(Math.random() * BANK.length)]}`); render();
        if (bank('yo')) return;
        await sleep(1300); G.busy = false; newTurn('me'); return;
      }
      log(`${SPK()} garde ${n} dé${n > 1 ? 's' : ''} et relance…`); render(); await sleep(900);
    }
  }
  function changeRule() {
    Sound.click();
    if (G.ruleCount >= RULES.length) { toast('Il n\'y a plus aucune règle à changer. Même Socrate a ses limites.'); return; }
    const [key, txt] = G.ruleOrder[G.ruleCount++]; G.rules[key] = true;
    const li = document.createElement('li'); li.textContent = txt; $('#rulesList').appendChild(li);
    Sound.glug(); toast('Nouvelle règle ! ' + RAGE[Math.floor(Math.random() * RAGE.length)], 3400);
    render();
  }
  async function finish(winner) {
    const won = winner === 'me';
    const w = store.get('gs_j3_wins', 0) + (won ? 1 : 0); store.set('gs_j3_wins', w);
    log(won ? 'Victoire ! Stanley grésille de fierté.' : 'Françoise et Jean-François l\'emportent…');
    Sound.fanfare();
    const again = document.createElement('div'); again.className = 'btn-row'; again.style.marginTop = '14px';
    again.innerHTML = '<button class="btn gold">Revanche</button>'; again.firstChild.addEventListener('click', () => { Sound.click(); setup(); });
    board.appendChild(again);
    const el = $('#epi'); el.classList.remove('hidden'); setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    await typeInto(el, won
      ? `Jean-François regarde les dés, puis te serre la main. « L'élève a dépassé les maîtres. »\n\nFrançoise éclate de rire. « ${G.ruleCount ? `Tu as changé les règles ${G.ruleCount} fois, mais bon… on t'a appris le 10 000, pas l'honnêteté.` : 'Et sans changer une seule règle ! Qui es-tu, et qu\'as-tu fait d\'Aurélien ?'} »\n\nElle sort de son sac un morceau de parchemin plié en quatre : le [[Fragment III]] de la carte. « Tiens. Et prends soin de notre fils pendant ces quatre nuits. »`
      : `Françoise range les dés en souriant. « Pas encore, mon grand. »\n\nJean-François te tape sur l'épaule. « Le fragment, il faudra venir le chercher. On ne bouge pas d'ici. »${G.ruleCount ? ` Il ajoute, l'air faussement sévère : « Et tu as changé les règles ${G.ruleCount} fois. Pour rien. »` : ''}\n\nStanley te réchauffe les pieds, solidaire. Il y a la revanche.`, { speed: 22 });
    if (won && !frags().includes(3)) setTimeout(() => giveFragment(3), 700);
    return true;
  }

  await ritual({
    kicker: '2 novembre. Il gèle sur les Royaumes de l\'Est.',
    title: 'Porte III',
    to: `Pour Aurélien, dit <b>${esc(h.name)}</b>`,
    text: 'Trois jours avant l\'ouverture. Le vent souffle, la taverne est glaciale… sauf un coin, où ronronne un vieil ami.\n\nApporte tes dés. Et cette fois, on garde les mêmes règles du début à la fin. Promis ?'
  });
  revealAll();

  const showDice = () => { $('#diceSec').classList.remove('hidden'); setup(); };
  const playStory = async () => {
    $('#replayRow').classList.add('hidden');
    await Story($('#storyRoot'), SCENES, {});
    store.set('gs_j3', true); $('#replayRow').classList.remove('hidden');
    showDice(); setTimeout(() => $('#diceSec').scrollIntoView({ behavior: 'smooth' }), 100);
  };
  $('#replayBtn').addEventListener('click', () => { Sound.click(); playStory(); });
  window.__dice = () => G; window.__pick = v => pickBest(v); window.__score = v => scoreOf(v);
  if (store.get('gs_j3', false)) {
    $('#storyRoot').innerHTML = `<div class="parch fable-card"><div class="fable-intro"><p>Stanley chauffe toujours. Les dés aussi.</p></div></div>`;
    $('#replayRow').classList.remove('hidden'); showDice();
  } else playStory();
})();
