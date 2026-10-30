'use strict';
/* Porte IV — La Rançon de Carlotta (3 novembre) */
(async () => {
  if (!gate(4)) return;
  $('#headSeal').innerHTML = sealSVG();
  const h = hero();
  const DEFI = PARAMS.get('defi'), DE = PARAMS.get('de');

  /* Sceau impérial de Carlotta */
  const CROWN_D = 'M58 122 L52 74 L79 98 L100 58 L121 98 L148 74 L142 122 Z M58 128 h84 v14 h-84 Z';
  function crownSVG() {
    const u = 'c' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 200 200" class="seal-svg" aria-hidden="true"><defs>
      <radialGradient id="g${u}" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#c46bc0"/><stop offset=".45" stop-color="#7a2a78"/><stop offset="1" stop-color="#3a0a38"/></radialGradient>
      <path id="t${u}" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>
      <path d="${SEAL_D}" fill="url(#g${u})"/><circle cx="100" cy="100" r="64" fill="none" stroke="rgba(30,0,30,.5)" stroke-width="4"/>
      <text font-family="Cinzel, serif" font-weight="700" font-size="12" fill="rgba(30,0,30,.6)"><textPath href="#t${u}" textLength="455">CARLOTTA ✦ IMPÉRATRICE DU CANAPÉ ✦ </textPath></text>
      <path d="${CROWN_D}" fill="rgba(30,0,30,.5)" transform="translate(2 2)"/><path d="${CROWN_D}" fill="#e6b84a"/>
      <circle cx="100" cy="56" r="6" fill="#e6b84a"/><circle cx="52" cy="72" r="5" fill="#e6b84a"/><circle cx="148" cy="72" r="5" fill="#e6b84a"/>
      <ellipse cx="70" cy="58" rx="28" ry="13" fill="rgba(255,255,255,.17)" transform="rotate(-32 70 58)"/></svg>`;
  }
  function drawCrown(c, x, y, size, rot) {
    const s = size / 200; c.save(); c.translate(x, y); c.rotate(rot * Math.PI / 180); c.scale(s, s); c.translate(-100, -100);
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
    const g = c.createRadialGradient(76, 64, 5, 100, 100, 150); g.addColorStop(0, '#c46bc0'); g.addColorStop(.45, '#7a2a78'); g.addColorStop(1, '#3a0a38');
    c.fillStyle = g; c.fill(new Path2D(SEAL_D)); c.shadowColor = 'transparent';
    c.lineWidth = 4; c.strokeStyle = 'rgba(30,0,30,.5)'; c.beginPath(); c.arc(100, 100, 64, 0, 7); c.stroke();
    const txt = 'CARLOTTA ✦ IMPÉRATRICE DU CANAPÉ ✦ '; c.font = '700 12px Cinzel, serif'; c.fillStyle = 'rgba(30,0,30,.6)'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < txt.length; i++) { const a = -Math.PI + i / txt.length * Math.PI * 2; c.save(); c.translate(100 + Math.cos(a) * 74, 100 + Math.sin(a) * 74); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore(); }
    const cp = new Path2D(CROWN_D); c.save(); c.translate(2, 2); c.fillStyle = 'rgba(30,0,30,.5)'; c.fill(cp); c.restore(); c.fillStyle = '#e6b84a'; c.fill(cp);
    [[100, 56, 6], [52, 72, 5], [148, 72, 5]].forEach(([a, b, r]) => { c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); });
    c.restore();
  }

  const ARTS = [
    'Aurélien est prêté, et non donné, du jeudi 5 au dimanche 8 novembre.',
    'Il sera rendu dimanche soir, entier, douché, et nourri d\'autre chose que de burgers et de pizzas.',
    'Quiconque l\'appellera « Charlotte » sera banni du royaume. On dit Carlotta.',
    'Un message de bonne nuit chaque soir, même en plein donjon.',
    'Get Sauced, voleur de son état, doit à Carlotta un verre, à prendre quand elle le décidera.',
    'Carlotta se réserve le droit de débrancher la box à tout moment. Elle ne le fera pas. Probablement.'
  ];

  $('#content').innerHTML = `
    <section id="story"><div class="sec-head"><span class="sec-num">I</span><h2>La Fable</h2><p>Le QG est prêt. Presque.</p></div>
      <div id="storyRoot"></div><div id="replayRow" class="btn-row hidden" style="margin-top:14px"><button class="btn dark small" id="replayBtn">Revivre la Fable</button></div></section>
    <section id="treaty" class="hidden"><div class="sec-head"><span class="sec-num">II</span><h2>Le Traité de Carlotta</h2><p>Impératrice du Canapé. Gardienne du Week-end.</p></div>
      <div class="parch pact carlotta" id="tPact">
        <h3>Le Traité de Carlotta</h3>
        <p class="pre">Nous, <b>Carlotta</b>, Impératrice du Canapé et Gardienne du Week-end, consentons à prêter <b>Aurélien</b>, dit « ${esc(h.name)} », à la Confrérie des Ombres, aux conditions suivantes&nbsp;:</p>
        <ol>${ARTS.map(a => `<li>${a}</li>`).join('')}</ol>
        <div class="sigs">
          <div class="sig"><div class="sig-c">Carlotta</div><div class="sig-line"></div><p>Carlotta, Impératrice<br><small>✔ SIGNÉ</small></p></div>
          <div class="sig"><div class="sig-y">Get Sauced</div><div class="sig-line"></div><p>Yohann, dit Get Sauced<br><small>✔ SIGNÉ (sous la contrainte)</small></p></div>
          <div class="sig" style="grid-column:1/-1"><div class="pad-wrap" id="tPadWrap"><canvas id="tPad" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas><span class="pad-ph">Signe ici, au doigt</span></div><div class="sig-line"></div><p>Aurélien, dit ${esc(h.name)}<br><small id="tSigned" style="color:#8e1b17">EN ATTENTE DE TA SIGNATURE</small></p></div>
        </div>
        <div class="crown-seal" id="tSeal">${crownSVG()}</div>
        <div class="btn-row" id="tActions"><button class="btn dark small" id="tClear">Effacer</button><button class="btn ink" id="tSealBtn">Signer le Traité</button></div>
        <div class="btn-row hidden" id="tDone"><button class="btn gold hidden" id="tShare">Envoyer à Carlotta</button><button class="btn ink" id="tDl">Télécharger le Traité</button></div>
        <div class="btn-row hidden" id="tRedoRow" style="margin-top:10px"><button class="btn dark small" id="tRedo">Re-signer</button></div>
      </div>
      <p class="hint">Envoie-le à Carlotta : c'est elle qui l'a écrit, elle mérite de le recevoir.</p>
    </section>
    <section id="gaze" class="hidden"><div class="sec-head"><span class="sec-num">III</span><h2>Le Regard de Carlotta</h2><p>Quitte la maison avec ton sac d'ordinateur sans te faire voir.</p></div>
      ${DEFI ? `<div class="defi-banner">⚔ <b>${esc(DE || 'Un voleur')}</b> a rejoint le QG en <b>${esc(DEFI)} s</b>. À toi de faire mieux !</div>` : ''}
      <div class="game-wrap" style="margin-top:12px"><canvas class="game-cv" id="gzCv"></canvas>
        <div class="duel-ov" id="gzOv"><h3>Le Regard de Carlotta</h3><p><b>Maintiens</b> le bouton pour avancer vers le QG. Quand Carlotta fredonne, elle va se retourner : <b>lâche tout</b>. Si elle te voit bouger, retour à la case départ. Quatre pièces à traverser.</p><button class="btn gold" id="gzStart">Prendre le sac</button></div></div>
      <button class="btn gold big-btn" id="gzHold" style="margin-top:12px;touch-action:none">Avancer (maintiens)</button>
      <div class="stat-row"><div>Pièce<b id="gzLvl">1</b></div><div>Temps<b id="gzTime">0,0</b></div><div>Record<b id="gzBest">${store.get('gs_j4_best', null) ? String(store.get('gs_j4_best')).replace('.', ',') + ' s' : '—'}</b></div></div>
      <div class="btn-row hidden" id="gzDefiRow" style="margin-top:12px"><button class="btn dark" id="gzDefi">Défier Yohann</button></div>
    </section>
    ${doorFooter(4)}`;

  const SCENES = [
    {
      title: 'Le Recrutement de Marv',
      text: () => `Le QG est presque prêt. Les écrans sont branchés, les chaises réglées, et Stanley a été rapproché du bureau. Il ne manque plus qu'un troisième larron.\n\nLa porte s'ouvre sur [[Marv]], ton responsable. Il a décidé de se lancer dans l'aventure avec vous. Il porte une robe de tissu flambant neuve, encore étiquetée.\n\n« Je n'arrive pas à choisir ma classe », avoue-t-il. Puis il te regarde : « C'est toi qui décides. Tu es mon meilleur vendeur, après tout. »\n\nTu savoures. Il vient de le dire. À voix haute. Devant Yohann.`,
      choices: () => [
        { label: 'Mage.', sub: 'Il fera fondre les ennemis. Et les objectifs du trimestre.', act: s => { s.marv = 'mage'; } },
        { label: 'Prêtre.', sub: 'Il vous soignera. Et validera vos notes de frais.', act: s => { s.marv = 'pretre'; } }
      ]
    },
    {
      title: 'L\'Impératrice du Canapé',
      text: s => (s.marv === 'mage'
        ? 'Marv invoque une boule de feu pour essayer. Stanley le prend très mal : la chaleur, c\'est son métier.'
        : 'Marv tente un premier soin sur Yohann, qui s\'était coupé avec une chips. Ça marche. Il n\'a jamais été aussi fier.') +
        `\n\nYohann déroule le plan : jeudi minuit, ouverture du monde. Quatre jours et quatre nuits au QG. Des burgers, des pizzas, de la bière, et Stanley à fond.\n\n« Il ne reste qu'un seul obstacle », murmure-t-il.\n\nÀ cet instant, la porte s'ouvre en grand. Une silhouette se découpe dans la lumière, une couronne sur la tête. Marv recule. Stanley baisse en puissance, par respect.\n\nC'est [[Carlotta]]. Impératrice du Canapé. Gardienne du Week-end. Celle que l'on ne doit jamais, JAMAIS appeler Charlotte.\n\nElle pointe Yohann du doigt. « Alors c'est toi. Celui qui me vole mon homme pendant quatre jours. »\n\nYohann se cache derrière Marv. Marv se cache derrière Stanley. Tous les regards se tournent vers toi.`,
      choices: () => [
        { label: '« Votre Majesté Carlotta, Reine des Ombres… »', sub: 'Commencer par un titre. Ça marche toujours.', tag: 'titre' },
        { label: 'Promettre d\'être rendu dimanche, douché.', sub: 'L\'argument hygiène.', tag: 'douche' },
        { label: 'Laisser Marv négocier.', sub: 'C\'est son métier, après tout.', tag: 'marv' }
      ]
    },
    {
      title: 'Les Conditions de Carlotta',
      text: s => ({
        titre: '« Reine des Ombres », répète Carlotta. Elle sourit, une demi-seconde. « Ça me plaît. Ça ne change rien. »',
        douche: '« Douché », répète Carlotta en plissant les yeux. « Et reposé. Et pas en mode zombie. Je connais vos nuits. »',
        marv: 'Marv s\'avance, ajuste sa robe et commence : « Alors, si on fait un point rapide sur vos attentes… » Carlotta le coupe d\'un seul regard. Marv retourne derrière Stanley.'
      })[s.tags[0]] + `\n\nCarlotta fait les cent pas devant Stanley. Puis elle s'arrête.\n\n« Très bien. Vous l'aurez, vos quatre nuits. Mais à MES conditions. »\n\nElle déroule un long parchemin, tamponné d'un sceau violet en forme de couronne : [[le Traité de Carlotta]].\n\n« Tu le signes, [[${h.name}]]. Et ensuite, si tu veux quitter la maison avec ton sac d'ordinateur, il faudra passer sous mon regard sans te faire voir. »\n\nYohann déglutit. « Elle est forte. » Marv acquiesce. « Très forte. » Stanley ne dit rien, mais il n'en pense pas moins.`,
      cta: 'Lire le Traité'
    }
  ];

  /* ---------- Traité ---------- */
  const pad = SigPad($('#tPad'), $('#tPadWrap'));
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const now = new Date(), dateTxt = `Fait au palais du Canapé, le ${now.getDate() === 1 ? '1er' : now.getDate()} ${MOIS[now.getMonth()]} ${now.getFullYear()}.`;
  function setSealed(on, anim) {
    pad.lock(on); $('#tPact').classList.toggle('sealed', on);
    $('#tActions').classList.toggle('hidden', on); $('#tDone').classList.toggle('hidden', !on); $('#tRedoRow').classList.toggle('hidden', !on);
    if (on && canShareFiles()) $('#tShare').classList.remove('hidden');
    $('#tSigned').textContent = on ? '✔ SIGNÉ ET SCELLÉ' : 'EN ATTENTE DE TA SIGNATURE'; $('#tSigned').style.color = on ? '#2a6a2a' : '#8e1b17';
    if (on && anim) {
      setTimeout(() => { Sound.stamp(); const r = $('#tSeal').getBoundingClientRect(); Embers.burst(r.left + r.width / 2, r.top + r.height / 2, 50, true); }, 250);
      setTimeout(() => { toast('Carlotta a obtenu gain de cause. Comme toujours.', 3200); }, 900);
      setTimeout(() => { if (!frags().includes(4)) giveFragment(4); showGaze(); }, 2600);
    }
  }
  $('#tClear').addEventListener('click', () => { Sound.click(); pad.clear(); });
  $('#tSealBtn').addEventListener('click', () => {
    if (pad.points < 12) { Sound.deny(); toast('Carlotta exige une vraie signature. Applique-toi.'); return; }
    store.set('gs_j4_treaty', pad.strokes); setSealed(true, true);
  });
  $('#tRedo').addEventListener('click', () => { Sound.click(); pad.clear(); store.set('gs_j4_treaty', null); setSealed(false); });
  async function renderTreaty() {
    await fontsReady();
    const W = 1080, H = 1720, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    const ink = '#2b1709', plum = '#6b1a4f';
    paperBg(g, W, H, 5150);
    g.fillStyle = plum; g.textAlign = 'center'; fitFont(g, 'Le Traité de Carlotta', 900, '"Cinzel Decorative"', 84, 900); g.fillText('Le Traité de Carlotta', W / 2, 180);
    g.font = 'italic 34px "IM Fell English"'; g.fillStyle = ink; g.fillText('Impératrice du Canapé · Gardienne du Week-end', W / 2, 232);
    ornamentRule(g, W / 2, 266, 700, ink);
    g.font = 'italic 32px "IM Fell English"';
    let y = wrap(g, `Nous, Carlotta, consentons à prêter Aurélien, dit « ${h.name} », à la Confrérie des Ombres, aux conditions suivantes :`, W / 2, 326, 880, 42) + 18;
    ARTS.forEach((t, i) => {
      g.fillStyle = plum; g.font = '900 34px Cinzel'; g.textAlign = 'center'; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI'][i], 150, y + 4);
      g.fillStyle = ink; g.font = '32px "IM Fell English"'; y = wrap(g, t, 200, y + 4, 780, 40, 'left') + 24;
    });
    g.textAlign = 'center'; g.font = 'italic 28px "IM Fell English"'; g.fillText(dateTxt, W / 2, y + 10);
    const by = Math.max(y + 150, H - 360);
    g.save(); g.fillStyle = plum; g.translate(200, by - 20); g.rotate(-.08); g.font = '88px "Pinyon Script"'; g.textAlign = 'center'; g.fillText('Carlotta', 0, 0); g.restore();
    g.save(); g.fillStyle = '#1f2a55'; g.translate(540, by - 20); g.rotate(-.06); g.font = '78px "Pinyon Script"'; g.textAlign = 'center'; g.fillText('Get Sauced', 0, 0); g.restore();
    pad.drawInto(g, 880, by - 50, 280, 150);
    g.strokeStyle = ink; g.lineWidth = 2; [[60, 340], [380, 700], [720, 1040]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a, by + 30); g.lineTo(b, by + 30); g.stroke(); });
    g.fillStyle = ink; g.font = '26px "IM Fell English"'; g.fillText('Carlotta, Impératrice', 200, by + 70); g.fillText('Yohann, dit Get Sauced', 540, by + 70); g.fillText('Aurélien, dit ' + h.name, 880, by + 70);
    drawCrown(g, W / 2, by + 190, 170, -12);
    return c;
  }
  $('#tDl').addEventListener('click', async () => { Sound.click(); saveCanvas(await renderTreaty(), 'traite-de-carlotta.jpg', false); });
  $('#tShare').addEventListener('click', async () => { Sound.click(); saveCanvas(await renderTreaty(), 'traite-de-carlotta.jpg', true, 'Le Traité de Carlotta est signé. Tu as gagné, Majesté.'); });

  /* ---------- Jeu : le Regard de Carlotta ---------- */
  const LEVELS = [
    { speed: .2, back: [1.8, 3.2], warn: .75, watch: [1.2, 1.8], fake: 0 },
    { speed: .22, back: [1.3, 2.6], warn: .6, watch: [1.2, 2], fake: .15 },
    { speed: .24, back: [1, 2.2], warn: .5, watch: [1.3, 2.2], fake: .3 },
    { speed: .26, back: [.8, 1.8], warn: .42, watch: [1.4, 2.4], fake: .4 }
  ];
  const CAUGHT = ['« Tu vas où comme ça ? »', '« Et la vaisselle ? »', '« Quatre nuits. Pas cinq. »', '« C\'est CARLOTTA. »', '« Le sac. Pose. Le sac. »', '« Je t\'ai vu, Socrate. »'];
  const Gaze = (() => {
    const cv = $('#gzCv'), cx = cv.getContext('2d');
    let W = 0, H = 0, st = null, run = false, last = 0, holding = false;
    function size() { const d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); if (!r.width) return; W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); draw(); }
    function phase(name) {
      const L = LEVELS[st.lvl]; st.ph = name;
      if (name === 'back') st.pt = rand(...L.back);
      else if (name === 'warn') { st.pt = L.warn; st.isFake = Math.random() < L.fake; Sound.tone(523, .25, { type: 'triangle', g: .08 }); Sound.tone(659, .3, { type: 'triangle', g: .08, t: .18 }); }
      else if (name === 'watch') { st.pt = rand(...L.watch); st.grace = .14; }
    }
    function reset() { st = { lvl: 0, pos: 0, t: 0, caught: 0, msg: '', msgT: 0, bob: 0 }; phase('back'); }
    function update(dt) {
      st.t += dt; st.pt -= dt; st.msgT = Math.max(0, st.msgT - dt);
      const L = LEVELS[st.lvl];
      if (st.ph === 'back' && st.pt <= 0) phase('warn');
      else if (st.ph === 'warn' && st.pt <= 0) { if (st.isFake) { phase('back'); st.msg = '… fausse alerte'; st.msgT = 1; } else phase('watch'); }
      else if (st.ph === 'watch') { st.grace -= dt; if (st.pt <= 0) phase('back'); }
      if (holding && st.msgT < .9) {
        if (st.ph === 'watch' && st.grace <= 0) {
          st.caught++; st.pos = 0; st.msg = CAUGHT[Math.floor(Math.random() * CAUGHT.length)]; st.msgT = 1.6; holding = false;
          Sound.hurt(); if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) {}
          phase('back');
        } else { st.pos += L.speed * dt; st.bob += dt * 10; if (Math.random() < dt * 4) Sound.tone(180, .05, { type: 'triangle', g: .03 }); }
      }
      if (st.pos >= 1) {
        st.lvl++; st.pos = 0; Sound.chime();
        if (st.lvl >= LEVELS.length) return finish();
        st.msg = 'Pièce ' + (st.lvl + 1) + ' sur 4'; st.msgT = 1.2; phase('back');
      }
      $('#gzLvl').textContent = Math.min(st.lvl + 1, 4); $('#gzTime').textContent = st.t.toFixed(1).replace('.', ',');
    }
    function person(x, y, s) { // Aurélien encapuchonné, sac d'ordi
      cx.save(); cx.translate(x, y + Math.sin(st ? st.bob : 0) * 2); cx.scale(s, s);
      cx.fillStyle = 'rgba(0,0,0,.4)'; cx.beginPath(); cx.ellipse(0, 2, 26, 6, 0, 0, 7); cx.fill();
      cx.fillStyle = '#2e2340'; cx.beginPath(); cx.moveTo(-22, 0); cx.quadraticCurveTo(-26, -40, -16, -60); cx.quadraticCurveTo(-18, -86, 2, -96); cx.quadraticCurveTo(20, -88, 16, -60); cx.quadraticCurveTo(26, -40, 22, 0); cx.closePath(); cx.fill();
      cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(8, -76, 8, 10, 0, 0, 7); cx.fill();
      cx.fillStyle = '#bfe3ff'; cx.fillRect(5, -79, 3, 2); cx.fillRect(11, -79, 3, 2);
      cx.fillStyle = '#4a3a26'; cx.fillRect(-30, -50, 22, 30); cx.fillStyle = '#d4a64a'; cx.font = '700 8px Cinzel'; cx.textAlign = 'center'; cx.fillText('PC', -19, -32);
      cx.restore();
    }
    function carlotta(x, y, s, facing, warn) {
      cx.save(); cx.translate(x, y); cx.scale(s, s);
      cx.fillStyle = 'rgba(0,0,0,.4)'; cx.beginPath(); cx.ellipse(0, 2, 34, 7, 0, 0, 7); cx.fill();
      const dress = cx.createLinearGradient(0, -80, 0, 0); dress.addColorStop(0, '#8a2a7a'); dress.addColorStop(1, '#4a0f48');
      cx.fillStyle = dress; cx.beginPath(); cx.moveTo(-34, 0); cx.lineTo(-12, -70); cx.lineTo(12, -70); cx.lineTo(34, 0); cx.closePath(); cx.fill();
      cx.fillStyle = facing ? '#e9c9a8' : '#3a1a10'; cx.beginPath(); cx.arc(0, -84, 15, 0, 7); cx.fill();
      cx.fillStyle = '#3a1a10'; if (facing) { cx.beginPath(); cx.arc(0, -90, 15, Math.PI, 0); cx.fill(); } else { cx.beginPath(); cx.ellipse(0, -76, 16, 18, 0, 0, 7); cx.fill(); }
      cx.fillStyle = '#f3c84a'; cx.beginPath(); cx.moveTo(-13, -100); cx.lineTo(-13, -112); cx.lineTo(-6, -105); cx.lineTo(0, -116); cx.lineTo(6, -105); cx.lineTo(13, -112); cx.lineTo(13, -100); cx.closePath(); cx.fill();
      if (facing) { cx.shadowColor = '#ff4ad0'; cx.shadowBlur = 12; cx.fillStyle = '#ff4ad0'; cx.fillRect(-7, -87, 4, 3); cx.fillRect(3, -87, 4, 3); cx.shadowBlur = 0; }
      if (warn) { cx.fillStyle = '#ffd9f4'; cx.font = 'italic 13px "IM Fell English", serif'; cx.textAlign = 'center'; cx.fillText('♪ Carlottaaa… ♪', 0, -128); }
      cx.restore();
    }
    function draw() {
      if (!W) return;
      cx.clearRect(0, 0, W, H);
      const bg = cx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a1a24'); bg.addColorStop(.6, '#1d120c'); bg.addColorStop(1, '#0d0704'); cx.fillStyle = bg; cx.fillRect(0, 0, W, H);
      cx.fillStyle = 'rgba(255,255,255,.03)'; for (let i = 0; i < 8; i++) cx.fillRect(i * W / 8, 0, 2, H * .62);
      const fy = H * .8; cx.fillStyle = '#5a1f2a'; cx.fillRect(W * .06, fy - 6, W * .78, 12);
      const dx = W * .9; cx.fillStyle = '#3b2414'; cx.fillRect(dx - 24, fy - 96, 48, 96); cx.strokeStyle = '#d4a64a'; cx.lineWidth = 2; cx.strokeRect(dx - 24, fy - 96, 48, 96);
      cx.fillStyle = '#f3d27a'; cx.font = '900 13px Cinzel, serif'; cx.textAlign = 'center'; cx.fillText('QG', dx, fy - 104);
      cx.fillStyle = '#ff9a3a'; cx.fillRect(dx - 2, fy - 50, 4, 4);
      const s = Math.min(1.1, H / 260);
      if (st) {
        const watch = st.ph === 'watch', warn = st.ph === 'warn';
        if (watch) { cx.fillStyle = 'rgba(255,60,180,.12)'; cx.beginPath(); cx.moveTo(W * .74, fy - 85 * s); cx.lineTo(0, fy - 130); cx.lineTo(0, fy + 20); cx.closePath(); cx.fill(); }
        carlotta(W * .74, fy, s, watch, warn);
        person(W * .08 + st.pos * W * .58, fy, s);
        if (st.msgT > 0) { cx.globalAlpha = Math.min(1, st.msgT); cx.fillStyle = '#ffd9f4'; cx.font = '900 18px Cinzel, serif'; cx.textAlign = 'center'; cx.shadowColor = '#000'; cx.shadowBlur = 6; cx.fillText(st.msg, W / 2, H * .22); cx.shadowBlur = 0; cx.globalAlpha = 1; }
        cx.fillStyle = 'rgba(243,210,122,.9)'; cx.font = '700 12px Cinzel, serif'; cx.textAlign = 'left'; cx.fillText(st.ph === 'watch' ? '● ELLE REGARDE' : st.ph === 'warn' ? '◐ ELLE FREDONNE…' : '○ Elle a le dos tourné', 12, 22);
      } else { carlotta(W * .74, fy, s, false, false); person(W * .08, fy, s); }
    }
    function loop(n) { if (!run) return; const dt = Math.min(.05, (n - last) / 1000); last = n; if (!document.hidden) { update(dt); if (run) draw(); } requestAnimationFrame(loop); }
    function start() { Sound.init(); Sound.click(); reset(); size(); run = true; last = performance.now(); $('#gzOv').classList.add('hidden'); requestAnimationFrame(loop); }
    function finish() {
      run = false; const t = Math.round(st.t * 10) / 10, best = store.get('gs_j4_best', null), rec = best == null || t < best;
      if (rec) { store.set('gs_j4_best', t); $('#gzBest').textContent = String(t).replace('.', ',') + ' s'; }
      Sound.fanfare(); draw();
      const ov = $('#gzOv');
      ov.innerHTML = `<h3>${rec ? 'Nouveau record !' : 'Arrivé au QG !'}</h3><div class="big">${String(t).replace('.', ',')} s</div><p>Repéré ${st.caught} fois par Carlotta.${DEFI ? (t < parseFloat(DEFI) ? '<br><b>Défi relevé ! Tu as battu ' + esc(DE || 'ton rival') + '.</b>' : '<br>Le défi tient toujours…') : ''}</p><button class="btn gold" id="gzAgain">Rejouer</button>`;
      ov.classList.remove('hidden'); $('#gzAgain').addEventListener('click', start);
      $('#gzDefiRow').classList.remove('hidden'); st.final = t;
    }
    const hold = v => e => { e.preventDefault(); if (run) holding = v; };
    ['pointerdown'].forEach(t => { $('#gzHold').addEventListener(t, hold(true)); cv.addEventListener(t, hold(true)); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => { $('#gzHold').addEventListener(t, hold(false)); cv.addEventListener(t, hold(false)); });
    $('#gzHold').addEventListener('contextmenu', e => e.preventDefault());
    addEventListener('keydown', e => { if (run && (e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); holding = true; } });
    addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'ArrowRight') holding = false; });
    $('#gzStart').addEventListener('click', start);
    $('#gzDefi').addEventListener('click', async () => {
      Sound.click(); const t = st && st.final; if (!t) return;
      const url = location.origin + location.pathname + `?defi=${t}&de=${encodeURIComponent(h.name)}`;
      const text = `J'ai échappé au regard de Carlotta en ${String(t).replace('.', ',')} s. Fais mieux.`;
      try { if (navigator.share) { await navigator.share({ text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(text + ' ' + url); toast('Lien du défi copié ! Colle-le à Yohann sur WhatsApp.'); } catch (e) { toast(url, 6000); }
    });
    addEventListener('resize', size);
    window.__gaze = () => st;
    return { size };
  })();
  function showGaze() { $('#gaze').classList.remove('hidden'); Gaze.size(); }

  await ritual({
    kicker: '3 novembre. Deux jours avant le grand départ.',
    title: 'Porte IV',
    to: `Pour Aurélien, dit <b>${esc(h.name)}</b>`,
    text: `La rumeur court dans tout le royaume : quelqu'un s'apprête à enlever [[${h.name}]] pendant quatre jours et quatre nuits.\n\nQuelqu'un d'autre n'est pas d'accord du tout. Et elle a une couronne.`
  });
  revealAll();

  const showTreaty = () => { $('#treaty').classList.remove('hidden'); pad.size(); };
  const playStory = async () => {
    $('#replayRow').classList.add('hidden');
    await Story($('#storyRoot'), SCENES, {});
    store.set('gs_j4', true); $('#replayRow').classList.remove('hidden');
    showTreaty(); setTimeout(() => $('#treaty').scrollIntoView({ behavior: 'smooth' }), 100);
  };
  $('#replayBtn').addEventListener('click', () => { Sound.click(); playStory(); });
  const saved = store.get('gs_j4_treaty', null);
  if (DEFI || store.get('gs_j4', false)) {
    $('#storyRoot').innerHTML = `<div class="parch fable-card"><div class="fable-intro"><p>Carlotta veille toujours. Le Traité aussi.</p></div></div>`;
    $('#replayRow').classList.remove('hidden'); showTreaty();
    if (saved && saved.length) { setTimeout(() => { pad.strokes = saved; setSealed(true, false); }, 120); }
    if ((saved && saved.length) || DEFI) showGaze();
    if (DEFI) setTimeout(() => $('#gaze').scrollIntoView({ behavior: 'smooth' }), 300);
  } else playStory();
})();
