/* Éléments partagés injectés dans chaque Porte */
document.body.insertAdjacentHTML('afterbegin', `
<canvas id="embers" aria-hidden="true"></canvas>
<button id="muteBtn" aria-label="Couper le son"></button>
<div id="toast" role="status" aria-live="polite"></div>
<div id="modal" role="dialog" aria-modal="true"><div class="modal-card parch" id="modalCard"><button class="x" id="modalX" aria-label="Fermer">×</button><div id="modalBody"></div></div></div>`);
'use strict';
/* Briques communes aux Portes du Calendrier des Ombres */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const TARGET = Date.UTC(2026, 10, 4, 23, 0, 0); // 5 nov. 2026 00:00 heure de Paris
const IS_TOUCH = matchMedia('(pointer: coarse)').matches;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PARAMS = new URLSearchParams(location.search);
/* ---------------- Sceau de cire (SVG + canvas) ---------------- */
function wobblyCircle(cx, cy, r) {
  let d = '';
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2;
    const rr = r + Math.sin(a * 7) * 3 + Math.sin(a * 13 + 1) * 2.2 + Math.sin(a * 3 + 2) * 2.4;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1);
  }
  return d + 'Z';
}
const SEAL_D = wobblyCircle(100, 100, 90);
const DAGGER_D = 'M100 30 L107 100 L100 108 L93 100 Z M80 100 h40 v8 h-40 Z M96 108 h8 v26 h-8 Z M93 140 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0 Z';
let sealUid = 0;
function sealSVG() {
  const u = 's' + (sealUid++);
  const dag = rot => `<g transform="rotate(${rot} 100 100) translate(0 -2)">
    <path d="${DAGGER_D}" fill="rgba(40,0,0,.55)" transform="translate(2 2)"/>
    <path d="${DAGGER_D}" fill="rgba(255,190,170,.35)" transform="translate(-1.2 -1.2)"/>
    <path d="${DAGGER_D}" fill="#9a1a14"/></g>`;
  return `<svg viewBox="0 0 200 200" class="seal-svg" aria-hidden="true"><defs>
    <radialGradient id="g${u}" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#dc4b3c"/><stop offset=".45" stop-color="#a51d17"/><stop offset="1" stop-color="#4d0705"/></radialGradient>
    <path id="t${u}" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs>
    <path d="${SEAL_D}" fill="url(#g${u})"/>
    <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(50,0,0,.35)" stroke-width="2"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="rgba(40,0,0,.5)" stroke-width="4"/>
    <circle cx="98.5" cy="98.5" r="64" fill="none" stroke="rgba(255,170,150,.28)" stroke-width="1.4"/>
    <text font-family="Cinzel, serif" font-weight="700" font-size="12.5" fill="rgba(45,0,0,.6)" letter-spacing="1"><textPath href="#t${u}" textLength="455">GET SAUCED ✦ GET SOCRATED ✦ </textPath></text>
    ${dag(-38)}${dag(38)}
    <ellipse cx="70" cy="58" rx="28" ry="13" fill="rgba(255,255,255,.17)" transform="rotate(-32 70 58)"/>
  </svg>`;
}
function drawSeal(c, x, y, size, rotDeg = 0) {
  const s = size / 200;
  c.save(); c.translate(x, y); c.rotate(rotDeg * Math.PI / 180); c.scale(s, s); c.translate(-100, -100);
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
  const g = c.createRadialGradient(76, 64, 5, 100, 100, 150);
  g.addColorStop(0, '#dc4b3c'); g.addColorStop(.45, '#a51d17'); g.addColorStop(1, '#4d0705');
  c.fillStyle = g; c.fill(new Path2D(SEAL_D));
  c.shadowColor = 'transparent';
  c.lineWidth = 4; c.strokeStyle = 'rgba(40,0,0,.5)'; c.beginPath(); c.arc(100, 100, 64, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,170,150,.3)'; c.beginPath(); c.arc(98.5, 98.5, 64, 0, Math.PI * 2); c.stroke();
  const txt = 'GET SAUCED ✦ GET SOCRATED ✦ ';
  c.font = '700 12.5px Cinzel, serif'; c.fillStyle = 'rgba(45,0,0,.6)'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < txt.length; i++) {
    const a = -Math.PI + i / txt.length * Math.PI * 2;
    c.save(); c.translate(100 + Math.cos(a) * 74, 100 + Math.sin(a) * 74); c.rotate(a + Math.PI / 2); c.fillText(txt[i], 0, 0); c.restore();
  }
  const dp = new Path2D(DAGGER_D);
  [-38, 38].forEach(r => {
    c.save(); c.translate(100, 100); c.rotate(r * Math.PI / 180); c.translate(-100, -102);
    c.save(); c.translate(2, 2); c.fillStyle = 'rgba(40,0,0,.55)'; c.fill(dp); c.restore();
    c.save(); c.translate(-1.2, -1.2); c.fillStyle = 'rgba(255,190,170,.35)'; c.fill(dp); c.restore();
    c.fillStyle = '#9a1a14'; c.fill(dp); c.restore();
  });
  c.save(); c.translate(70, 58); c.rotate(-32 * Math.PI / 180); c.fillStyle = 'rgba(255,255,255,.17)'; c.beginPath(); c.ellipse(0, 0, 28, 13, 0, 0, Math.PI * 2); c.fill(); c.restore();
  c.restore();
}

