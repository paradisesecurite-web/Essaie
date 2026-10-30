'use strict';
/* =========================================================
   Le Pacte des Ombres — par Yohann (Get Sauced) pour Aurélien (Get Socrated)
   ========================================================= */
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
/* ?reset : efface tout ce que ce téléphone a mémorisé (Fable, pacte, secrets, record) */
const WAS_RESET = PARAMS.has('reset');
if (WAS_RESET) {
  try { Object.keys(localStorage).filter(k => k.startsWith('gs_') && k !== 'gs_mute').forEach(k => localStorage.removeItem(k)); } catch (e) {}
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
}

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
  return Object.assign({ init, startMusic, setMuted, get muted() { return muted; } }, fx);
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

/* =========================================================
   SECRETS (easter eggs)
   ========================================================= */
const SECRETS = [
  ['message', 'Le message scellé', 'Le sceau tout en haut garde un dernier secret… pour qui sait patienter. Garde le doigt dessus.'],
  ['sauce', 'Pluie de sauce', 'Mon nom a un goût prononcé. Tapote-le, insiste un peu.'],
  ['socrate', 'Pensées de Socrate', 'Ton nom cache un philosophe. Interroge-le… cinq fois.'],
  ['vanish', 'Disparition', 'Un voleur qu\'on secoue finit toujours par disparaître. (Sur ordinateur : touche V.)'],
  ['repetition', 'Répétition générale', 'Même le temps se laisse chatouiller. Tapote le compte à rebours.'],
  ['legendaire', 'Mode légendaire', 'Haut, haut, bas, bas, gauche, droite, gauche, droite. Au doigt (glisse) ou au clavier.'],
  ['leeroy', 'Le cri légendaire', 'Il existe un nom de héros que tout le monde crie avant de foncer. Essaie-le dans la Fable.'],
  ['yohann', 'L\'imposteur', 'Et si tu essayais de me voler mon nom, dans la Fable ?'],
  ['nuit', 'Oiseau de nuit', 'Reviens quand les honnêtes gens dorment (entre minuit et 5 h).']
];
let found = new Set(store.get('gs_secrets', []));
function renderGems() {
  const g = $('#gems'); g.innerHTML = '';
  SECRETS.forEach(([id, name, hint]) => {
    const b = document.createElement('button'); b.setAttribute('aria-label', found.has(id) ? name : 'Secret caché');
    if (found.has(id)) b.classList.add('on');
    b.addEventListener('click', () => { Sound.click(); toast(found.has(id) ? '✦ ' + name + ' — trouvé !' : 'Indice : ' + hint, 4200); });
    g.appendChild(b);
  });
  $('#secretsTxt').textContent = found.size === SECRETS.length
    ? 'Tous les secrets sont à toi. Tu es un vrai voleur.'
    : `${found.size} / ${SECRETS.length} secrets trouvés. Touche une gemme pour un indice.`;
}
function discover(id) {
  if (found.has(id)) return;
  found.add(id); store.set('gs_secrets', [...found]); renderGems();
  const s = SECRETS.find(x => x[0] === id);
  setTimeout(() => { toast(`✦ Secret trouvé : ${s[1]} (${found.size}/${SECRETS.length})`, 3200); Sound.coin(); }, 400);
}
renderGems();

function openSecretMessage() {
  Sound.secret();
  Embers.burst(innerWidth / 2, innerHeight / 2, 90, true);
  const msg = 'Je ne pouvais rêver meilleur duo pour recommencer WoW à zéro.\n\nJe t\'aime, mon frère.';
  Modal.open(`<p class="kick">Message scellé · ne s'ouvre qu'une fois… ou plus</p><h3>Pour Aurélien</h3>
    <div class="typed-wrap"><div class="ghost">${msg.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div><div class="typed" id="secretTyped"></div></div>
    <p class="sigline">Yohann</p>`, 'secret-letter');
  setTimeout(() => typeInto($('#secretTyped'), msg, { speed: 45, skipEl: $('#modalCard') }), 500);
  discover('message');
}

/* Appui long sur le sceau du haut */
(() => {
  const el = $('#sigil'); let timer = null, taps = 0, tapT = 0;
  $('#sigilSeal').innerHTML = sealSVG();
  const start = e => {
    e.preventDefault();
    el.classList.add('charging'); Sound.init();
    timer = setTimeout(() => { el.classList.remove('charging'); timer = null; openSecretMessage(); }, 1600);
  };
  const cancel = () => {
    if (timer) {
      clearTimeout(timer); timer = null; el.classList.remove('charging');
      const now = Date.now(); taps = now - tapT < 600 ? taps + 1 : 1; tapT = now;
      if (taps === 1) toast('Le sceau frémit… il faudrait le tenir plus longtemps.', 2200);
      if (taps >= 7) { taps = 0; openSecretMessage(); }
    }
  };
  el.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, cancel));
  el.addEventListener('contextmenu', e => e.preventDefault());
})();

/* Tapoter X fois un élément */
function onTaps(el, n, cb, each) {
  let c = 0, t = 0;
  el.addEventListener('click', () => {
    const now = Date.now(); c = now - t < 700 ? c + 1 : 1; t = now;
    each && each(c);
    if (c >= n) { c = 0; cb(); }
  });
}
onTaps($('#eggSauce'), 5, () => {
  Sound.glug(); discover('sauce');
  toast('Get Sauced ! Il pleut de la sauce sur Azeroth.');
  const items = ['🌶️', '🥫', '🍯', '🧄', '🍅', '🌶️', '🥫'];
  for (let i = 0; i < 40; i++) {
    const d = document.createElement('div'); d.className = 'rain'; d.textContent = items[i % items.length];
    d.style.left = Math.random() * 100 + 'vw'; d.style.animationDuration = rand(1.8, 3.6) + 's'; d.style.animationDelay = rand(0, 1.4) + 's'; d.style.fontSize = rand(22, 40) + 'px';
    document.body.appendChild(d); setTimeout(() => d.remove(), 5500);
  }
}, c => { if (c < 5) Sound.click(); });

const QUOTES = [
  'Connais-toi toi-même. Et connais surtout l\'emplacement de la bourse de ton ennemi.',
  'Je sais que je ne sais rien. Sauf qu\'une Éviscération à cinq points de combo, ça pique.',
  'Une vie sans Camouflage ne vaut pas d\'être vécue.',
  'Le sage ne court pas. Il lance Sprint.',
  'La ciguë ? Non merci. Je préfère mes poisons instantanés.',
  'Il n\'y a qu\'un bien, le butin. Et qu\'un mal : celui qui le rafle sans demander.',
  'L\'homme est un loup pour l\'homme. Le voleur, lui, est derrière le loup.',
  'Philosopher, c\'est apprendre à mourir. Au niveau 1, j\'ai beaucoup philosophé.'
];
let qi = Math.floor(Math.random() * QUOTES.length);
onTaps($('#eggSocrate'), 5, () => {
  discover('socrate'); Sound.chime();
  const show = () => {
    qi = (qi + 1) % QUOTES.length;
    Modal.open(`<p class="kick">Pensées de</p><h3>Socrate des Ombres</h3><p class="q">« ${QUOTES[qi]} »</p>
      <div class="btn-row"><button class="btn ink small" id="moreQ">Une autre pensée</button></div>`);
    $('#moreQ').addEventListener('click', () => { Sound.click(); show(); });
  };
  show();
}, c => { if (c < 5) Sound.click(); });

/* Disparition : secouer le téléphone / touche V */
let vanishing = false;
function vanish() {
  if (vanishing) return; vanishing = true;
  Sound.whoosh(); discover('vanish');
  document.body.classList.add('vanish');
  setTimeout(() => { document.body.classList.remove('vanish'); Sound.whoosh(); vanishing = false; toast('… et te revoilà. Personne n\'a rien vu.'); }, 2600);
}
(() => {
  let lastShake = 0, lx = null, ly = null, lz = null;
  addEventListener('devicemotion', e => {
    const a = e.accelerationIncludingGravity; if (!a || a.x == null) return;
    if (lx !== null) {
      const d = Math.abs(a.x - lx) + Math.abs(a.y - ly) + Math.abs(a.z - lz);
      if (d > 38 && Date.now() - lastShake > 4000 && document.body.classList.contains('entered')) { lastShake = Date.now(); vanish(); }
    }
    lx = a.x; ly = a.y; lz = a.z;
  });
})();
function askMotion() {
  try { if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().catch(() => {}); } catch (e) {}
}

