'use strict';
/* Porte V — La Veillée d'Armes (4 novembre) : en préparation */
(async () => {
  if (!gate(5)) return;
  $('#headSeal').innerHTML = sealSVG();
  $('#content').innerHTML = `<section><div class="panel" style="text-align:center"><h3>La Veillée se prépare…</h3><p style="margin-top:10px">Yohann forge encore cette dernière porte. Reviens bientôt.</p></div></section>${doorFooter(5)}`;
  document.body.classList.remove('locked'); $('#app').classList.add('show'); $('#app').removeAttribute('aria-hidden');
})();