/* =========================================================
   SON — tout est généré en Web Audio
   ========================================================= */
const Sound = (() => {
  let ctx = null, master, musicBus, sfxBus, verb, noiseBuf, comp;
  let muted = store.get('gs_mute', false), started = false, schedTimer = null, crackTimer = null;
  let nextT = 0, step = 0, melody = 74;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function silentWavURL() {
    const n = 4000, buf = new Uint8Array(44 + n), v = new DataView(buf.buffer);
    const w = (o, s) => [...s].forEach((ch, i) => buf[o + i] = ch.charCodeAt(0));
    w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    w(36, 'data'); v.setUint32(40, n, true); buf.fill(128, 44);
    let s = ''; buf.forEach(b => s += String.fromCharCode(b));
    return 'data:audio/wav;base64,' + btoa(s);
  }
  function init() {
    if (ctx) { if (ctx.state === 'suspended' && !muted) ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ctx = new AC(); } catch (e) { return; }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { // iPhone en mode silencieux : un <audio> muet débloque le son
      const a = new Audio(silentWavURL()); a.loop = true; a.setAttribute('playsinline', ''); a.volume = 0.01; a.play().catch(() => {});
    } catch (e) {}
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    comp.connect(master); master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.75; sfxBus.connect(comp);
    verb = ctx.createConvolver(); verb.buffer = impulse(3);
    const vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg); vg.connect(comp);
    musicBus.connect(verb);
    const sv = ctx.createGain(); sv.gain.value = 0.25; sfxBus.connect(sv); sv.connect(verb);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (ctx.state === 'suspended') ctx.resume();
  }
  function impulse(sec) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    return b;
  }
  function tone(f, dur, o = {}) {
    if (!ctx) return;
    const t0 = o.at != null ? o.at : ctx.currentTime + (o.t || 0);
    const osc = ctx.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    if (o.det) osc.detune.value = o.det;
    const g = ctx.createGain(); const a = o.a || 0.005;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.g || 0.2, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node = osc;
    if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t0); if (o.lp2) fl.frequency.exponentialRampToValueAtTime(o.lp2, t0 + dur); osc.connect(fl); node = fl; }
    node.connect(g); g.connect(o.dest || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
    if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.2; lg.gain.value = o.vib; l.connect(lg); lg.connect(osc.frequency); l.start(t0); l.stop(t0 + dur + .05); }
  }
  function noise(dur, o = {}) {
    if (!ctx) return;
    const t0 = o.at != null ? o.at : ctx.currentTime + (o.t || 0);
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 1000, t0);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + dur);
    const g = ctx.createGain(); const a = o.a || 0.004;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.g || 0.2, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || sfxBus);
    src.start(t0, Math.random() * 1.5); src.stop(t0 + dur + 0.05);
  }

  /* ---- Musique de taverne générative (ré mineur) ---- */
  const BPM = 78, E8 = 60 / BPM / 2;
  const PROG = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [50, 53, 57], [53, 57, 60], [48, 52, 55], [46, 50, 53], [45, 49, 52]];
  const SCALE = [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81];
  function pluck(m, at, g = 0.09) {
    const f = mtof(m);
    tone(f, 1.4, { at, type: 'triangle', g, lp: 3200, lp2: 500, dest: musicBus });
    tone(f * 2, 0.35, { at, type: 'sine', g: g * 0.35, dest: musicBus });
  }
  function bass(m, at, dur) { tone(mtof(m), dur, { at, type: 'sine', g: 0.16, a: 0.02, dest: musicBus }); tone(mtof(m) * 2, dur * .6, { at, type: 'triangle', g: .03, dest: musicBus }); }
  function pad(ch, at, dur) { ch.forEach((m, i) => tone(mtof(m), dur, { at, type: 'sawtooth', g: 0.018, a: 0.9, lp: 700, det: i * 4 - 4, dest: musicBus })); }
  function flute(m, at, dur) { tone(mtof(m), dur, { at, type: 'sine', g: 0.07, a: 0.08, vib: 4, dest: musicBus }); tone(mtof(m) * 2, dur, { at, type: 'sine', g: 0.008, a: 0.1, dest: musicBus }); }
  function playStep(i, at) {
    const bar = Math.floor(i / 8) % PROG.length, pos = i % 8, ch = PROG[bar];
    if (pos === 0) { bass(ch[0] - 12, at, E8 * 7.5); pad(ch, at, E8 * 8.4); }
    if (pos === 5 && Math.random() < .5) bass(ch[0] - 12 + 7, at, E8 * 2.5);
    const arp = [0, 1, 2, 1, 0, 2, 1, 2];
    if (Math.random() < 0.88) pluck(ch[arp[pos]] + (pos % 4 === 2 ? 12 : 0), at, pos % 2 ? 0.06 : 0.085);
    const phrase = Math.floor(i / 16) % 4;
    if (phrase !== 3 && (pos % 2 === 0) && Math.random() < 0.55) {
      if (pos === 0) { const tgt = ch.map(c => c + 24).filter(c => c >= 62 && c <= 81); melody = tgt.reduce((a, b) => Math.abs(b - melody) < Math.abs(a - melody) ? b : a, tgt[0] || 74); }
      else { let idx = SCALE.indexOf(melody); if (idx < 0) idx = 6; idx = Math.max(0, Math.min(SCALE.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)])); melody = SCALE[idx]; }
      flute(melody, at, E8 * (Math.random() < .4 ? 3.6 : 1.8));
    }
  }
  function schedule() { if (!ctx) return; while (nextT < ctx.currentTime + 0.4) { playStep(step, nextT); nextT += E8; step++; } }
  function drone() {
    [38, 45].forEach((m, i) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = i ? 5 : -5;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 0.07 + i * 0.03; lg.gain.value = 90; l.connect(lg); lg.connect(f.frequency); l.start();
      const g = ctx.createGain(); g.gain.value = 0.03; o.connect(f); f.connect(g); g.connect(musicBus); o.start();
    });
  }
  function crackle() {
    crackTimer = setInterval(() => {
      if (!ctx || muted) return;
      const n = Math.random() < .5 ? 1 : 2;
      for (let k = 0; k < n; k++) noise(0.02 + Math.random() * .03, { t: Math.random() * .12, g: 0.02 + Math.random() * 0.05, type: 'highpass', f: 1800 + Math.random() * 3000, dest: musicBus });
    }, 140);
  }
  function startMusic() {
    if (!ctx || started) return; started = true;
    nextT = ctx.currentTime + 0.15;
    musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 5);
    drone(); crackle(); schedTimer = setInterval(schedule, 90);
  }
  function setMuted(m) {
    muted = m; store.set('gs_mute', m);
    if (!ctx) return;
    master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.08);
    if (!m && ctx.state === 'suspended') ctx.resume();
  }
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume();
  });

  const fx = {
    crack() { noise(.3, { g: .7, type: 'highpass', f: 1500 }); tone(150, .4, { g: .55, f2: 38 }); noise(.1, { t: .07, g: .45, type: 'bandpass', f: 3200, q: 2 }); noise(.08, { t: .16, g: .3, type: 'bandpass', f: 2200, q: 3 }); },
    unroll() { noise(1.7, { g: .14, type: 'bandpass', f: 400, f2: 2400, q: .8, a: .35 }); },
    tick() { tone(1500 + Math.random() * 600, .025, { type: 'square', g: .012 }); },
    click() { tone(560, .09, { type: 'triangle', g: .14, f2: 300 }); },
    slash() { noise(.2, { g: .4, type: 'bandpass', f: 4500, f2: 1100, q: 1.6 }); },
    hit() { tone(115, .2, { g: .45, f2: 48 }); noise(.12, { g: .3, type: 'lowpass', f: 1600 }); },
    crit() { fx.slash(); fx.hit(); tone(1250, .6, { g: .1, t: .02 }); tone(1875, .45, { g: .07, t: .02 }); },
    whoosh() { noise(.35, { g: .3, type: 'bandpass', f: 500, f2: 3200, q: .7, a: .08 }); },
    hurt() { tone(190, .32, { type: 'sawtooth', g: .14, f2: 70, lp: 900 }); noise(.15, { g: .25, type: 'lowpass', f: 900 }); },
    coin() { tone(1318, .14, { type: 'square', g: .05, lp: 4000 }); tone(1760, .4, { type: 'square', g: .05, t: .08, lp: 4000 }); },
    warn() { tone(330, .14, { type: 'triangle', g: .1 }); },
    deny() { tone(150, .14, { type: 'square', g: .05, lp: 800 }); },
    stamp() { tone(95, .3, { g: .65, f2: 38 }); noise(.08, { g: .45, type: 'lowpass', f: 900 }); },
    pop() { noise(.6, { g: .3, type: 'lowpass', f: 2600, f2: 300 }); tone(85, .35, { g: .3, f2: 30 }); for (let i = 0; i < 6; i++) noise(.03, { t: .15 + Math.random() * .5, g: .06, type: 'highpass', f: 3000 }); },
    chime() { [880, 1108.7, 1318.5, 1760].forEach((f, i) => tone(f, 1.2, { type: 'triangle', g: .08, t: i * .09 })); },
    glug() { for (let i = 0; i < 4; i++) tone(220 + i * 40, .1, { t: i * .11, f2: 520 + i * 60, g: .12 }); },
    horn(kind) {
      const seq = kind === 'alliance' ? [[62, 0, .5], [66, .25, .5], [69, .5, 1.4], [74, .5, 1.4]] : [[38, 0, 1.6], [45, 0, 1.6], [50, .35, 1.3], [41, .9, .9]];
      seq.forEach(([m, t, d]) => tone(mtof(m), d, { t, type: 'sawtooth', g: kind === 'alliance' ? .09 : .12, a: .06, lp: kind === 'alliance' ? 2400 : 900, lp2: 500 }));
    },
    fanfare() { [[62, 0], [66, .16], [69, .32], [74, .5], [69, .72], [74, .88]].forEach(([m, t]) => tone(mtof(m), .7, { t, type: 'sawtooth', g: .08, a: .03, lp: 2600, lp2: 700 })); },
    secret() { [57, 62, 65, 69, 74].forEach((m, i) => tone(mtof(m), 2.2, { t: i * .16, type: 'triangle', g: .07, a: .02 })); [62, 65, 69].forEach(m => tone(mtof(m), 3.5, { t: .8, type: 'sine', g: .04, a: .6 })); }
  };
  return Object.assign({ init, startMusic, setMuted, tone, noise, get muted() { return muted; } }, fx);
})();