/* Konami : clavier + glissés au doigt */
(() => {
  const CODE = ['U', 'U', 'D', 'D', 'L', 'R', 'L', 'R'];
  let seq = [];
  const push = d => { seq.push(d); seq = seq.slice(-8); if (seq.join() === CODE.join()) { seq = []; legendary(); } };
  addEventListener('keydown', e => {
    const m = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R' }[e.key];
    if (m) push(m);
    if ((e.key === 'v' || e.key === 'V') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.body.classList.contains('entered')) vanish();
  });
  let sx = 0, sy = 0;
  addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (e.target.closest && e.target.closest('#pad')) return;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return;
    push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'));
  }, { passive: true });
})();
function legendary() {
  document.body.classList.toggle('legendary', true);
  Sound.fanfare(); discover('legendaire');
  Embers.burst(innerWidth / 2, innerHeight / 3, 80);
  Modal.open(`<div class="iname">[Lames jumelles de la Fraternité]</div>
    <div class="ilvl">Niveau d'objet 60</div>
    <div class="row2"><span>Lié quand ramassé</span><span>Unique</span></div>
    <div class="row2"><span>Main gauche & main droite</span><span>Dague</span></div>
    <div class="stat">+100 Fraternité</div><div class="stat">+60 Fourberie</div><div class="stat">+42 Sauce</div>
    <div class="eq">Équipé : vous ne jouez plus jamais seul.</div>
    <div class="eq">Équipé : vos réunions de bureau sont automatiquement esquivées.</div>
    <div class="flav">« Forgées pour deux, la veille d'un monde nouveau. »</div>`, 'item-tip');
}

/* =========================================================
   INTRO
   ========================================================= */
const INTRO_TXT = "Le 5 novembre 2026, à minuit, un monde ancien renaît de ses cendres. Tout recommence à zéro.\n\nDeux voleurs y entreront ensemble, ou n'y entreront pas. Ton complice t'attend déjà dans l'ombre.";
$('#introGhost').innerHTML = INTRO_TXT.split('\n\n').map(p => `<p>${p}</p>`).join('');
$('#sealL').innerHTML = sealSVG();
$('#sealR').innerHTML = sealSVG();
let introOpened = false;
$('#sealBtn').addEventListener('click', async () => {
  if (introOpened) return; introOpened = true;
  Sound.init();
  const b = $('#sealBtn');
  b.classList.add('cracking'); Sound.crack();
  if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
  const r = b.getBoundingClientRect(); Embers.burst(r.left + r.width / 2, r.top + r.height / 2, 40);
  $('#introHint').style.opacity = 0;
  await sleep(320);
  b.classList.remove('cracking'); b.classList.add('broken');
  await sleep(380);
  const sheet = $('#sheet');
  sheet.style.height = $('#sheetInner').scrollHeight + 'px';
  $('#scroll').classList.add('open');
  Sound.unroll(); Sound.startMusic();
  await sleep(1750);
  sheet.style.height = 'auto';
  await typeInto($('#introText'), INTRO_TXT, { speed: 26, skipEl: $('#sheet') });
  $('#enterBtn').classList.add('show');
});
$('#enterBtn').addEventListener('click', () => {
  Sound.init(); Sound.click(); Sound.whoosh(); askMotion();
  $('#intro').classList.add('leaving');
  document.body.classList.remove('locked'); document.body.classList.add('entered');
  const app = $('#app'); app.classList.add('show'); app.removeAttribute('aria-hidden');
  scrollTo(0, 0);
  setTimeout(() => { $('#intro').remove(); $('#bnav').classList.add('show'); }, 1100);
  const h = new Date().getHours();
  if (h >= 0 && h < 5) setTimeout(() => { toast('Il est tard, voleur. Les meilleurs coups se préparent la nuit.', 3500); discover('nuit'); }, 2500);
  if (Date.now() >= TARGET) setTimeout(() => Celebrate.show(false), 1500);
});

