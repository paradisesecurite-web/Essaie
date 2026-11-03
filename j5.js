'use strict';
/* Porte V — La Veillée d'Armes (4 novembre) */
(async () => {
  if (!gate(5)) return;
  $('#headSeal').innerHTML = sealSVG();
  const h = hero();
  const LAUNCH = Date.UTC(2026, 10, 4, 23, 0, 0); // 5 nov. 00:00 Paris

  $('#content').innerHTML = `
    <section id="story"><div class="sec-head"><span class="sec-num">I</span><h2>La Fable</h2><p>La dernière nuit avant le monde nouveau.</p></div>
      <div id="storyRoot"></div><div id="replayRow" class="btn-row hidden" style="margin-top:14px"><button class="btn dark small" id="replayBtn">Revivre la Fable</button></div></section>
    <section id="mapSec" class="hidden"><div class="sec-head"><span class="sec-num">II</span><h2>La Carte des Ombres</h2><p>Cinq fragments. Un seul chemin.</p></div>
      <div id="mapBox"></div><div id="missing"></div></section>
    <section id="finalSec" class="hidden"><div class="sec-head"><span class="sec-num">III</span><h2>Le Dernier Sceau</h2><p>Celui-là, Yohann l'a gardé pour la fin.</p></div>
      <div class="final-seal-wrap" id="finalSealWrap">
        <button class="seal-btn final-seal" id="finalSeal" aria-label="Briser le dernier sceau"><div class="half l">${sealSVG()}</div><div class="half r">${sealSVG()}</div></button>
        <p class="intro-hint" style="margin-top:22px">Touche le sceau. Monte le son.</p>
      </div>
      <div id="reveal" class="hidden"></div>
    </section>
    ${doorFooter(5)}`;

  const SCENES = [
    {
      title: 'La Dernière Nuit',
      text: () => `Le QG est prêt. Vraiment prêt, cette fois.\n\nStanley ronronne au maximum. Au-dessus de lui, la pancarte du spectre : [[« MID A BESOIN D'AIDE »]]. Sur le mur, le Traité de Carlotta, punaisé bien en évidence. Dans un coin, la robe de Marv, toujours étiquetée. Sur la table, cinq dés, et une feuille de score où quelqu'un a gribouillé « nouvelle règle » dans la marge.\n\nYohann t'entraîne sur le toit. Deux chaises, deux bières, et la ville qui s'endort en dessous. Demain, à minuit, tout recommence.\n\nIl trinque avec toi, puis regarde au loin. « Tu te souviens du Jardin du Golfe ? »`,
      choices: () => [
        { label: '« Le jour où tu es monté chez moi. J\'étais sur League. »', sub: 'Le contact a accroché direct.', tag: 'league' },
        { label: '« Les écouteurs. Six mois. »', sub: 'Il fallait bien que ça revienne.', tag: 'ecouteurs' },
        { label: '« Le jour où je t\'ai réclamé mon premier gank. »', sub: 'Et le dernier que tu n\'as pas fait.', tag: 'gank' }
      ]
    },
    {
      title: 'L\'Élève et le Maître',
      text: s => ({
        league: 'Yohann sourit. « Je suis entré, je t\'ai vu jouer, et je me suis dit : lui, je vais le garder. »',
        ecouteurs: 'Yohann éclate de rire. « Six mois pour deux bouts de plastique. On a rattrapé le temps perdu, je crois. Quinze ans, ça compense. »',
        gank: '« Je venais », proteste Yohann. Puis il baisse les yeux. « Bon. Pas souvent. Mais là, je viendrai. Je l\'ai juré au spectre. »'
      })[s.tags[0]] + `\n\nIl fait tourner sa bière entre ses mains. « Tu sais, quand on s'est rencontrés, je n'étais pas bien malin. Toi, tu étais déjà [[Socrate]]. Tu lisais, tu réfléchissais, tu avais toujours un coup d'avance. »\n\n« Et puis j'ai grandi. Quinze ans à côté de toi, forcément, ça déteint. Il paraît même que, certains soirs, tu le dis à demi-mot… que l'élève est en train de dépasser le maître. »\n\nIl te regarde, l'œil malicieux. « Alors ? Tu le dis, ce soir ? À voix haute ? »`,
      choices: () => [
        { label: '« L\'élève a dépassé le maître. »', sub: 'Le dire enfin. À voix haute.', tag: 'dit' },
        { label: '« Disons… qu\'il le talonne. »', sub: 'Faut pas exagérer non plus.', tag: 'talonne' },
        { label: '« Il n\'y a jamais eu de maître. Juste deux voleurs. »', sub: 'La réponse du philosophe.', tag: 'egal' }
      ]
    },
    {
      title: 'Le Dernier Sceau',
      text: s => ({
        dit: 'Yohann ne dit rien pendant un long moment. Puis il lève sa bière vers le ciel. « Je l\'ai entendu. Stanley aussi. C\'est officiel. »',
        talonne: '« Il le talonne », répète Yohann, ravi. « Je prends. Venant de toi, c\'est un discours. »',
        egal: 'Yohann hoche la tête, lentement. « Juste deux voleurs. » Il trinque. « C\'est la plus belle chose qu\'on m\'ait dite depuis les écouteurs. »'
      })[s.tags[1]] + `\n\nPuis il sort de sa poche un dernier parchemin, roulé serré, scellé de cire rouge.\n\n« Celui-là, je l'ai gardé pour la fin. Il ne s'ouvre qu'avec la carte complète. Les cinq fragments, [[${h.name}]]. Le cimetière, le tribunal, la taverne, le palais… et le QG. »\n\nIl pose sur la table le cinquième morceau de la carte, celui où une grande croix rouge marque le QG.`,
      cta: 'Réunir les fragments'
    }
  ];

  await ritual({
    kicker: '4 novembre. La veille du monde nouveau.',
    title: 'Porte V',
    to: `Pour Aurélien, dit <b>${esc(h.name)}</b>`,
    text: 'Demain, à minuit, le monde renaît.\n\nCe soir, il n\'y a plus de spectre, plus de procès, plus de Carlotta à amadouer. Juste deux voleurs, deux bières, et un dernier sceau.'
  });
  revealAll();

  /* ---------- La carte ---------- */
  function showMap(scroll) {
    $('#mapSec').classList.remove('hidden');
    const have = new Set(frags());
    $('#mapBox').innerHTML = mapSVG([...have], false);
    const miss = [1, 2, 3, 4, 5].filter(n => !have.has(n));
    const box = $('#missing');
    if (!miss.length || store.get('gs_j5_double', false)) {
      box.innerHTML = `<p class="hint" style="font-size:17px">${miss.length ? 'Avec le double de Yohann, la carte est complète.' : '<b>LA CARTE EST COMPLÈTE.</b> La croix rouge marque le QG.'}</p>`;
      showFinal(scroll);
    } else {
      box.innerHTML = `<div class="panel" style="margin-top:14px"><p style="text-align:center">Il te manque ${miss.length} fragment${miss.length > 1 ? 's' : ''} :</p>
        <div class="btn-row" style="margin-top:12px">${miss.map(n => `<a class="btn dark small" href="${withApercu(DOORS[n - 1].url)}">Porte ${ROMAN5[n - 1]}</a>`).join('')}</div>
        <p style="text-align:center;margin-top:14px;font-size:15px;font-style:italic">Ou alors…</p>
        <div class="btn-row" style="margin-top:8px"><button class="btn ink small" id="askDouble">Demander son double à Yohann</button></div></div>`;
      $('#askDouble').addEventListener('click', () => {
        Sound.click(); store.set('gs_j5_double', true);
        toast('Yohann soupire, fouille sa sacoche… et sort une copie de la carte. « Évidemment que j\'avais un double. »', 4500);
        setTimeout(() => showMap(true), 600);
      });
    }
    if (scroll) setTimeout(() => $('#mapSec').scrollIntoView({ behavior: 'smooth' }), 150);
  }

  /* ---------- Le dernier sceau ---------- */
  function showFinal(scroll) {
    $('#finalSec').classList.remove('hidden');
    if (store.get('gs_j5_opened', false)) { openReveal(false); return; }
    if (scroll) setTimeout(() => $('#finalSec').scrollIntoView({ behavior: 'smooth', block: 'start' }), 1400);
  }
  let opening = false;
  $('#finalSeal').addEventListener('click', async () => {
    if (opening) return; opening = true; Sound.init();
    const b = $('#finalSeal'); b.classList.add('cracking'); Sound.crack();
    if (navigator.vibrate) try { navigator.vibrate([40, 60, 80]); } catch (e) {}
    const r = b.getBoundingClientRect(); Embers.burst(r.left + r.width / 2, r.top + r.height / 2, 90, true);
    await sleep(320); b.classList.remove('cracking'); b.classList.add('broken');
    await sleep(700); store.set('gs_j5_opened', true); Sound.secret();
    openReveal(true);
  });

  function openReveal(anim) {
    $('#finalSealWrap').classList.add('hidden');
    const el = $('#reveal'); el.classList.remove('hidden');
    el.innerHTML = `
      <figure class="polaroid ${anim ? 'drop' : ''}"><img src="duo.jpg?v=1" alt="Yohann et Aurélien" width="1000" height="750"><figcaption>Get Sauced & Get Socrated</figcaption></figure>
      <div class="parch voice-card ${anim ? 'rise' : ''}">
        <p class="kick">Message scellé de Get Sauced</p>
        <div class="player" id="player">
          <button class="play" id="playBtn" aria-label="Écouter le message"><svg viewBox="0 0 24 24" id="playIco"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></button>
          <div class="pmeta"><div class="bars" id="bars">${'<i></i>'.repeat(22)}</div>
            <div class="ptrack" id="ptrack"><i id="pfill"></i></div><div class="ptime"><span id="pcur">0:00</span><span id="pdur">0:25</span></div></div>
        </div>
        <audio id="voice" preload="auto" playsinline><source src="message.mp3?v=1" type="audio/mpeg"><source src="message.m4a?v=1" type="audio/mp4"></audio>
      </div>
      <div class="parch epilogue hidden" id="finale"></div>`;
    const a = $('#voice'), btn = $('#playBtn');
    const fmt = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
    const setIco = playing => { $('#playIco').innerHTML = playing ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/>' : '<path d="M8 5v14l11-7z" fill="currentColor"/>'; $('#player').classList.toggle('on', playing); };
    btn.addEventListener('click', () => {
      Sound.init();
      if (a.paused) { a.play().then(() => {}).catch(() => toast('Touche encore une fois pour lancer le message.')); }
      else a.pause();
    });
    a.addEventListener('play', () => { setIco(true); Sound.duck(true); });
    a.addEventListener('pause', () => { setIco(false); Sound.duck(false); });
    a.addEventListener('loadedmetadata', () => { if (isFinite(a.duration)) $('#pdur').textContent = fmt(a.duration); });
    a.addEventListener('timeupdate', () => { $('#pcur').textContent = fmt(a.currentTime); if (a.duration) $('#pfill').style.width = (a.currentTime / a.duration * 100) + '%'; });
    a.addEventListener('ended', () => { setIco(false); Sound.duck(false); finale(); });
    $('#ptrack').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); if (a.duration) a.currentTime = (e.clientX - r.left) / r.width * a.duration; });
    if (anim) setTimeout(() => $('#reveal').scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    if (store.get('gs_j5_heard', false)) finale(true);
    else setTimeout(() => { if (a.paused && !a.currentTime) finale(); }, 45000);
  }

  let finaleShown = false;
  async function finale(instant) {
    if (finaleShown) return; finaleShown = true; store.set('gs_j5_heard', true);
    const el = $('#finale'); el.classList.remove('hidden');
    const txt = `La croix rouge sur la carte ne marque pas un trésor. Elle marque un rendez-vous.\n\n[[Ce soir. Minuit. Au QG.]]\n\nDeux voleurs, un monde neuf, et quinze ans d'amitié dans les poches. Le reste, on l'écrira ensemble.`;
    if (instant) { el.innerHTML = txt.split('\n\n').map(p => `<p>${esc(p).replace(/\[\[(.*?)\]\]/g, '<span class="hl">$1</span>')}</p>`).join('') + countdownHTML(); tickCd(); return; }
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    await typeInto(el, txt, { speed: 30 });
    el.insertAdjacentHTML('beforeend', countdownHTML()); tickCd();
    Sound.fanfare(); Embers.burst(innerWidth / 2, innerHeight / 2, 80);
  }
  function countdownHTML() {
    return `<div class="final-cd"><p class="kick">Ouverture du monde dans</p><p class="big-cd" id="finalCd">—</p>
      <div class="btn-row" style="margin-top:16px"><a class="btn gold" href="${backLink().replace('#portes', '')}">Retour au parchemin</a></div></div>`;
  }
  let cdTimer = null;
  function tickCd() {
    const f = () => { const ms = LAUNCH - Date.now(); const el = $('#finalCd'); if (!el) return; el.textContent = ms > 0 ? fmtLeft(ms) : 'C\'est l\'heure. Connecte-toi.'; };
    f(); clearInterval(cdTimer); cdTimer = setInterval(f, 1000);
  }

  /* ---------- Déroulé ---------- */
  const afterStory = scroll => { if (!frags().includes(5)) { const have = new Set(frags()); have.add(5); store.set('gs_frags', [...have].sort()); } showMap(scroll); };
  const playStory = async () => {
    $('#replayRow').classList.add('hidden');
    await Story($('#storyRoot'), SCENES, {});
    store.set('gs_j5', true); $('#replayRow').classList.remove('hidden');
    Sound.secret(); Embers.burst(innerWidth / 2, innerHeight / 2, 60);
    toast('Fragment V obtenu : le QG.', 3000);
    afterStory(true);
  };
  $('#replayBtn').addEventListener('click', () => { Sound.click(); playStory(); });
  if (store.get('gs_j5', false)) {
    $('#storyRoot').innerHTML = `<div class="parch fable-card"><div class="fable-intro"><p>Le toit, deux bières, et un dernier sceau. La nuit t'attend toujours.</p></div></div>`;
    $('#replayRow').classList.remove('hidden'); afterStory(false);
  } else playStory();
})();