/* ---------------- Bouton son ---------------- */
const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
function renderMute() { const b = $('#muteBtn'); b.innerHTML = Sound.muted ? ICON_OFF : ICON_ON; b.setAttribute('aria-label', Sound.muted ? 'Activer le son' : 'Couper le son'); }
$('#muteBtn').addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); renderMute(); if (!Sound.muted) Sound.startMusic(); });
renderMute();

/* ---------------- Toast & modale ---------------- */
function toast(msg, ms = 2800) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
}
const Modal = {
  open(html, cls = '') {
    $('#modalBody').innerHTML = html;
    $('#modalCard').className = 'modal-card parch ' + cls;
    $('#modal').classList.add('show'); this.at = Date.now();
  },
  close() { $('#modal').classList.remove('show'); }
};
$('#modalX').addEventListener('click', () => { Sound.click(); Modal.close(); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && Date.now() - (Modal.at || 0) > 700) Modal.close(); });

/* ---------------- Braises ---------------- */
const Embers = (() => {
  const cv = $('#embers'), cx = cv.getContext('2d');
  let W, H, dpr, ps = [], extra = [], last = performance.now(), on = true;
  const sprite = (() => {
    const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,235,170,1)'); gr.addColorStop(.22, 'rgba(255,170,70,.85)'); gr.addColorStop(1, 'rgba(255,70,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s;
  })();
  const pink = (() => {
    const s = document.createElement('canvas'); s.width = s.height = 32; const g = s.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,240,220,1)'); gr.addColorStop(.25, 'rgba(255,140,170,.85)'); gr.addColorStop(1, 'rgba(255,60,120,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s;
  })();
  function mk(initial) { return { x: Math.random() * W, y: initial ? Math.random() * H : H + 20, vy: rand(.25, 1.1), vx: rand(-.15, .15), s: rand(3, 9), ph: Math.random() * 6.28, f: rand(.5, 1.6), life: 0, max: rand(5, 12) }; }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = REDUCED ? 10 : (W < 600 ? 30 : 55);
    while (ps.length < n) ps.push(mk(true)); ps.length = n;
  }
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (on) {
      cx.clearRect(0, 0, W, H); cx.globalCompositeOperation = 'lighter';
      const t = now / 1000;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]; p.life += dt; p.y -= p.vy * dt * 60; p.x += (Math.sin(t * p.f + p.ph) * .35 + p.vx) * dt * 60;
        if (p.y < -20 || p.life > p.max) { ps[i] = mk(false); continue; }
        const a = Math.sin(Math.min(1, p.life / p.max) * Math.PI) * (0.55 + .45 * Math.sin(t * 6 + p.ph));
        cx.globalAlpha = Math.max(0, a); cx.drawImage(sprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      }
      for (let i = extra.length - 1; i >= 0; i--) {
        const p = extra[i]; p.life += dt; p.vy += 0.02; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
        if (p.life > p.max) { extra.splice(i, 1); continue; }
        cx.globalAlpha = 1 - p.life / p.max; cx.drawImage(p.pink ? pink : sprite, p.x - p.s, p.y - p.s, p.s * 2, p.s * 2);
      }
      cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
    }
    requestAnimationFrame(loop);
  }
  function burst(x, y, n = 60, isPink = false) {
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = rand(1, 6); extra.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, s: rand(4, 11), life: 0, max: rand(1, 2.4), pink: isPink && Math.random() < .7 }); }
  }
  addEventListener('resize', resize); resize(); requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => { on = !document.hidden; });
  return { burst };
})();

