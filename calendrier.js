'use strict';
/* Calendrier des Ombres : dates des Portes et carte (partagé par toutes les pages) */
const DOORS = [
  { n: 1, at: Date.UTC(2026, 9, 31, 9), url: 'jour1.html', title: 'La Nuit des Morts', day: 'samedi 31 octobre' },
  { n: 2, at: Date.UTC(2026, 10, 1, 9), url: 'jour2.html', title: 'Le Procès des Écouteurs', day: 'dimanche 1er novembre' },
  { n: 3, at: Date.UTC(2026, 10, 2, 9), url: 'jour3.html', title: 'Le 10 000 des Ombres', day: 'lundi 2 novembre' },
  { n: 4, at: Date.UTC(2026, 10, 3, 9), url: 'jour4.html', title: 'La Rançon de Carlotta', day: 'mardi 3 novembre' },
  { n: 5, at: Date.UTC(2026, 10, 4, 9), url: 'jour5.html', title: 'La Veillée d\'Armes', day: 'mercredi 4 novembre' }
];
const ROMAN5 = ['I', 'II', 'III', 'IV', 'V'];

/* ---- Fragments de la carte ---- */
const MAP_STOPS = ['Le Cimetière', 'Le Tribunal', 'La Taverne de Stanley', 'Le Palais de Carlotta', 'Le QG'];
const MAP_LABELS = [['Le Cimetière'], ['Le Tribunal'], ['La Taverne', 'de Stanley'], ['Le Palais', 'de Carlotta']];
function mapSVG(have, big) {
  const hv = new Set(have);
  const strip = i => `<clipPath id="mc${i}${big ? 'b' : ''}"><rect x="${i * 100}" y="0" width="100" height="300"/></clipPath>`;
  const art = `
    <rect width="500" height="300" fill="#e6cf9c"/>
    <path d="M0 40 Q60 20 120 50 T260 30 T400 55 T500 35 L500 0 L0 0Z" fill="#9ab7c9" opacity=".7"/>
    <path d="M0 260 Q80 240 150 275 T320 260 T500 270 L500 300 L0 300Z" fill="#9ab7c9" opacity=".6"/>
    <path d="M30 120 Q120 90 160 160 T300 140 T420 190 T470 120" fill="none" stroke="#5a7da0" stroke-width="5" opacity=".55"/>
    ${[[60, 200], [80, 210], [230, 90], [250, 100], [270, 85], [370, 230], [390, 222]].map(([x, y]) => `<path d="M${x - 12} ${y + 10} L${x} ${y - 12} L${x + 12} ${y + 10}Z" fill="#8a6a3a" opacity=".8"/>`).join('')}
    ${[[150, 230], [162, 238], [140, 242], [330, 70], [342, 78], [320, 82]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#5e7a3a" opacity=".75"/>`).join('')}
    <path d="M40 150 C90 120 110 190 150 170 S220 120 250 160 S330 210 350 170 S420 110 455 150" fill="none" stroke="#7a120f" stroke-width="3.5" stroke-dasharray="9 7"/>
    ${[[50, 150], [150, 172], [250, 160], [350, 172]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="8" fill="#2b1709"/>` + MAP_LABELS[i].map((l, k) => `<text x="${x}" y="${y + 28 + k * 14}" font-family="Cinzel,serif" font-size="11.5" font-weight="700" text-anchor="middle" fill="#2b1709">${l}</text>`).join('')).join('')}
    <g transform="translate(455 150)"><path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke="#a51d17" stroke-width="7" stroke-linecap="round"/></g>
    <text x="455" y="185" font-family="Cinzel,serif" font-size="13" font-weight="900" text-anchor="middle" fill="#a51d17">LE QG</text>
    <text x="455" y="200" font-family="Cinzel,serif" font-size="9" text-anchor="middle" fill="#2b1709">5 nov. · minuit</text>
    <text x="50" y="62" font-family="IM Fell English,serif" font-style="italic" font-size="12" text-anchor="middle" fill="#2b1709">Départ :</text><text x="50" y="77" font-family="IM Fell English,serif" font-style="italic" font-size="12" text-anchor="middle" fill="#2b1709">Jardin du Golfe</text>`;
  return `<svg viewBox="0 0 500 300" class="map-svg" role="img" aria-label="Carte des Ombres"><defs>${[0, 1, 2, 3, 4].map(strip).join('')}</defs>
    <rect width="500" height="300" fill="#1a0f08"/>
    ${[0, 1, 2, 3, 4].map(i => hv.has(i + 1) ? `<g clip-path="url(#mc${i}${big ? 'b' : ''})">${art}</g>` : `<g><rect x="${i * 100 + 3}" y="3" width="94" height="294" fill="#2a1a10" stroke="#7d5f27" stroke-dasharray="4 4"/><text x="${i * 100 + 50}" y="160" font-family="Cinzel Decorative,serif" font-size="40" text-anchor="middle" fill="#7d5f27">?</text><text x="${i * 100 + 50}" y="190" font-family="Cinzel,serif" font-size="11" text-anchor="middle" fill="#7d5f27">Porte ${ROMAN5[i]}</text></g>`).join('')}
    ${[1, 2, 3, 4].map(i => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="300" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`).join('')}
  </svg>`;
}
