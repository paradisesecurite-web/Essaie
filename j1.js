'use strict';
/* Porte I — La Nuit des Morts (31 octobre) */
(async () => {
  if (!gate(1)) return;
  $('#headSeal').innerHTML = sealSVG();
  const h = hero();
  $('#content').innerHTML = `
    <section id="story"><div class="sec-head"><span class="sec-num">I</span><h2>La Fable</h2><p>Halloween, minuit, un cimetière. Que pourrait-il arriver ?</p></div>
      <div id="storyRoot"></div><div id="replayRow" class="btn-row hidden" style="margin-top:14px"><button class="btn dark small" id="replayBtn">Revivre la Fable</button></div></section>
    <section id="game" class="hidden"><div class="sec-head"><span class="sec-num">II</span><h2>Les Cadenas du Spectre</h2><p>Ouvre 3 serrures pour libérer le spectre.</p></div>
      <div class="game-wrap"><canvas class="game-cv" id="lockCv"></canvas>
        <div class="duel-ov" id="lockOv"><h3>Les Cadenas du Spectre</h3><p>Touche l'écran quand le crochet passe dans la <b>zone dorée</b>. Chaque goupille posée fait accélérer le crochet. Tu as <b>3 crochets</b>, pas un de plus.</p><button class="btn gold" id="lockStart">Prendre les crochets</button></div></div>
      <button class="btn gold big-btn" id="lockTap" style="margin-top:12px">Crocheter !</button>
      <div class="stat-row"><div>Serrures<b id="lkNow">0</b></div><div>Crochets<b id="lkPicks">3</b></div><div>Record<b id="lkBest">${store.get('gs_j1_best', 0)}</b></div></div>
      <div class="parch epilogue hidden" id="epi"></div>
    </section>
    ${doorFooter(1)}`;

  const yLine = h.yRace === 'Mort-vivant'
    ? 'Yohann, qui sera mort-vivant dans cinq jours, s\'entraîne déjà : il salue chaque tombe comme un vieux cousin.'
    : h.yRace === 'Elfe de la nuit'
      ? 'Yohann, futur elfe de la nuit, a déjà tenté trois saltos sur les pierres tombales. Il en a raté trois.'
      : 'Yohann avance en tête, une lanterne à la main et un sandwich dans l\'autre.';

  const SCENES = [
    {
      title: 'Le Vieux Cimetière',
      text: () => `Minuit sonne au clocher d'un village sans nom. Le brouillard rampe entre les tombes, et quelque part, un corbeau ricane.\n\n${yLine}\n\nAu fond du cimetière se dresse une crypte de pierre noire. Sur le fronton, à moitié effacé : [[Crypte des Joueurs Oubliés]]. On raconte que le premier fragment d'une carte très ancienne y dort. Une carte qui mène… au QG.\n\nYohann lève sa lanterne. « Après toi, [[${h.name}]]. »`,
      choices: () => [
        { label: 'Entrer le premier, dague au poing.', sub: 'Le cerveau passe devant. C\'est la règle.', tag: 'brave' },
        { label: 'Laisser Yohann passer devant.', sub: 'C\'est lui le jungler. En théorie.', tag: 'jungle' },
        { label: 'Frapper poliment à la porte.', sub: 'Les morts ont peut-être des manières.', tag: 'poli' }
      ]
    },
    {
      title: 'Le Spectre des Ganks Perdus',
      text: s => ({
        brave: 'Tu pousses la porte. Elle grince comme une chaise de bureau un lundi matin.',
        jungle: 'Yohann entre le premier… puis ressort aussitôt, blanc comme un linge. Pour un futur voleur, c\'est un début.',
        poli: 'Tu frappes trois coups. Une voix d\'outre-tombe répond : « Entrez… et essuyez vos pieds. »'
      })[s.tags[0]] + `\n\nAu centre de la crypte flotte une silhouette translucide, coiffée d'une vieille capuche de jungle. Elle tient une pancarte rongée par le temps : [[« MID A BESOIN D'AIDE »]].\n\nLe spectre se tourne lentement vers Yohann et gémit :\n\n« Sauuuuuce… Tu n'es jamais veeeenu… »\n\nC'est le [[Spectre des Ganks Perdus]] : l'âme de tous les ganks que tu as réclamés au Jardin du Golfe, il y a quinze ans, et que Yohann n'a jamais faits. Il pointe vers toi un doigt glacé. « Toi… Tu les as réclamés. Des centaines de fois. Témoigne ! »`,
      choices: () => [
        { label: '« C\'est vrai. Il ne venait JAMAIS. »', sub: 'La vérité, rien que la vérité.', tag: 'verite' },
        { label: '« Il venait… parfois… avec dix minutes de retard. »', sub: 'Défendre son frère, même quand il a tort.', tag: 'defense' },
        { label: '« Spectre, on peut s\'arranger entre gens raisonnables. »', sub: 'Le commercial reprend le dessus.', tag: 'deal' }
      ]
    },
    {
      title: 'Le Serment de la Sauce',
      text: s => ({
        verite: 'Yohann pose une main sur son cœur, l\'air blessé. « Traître. » Le spectre, lui, hoche la tête, satisfait. Quinze ans qu\'il attendait ce témoignage.',
        defense: 'Le spectre te dévisage longuement. « Dix minutes de retard… Le mid était mort trois fois. » Yohann te glisse un merci du coin des lèvres.',
        deal: '« S\'arranger ? » Le spectre hésite. Personne ne lui avait jamais fait d\'offre commerciale. Tu sens que tu le tiens : il est déjà à moitié convaincu, et à moitié transparent.'
      })[s.tags[1]] + `\n\nLe spectre se redresse. « Je ne trouverai le repos qu'à une condition. Dans le monde nouveau, quand [[${h.name}]] appellera à l'aide, la Sauce viendra. Toujours. »\n\nYohann lève la main droite. « Je le jure. Sur ma dague, sur ma bière… et sur Stanley. »\n\n« Les serments ne coûtent rien », gronde le spectre. « Mon âme est retenue par les cadenas de cette crypte. Qu'un voleur à la main sûre en ouvre trois, et je partirai en paix. »\n\nYohann te tend un trousseau de crochets. « Moi, je tiens la lanterne. C'est ça aussi, le travail d'équipe. »`,
      cta: 'Prendre les crochets'
    }
  ];

  await ritual({
    kicker: '31 octobre. La nuit où les morts se lèvent…',
    title: 'Porte I',
    to: `Pour Aurélien, dit <b>${esc(h.name)}</b>`,
    text: 'Le monde renaît dans cinq jours. Mais cette nuit, c\'est Halloween, et les morts ont des comptes à régler.\n\nRendez-vous au vieux cimetière. Viens seul. Enfin… viens avec moi.'
  });
  revealAll();

  const showGame = () => { $('#game').classList.remove('hidden'); Lock.size(); };
  const playStory = async () => {
    $('#replayRow').classList.add('hidden');
    await Story($('#storyRoot'), SCENES, {});
    store.set('gs_j1', true); $('#replayRow').classList.remove('hidden');
    showGame(); setTimeout(() => $('#game').scrollIntoView({ behavior: 'smooth' }), 100);
  };
  $('#replayBtn').addEventListener('click', () => { Sound.click(); playStory(); });

  /* ---------- Jeu : crochetage ---------- */
  const Lock = (() => {
    const cv = $('#lockCv'), cx = cv.getContext('2d');
    let W = 0, H = 0, st = null, run = false, last = 0, freed = store.get('gs_j1_freed', false);
    function size() { const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); if (!r.width) return; W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); draw(); }
    const pinsFor = l => Math.min(6, 3 + Math.floor((l - 1) / 2));
    function target() { st.tA = Math.random() * Math.PI * 2; st.tW = Math.max(.45, 1.05 - st.lvl * .05); }
    function reset() { st = { lvl: 1, pins: pinsFor(1), set: 0, ang: 0, dir: 1, speed: 1.75, picks: 3, opened: 0, fx: [], flash: 0, shake: 0, over: false, open: 0 }; target(); }
    const angDist = (a, b) => { let d = Math.abs(a - b) % (Math.PI * 2); return d > Math.PI ? Math.PI * 2 - d : d; };
    function fx(t, col) { st.fx.push({ t, col, life: 0 }); }
    function tap() {
      if (!run || st.over || st.open > 0) return;
      if (angDist(st.ang, st.tA) <= st.tW / 2 + .12) {
        st.set++; st.flash = 1; Sound.tone(1900, .05, { type: 'square', g: .06 }); Sound.tone(950, .12, { type: 'triangle', g: .1, t: .03 });
        if (st.set >= st.pins) {
          st.opened++; st.open = 1.1; Sound.chime(); fx('Serrure ouverte !', '#f3d27a');
          if (st.opened >= 3 && !freed) { freed = true; store.set('gs_j1_freed', true); setTimeout(epilogue, 900); }
        } else { target(); st.dir *= -1; st.speed += .08; }
      } else {
        st.picks--; st.shake = 9; Sound.crack(); fx('Crochet brisé !', '#ff7a6a');
        if (navigator.vibrate) try { navigator.vibrate(50); } catch (e) {}
        if (st.picks <= 0) gameOver(); else target();
      }
      hud();
    }
    function nextLock() { st.lvl++; st.pins = pinsFor(st.lvl); st.set = 0; st.speed = 1.75 + st.lvl * .25; if (st.picks < 3) { st.picks++; fx('+1 crochet', '#bfe3ff'); } hud(); target(); }
    function hud() { $('#lkNow').textContent = st.opened; $('#lkPicks').textContent = st.picks; }
    function update(dt) {
      st.ang = (st.ang + st.dir * st.speed * dt + Math.PI * 2) % (Math.PI * 2);
      st.flash = Math.max(0, st.flash - dt * 4); st.shake = Math.max(0, st.shake - dt * 30);
      if (st.open > 0) { st.open -= dt; if (st.open <= 0) { st.open = 0; nextLock(); } }
      st.fx = st.fx.filter(f => (f.life += dt) < 1.2);
    }
    function draw() {
      if (!W) return;
      cx.save(); cx.clearRect(0, 0, W, H);
      if (st && st.shake) cx.translate(rand(-st.shake, st.shake), rand(-st.shake, st.shake));
      const bg = cx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#16121c'); bg.addColorStop(1, '#0a0705'); cx.fillStyle = bg; cx.fillRect(-20, -20, W + 40, H + 40);
      cx.fillStyle = 'rgba(200,210,230,.06)'; for (let i = 0; i < 6; i++) { cx.beginPath(); cx.ellipse(W * (i / 5), H * .85, W * .3, 30, 0, 0, 7); cx.fill(); }
      cx.fillStyle = '#0d0a10'; [[.1, .62], [.2, .7], [.82, .64], [.92, .72]].forEach(([x, y]) => { const gx = W * x, gy = H * y; cx.beginPath(); cx.moveTo(gx - 16, H); cx.lineTo(gx - 16, gy); cx.arc(gx, gy, 16, Math.PI, 0); cx.lineTo(gx + 16, H); cx.fill(); });
      const R = Math.min(W, H) * .32, X = W / 2, Y = H * .54;
      const ring = cx.createRadialGradient(X - R * .3, Y - R * .3, R * .2, X, Y, R * 1.15); ring.addColorStop(0, '#6a6a72'); ring.addColorStop(1, '#202024');
      cx.fillStyle = ring; cx.beginPath(); cx.arc(X, Y, R, 0, 7); cx.fill();
      cx.fillStyle = '#141416'; cx.beginPath(); cx.arc(X, Y, R * .72, 0, 7); cx.fill();
      cx.fillStyle = '#000'; cx.beginPath(); cx.arc(X, Y - R * .12, R * .12, 0, 7); cx.fill(); cx.beginPath(); cx.moveTo(X - R * .07, Y - R * .08); cx.lineTo(X + R * .07, Y - R * .08); cx.lineTo(X + R * .1, Y + R * .25); cx.lineTo(X - R * .1, Y + R * .25); cx.fill();
      if (st) {
        const open = st.open > 0;
        if (!open && !st.over) {
          cx.strokeStyle = '#f3d27a'; cx.lineWidth = R * .16; cx.shadowColor = '#ffb040'; cx.shadowBlur = 18 + st.flash * 20; cx.lineCap = 'round';
          cx.beginPath(); cx.arc(X, Y, R * .86, st.tA - st.tW / 2, st.tA + st.tW / 2); cx.stroke(); cx.shadowBlur = 0;
        }
        const a = st.ang; cx.strokeStyle = '#d9dde6'; cx.lineWidth = 4; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(X, Y); cx.lineTo(X + Math.cos(a) * R * .98, Y + Math.sin(a) * R * .98); cx.stroke();
        cx.fillStyle = '#d9dde6'; cx.beginPath(); cx.arc(X + Math.cos(a) * R * .98, Y + Math.sin(a) * R * .98, 6, 0, 7); cx.fill();
        for (let i = 0; i < st.pins; i++) { const px = X + (i - (st.pins - 1) / 2) * 22; cx.fillStyle = i < st.set || open ? '#f3d27a' : 'rgba(255,255,255,.15)'; cx.fillRect(px - 7, Y - R - 30, 14, 18); }
        cx.fillStyle = '#f3d27a'; cx.font = '700 14px Cinzel, serif'; cx.textAlign = 'left'; cx.fillText('Serrure n° ' + st.lvl, 14, 24);
        cx.textAlign = 'right'; cx.fillText('Crochets : ' + '🗝'.repeat(Math.max(0, st.picks)), W - 14, 24);
        st.fx.forEach(f => { cx.globalAlpha = Math.max(0, 1 - f.life / 1.2); cx.fillStyle = f.col; cx.font = '900 22px Cinzel, serif'; cx.textAlign = 'center'; cx.shadowColor = '#000'; cx.shadowBlur = 8; cx.fillText(f.t, X, Y + R + 34 - f.life * 30); cx.shadowBlur = 0; cx.globalAlpha = 1; });
      }
      cx.restore();
    }
    function loop(now) { if (!run) return; const dt = Math.min(.05, (now - last) / 1000); last = now; if (!document.hidden) { update(dt); draw(); } requestAnimationFrame(loop); }
    function start() { Sound.init(); Sound.click(); reset(); hud(); size(); run = true; last = performance.now(); $('#lockOv').classList.add('hidden'); requestAnimationFrame(loop); }
    function gameOver() {
      st.over = true; run = false; draw();
      const best = store.get('gs_j1_best', 0), rec = st.opened > best; if (rec) { store.set('gs_j1_best', st.opened); $('#lkBest').textContent = st.opened; }
      const ov = $('#lockOv');
      ov.innerHTML = `<h3>${rec ? 'Nouveau record !' : 'Plus de crochets…'}</h3><div class="big">${st.opened}</div><p>serrure${st.opened > 1 ? 's' : ''} ouverte${st.opened > 1 ? 's' : ''}.<br>${freed ? 'Le spectre repose en paix. Tu peux viser le record.' : 'Il en faut 3 pour libérer le spectre. Yohann tient toujours la lanterne.'}</p><button class="btn gold" id="lockAgain">Reprendre des crochets</button>`;
      ov.classList.remove('hidden'); $('#lockAgain').addEventListener('click', start);
    }
    cv.addEventListener('pointerdown', e => { e.preventDefault(); tap(); });
    $('#lockTap').addEventListener('pointerdown', e => { e.preventDefault(); tap(); });
    $('#lockStart').addEventListener('click', start);
    addEventListener('resize', size);
    window.__lock = () => st;
    return { size };
  })();

  async function epilogue() {
    const el = $('#epi'); el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await typeInto(el, `Le dernier cadenas cède dans un déclic. Le spectre ferme les yeux et sourit, pour la première fois depuis quinze ans.\n\n« Il viendra, cette fois. Je le sens. » Puis il s'efface dans la brume, ne laissant derrière lui qu'un morceau de parchemin… et sa pancarte. Yohann la ramasse et la glisse dans son sac. « Pour le QG. Je l'accrocherai au-dessus de Stanley. »\n\nDans cinq jours, quand tu crieras à l'aide, [[la Sauce sera là]]. C'est juré.`, { speed: 22 });
    setTimeout(() => giveFragment(1), 600);
  }

  if (store.get('gs_j1', false)) {
    $('#storyRoot').innerHTML = `<div class="parch fable-card"><div class="fable-intro"><p>Le spectre t'attend toujours dans sa crypte… ou repose déjà en paix.</p></div></div>`;
    $('#replayRow').classList.remove('hidden'); showGame();
    if (store.get('gs_j1_freed', false)) { $('#epi').classList.remove('hidden'); $('#epi').innerHTML = '<p>Le spectre repose en paix. Le Fragment I de la carte est à toi. Tu peux encore battre ton record.</p>'; }
  } else playStory();
})();
