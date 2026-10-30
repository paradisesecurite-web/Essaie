'use strict';
/* Porte II — Le Procès des Écouteurs (1er novembre) */
(async () => {
  if (!gate(2)) return;
  $('#headSeal').innerHTML = sealSVG();
  const h = hero();
  $('#content').innerHTML = `
    <section id="story"><div class="sec-head"><span class="sec-num">I</span><h2>La Fable</h2><p>Affaire Sauce contre Socrate. Quinze ans plus tard.</p></div>
      <div id="storyRoot"></div><div id="replayRow" class="btn-row hidden" style="margin-top:14px"><button class="btn dark small" id="replayBtn">Revivre le procès</button></div></section>
    <section id="quizSec" class="hidden"><div class="sec-head"><span class="sec-num">II</span><h2>L'Épreuve du Frère</h2><p>Dix questions. Seul le vrai Socrate peut toutes les réussir.</p></div>
      <div class="parch quiz" id="quiz"></div></section>
    ${doorFooter(2)}`;

  const SCENES = [
    {
      title: 'La Cour des Ombres',
      text: () => `Dans la cave d'une taverne, entre deux tonneaux, siège la [[Cour des Ombres]]. Au perchoir, le [[Juge Hibou]], magistrat à plumes, ajuste ses lunettes. Au premier rang, le plaignant : [[Get Sauced]], bras croisés, regard noir.\n\nEt sur le banc des accusés… toi, [[${h.name}]].\n\nLe greffier, un kobold enroué, déroule l'acte d'accusation : « Affaire Sauce contre Socrate. Jardin du Golfe, il y a quinze ans. Une voiture de voisine. Une paire d'écouteurs, propriété de la copine du plaignant. Montée dans la voiture avec l'accusé. Jamais revue. »\n\nLe Juge Hibou se tourne vers toi. « Que plaide l'accusé ? »`,
      choices: () => [
        { label: '« Je le jure sur la tête de ma mère ! »', sub: 'La défense classique. Et sincère.', tag: 'mere' },
        { label: '« J\'ai exactement les mêmes, Votre Honneur. »', sub: 'Techniquement, c\'était vrai.', tag: 'memes' },
        { label: '« Objection ! Je ne sais même pas ce qu\'est un écouteur. »', sub: 'Audacieux. Peu crédible.', tag: 'objection' }
      ]
    },
    {
      title: 'Six Mois de Silence',
      text: s => ({
        mere: 'Un murmure parcourt la salle. On ne plaisante pas avec la tête d\'une mère. Le Juge Hibou note quelque chose, puis hulule, perplexe.',
        memes: '« Les mêmes », répète le Juge Hibou. « Quelle coïncidence. » Il plisse les yeux si fort que ses lunettes tombent.',
        objection: '« Rejetée », hulule le Juge Hibou. « Vous en portez une paire autour du cou en ce moment même. » Ah. Oui. Effectivement.'
      })[s.tags[0]] + `\n\nLe plaignant se lève et raconte. [[Six mois.]] Six mois à se croiser dans l'escalier du Jardin du Golfe sans un mot. Six mois de regards noirs, de portes claquées, de « bonjour » qui n'en étaient pas. Pour deux bouts de plastique.\n\n« Votre Honneur », conclut Yohann, « je demande la vérité. Et des excuses. Et éventuellement une bière. »\n\nLe Juge Hibou se tourne vers toi. « La défense souhaite-t-elle appeler un témoin ? »`,
      choices: () => [
        { label: 'Appeler la voisine au volant.', sub: 'Elle a tout vu. Enfin, elle conduisait.', tag: 'voisine' },
        { label: 'Appeler… le canapé de l\'accusé.', sub: 'Personne ne comprend ce choix. Pour l\'instant.', tag: 'canape' },
        { label: 'Appeler Stanley.', sub: 'Il ne parle pas, mais il réchauffe l\'ambiance.', tag: 'stanley' }
      ]
    },
    {
      title: 'Le Coussin de la Vérité',
      text: s => ({
        voisine: 'La voisine s\'avance, mâche son chewing-gum et déclare : « Moi, je conduisais. Les écouteurs, je sais pas. Par contre, son canapé, il était vraiment pas propre. »',
        canape: 'Deux huissiers apportent ton canapé dans la salle d\'audience. Il ne dit rien. Les canapés ne disent jamais rien. C\'est bien ça le problème.',
        stanley: 'On amène Stanley à la barre. Il ronronne, il chauffe, il ne dit rien. La salle se détend de deux degrés. Puis quelqu\'un remarque qu\'il est posé juste à côté de ton canapé.'
      })[s.tags[1]] + `\n\nUn huissier gnome s'approche de ton canapé. Il glisse la main sous un coussin… et brandit quelque chose au-dessus de sa tête.\n\nSilence total dans la salle.\n\n[[Les écouteurs.]] Là depuis six mois. Juste sous tes fesses.\n\nTous les regards se tournent vers toi.`,
      choices: () => [
        { label: 'Appeler Yohann sur-le-champ pour t\'excuser.', sub: 'Ce que tu as vraiment fait. À l\'époque. Tout de suite.', tag: 'appel' },
        { label: 'Accuser le coussin.', sub: '« Il est complice, Votre Honneur. »', tag: 'coussin' },
        { label: 'Offrir une tournée générale.', sub: 'La justice a soif.', tag: 'tournee' }
      ]
    },
    {
      title: 'Le Verdict',
      text: s => ({
        appel: 'Tu sors ton téléphone, là, en pleine audience, et tu appelles Yohann, qui est à trois mètres de toi. Il décroche quand même. « Pardon, mon frère. Je m\'en veux à mort. »',
        coussin: '« Le coussin est condamné à être retourné », tranche le Juge Hibou. Puis il te regarde par-dessus ses lunettes. « Et vous, appelez-le. » Tu appelles Yohann. « Pardon, mon frère. Je m\'en veux à mort. »',
        tournee: 'La salle applaudit. Le Juge Hibou commande un hydromel. Puis il te regarde par-dessus son verre. « Et maintenant, appelez-le. » Tu appelles Yohann. « Pardon, mon frère. Je m\'en veux à mort. »'
      })[s.tags[2]] + `\n\nLe Juge Hibou abat son marteau. « Verdict : coupable… d'avoir été de bonne foi. Et d'avoir appelé tout de suite. La Cour retient que ce coup de fil a ouvert quinze ans d'amitié. »\n\nYohann se lève, le sourire en coin. « Sans ces écouteurs, on ne se serait peut-être jamais vraiment parlé. »\n\nMais la Cour n'en a pas tout à fait fini. Pour clore l'affaire, l'accusé doit prouver qu'il connaît vraiment le plaignant. C'est [[l'Épreuve du Frère]].`,
      cta: 'Passer l\'Épreuve'
    }
  ];

  const Q = [
    ['Où vous êtes-vous rencontrés ?', ['Au Jardin du Golfe', 'Dans un bar à bières', 'Sur un serveur de WoW', 'À la taverne du Cochon Borgne'], 'Voisins de palier. Le destin a un sens de l\'humour.'],
    ['À quoi jouais-tu la première fois que Yohann est monté chez toi ?', ['League of Legends', 'World of Warcraft', 'Mario Kart', 'Au 10 000'], 'Le contact a accroché direct.'],
    ['Quel était le poste de Yohann sur League of Legends ?', ['Jungler', 'Support', 'Mid', 'Spectateur'], 'Jungler. Officiellement.'],
    ['Que réclamais-tu sans jamais l\'obtenir ?', ['Des ganks', 'Des soins', 'Une bière', 'Des excuses'], 'D\'où le nom : Get Sauced. Tu t\'es pris la Sauce.'],
    ['Combien de temps vous êtes-vous fait la gueule pour les écouteurs ?', ['Six mois', 'Deux semaines', 'Un an', 'Trois jours'], 'Six mois. Pour deux bouts de plastique.'],
    ['Où se cachaient les écouteurs ?', ['Sous un coussin du canapé', 'Dans la voiture de la voisine', 'Dans ta poche', 'Chez ta mère'], 'Juste sous tes fesses. Six mois.'],
    ['Qui est Stanley ?', ['Le radiateur de chantier de Yohann', 'Le chat de Yohann', 'Ton manager', 'Un orc de la guilde'], 'Ton meilleur ami chez Yohann. Il chauffe, il écoute, il ne juge pas.'],
    ['Comment s\'appelait ta guilde, quand tu jouais druide ?', ['Harmony', 'Les Ombres', 'Sauce Nation', 'Les Druides du Golfe'], 'Guild master, en plus. Respect.'],
    ['Le jeu de dés chez les parents de Yohann ?', ['Le 10 000', 'Le 421', 'Le Yams', 'Le poker menteur'], 'Et tu veux en changer les règles à chaque partie. Tu verras demain.'],
    ['Comment Charlotte adore-t-elle qu\'on l\'appelle ?', ['Carlotta', 'Charlie', 'Lolotte', 'Sa Majesté'], 'Note-le bien. Ça servira mardi.']
  ];
  const RANKS = [[10, 'Âme sœur de la Confrérie', 'Dix sur dix. Yohann est ému. Il ne le dira pas, mais il est ému.'], [8, 'Frère de sang', 'Presque parfait. Le Juge Hibou te salue.'], [5, 'Frère d\'armes', 'Pas mal. Mais Yohann va te réexpliquer deux ou trois choses autour d\'une bière.'], [0, 'Frère en probation', 'Aïe. Six mois de silence, ça te dit quelque chose ?']];

  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function runQuiz() {
    const box = $('#quiz'); let i = 0, good = 0;
    function show() {
      const [q, answers, com] = Q[i], right = answers[0];
      box.innerHTML = `<div class="qnum"><span>Question ${i + 1} / ${Q.length}</span><span>${good} ✔</span></div><div class="bar"><i style="width:${i / Q.length * 100}%"></i></div>
        <p class="qtxt">${esc(q)}</p><div id="answers"></div><p class="com" id="com"></p>`;
      shuffle(answers).forEach(a => {
        const b = document.createElement('button'); b.className = 'ans'; b.textContent = a;
        b.addEventListener('click', () => {
          $$('.ans', box).forEach(x => { x.disabled = true; if (x.textContent === right) x.classList.add('good'); });
          if (a === right) { good++; Sound.coin(); $('#com').textContent = '✔ ' + com; }
          else { b.classList.add('bad'); Sound.deny(); $('#com').textContent = '✘ C\'était : ' + right + '. ' + com; }
          setTimeout(() => { i++; i < Q.length ? show() : end(); }, 2300);
        });
        $('#answers').appendChild(b);
      });
    }
    function end() {
      const [, title, line] = RANKS.find(r => good >= r[0]);
      const best = Math.max(good, store.get('gs_j2_best', 0)); store.set('gs_j2_best', best);
      box.innerHTML = `<p class="qnum" style="justify-content:center">Verdict de l'Épreuve</p><p class="qtxt" style="text-align:center;font-size:44px">${good} / ${Q.length}</p>
        <h3 style="text-align:center;font-family:var(--ff-title);color:var(--blood);font-size:26px">${title}</h3><p style="text-align:center;margin-top:10px;font-style:italic">${line}</p>
        <div class="btn-row" style="margin-top:18px"><button class="btn ink small" id="quizAgain">Repasser l'Épreuve</button></div>`;
      $('#quizAgain').addEventListener('click', () => { Sound.click(); runQuiz(); });
      Sound.fanfare();
      const first = !frags().includes(2);
      setTimeout(() => giveFragment(2), first ? 1400 : 99999999);
    }
    show();
  }

  await ritual({
    kicker: '1er novembre. La Cour des Ombres est en session.',
    title: 'Porte II',
    to: `Pour Aurélien, dit <b>${esc(h.name)}</b>`,
    text: 'Une vieille affaire refait surface. Six mois de silence, une paire d\'écouteurs, un canapé.\n\nLa Cour des Ombres te convoque. Prépare ta défense.',
    from: '— Get Sauced, plaignant'
  });
  revealAll();

  const showQuiz = () => { $('#quizSec').classList.remove('hidden'); runQuiz(); };
  const playStory = async () => {
    $('#replayRow').classList.add('hidden');
    await Story($('#storyRoot'), SCENES, {});
    store.set('gs_j2', true); $('#replayRow').classList.remove('hidden');
    showQuiz(); setTimeout(() => $('#quizSec').scrollIntoView({ behavior: 'smooth' }), 100);
  };
  $('#replayBtn').addEventListener('click', () => { Sound.click(); playStory(); });
  if (store.get('gs_j2', false)) {
    $('#storyRoot').innerHTML = `<div class="parch fable-card"><div class="fable-intro"><p>L'affaire est jugée. Mais l'Épreuve du Frère peut toujours être repassée.</p></div></div>`;
    $('#replayRow').classList.remove('hidden'); showQuiz();
  } else playStory();
})();