/* ---------------- Machine à écrire ---------------- */
async function typeInto(el, text, { speed = 24, skipEl = el } = {}) {
  el.innerHTML = ''; el.classList.add('typing');
  let skip = false; const sk = () => { skip = true; };
  skipEl.addEventListener('pointerdown', sk);
  const paras = text.split(/\n\n/);
  for (const para of paras) {
    const p = document.createElement('p'); el.appendChild(p);
    for (const part of para.split(/(\[\[.*?\]\])/)) {
      if (!part) continue;
      let node = document.createTextNode(''), txt = part;
      if (part.startsWith('[[')) { const sp = document.createElement('span'); sp.className = 'hl'; sp.appendChild(node); p.appendChild(sp); txt = part.slice(2, -2); }
      else p.appendChild(node);
      for (let i = 0; i < txt.length; i++) {
        if (skip) { node.data += txt.slice(i); break; }
        const ch = txt[i]; node.data += ch;
        if (i % 3 === 0 && ch !== ' ') Sound.tick();
        await sleep(/[.!?…]/.test(ch) ? speed * 9 : /[,;:]/.test(ch) ? speed * 4 : speed);
      }
    }
    if (!skip) await sleep(speed * 10);
  }
  skipEl.removeEventListener('pointerdown', sk);
  el.classList.remove('typing');
}
const plain = s => s.replace(/\[\[|\]\]/g, '');
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
async function fontsReady() {
  try {
    await Promise.race([Promise.all([
      document.fonts.load('900 40px "Cinzel Decorative"'), document.fonts.load('900 40px Cinzel'), document.fonts.load('700 40px Cinzel'),
      document.fonts.load('40px "IM Fell English"'), document.fonts.load('italic 40px "IM Fell English"'), document.fonts.load('40px "Pinyon Script"')
    ]), sleep(2500)]);
  } catch (e) {}
}
function fitFont(c, text, weight, family, maxSize, maxW) {
  let sz = maxSize; c.font = `${weight} ${sz}px ${family}`;
  while (c.measureText(text).width > maxW && sz > 12) { sz -= 2; c.font = `${weight} ${sz}px ${family}`; }
  return sz;
}
function wrap(c, text, x, y, maxW, lh, align = 'center') {
  const words = text.split(' '); let line = '', lines = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line); c.textAlign = align;
  lines.forEach((l, i) => c.fillText(l, x, y + i * lh));
  return y + lines.length * lh;
}
function paperBg(c, W, H, seed, inset = 40) {
  const r = mulberry(seed);
  // planche de bois
  const wood = c.createLinearGradient(0, 0, W, 0); wood.addColorStop(0, '#2a170c'); wood.addColorStop(.5, '#3b2414'); wood.addColorStop(1, '#25140a');
  c.fillStyle = wood; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2;
  for (let i = 0; i < 26; i++) { c.beginPath(); const y = r() * H; c.moveTo(0, y); c.bezierCurveTo(W * .3, y + r() * 30 - 15, W * .7, y + r() * 30 - 15, W, y + r() * 20 - 10); c.stroke(); }
  // papier déchiré
  const pts = [], step = 22;
  for (let x = inset; x <= W - inset; x += step) pts.push([x, inset + r() * 12 - 6]);
  for (let y = inset; y <= H - inset; y += step) pts.push([W - inset + r() * 12 - 6, y]);
  for (let x = W - inset; x >= inset; x -= step) pts.push([x, H - inset + r() * 12 - 6]);
  for (let y = H - inset; y >= inset; y -= step) pts.push([inset + r() * 12 - 6, y]);
  c.save(); c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
  c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 30; c.shadowOffsetY = 12;
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f1dfb4'); g.addColorStop(.5, '#e2c48c'); g.addColorStop(1, '#ead3a0');
  c.fillStyle = g; c.fill(); c.shadowColor = 'transparent'; c.clip();
  for (let i = 0; i < 9; i++) { const x = r() * W, y = r() * H, rr = 60 + r() * 220; const sg = c.createRadialGradient(x, y, 0, x, y, rr); sg.addColorStop(0, 'rgba(140,90,35,.13)'); sg.addColorStop(1, 'rgba(140,90,35,0)'); c.fillStyle = sg; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(${80 + r() * 60},${45 + r() * 30},${15},${r() * .12})`; c.fillRect(r() * W, r() * H, 1 + r() * 2.5, 1 + r() * 2.5); }
  const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.max(W, H) * .72);
  v.addColorStop(0, 'rgba(110,55,10,0)'); v.addColorStop(1, 'rgba(95,45,8,.6)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  c.restore();
}
function ornamentRule(c, cx, y, w, col) {
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(cx - w / 2, y); c.lineTo(cx - 22, y); c.moveTo(cx + 22, y); c.lineTo(cx + w / 2, y); c.stroke();
  c.beginPath(); c.moveTo(cx, y - 11); c.lineTo(cx + 11, y); c.lineTo(cx, y + 11); c.lineTo(cx - 11, y); c.closePath(); c.fill();
}
function canShareFiles() {
  try { return IS_TOUCH && !!navigator.canShare && navigator.canShare({ files: [new File([new Blob(['x'], { type: 'image/jpeg' })], 'x.jpg', { type: 'image/jpeg' })] }); } catch (e) { return false; }
}
async function saveCanvas(cv, filename, share, text) {
  const blob = await new Promise(res => cv.toBlob(res, 'image/jpeg', .92));
  if (share) {
    const file = new File([blob], filename, { type: 'image/jpeg' });
    try { await navigator.share({ files: [file], text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('Image enregistrée ! Envoie-la à Yohann sur WhatsApp.');
}
const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'voleur';
function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
/* =========================================================
   CALENDRIER DES OMBRES
   ========================================================= */
const APERCU = PARAMS.has('apercu');
const doorOpen = d => APERCU || Date.now() >= d.at;
const deCity = c => (/^[AEIOU]/.test(c) ? 'd\'' : 'de ') + c;
function hero() {
  const r = store.get('gs_fable', null) || {};
  return {
    name: r.name || 'Get Socrated', race: r.race || null, faction: r.faction || null,
    yRace: r.yRace || null, city: r.city || 'la capitale',
    raceLow: r.race ? r.race.toLowerCase() : 'voleur',
    ally: r.faction === 'Horde' ? 'Horde' : r.faction === 'Alliance' ? 'Alliance' : null
  };
}
function fmtLeft(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60, x = s % 60;
  return (d ? d + ' j ' : '') + String(h).padStart(2, '0') + ' h ' + String(m).padStart(2, '0') + ' min ' + String(x).padStart(2, '0') + ' s';
}
const backLink = () => 'index.html' + (APERCU ? '?apercu' : '') + '#portes';
const withApercu = u => u + (APERCU ? '?apercu' : '');

/* ---- Porte verrouillée ---- */
function gate(n) {
  const d = DOORS[n - 1];
  if (doorOpen(d)) return true;
  document.body.classList.add('locked');
  document.body.insertAdjacentHTML('beforeend', `<div id="intro"><div class="tavern-glow"></div>
    <div class="locked-door"><div class="seal-mini">${sealSVG()}</div>
    <p class="kicker">Porte ${ROMAN5[n - 1]} · titre scellé</p>
    <h1 class="convo-title" style="color:var(--gold2)">Encore scellée</h1>
    <p class="intro-kicker" style="opacity:1;animation:none">Elle s'ouvrira le ${d.day} à 10 h.<br>Patience, voleur.</p>
    <p class="lock-left" id="lockLeft"></p>
    <a class="btn dark" href="${backLink()}">Retour au parchemin</a></div></div>`);
  const t = () => { const ms = d.at - Date.now(); if (ms <= 0) location.reload(); else $('#lockLeft').textContent = fmtLeft(ms); };
  t(); setInterval(t, 1000);
  return false;
}

/* ---- Rituel du sceau (ouverture de chaque Porte) ---- */
function ritual({ kicker, title, to, text, from = '— Yohann, dit <b>Get Sauced</b>', btn = 'Entrer' }) {
  return new Promise(resolve => {
    const ghost = text.split('\n\n').map(p => `<p>${p.replace(/\[\[|\]\]/g, '')}</p>`).join('');
    document.body.insertAdjacentHTML('beforeend', `<div id="intro"><div class="tavern-glow"></div>
      <p class="intro-kicker">${kicker}</p>
      <div class="scroll" id="scroll"><div class="roller"></div>
        <div class="sheet" id="sheet"><div class="parch" id="sheetInner">
          <p class="sm">Le Calendrier des Ombres</p><h1 class="convo-title">${title}</h1><p class="to">${to}</p><div class="rule"></div>
          <div class="typed-wrap"><div class="ghost">${ghost}</div><div class="typed" id="introText"></div></div>
          <p class="from">${from}</p><button class="btn gold" id="enterBtn">${btn}</button></div></div>
        <div class="roller"></div><div class="ribbon"></div>
        <button class="seal-btn" id="sealBtn" aria-label="Briser le sceau"><div class="half l">${sealSVG()}</div><div class="half r">${sealSVG()}</div>
        <svg class="crack" viewBox="0 0 200 200" aria-hidden="true"><polyline points="104,8 92,60 110,104 88,148 104,192" fill="none" stroke="#ffd9a0" stroke-width="3.5" stroke-linejoin="round"/></svg></button>
      </div><p class="intro-hint" id="introHint">Touche le sceau pour le briser</p></div>`);
    let opened = false;
    $('#sealBtn').addEventListener('click', async () => {
      if (opened) return; opened = true; Sound.init();
      const b = $('#sealBtn'); b.classList.add('cracking'); Sound.crack();
      if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
      const r = b.getBoundingClientRect(); Embers.burst(r.left + r.width / 2, r.top + r.height / 2, 40);
      $('#introHint').style.opacity = 0;
      await sleep(320); b.classList.remove('cracking'); b.classList.add('broken'); await sleep(380);
      const sheet = $('#sheet'); sheet.style.height = $('#sheetInner').scrollHeight + 'px';
      $('#scroll').classList.add('open'); Sound.unroll(); Sound.startMusic();
      await sleep(1750); sheet.style.height = 'auto';
      await typeInto($('#introText'), text, { speed: 24, skipEl: $('#sheet') });
      $('#enterBtn').classList.add('show');
    });
    $('#enterBtn').addEventListener('click', () => {
      Sound.init(); Sound.click(); Sound.whoosh();
      $('#intro').classList.add('leaving');
      document.body.classList.remove('locked'); document.body.classList.add('entered');
      const app = $('#app'); app.classList.add('show'); app.removeAttribute('aria-hidden'); scrollTo(0, 0);
      setTimeout(() => $('#intro').remove(), 1100);
      resolve();
    });
    if (PARAMS.has('entrer')) { opened = true; $('#enterBtn').click(); }
  });
}

/* ---- Apparition au défilement ---- */
function revealAll() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---- Moteur d'histoire à choix ---- */
function Story(root, scenes, state = {}) {
  root.innerHTML = `<div class="parch fable-card"><div class="fable-body">
    <div class="fable-top"><span class="chNum"></span><div class="dots"></div></div><h3 class="chTitle"></h3>
    <div class="fable-text"></div><p class="skip-hint">Touche le texte pour accélérer</p><div class="choices"></div></div></div>`;
  const card = $('.fable-card', root), body = $('.fable-body', root), T = $('.fable-text', root), C = $('.choices', root);
  const byId = id => scenes.findIndex(s => s.id === id);
  let idx = 0;
  return new Promise(resolve => {
    async function show() {
      const sc = scenes[idx];
      $('.chNum', root).innerHTML = sc.badge || ('Scène ' + (idx + 1));
      $('.chTitle', root).textContent = typeof sc.title === 'function' ? sc.title(state) : sc.title;
      $('.dots', root).innerHTML = scenes.filter(s => !s.alt).map((_, i) => `<i class="${i <= (sc.step ?? idx) ? 'on' : ''}"></i>`).join('');
      C.innerHTML = ''; $('.skip-hint', root).classList.remove('hidden');
      const top = card.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * .5) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      sc.onShow && sc.onShow(state);
      await typeInto(T, sc.text(state), { skipEl: card });
      $('.skip-hint', root).classList.add('hidden');
      const list = sc.choices ? sc.choices(state) : [{ label: sc.cta || 'Continuer', end: true }];
      list.forEach((c, i) => {
        const b = document.createElement('button'); b.className = 'choice ' + (c.cls || '');
        b.style.animationDelay = (i * .12) + 's';
        b.innerHTML = esc(c.label) + (c.sub ? `<small>${esc(c.sub)}</small>` : '');
        b.addEventListener('click', () => pick(c), { once: true });
        C.appendChild(b);
      });
      setTimeout(() => { const r = C.getBoundingClientRect(); if (r.bottom > innerHeight - 80) scrollBy({ top: Math.min(r.bottom - innerHeight + 100, r.top - 80), behavior: 'smooth' }); }, 150);
    }
    async function pick(c) {
      Sound.click();
      if (c.tag) { state.tags = state.tags || []; state.tags.push(c.tag); }
      c.act && c.act(state);
      const next = c.go ? byId(c.go) : (c.end || scenes[idx].last) ? -1 : idx + 1;
      body.classList.add('out'); await sleep(420); body.classList.remove('out');
      if (next < 0 || next >= scenes.length) { C.innerHTML = ''; resolve(state); return; }
      idx = next; show();
    }
    show();
  });
}

const frags = () => store.get('gs_frags', []);
function giveFragment(n) {
  const have = new Set(frags()); const isNew = !have.has(n); have.add(n); store.set('gs_frags', [...have].sort());
  Sound.secret(); Embers.burst(innerWidth / 2, innerHeight / 2, 70);
  Modal.open(`<p class="kick">${isNew ? 'Fragment obtenu' : 'Fragment déjà en ta possession'}</p><h3>Fragment ${ROMAN5[n - 1]} de la Carte</h3>
    <div class="map-wrap">${mapSVG([...have], true)}</div>
    <p class="q" style="font-size:17px">${have.size} / 5 fragments. ${have.size === 5 ? 'La carte est complète. Le QG t\'attend.' : 'Reviens demain à 10 h pour le suivant.'}</p>
    <div class="btn-row"><a class="btn ink small" href="${backLink()}">Voir le calendrier</a></div>`);
}

/* ---- Pavé de signature ---- */
function SigPad(cv, wrapEl) {
  const cx = cv.getContext('2d'); let strokes = [], cur = null, W = 0, H = 0, locked = false;
  function size() { const dp = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dp; cv.height = H * dp; cx.setTransform(dp, 0, 0, dp, 0, 0); redraw(); }
  function drawStrokes(c, list, sx = 1, sy = 1, ox = 0, oy = 0, lw = 1) {
    c.strokeStyle = '#1f2a55'; c.fillStyle = '#1f2a55'; c.lineCap = 'round'; c.lineJoin = 'round';
    list.forEach(st => {
      if (st.length === 1) { c.beginPath(); c.arc(ox + st[0][0] * sx, oy + st[0][1] * sy, 1.8 * lw, 0, 7); c.fill(); return; }
      for (let i = 1; i < st.length; i++) { const [x0, y0] = st[i - 1], [x1, y1] = st[i]; c.lineWidth = Math.max(1.4, 3.6 - Math.hypot(x1 - x0, y1 - y0) * .08) * lw; c.beginPath(); c.moveTo(ox + x0 * sx, oy + y0 * sy); c.lineTo(ox + x1 * sx, oy + y1 * sy); c.stroke(); }
    });
  }
  function redraw() { cx.clearRect(0, 0, W, H); drawStrokes(cx, strokes.map(s => s.map(([x, y]) => [x * W, y * H]))); }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  cv.addEventListener('pointerdown', e => { if (locked) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.push(cur); wrapEl.classList.add('inked'); redraw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(ev => cur.push(pos(ev))); redraw(); });
  ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { cur = null; }));
  addEventListener('resize', size); setTimeout(size, 60);
  return {
    size, clear() { strokes = []; wrapEl.classList.remove('inked'); redraw(); },
    get points() { return strokes.reduce((a, s) => a + s.length, 0); },
    get strokes() { return strokes; }, set strokes(v) { strokes = v || []; wrapEl.classList.toggle('inked', strokes.length > 0); redraw(); },
    lock(v) { locked = v; },
    drawInto(g, cxp, cyp, bw0 = 380, bh0 = 170) {
      const pts = strokes.flat(); if (!pts.length) return;
      const asp = W && H ? W / H : 3;
      let minX = 1, minY = 1, maxX = 0, maxY = 0; pts.forEach(([px, py]) => { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); });
      const bw = Math.max(.02, maxX - minX) * asp, bh = Math.max(.02, maxY - minY), sc = Math.min(bw0 / bw, bh0 / bh);
      drawStrokes(g, strokes.map(s => s.map(([px, py]) => [px * asp, py])), sc, sc, cxp - (bw * sc) / 2 - minX * asp * sc, cyp - (bh * sc) / 2 - minY * sc, 2.4);
    }
  };
}

/* Tapoter X fois */
function onTaps(el, n, cb, each) {
  let c = 0, t = 0;
  el.addEventListener('click', () => { const now = Date.now(); c = now - t < 700 ? c + 1 : 1; t = now; each && each(c); if (c >= n) { c = 0; cb(); } });
}
/* Pied de page commun */
function doorFooter(n) {
  const next = DOORS[n];
  return `<footer><p class="credit">${next ? `Prochaine porte : <b>le ${next.day} à 10 h</b>.<br>Son nom reste scellé jusque-là.` : 'Rendez-vous au QG, le 5 novembre à minuit.'}</p>
    <div class="btn-row" style="margin-top:16px"><a class="btn dark small" href="${backLink()}">Retour au calendrier</a></div>
    <p class="legal">Création de fan, 100 % originale. Non affiliée à Blizzard Entertainment.</p></footer>`;
}