/* Apparition au défilement + nav active */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));
const navIo = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('#bnav a').forEach(a => a.classList.toggle('on', a.dataset.s === e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['top', 'portes', 'fable', 'duel', 'pacte'].forEach(id => navIo.observe(document.getElementById(id)));
$$('#bnav a').forEach(a => a.addEventListener('click', () => Sound.click()));

/* =========================================================
   COMPTE À REBOURS
   ========================================================= */
const Countdown = (() => {
  const els = { d: $('#cdD'), h: $('#cdH'), m: $('#cdM'), s: $('#cdS') };
  let celebrated = false;
  function set(el, v) { if (el.textContent !== v) { el.textContent = v; el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } }
  function tick() {
    let ms = TARGET - Date.now();
    if (ms <= 0) {
      ['d', 'h', 'm', 's'].forEach(k => set(els[k], '00'));
      $('#cdLabel').innerHTML = '<span class="cd-open">Le monde est ouvert !</span>';
      if (!celebrated && document.body.classList.contains('entered')) { celebrated = true; Celebrate.show(false); }
      if (document.body.classList.contains('entered')) celebrated = true;
      return;
    }
    const s = Math.floor(ms / 1000);
    set(els.d, String(Math.floor(s / 86400)).padStart(2, '0'));
    set(els.h, String(Math.floor(s / 3600) % 24).padStart(2, '0'));
    set(els.m, String(Math.floor(s / 60) % 60).padStart(2, '0'));
    set(els.s, String(s % 60).padStart(2, '0'));
  }
  tick(); setInterval(tick, 1000);
  onTaps($('#cdWrap'), 5, () => { discover('repetition'); Celebrate.show(true); }, c => { if (c > 1 && c < 5) Sound.tick(); });
})();

/* =========================================================
   CÉLÉBRATION + FEUX D'ARTIFICE
   ========================================================= */
const Celebrate = (() => {
  const cv = $('#fwCv'), cx = cv.getContext('2d');
  let W, H, run = false, parts = [], rockets = [], last = 0, nextR = 0;
  const COLORS = [[243, 210, 122], [255, 120, 60], [120, 170, 255], [255, 90, 90], [200, 140, 255], [255, 255, 220]];
  function size() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function explode(x, y) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)], n = W < 600 ? 60 : 90;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = rand(1, 5.5); parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rand(1.1, 2), c }); }
    Sound.pop();
  }
  function loop(now) {
    if (!run) return;
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    cx.globalCompositeOperation = 'source-over'; cx.fillStyle = 'rgba(5,2,1,.22)'; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    nextR -= dt;
    if (nextR <= 0) { nextR = rand(.35, .9); rockets.push({ x: rand(W * .15, W * .85), y: H + 10, vy: -rand(8, 11.5) * (H / 800 + .4), ty: rand(H * .12, H * .45) }); }
    rockets = rockets.filter(r => { r.y += r.vy * dt * 60; cx.fillStyle = '#ffe6a0'; cx.fillRect(r.x - 1.5, r.y, 3, 10); if (r.y <= r.ty) { explode(r.x, r.y); return false; } return true; });
    parts = parts.filter(p => {
      p.life += dt; p.vy += .05 * dt * 60; p.vx *= .985; p.vy *= .985; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
      const a = 1 - p.life / p.max; if (a <= 0) return false;
      cx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`; cx.beginPath(); cx.arc(p.x, p.y, 2.2, 0, 6.28); cx.fill();
      return true;
    });
    requestAnimationFrame(loop);
  }
  function show(rehearsal) {
    $('#celK').textContent = rehearsal ? 'Répétition générale · le vrai spectacle, c\'est jeudi à minuit' : 'Jeudi 5 novembre 2026 · minuit';
    size(); $('#celebrate').classList.add('show'); Sound.init(); Sound.fanfare();
    if (!run) { run = true; last = performance.now(); requestAnimationFrame(loop); }
  }
  function hide() { $('#celebrate').classList.remove('show'); setTimeout(() => { run = false; parts = []; rockets = []; }, 800); }
  $('#celClose').addEventListener('click', () => { Sound.click(); hide(); });
  addEventListener('resize', () => run && size());
  return { show };
})();

/* =========================================================
   LA FABLE
   ========================================================= */
const RACES = {
  Alliance: [
    ['Humain', 'Le classique. Assez banal pour se fondre dans n\'importe quelle foule.'],
    ['Nain', 'Petit, barbu, et capable de poignarder un genou à bout portant.'],
    ['Gnome', 'Si petit qu\'on te prend pour un tabouret. Le camouflage ultime.'],
    ['Elfe de la nuit', 'Comme Yohann. Deux elfes, deux saltos, zéro discrétion.']
  ],
  Horde: [
    ['Orc', 'Des épaules larges comme une porte. Discret… à sa manière.'],
    ['Mort-vivant', 'Comme Yohann. Deux squelettes dans le placard. Littéralement.'],
    ['Troll', 'Grand, voûté, et toujours de bonne humeur. Ça désarme.']
  ]
};
const MIRROR = {
  'Humain': 'Ton reflet se précise : un [[humain]], au regard malin et au sourire de vendeur de chevaux d\'occasion.',
  'Nain': 'Ton reflet rapetisse, s\'élargit, et se couvre d\'une barbe magnifique : un [[nain]]. Yohann essuie une larme.',
  'Gnome': 'Ton reflet rétrécit… rétrécit encore… Un [[gnome]]. Yohann doit s\'accroupir pour te faire un check.',
  'Elfe de la nuit': 'Ton reflet s\'allonge, tes oreilles aussi : un [[elfe de la nuit]]. Yohann hurle de joie. Deux elfes, deux saltos. Le voisin pleure sa deuxième bière.',
  'Orc': 'Ton reflet gonfle, verdit et se pousse deux défenses : un [[orc]]. Le miroir se fissure légèrement, par respect.',
  'Mort-vivant': 'Ton reflet perd quelques kilos… surtout de chair : un [[mort-vivant]]. Yohann et toi trinquez. Vos mâchoires claquent en rythme.',
  'Troll': 'Ton reflet s\'étire, se voûte et te fait un clin d\'œil : un [[troll]]. « Ça va bien s\'passer, mon frère », dit-il.'
};
const ENDINGS = {
  ombre: {
    title: 'Les Fantômes du Registre', bounty: '2 500', unit: 'pièces d\'or',
    crime: 'Effraction parfaitement invisible. Probablement.',
    text: s => `Le lendemain, à minuit pile, des milliers d'aventuriers se ruent sur le monde. Tous les noms sont pris d'assaut… sauf deux, déjà gravés à l'encre de l'ombre : [[Get Sauced]] et [[${s.name}]].\n\nPersonne ne sait comment. Personne ne vous a vus. Les gardes ${deCity(s.city)} parlent de deux fantômes, et les bardes en font déjà une chanson. Une très mauvaise chanson.\n\nUne affiche apparaît pourtant sur le panneau des avis de recherche. Avec ta tête dessus. Floue. Mais quand même.`
  },
  chaos: {
    title: 'Les Incendiaires ', bounty: '50 000', unit: 'pièces d\'or',
    crime: 'Tag géant sur un bâtiment officiel, paladin assommé, cloche d\'alarme traumatisée.',
    text: s => `La cloche a fini par se décider. Toute la garde ${deCity(s.city)} débarque… juste à temps pour voir deux silhouettes filer sur les toits en riant comme des idiots, sous une inscription de trois mètres de haut.\n\nLe Registre est sauvé : vos noms y sont, en très gros. Le mur, lui, est à repeindre. Le paladin s'est réveillé et a juré de vous retrouver, niveau 1 ou pas.\n\nÀ l'aube, ton visage est placardé dans tout le royaume. Prime record.`
  },
  ruse: {
    title: 'Les Escrocs de la File d\'Attente', bounty: '12 345', unit: 'pièces d\'or + 1 tonneau',
    crime: 'Revente de pseudos au marché noir et recrutement frauduleux d\'un paladin.',
    text: s => `Au matin, une rumeur court dans tout le royaume : des noms comme « Tankpabien », « Soignemoistp » ou « Kévin-des-Bois » se revendent cinquante pièces d'or au marché noir.\n\nVous êtes riches avant même d'atteindre le niveau 2. Le paladin est devenu officier de votre guilde. Et quelque part à ${s.city}, un comptable royal fronce les sourcils devant ses registres.\n\nL'avis de recherche est déjà en route. Avec une prime… négociable.`
  }
};
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const deCity = c => (/^[AEIOU]/.test(c) ? 'd\'' : 'de ') + c;

const Fable = (() => {
  let s = null, idx = 0;
  const T = $('#fableText'), C = $('#fableChoices');
  const fresh = () => ({ name: 'Get Socrated', faction: null, race: null, yRace: null, city: null, tags: [], score: { ombre: 0, chaos: 0, ruse: 0 } });

  const CH = [
    {
      title: 'La Taverne du Cochon Borgne',
      text: () => `La pluie tambourine sur les vitres de la taverne du Cochon Borgne. Au fond de la salle, là où même la lumière des bougies n'ose pas aller, une silhouette encapuchonnée te fait signe.\n\nC'est [[Yohann]]. Ou plutôt [[Get Sauced]], comme l'appellent ceux qui ont survécu à ses soirées.\n\n« Demain, à minuit, le monde renaît. Tout recommence à zéro : niveau 1, trois pièces de cuivre et une dague émoussée. Mais avant ça… j'ai besoin de mon complice. Rappelle-moi ton nom de voleur ? »`,
      choices: 'name'
    },
    {
      title: 'Le Choix des Bannières',
      text: s => `« [[${s.name}]]. » Il sourit sous sa capuche. « Toujours aussi philosophe. »\n\nIl déplie une carte jaunie sur la table. Deux bannières glissent de sa manche.\n\n« J'ai un problème : je n'arrive pas à choisir. Une part de moi veut devenir un [[elfe de la nuit]], gracieux, mystérieux, qui fait des saltos sans raison. L'autre veut être un [[mort-vivant]], parce que ne plus avoir de rate, c'est un sacré gain de poids. »\n\nIl pousse les deux bannières vers toi.\n\n« Alors c'est toi qui tranches. Notre camp, notre sang, notre destin. Pour toujours. Enfin… au moins jusqu'au prochain reroll. »`,
      choices: () => [
        { label: 'Pour l\'Alliance !', sub: 'Yohann deviendra elfe de la nuit. Direction Hurlevent.', cls: 'alliance', act: s => { s.faction = 'Alliance'; s.yRace = 'Elfe de la nuit'; s.city = 'Hurlevent'; Sound.horn('alliance'); } },
        { label: 'Pour la Horde !', sub: 'Yohann deviendra mort-vivant. Direction Orgrimmar.', cls: 'horde', act: s => { s.faction = 'Horde'; s.yRace = 'Mort-vivant'; s.city = 'Orgrimmar'; Sound.horn('horde'); } }
      ]
    },
    {
      title: 'Le Miroir des Races',
      text: s => (s.faction === 'Alliance'
        ? `« L'Alliance, donc. » Yohann soupire de soulagement : il sera [[elfe de la nuit]]. Il tente immédiatement un salto, le rate, et renverse la bière du voisin.`
        : `« La Horde, donc. » Yohann sourit. Un sourire qui, dès demain, n'aura plus de lèvres : il sera [[mort-vivant]]. « J'ai toujours rêvé de voir à travers mes propres côtes. »`) +
        `\n\nUn vieux miroir trône au-dessus du comptoir. On raconte qu'il montre à chacun ce qu'il deviendra dans le nouveau monde. Tu t'approches. Ton reflet hésite…\n\nQui seras-tu, [[${s.name}]] ?`,
      choices: s => RACES[s.faction].map(([r, d]) => ({ label: r, sub: d, act: s => { s.race = r; } }))
    },
    {
      title: 'Le Plan',
      text: s => `${MIRROR[s.race]}\n\n« [[${s.name}]], ${s.race.toLowerCase()}, voleur. Parfait. » Yohann baisse la voix. « Maintenant, le coup. Demain, des milliers d'aventuriers vont se ruer sur le monde. Et tu sais ce qu'ils vont faire ? Ils vont nous voler nos noms. »\n\nIl frappe la table du poing. Trois chopes sursautent.\n\n« Cette nuit, on entre dans le [[Grand Registre des Noms]] ${deCity(s.city)}. On y inscrit "Get Sauced" et "${s.name}" à l'encre indélébile, avant tout le monde. Le casse du siècle, mon frère. Par où on entre ? »`,
      choices: () => [
        { label: 'Par les égouts, en Camouflage.', sub: 'Personne ne regarde jamais les égouts.', tag: 'ombre' },
        { label: 'Par la grande porte. Embuscade sur le garde.', sub: 'Et après, on improvise.', tag: 'chaos' },
        { label: 'Déguisés en livreurs de bière.', sub: 'Personne ne refuse une livraison de bière.', tag: 'ruse' }
      ]
    },
    {
      title: 'L\'Imprévu',
      text: s => ({
        ombre: `Les égouts ${deCity(s.city)} sentent exactement ce que tu imagines. En pire. Mais vous glissez dans l'ombre comme deux rumeurs, sans un bruit… jusqu'à ce que Yohann marche sur un rat.`,
        chaos: `Le garde n'a rien vu venir. Littéralement : il dort maintenant contre une colonne, avec une bosse en forme de pommeau de dague. Discrétion : discutable. Efficacité : totale.`,
        ruse: `« Livraison pour le Registre ! Trois tonneaux de bière naine, offerts par… euh… la mairie ! » Le garde vous ouvre en salivant. Yohann avait raison. Ça arrive.`
      })[s.tags[0]] + `\n\nMais au détour d'un couloir, une ombre immense vous barre la route : le [[Gardien du Registre]], un paladin en armure complète. Deux mètres de muscles et de bonnes intentions. Il renifle l'air.\n\n« Je sens… de la fourberie. Et de la sauce. »\n\nYohann te lance un regard paniqué. C'est à toi d'agir.`,
      choices: () => [
        { label: 'Disparition ! On s\'évanouit dans la fumée.', sub: 'Le grand classique du voleur.', tag: 'ombre' },
        { label: 'Coup bas, puis Assommer.', sub: 'Il a besoin d\'une petite sieste.', tag: 'chaos' },
        { label: 'Lui proposer de rejoindre notre guilde.', sub: 'Les paladins adorent les guildes sérieuses.', tag: 'ruse' }
      ]
    },
    {
      title: 'Le Grand Registre',
      text: s => ({
        ombre: `Un nuage de fumée. Quand il se dissipe, le paladin ne trouve qu'une odeur de sauce et un vague sentiment d'humiliation. Vous êtes déjà loin.`,
        chaos: `Coup bas. Assommer. Le paladin s'effondre comme une armoire mal montée. Le bruit résonne dans tout le bâtiment. Quelque part, une cloche d'alarme commence à hésiter.`,
        ruse: `Le paladin plisse les yeux. « Une guilde… sérieuse ? » Tu lui tends un parchemin de recrutement. Il le signe en pleurant de joie. Vous avez un tank. Et la voie est libre.`
      })[s.tags[1]] + `\n\nLe voilà enfin : le [[Grand Registre des Noms]], posé sur un lutrin d'argent, éclairé par un seul rayon de lune. Ses pages sont vierges. Demain, des milliers de noms viendront s'y battre.\n\nYohann te tend la plume. Sa main tremble un peu. Ce n'est pas la peur. C'est l'émotion.\n\n« À toi l'honneur, mon frère. »`,
      choices: s => [
        { label: 'Inscrire nos deux noms, souffler la bougie, disparaître.', sub: 'Propre. Net. Légendaire.', tag: 'ombre' },
        { label: `Inscrire nos noms en lettres géantes, puis taguer « Get Sauced & ${s.name} étaient là » sur le mur.`, sub: 'La discrétion, c\'est surfait.', tag: 'chaos' },
        { label: 'Inscrire nos noms… et réserver tous les pseudos drôles pour les revendre.', sub: 'Le capitalisme, version voleur.', tag: 'ruse' }
      ]
    }
  ];

  function dots() { $('#dots').innerHTML = CH.map((_, i) => `<i class="${i <= idx ? 'on' : ''}"></i>`).join(''); }
  async function turn(fn) {
    const body = $('#fableBody'); body.classList.add('out');
    await sleep(420); fn(); body.classList.remove('out');
  }
  function start() {
    s = fresh(); idx = 0;
    $('#posterZone').classList.add('hidden');
    turn(() => { $('#fableIntro').classList.add('hidden'); $('#fableMain').classList.remove('hidden'); }).then(show);
  }
  async function show() {
    const ch = CH[idx];
    $('#chNum').textContent = 'Chapitre ' + ROMAN[idx];
    $('#chTitle').textContent = ch.title;
    dots(); C.innerHTML = ''; $('#skipHint').classList.remove('hidden');
    const top = $('#fableCard').getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * .5) $('#fableCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    await typeInto(T, ch.text(s), { skipEl: $('#fableCard') });
    $('#skipHint').classList.add('hidden');
    if (ch.choices === 'name') renderName(); else renderChoices(ch.choices(s));
    setTimeout(() => { const r = C.getBoundingClientRect(); if (r.bottom > innerHeight - 80) window.scrollBy({ top: Math.min(r.bottom - innerHeight + 100, r.top - 80), behavior: 'smooth' }); }, 150);
  }
  function renderChoices(list) {
    C.innerHTML = '';
    list.forEach((c, i) => {
      const b = document.createElement('button'); b.className = 'choice ' + (c.cls || '');
      b.style.animationDelay = (i * .12) + 's';
      b.innerHTML = `${esc(c.label)}${c.sub ? `<small>${esc(c.sub)}</small>` : ''}`;
      b.addEventListener('click', () => choose(c), { once: true });
      C.appendChild(b);
    });
  }
  function renderName() {
    C.innerHTML = `<div class="name-pick"><input id="nameIn" maxlength="22" value="Get Socrated" autocomplete="off" aria-label="Ton nom de voleur"><button class="btn ink small" id="nameOk">Signer</button></div>
      <div class="sugg"><button>Get Socrated</button><button>Socrate des Ombres</button><button>Aurélien le Sournois</button></div><p class="y-says" id="ySays"></p>`;
    const inp = $('#nameIn');
    $$('.sugg button', C).forEach(b => b.addEventListener('click', () => { Sound.click(); inp.value = b.textContent; }));
    const ok = () => {
      const v = inp.value.trim().replace(/\s+/g, ' ');
      if (v.length < 2) { Sound.deny(); $('#ySays').textContent = '« Un nom, voleur. Même un petit. »'; return; }
      if (/yohann|sauced/i.test(v)) { Sound.deny(); discover('yohann'); $('#ySays').textContent = '« Il ne peut y avoir qu\'un seul Yohann. Choisis un autre nom, imposteur. »'; inp.value = 'Get Socrated'; return; }
      if (/lee+roy|lee+rooo*y|leroy/i.test(v)) { discover('leeroy'); toast('LEEROOOOY… Au moins, toi, tu as du poulet.', 3600); }
      inp.blur(); choose({ act: s => { s.name = v; } });
    };
    $('#nameOk').addEventListener('click', ok);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') ok(); });
  }
  function choose(c) {
    Sound.click();
    if (c.tag) { s.score[c.tag]++; s.tags.push(c.tag); }
    c.act && c.act(s);
    idx++;
    if (idx < CH.length) turn(show); else turn(ending);
  }
  async function ending() {
    const sc = s.score, max = Math.max(sc.ombre, sc.chaos, sc.ruse);
    const tied = ['ombre', 'chaos', 'ruse'].filter(k => sc[k] === max);
    const key = tied.length === 1 ? tied[0] : (tied.includes(s.tags[2]) ? s.tags[2] : tied[0]);
    const E = ENDINGS[key];
    const num = { ombre: 'I', chaos: 'II', ruse: 'III' }[key];
    const title = key === 'chaos' ? E.title + deCity(s.city) : E.title;
    $('#chNum').innerHTML = '<span class="ending-badge">Fin ' + num + ' sur III</span>';
    $('#chTitle').textContent = title;
    $('#dots').innerHTML = CH.map(() => '<i class="on"></i>').join('');
    C.innerHTML = ''; $('#skipHint').classList.remove('hidden');
    Sound.fanfare();
    await typeInto(T, E.text(s) + `\n\nYohann range sa dague et te tend la main. « Rendez-vous le 5 novembre, à minuit pile. Cette fois, pour de vrai, [[${s.name}]]. »`, { skipEl: $('#fableCard') });
    $('#skipHint').classList.add('hidden');
    const result = { name: s.name, race: s.race, faction: s.faction, yRace: s.yRace, city: s.city, ending: key, title, bounty: E.bounty, unit: E.unit, crime: E.crime };
    store.set('gs_fable', result);
    applyResult(result);
    C.innerHTML = ''; const b = document.createElement('button'); b.className = 'btn gold'; b.style.width = '100%'; b.textContent = 'Recevoir mon avis de recherche';
    b.addEventListener('click', () => { Sound.coin(); showPoster(result, true); }, { once: true });
    C.appendChild(b);
  }
  $('#fableStart').addEventListener('click', () => { Sound.init(); Sound.click(); start(); });
  $('#fableReplay').addEventListener('click', () => { Sound.click(); $('#fableCard').scrollIntoView({ behavior: 'smooth' }); start(); });
  return { start };
})();
function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function applyResult(r) {
  $('#aName').textContent = r.name;
  $('#aRace').textContent = r.race;
  $('#aFaction').textContent = r.faction;
  $('#yRace').textContent = r.yRace;
  $$('.pName').forEach(e => e.textContent = r.name);
}

/* =========================================================
   AVIS DE RECHERCHE (canvas → image)
   ========================================================= */
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
function drawHooded(c, x, y, s, race, eye) {
  c.save(); c.translate(x, y); c.scale(s, s);
  const small = race === 'Gnome' ? .78 : race === 'Nain' ? .9 : 1;
  c.translate(0, (1 - small) * 160); c.scale(small, small);
  c.fillStyle = '#0d0805';
  if (race === 'Elfe de la nuit') { c.beginPath(); c.moveTo(-58, -78); c.lineTo(-128, -128); c.lineTo(-62, -55); c.closePath(); c.fill(); c.beginPath(); c.moveTo(58, -78); c.lineTo(128, -128); c.lineTo(62, -55); c.closePath(); c.fill(); }
  c.beginPath(); c.moveTo(-150, 160); c.bezierCurveTo(-150, 40, -100, 10, -70, -10); c.bezierCurveTo(-90, -80, -60, -160, 0, -175);
  c.bezierCurveTo(60, -160, 90, -80, 70, -10); c.bezierCurveTo(100, 10, 150, 40, 150, 160); c.closePath(); c.fill();
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, -60, 44, 56, 0, 0, Math.PI * 2); c.fill();
  if (race === 'Nain') { c.fillStyle = '#1a100a'; c.beginPath(); c.moveTo(-40, -30); c.quadraticCurveTo(0, 70, 40, -30); c.quadraticCurveTo(0, -10, -40, -30); c.fill(); }
  if (race === 'Orc' || race === 'Troll') { c.strokeStyle = '#e8dcc0'; c.lineWidth = 7; c.lineCap = 'round'; const L = race === 'Troll' ? 34 : 18; c.beginPath(); c.moveTo(-20, -28); c.quadraticCurveTo(-30, -28 - L * .5, -26, -30 - L); c.moveTo(20, -28); c.quadraticCurveTo(30, -28 - L * .5, 26, -30 - L); c.stroke(); }
  if (race === 'Mort-vivant') { c.strokeStyle = 'rgba(220,210,180,.55)'; c.lineWidth = 3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 9, -30); c.lineTo(i * 9, -18); c.stroke(); } }
  c.shadowColor = eye; c.shadowBlur = 24; c.fillStyle = eye;
  c.beginPath(); c.ellipse(-17, -66, 10, 5, -.15, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(17, -66, 10, 5, .15, 0, Math.PI * 2); c.fill();
  c.restore();
}
async function renderPoster(r) {
  await fontsReady();
  const W = 1080, H = 1500, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); const ink = '#2b1709', red = '#7a120f';
  paperBg(c, W, H, 777);
  // clou
  c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 8; c.shadowOffsetY = 4; const ng = c.createRadialGradient(W / 2 - 4, 66, 2, W / 2, 70, 16); ng.addColorStop(0, '#ddd'); ng.addColorStop(1, '#444'); c.fillStyle = ng; c.beginPath(); c.arc(W / 2, 70, 15, 0, 7); c.fill(); c.restore();
  c.fillStyle = red; c.textBaseline = 'alphabetic';
  fitFont(c, 'AVIS DE RECHERCHE', 900, '"Cinzel Decorative"', 96, 940); c.textAlign = 'center'; c.fillText('AVIS DE RECHERCHE', W / 2, 200);
  ornamentRule(c, W / 2, 238, 760, ink);
  c.fillStyle = ink; c.font = 'italic 42px "IM Fell English"';
  c.fillText(r.race === 'Mort-vivant' ? 'Mort ou… encore plus mort' : 'Mort ou vif — de préférence en Camouflage', W / 2, 300);
  // portrait
  const px = 230, py = 340, pw = 620, ph = 500;
  const fcol = r.faction === 'Alliance' ? '47,95,168' : '163,34,27';
  const bg = c.createLinearGradient(0, py, 0, py + ph); bg.addColorStop(0, '#3a2a1c'); bg.addColorStop(1, `rgb(${fcol})`);
  c.fillStyle = bg; c.fillRect(px, py, pw, ph);
  const mist = c.createRadialGradient(W / 2, py + ph * .45, 20, W / 2, py + ph * .45, 330); mist.addColorStop(0, 'rgba(255,220,160,.35)'); mist.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = mist; c.fillRect(px, py, pw, ph);
  c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
  const eye = { 'Mort-vivant': '#ffd23a', 'Elfe de la nuit': '#bfe3ff', 'Troll': '#ff7a3a', 'Orc': '#ff5a3a', 'Gnome': '#b0ffb0', 'Nain': '#ffd9a0', 'Humain': '#9fd0ff' }[r.race] || '#f3d27a';
  drawHooded(c, W / 2, py + ph - 150, 1.05, r.race, eye);
  c.restore();
  c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(px, py, pw, ph); c.lineWidth = 2; c.strokeRect(px - 12, py - 12, pw + 24, ph + 24);
  // nom
  c.fillStyle = ink; fitFont(c, r.name.toUpperCase(), 900, 'Cinzel', 104, 940); c.textAlign = 'center'; c.fillText(r.name.toUpperCase(), W / 2, 960);
  c.font = '700 38px Cinzel'; c.fillStyle = ink;
  c.fillText(`Voleur · ${r.race} · ${r.faction}`, W / 2, 1018);
  c.fillStyle = `rgb(${fcol})`; c.fillRect(W / 2 - 120, 1036, 240, 5);
  c.fillStyle = ink; c.font = 'italic 34px "IM Fell English"';
  const y2 = wrap(c, 'Recherché pour : ' + r.crime, W / 2, 1092, 860, 42);
  c.font = '700 40px Cinzel'; c.fillText('— PRIME —', W / 2, y2 + 34);
  c.fillStyle = red; fitFont(c, r.bounty + ' po', 900, '"Cinzel Decorative"', 104, 700); c.fillText(r.bounty + ' po', W / 2, y2 + 136);
  c.fillStyle = ink; c.font = 'italic 30px "IM Fell English"';
  c.fillText(r.unit.includes('tonneau') ? '+ un tonneau de bière naine' : 'pièces d\'or, payables à la taverne', W / 2, y2 + 180);
  c.font = '26px "IM Fell English"';
  wrap(c, `Complice notoire : Get Sauced (${r.yRace.toLowerCase()}). Ne pas approcher sans potion de soins. — La garde ${deCity(r.city)}`, W / 2, y2 + 245, 760, 32);
  drawSeal(c, W - 150, y2 + 100, 140, -14);
  return cv;
}
let posterCanvas = null;
async function showPoster(r, scroll) {
  posterCanvas = await renderPoster(r);
  const img = $('#posterImg'); img.src = posterCanvas.toDataURL('image/jpeg', .9);
  $('#posterZone').classList.remove('hidden');
  if (canShareFiles()) $('#posterShare').classList.remove('hidden');
  if (scroll) setTimeout(() => $('#posterZone').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
$('#posterDl').addEventListener('click', () => { Sound.click(); posterCanvas && saveCanvas(posterCanvas, `avis-de-recherche-${slug(store.get('gs_fable', {}).name || 'voleur')}.jpg`, false); });
$('#posterShare').addEventListener('click', () => { Sound.click(); posterCanvas && saveCanvas(posterCanvas, `avis-de-recherche-${slug(store.get('gs_fable', {}).name || 'voleur')}.jpg`, true, 'Avis de recherche. Signé : la garde.'); });

/* Résultat déjà obtenu lors d'une visite précédente */
(() => {
  const r = store.get('gs_fable', null);
  if (r && r.name && r.race) {
    applyResult(r);
    $('#fableIntro').innerHTML = `<p>Ta légende est déjà écrite : <b>${esc(r.name)}</b>, ${esc(r.race.toLowerCase())}, ${esc(r.faction)}. Fin : « ${esc(r.title)} ».</p><button class="btn ink" id="fableStart2">Rejouer la Fable</button>`;
    $('#fableStart2').addEventListener('click', () => { Sound.init(); Sound.click(); Fable.start(); });
    showPoster(r, false);
  }
})();

/* =========================================================
   DUEL DANS LES OMBRES
   ========================================================= */
const Duel = (() => {
  const cv = $('#duelCv'), cx = cv.getContext('2d');
  let W = 0, H = 0, st = null, running = false, last = 0, best = store.get('gs_best', 0), denyT = 0;
  const ENEMIES = ['Gnoll pickpocket', 'Garde somnolent', 'Kobold « Pas la bougie ! »', 'Bandit des Défias', 'Voleur rival masqué', 'Le Gardien du Registre', 'Ogre mal réveillé', 'Comptable royal', 'Assassin de la Main Noire', 'L\'Ombre Rivale'];
  $('#scBest').textContent = best;
  function size() { const d = Math.min(devicePixelRatio || 1, 2); const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); if (!running) draw(0); }
  function enemy(l) { const hp = 50 + 24 * (l - 1); return { name: ENEMIES[(l - 1) % ENEMIES.length] + (l > ENEMIES.length ? ` +${l - ENEMIES.length}` : ''), hp, max: hp, next: 1.3, wind: 0, winding: false, windDur: Math.max(.5, .95 - .045 * l), interval: Math.max(.95, 2.3 - .13 * l), dmg: 9 + 2 * l, dead: false }; }
  function reset() { st = { hp: 100, max: 100, en: 100, cp: 0, score: 0, kills: 0, lvl: 1, e: enemy(1), evUntil: -1, evCd: -1, evAt: -9, t: 0, fx: [], shake: 0, pl: 0, el: 0, pf: 0, ef: 0, over: false, spawn: 0 }; }
  function float(text, x, y, col, big) { st.fx.push({ text, x, y, col, big, life: 0 }); }
  function hitEnemy(dmg, crit, label) {
    const e = st.e; e.hp -= dmg; st.score += dmg; st.ef = 1;
    float((label ? label + ' ' : '') + dmg, W * .72, H * .45, crit ? '#ffd23a' : '#fff', crit);
    if (crit) { st.shake = 10; Sound.crit(); if (navigator.vibrate) try { navigator.vibrate(30); } catch (x) {} } else Sound.hit();
    if (e.hp <= 0) {
      e.hp = 0; e.dead = true; e.winding = false; st.kills++; st.score += 150; st.hp = Math.min(st.max, st.hp + 25); st.spawn = 1.3;
      float('VAINCU ! +150', W * .5, H * .42, '#f3d27a', true); Sound.coin();
    }
  }
  function ss() {
    if (!running || st.over || st.e.dead) return;
    if (st.en < 40) return deny('Pas assez d\'énergie');
    st.en -= 40; st.pl = 1; Sound.slash();
    const crit = Math.random() < .22; let d = 8 + Math.floor(Math.random() * 6); if (crit) d *= 2;
    st.cp = Math.min(5, st.cp + (crit ? 2 : 1));
    hitEnemy(d, crit, crit ? 'CRITIQUE !' : '');
  }
  function ev() {
    if (!running || st.over || st.e.dead) return;
    if (st.cp < 1) return deny('Aucun point de combo');
    if (st.en < 35) return deny('Pas assez d\'énergie');
    st.en -= 35; st.pl = 1.2; Sound.slash();
    const cp = st.cp, crit = Math.random() < .22; let d = Math.round(cp * (10 + Math.random() * 5) * (crit ? 2 : 1));
    st.cp = 0;
    hitEnemy(d, crit || cp === 5, cp === 5 && crit ? 'SIGNATURE DE LA MAISON !' : crit ? 'CRITIQUE !' : cp === 5 ? 'ÉVISCÉRATION !' : '');
  }
  function dodge() {
    if (!running || st.over) return;
    if (st.t < st.evCd) return;
    st.evAt = st.t; st.evUntil = st.t + .5; st.evCd = st.t + 1.05; Sound.whoosh();
  }
  function deny(msg) { if (st.t - denyT > .6) { denyT = st.t; float(msg, W * .3, H * .5, '#ff9a8a'); Sound.deny(); } }
  function update(dt) {
    st.t += dt; st.en = Math.min(100, st.en + 30 * dt);
    const e = st.e;
    if (e.dead) { st.spawn -= dt; if (st.spawn <= 0) { st.lvl++; st.e = enemy(st.lvl); float('Niveau ' + st.lvl, W * .5, H * .5, '#f3d27a', true); } }
    else if (!e.winding) { e.next -= dt; if (e.next <= 0) { e.winding = true; e.wind = e.windDur; Sound.warn(); } }
    else {
      e.wind -= dt;
      if (e.wind <= 0) {
        e.winding = false; e.next = e.interval * rand(.7, 1.3); st.el = 1;
        if (st.t < st.evUntil) {
          if (st.t - st.evAt <= .3) { float('RIPOSTE !', W * .28, H * .42, '#ffd23a', true); st.cp = Math.min(5, st.cp + 1); hitEnemy(12, false, ''); }
          else float('ESQUIVE !', W * .28, H * .42, '#bfe3ff', true);
          Sound.whoosh();
        } else {
          st.hp -= e.dmg; st.pf = 1; st.shake = 7; Sound.hurt(); float('-' + e.dmg, W * .28, H * .48, '#ff5a4a');
          if (navigator.vibrate) try { navigator.vibrate(60); } catch (x) {}
          if (st.hp <= 0) { st.hp = 0; gameOver(); }
        }
      }
    }
    st.pl = Math.max(0, st.pl - dt * 5); st.el = Math.max(0, st.el - dt * 5); st.pf = Math.max(0, st.pf - dt * 3); st.ef = Math.max(0, st.ef - dt * 4); st.shake = Math.max(0, st.shake - dt * 30);
    st.fx = st.fx.filter(f => (f.life += dt) < 1.1);
  }
  function rogue(x, y, s, dir, cloak, eye, alpha, flash, raise) {
    cx.save(); cx.translate(x, y); cx.scale(s * dir, s); cx.globalAlpha = alpha;
    cx.fillStyle = 'rgba(0,0,0,.5)'; cx.beginPath(); cx.ellipse(0, 2, 34, 7, 0, 0, 7); cx.fill();
    cx.fillStyle = cloak;
    cx.beginPath(); cx.moveTo(-30, 0); cx.quadraticCurveTo(-36, -40, -22, -62); cx.quadraticCurveTo(-28, -90, -8, -106); cx.quadraticCurveTo(6, -116, 18, -102);
    cx.quadraticCurveTo(28, -90, 22, -64); cx.quadraticCurveTo(36, -42, 30, 0); cx.closePath(); cx.fill();
    if (flash > 0) { cx.fillStyle = `rgba(255,70,50,${flash * .55})`; cx.fill(); }
    cx.fillStyle = '#000'; cx.beginPath(); cx.ellipse(9, -84, 10, 12, 0, 0, 7); cx.fill();
    cx.shadowColor = eye; cx.shadowBlur = 10; cx.fillStyle = eye; cx.fillRect(5, -87, 4, 2.5); cx.fillRect(12, -87, 4, 2.5); cx.shadowBlur = 0;
    const ang = raise ? -1.1 : -.25;
    cx.save(); cx.translate(18, -58); cx.rotate(ang);
    cx.strokeStyle = cloak; cx.lineWidth = 9; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(22, 4); cx.stroke();
    cx.strokeStyle = '#d9dde6'; cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(24, 4); cx.lineTo(50, 0); cx.stroke();
    cx.strokeStyle = '#8a6a2c'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(24, -3); cx.lineTo(24, 11); cx.stroke();
    cx.restore(); cx.restore();
  }
  function draw(dt) {
    if (!W) return;
    cx.save(); cx.clearRect(0, 0, W, H);
    if (st && st.shake) cx.translate(rand(-st.shake, st.shake), rand(-st.shake, st.shake));
    const bg = cx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#120a14'); bg.addColorStop(.62, '#1d120c'); bg.addColorStop(1, '#0a0503'); cx.fillStyle = bg; cx.fillRect(-20, -20, W + 40, H + 40);
    cx.fillStyle = 'rgba(230,220,255,.9)'; cx.shadowColor = '#c8c0ff'; cx.shadowBlur = 30; cx.beginPath(); cx.arc(W * .82, H * .2, 16, 0, 7); cx.fill(); cx.shadowBlur = 0;
    cx.fillStyle = '#0a0606'; for (let i = 0; i < 7; i++) { const bx = i * W / 6 - 10, bh = 40 + (i * 37 % 50); cx.fillRect(bx, H * .62 - bh, W / 7, bh); cx.beginPath(); cx.moveTo(bx - 6, H * .62 - bh); cx.lineTo(bx + W / 14, H * .62 - bh - 22); cx.lineTo(bx + W / 7 + 6, H * .62 - bh); cx.fill(); }
    const fy = H * .7, gl = cx.createRadialGradient(W / 2, fy, 10, W / 2, fy, W * .55); gl.addColorStop(0, 'rgba(255,150,60,.25)'); gl.addColorStop(1, 'rgba(255,150,60,0)'); cx.fillStyle = gl; cx.fillRect(0, H * .5, W, H * .5);
    const sc = Math.min(1.05, H / 270);
    if (st) {
      const evading = st.t < st.evUntil;
      const px = W * .27 + st.pl * W * .2 - (evading ? 16 : 0), ex = W * .73 - st.el * W * .2;
      if (evading) rogue(px - 18, fy, sc, 1, '#3b2a55', '#bfe3ff', .25, 0, false);
      rogue(px, fy, sc, 1, '#2e2340', '#bfe3ff', evading ? .55 : 1, st.pf, st.pl > 0);
      const e = st.e;
      if (!e.dead || st.spawn > 1) rogue(ex, fy, sc * (st.lvl % 7 === 0 ? 1.18 : 1), -1, '#3a1410', '#ff4a3a', e.dead ? .3 : 1, st.ef, e.winding);
      if (e.winding && !e.dead) {
        const p = Math.max(0, e.wind / e.windDur), golden = e.wind <= .3;
        cx.strokeStyle = golden ? '#ffd23a' : '#ff3a2a'; cx.lineWidth = golden ? 5 : 3; cx.shadowColor = cx.strokeStyle; cx.shadowBlur = 14;
        cx.beginPath(); cx.arc(ex, fy - 55 * sc, 26 + p * 55, 0, 7); cx.stroke(); cx.shadowBlur = 0;
        cx.fillStyle = golden ? '#ffd23a' : '#ff3a2a'; cx.font = `900 ${28 * sc}px Cinzel, serif`; cx.textAlign = 'center'; cx.fillText('!', ex, fy - 130 * sc);
      }
      st.fx.forEach(f => {
        const a = 1 - f.life / 1.1; cx.globalAlpha = Math.max(0, a); cx.fillStyle = f.col; cx.textAlign = 'center';
        cx.font = `900 ${f.big ? 22 : 17}px Cinzel, serif`; cx.shadowColor = '#000'; cx.shadowBlur = 6;
        cx.fillText(f.text, Math.min(W - 60, Math.max(60, f.x)), f.y - f.life * 40); cx.shadowBlur = 0; cx.globalAlpha = 1;
      });
    } else {
      rogue(W * .27, fy, sc, 1, '#2e2340', '#bfe3ff', 1, 0, false);
      rogue(W * .73, fy, sc, -1, '#3a1410', '#ff4a3a', 1, 0, false);
    }
    cx.restore();
  }
  function hud() {
    $('#eName').textContent = st.e.dead ? '…' : st.e.name;
    $('#eHpTxt').textContent = st.e.dead ? '' : Math.ceil(st.e.hp) + ' / ' + st.e.max;
    $('#eHp').style.width = (st.e.hp / st.e.max * 100) + '%';
    $('#pHp').style.width = (st.hp / st.max * 100) + '%'; $('#pHpTxt').textContent = Math.ceil(st.hp);
    $('#pEn').style.width = st.en + '%'; $('#pEnTxt').textContent = Math.floor(st.en);
    $$('#cps i').forEach((i, k) => i.classList.toggle('on', k < st.cp));
    $('#skSS').classList.toggle('off', st.en < 40);
    $('#skEV').classList.toggle('off', st.en < 35 || st.cp < 1);
    const cd = Math.max(0, st.evCd - st.t); $('#doCd').style.width = (cd / 1.05 * 100) + '%';
    $('#skDO').classList.toggle('off', cd > 0);
    $('#scNow').textContent = st.score; $('#scLvl').textContent = st.lvl;
  }
  function loop(now) {
    if (!running) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!document.hidden) { update(dt); draw(dt); hud(); }
    requestAnimationFrame(loop);
  }
  function startGame() {
    Sound.init(); Sound.click(); reset(); size(); running = true; last = performance.now();
    $('#duelOv').classList.add('hidden'); requestAnimationFrame(loop);
  }
  function gameOver() {
    st.over = true; running = false; draw(0); hud();
    const rec = st.score > best; if (rec) { best = st.score; store.set('gs_best', best); $('#scBest').textContent = best; }
    const ov = $('#duelOv');
    ov.innerHTML = `<h3>${rec ? 'Nouveau record !' : 'Tu es tombé…'}</h3><div class="big">${st.score}</div>
      <p>Niveau ${st.lvl} atteint · ${st.kills} ennemi${st.kills > 1 ? 's' : ''} vaincu${st.kills > 1 ? 's' : ''}<br>${rec ? 'Envoie une capture à Yohann. Il va rager.' : 'Record : ' + best + '. Un vrai voleur se relève toujours.'}</p>
      <button class="btn gold" id="duelAgain">Rejouer</button>`;
    ov.classList.remove('hidden');
    $('#duelAgain').addEventListener('click', startGame);
    Sound.hurt();
  }
  const press = (el, fn) => {
    el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('pressed'); fn(); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => el.addEventListener(t, () => el.classList.remove('pressed')));
    el.addEventListener('contextmenu', e => e.preventDefault());
  };
  press($('#skSS'), ss); press($('#skEV'), ev); press($('#skDO'), dodge);
  addEventListener('keydown', e => {
    if (!running || /INPUT/.test(document.activeElement.tagName)) return;
    if (e.key === '1' || e.key === 'a') ss(); if (e.key === '2' || e.key === 'z') ev(); if (e.key === '3' || e.key === ' ' || e.key === 'e') { if (e.key === ' ') e.preventDefault(); dodge(); }
  });
  $('#duelStart').addEventListener('click', startGame);
  addEventListener('resize', size); setTimeout(size, 50);
  return { size };
})();

/* =========================================================
   LE PACTE DES OMBRES
   ========================================================= */
const Pact = (() => {
  const cv = $('#pad'), cx = cv.getContext('2d'), wrapEl = $('#padWrap');
  let strokes = [], cur = null, sealed = false, W = 0, H = 0;
  const d = new Date();
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const dateTxt = `Fait à la taverne du Cochon Borgne, le ${d.getDate() === 1 ? '1er' : d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}.`;
  $('#pactDate').textContent = dateTxt;
  $('#pactSeal').innerHTML = sealSVG();
  function size() { const dp = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dp; cv.height = H * dp; cx.setTransform(dp, 0, 0, dp, 0, 0); redraw(); }
  function drawStrokes(c, list, sx = 1, sy = 1, ox = 0, oy = 0, lw = 1) {
    c.strokeStyle = '#1f2a55'; c.lineCap = 'round'; c.lineJoin = 'round';
    list.forEach(st => {
      if (st.length === 1) { c.fillStyle = '#1f2a55'; c.beginPath(); c.arc(ox + st[0][0] * sx, oy + st[0][1] * sy, 1.8 * lw, 0, 7); c.fill(); return; }
      for (let i = 1; i < st.length; i++) {
        const [x0, y0] = st[i - 1], [x1, y1] = st[i];
        const v = Math.hypot(x1 - x0, y1 - y0); c.lineWidth = Math.max(1.4, 3.6 - v * .08) * lw;
        c.beginPath(); c.moveTo(ox + x0 * sx, oy + y0 * sy); c.lineTo(ox + x1 * sx, oy + y1 * sy); c.stroke();
      }
    });
  }
  function redraw() { cx.clearRect(0, 0, W, H); drawStrokes(cx, strokes.map(s => s.map(([x, y]) => [x * W, y * H]))); }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  cv.addEventListener('pointerdown', e => { if (sealed) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = [pos(e)]; strokes.push(cur); wrapEl.classList.add('inked'); redraw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; evs.forEach(ev => cur.push(pos(ev))); redraw(); });
  ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { cur = null; }));
  $('#padClear').addEventListener('click', () => { Sound.click(); strokes = []; wrapEl.classList.remove('inked'); redraw(); });
  $('#padSeal').addEventListener('click', () => {
    const pts = strokes.reduce((a, s) => a + s.length, 0);
    if (pts < 12) { Sound.deny(); toast('Signe un peu plus franchement, voleur. Yohann, lui, n\'a pas hésité.'); return; }
    seal(true);
  });
  function unseal() {
    sealed = false; strokes = []; wrapEl.classList.remove('inked'); redraw();
    $('#pact').classList.remove('sealed');
    $('#pactActions').classList.remove('hidden'); $('#pactDone').classList.add('hidden'); $('#pactRedoRow').classList.add('hidden');
    $('#pSigned').textContent = 'EN ATTENTE DE TA SIGNATURE'; $('#pSigned').style.color = '#8e1b17';
    try { localStorage.removeItem('gs_pact'); } catch (e) {}
    Sound.whoosh(); toast('Le pacte est vierge. Signe à nouveau, voleur.');
  }
  $('#pactRedo').addEventListener('click', () => { Sound.click(); unseal(); });
  function seal(anim) {
    sealed = true;
    $('#pact').classList.add('sealed');
    $('#pactActions').classList.add('hidden'); $('#pactDone').classList.remove('hidden'); $('#pactRedoRow').classList.remove('hidden');
    if (canShareFiles()) $('#pactShare').classList.remove('hidden');
    $('#pSigned').textContent = '✔ SIGNÉ ET SCELLÉ'; $('#pSigned').style.color = '#2a6a2a';
    if (anim) {
      setTimeout(() => { Sound.stamp(); const r = $('#pactSeal').getBoundingClientRect(); Embers.burst(r.left + r.width / 2, r.top + r.height / 2, 50); }, 250);
      setTimeout(() => { Sound.chime(); toast('Le pacte est scellé. Pour la vie, et même après.', 3500); }, 900);
      store.set('gs_pact', { strokes, date: dateTxt });
    }
  }
  async function render() {
    await fontsReady();
    const r = store.get('gs_fable', null), name = r ? r.name : 'Get Socrated';
    const Wd = 1080, Hd = 1720, c = document.createElement('canvas'); c.width = Wd; c.height = Hd; const g = c.getContext('2d');
    const ink = '#2b1709', red = '#7a120f';
    paperBg(g, Wd, Hd, 4242);
    g.fillStyle = red; g.textAlign = 'center'; fitFont(g, 'Le Pacte des Ombres', 900, '"Cinzel Decorative"', 84, 900); g.fillText('Le Pacte des Ombres', Wd / 2, 180);
    ornamentRule(g, Wd / 2, 218, 700, ink);
    g.fillStyle = ink; g.font = 'italic 34px "IM Fell English"';
    let y = wrap(g, `Entre les soussignés, Yohann, dit « Get Sauced », voleur de son état, et Aurélien, dit « ${name} », voleur de son état également, il est convenu ce qui suit, sous le regard des ombres et d'une chope de bière :`, Wd / 2, 285, 880, 44);
    y += 20;
    const arts = $$('#pact li').map(li => li.textContent);
    arts.forEach((t, i) => {
      g.fillStyle = red; g.font = '900 34px Cinzel'; g.textAlign = 'center'; g.fillText(['I','II','III','IV','V','VI','VII','VIII'][i], 150, y + 4);
      g.fillStyle = ink; g.font = '32px "IM Fell English"'; y = wrap(g, t, 200, y + 4, 780, 40, 'left') + 26;
    });
    g.textAlign = 'center'; g.font = 'italic 30px "IM Fell English"'; g.fillText(dateTxt, Wd / 2, y + 16); y += 70;
    const by = Math.max(y + 140, Hd - 330);
    g.fillStyle = '#1f2a55'; g.save(); g.translate(290, by - 20); g.rotate(-.07); g.font = '96px "Pinyon Script"'; g.fillText('Get Sauced', 0, 0); g.restore();
    const pts = strokes.flat();
    if (pts.length) {
      const asp = W && H ? W / H : 3;
      let minX = 1, minY = 1, maxX = 0, maxY = 0; pts.forEach(([px, py]) => { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); });
      const bw = Math.max(.02, maxX - minX) * asp, bh = Math.max(.02, maxY - minY);
      const box = { w: 380, h: 170 }, sc = Math.min(box.w / bw, box.h / bh);
      const ox = 790 - (bw * sc) / 2 - minX * asp * sc, oy = by - 60 - (bh * sc) / 2 - minY * sc;
      drawStrokes(g, strokes.map(s => s.map(([px, py]) => [px * asp, py])), sc, sc, ox, oy, 2.4);
    }
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(100, by + 30); g.lineTo(480, by + 30); g.moveTo(600, by + 30); g.lineTo(980, by + 30); g.stroke();
    g.fillStyle = ink; g.font = '28px "IM Fell English"'; g.fillText('Yohann, dit Get Sauced', 290, by + 72); g.fillText(`Aurélien, dit ${name}`, 790, by + 72);
    drawSeal(g, Wd / 2, by + 180, 170, -14);
    return c;
  }
  $('#pactDl').addEventListener('click', async () => { Sound.click(); saveCanvas(await render(), 'pacte-des-ombres.jpg', false); });
  $('#pactShare').addEventListener('click', async () => { Sound.click(); saveCanvas(await render(), 'pacte-des-ombres.jpg', true, 'Le Pacte des Ombres est scellé.'); });
  onTaps($('#sigY'), 3, () => { Sound.chime(); toast('Signé à l\'encre de sauce. Indélébile.'); });
  const saved = store.get('gs_pact', null);
  setTimeout(() => { size(); if (saved && saved.strokes && saved.strokes.length) { strokes = saved.strokes; wrapEl.classList.add('inked'); redraw(); seal(false); } }, 60);
  addEventListener('resize', size);
  return { size };
})();

/* Recalcule les tailles des canvas quand la page apparaît */
$('#enterBtn').addEventListener('click', () => setTimeout(() => { Duel.size(); Pact.size(); }, 300));

/* Accès direct pour tests : ?entrer */
if (WAS_RESET) setTimeout(() => toast('Tout est remis à zéro : Fable, pacte, secrets, portes et records.', 3500), 600);
if (PARAMS.has('entrer')) { introOpened = true; $('#enterBtn').click(); }

/* =========================================================
   CALENDRIER DES OMBRES (page principale)
   ========================================================= */
(() => {
  const AP = PARAMS.has('apercu');
  const left = ms => { const t = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(t / 86400), hh = Math.floor(t / 3600) % 24, m = Math.floor(t / 60) % 60, x = t % 60; return (d ? d + ' j ' : '') + String(hh).padStart(2, '0') + ' h ' + String(m).padStart(2, '0') + ' min ' + String(x).padStart(2, '0') + ' s'; };
  function render() {
    const done = new Set(store.get('gs_frags', []));
    $('#doors').innerHTML = DOORS.map(d => {
      const open = AP || Date.now() >= d.at;
      return `<a class="door ${open ? 'open' : ''} ${done.has(d.n) ? 'done' : ''}" href="${d.url}${AP ? '?apercu' : ''}" aria-label="Porte ${ROMAN5[d.n - 1]}${open ? ' : ' + d.title : ' (scellée)'}"><span class="lk">${open ? '🔓' : '🔒'}</span><span class="n">${ROMAN5[d.n - 1]}</span><span class="d">${d.day.split(' ').slice(1).join(' ')}</span></a>`;
    }).join('');
    const next = DOORS.find(d => Date.now() < d.at);
    const cur = [...DOORS].reverse().find(d => Date.now() >= d.at);
    $('#nextDoor').innerHTML = (cur ? `Porte ouverte : <b>${cur.title}</b>${done.has(cur.n) ? ' ✔' : ' — elle t\'attend !'}<br>` : '') +
      (next ? `Prochaine porte : <b>${next.day}</b> à 10 h, dans <span id="ndLeft">${left(next.at - Date.now())}</span>` : 'Toutes les portes sont ouvertes. Rendez-vous au QG.');
    $('#mapHome').innerHTML = mapSVG([...done]);
  }
  render();
  setInterval(() => { const next = DOORS.find(d => Date.now() < d.at); if (!next) return; const el = $('#ndLeft'); if (el) el.textContent = left(next.at - Date.now()); if (next.at - Date.now() < 1000) setTimeout(render, 1200); }, 1000);
  addEventListener('pageshow', render);
})();
