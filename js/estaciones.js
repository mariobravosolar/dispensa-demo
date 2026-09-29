/* ============================================================
   Dispensa — «Estaciones del club»: música generada en vivo con Web Audio.
   No usa archivos ni servicios externos, así que suena en cualquier lugar
   (también en el enlace publicado) y no tiene derechos de autor de terceros.
   Tres estilos: reggae, cósmico (psicodélico) y boom bap (hip hop).
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  let ctx = null, master = null, reverb = null, eco = null, timer = null, actual = null, paso = 0, proximo = 0;

  const nota = n => 440 * Math.pow(2, (n - 69) / 12);   // MIDI → Hz

  function iniciarAudio() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = .55;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    // reverberación simple con ruido que decae
    reverb = ctx.createConvolver();
    const largo = ctx.sampleRate * 2.4, ir = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < largo; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.6); }
    reverb.buffer = ir;
    const rv = ctx.createGain(); rv.gain.value = .32; reverb.connect(rv).connect(master);
    // eco (delay con retroalimentación)
    eco = ctx.createDelay(1); eco.delayTime.value = .375;
    const fb = ctx.createGain(); fb.gain.value = .38; const ev = ctx.createGain(); ev.gain.value = .35;
    eco.connect(fb).connect(eco); eco.connect(ev).connect(master);
  }

  /* ---------- instrumentos ---------- */
  function envolvente(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function bombo(t, v = 1) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .18);
    envolvente(g, t, .003, .95 * v, .32); o.connect(g).connect(master); o.start(t); o.stop(t + .4);
  }
  let ruidoBuf = null;
  function ruido() { if (!ruidoBuf) { ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } const s = ctx.createBufferSource(); s.buffer = ruidoBuf; return s; }
  function caja(t, v = 1, rev = .6) {
    const n = ruido(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = .8;
    envolvente(g, t, .002, .5 * v, .18); n.connect(f).connect(g); g.connect(master);
    const s = ctx.createGain(); s.gain.value = rev; g.connect(s).connect(reverb);
    n.start(t); n.stop(t + .25);
    const o = ctx.createOscillator(), go = ctx.createGain(); o.frequency.value = 190; envolvente(go, t, .002, .25 * v, .08); o.connect(go).connect(master); o.start(t); o.stop(t + .12);
  }
  function platillo(t, v = .5, largo = .05) {
    const n = ruido(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'highpass'; f.frequency.value = 7500; envolvente(g, t, .001, .22 * v, largo);
    n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + largo + .05);
  }
  function bajo(t, n, dur, v = .5) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = nota(n); f.type = 'lowpass'; f.frequency.value = 420;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .02); g.gain.setTargetAtTime(.0001, t + dur * .7, .06);
    o.connect(f).connect(g).connect(master); o.start(t); o.stop(t + dur + .3);
  }
  function acorde(t, notas, dur, { tipo = 'sawtooth', corte = 1400, v = .08, rev = .4, conEco = 0, ataque = .01 } = {}) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'lowpass'; f.frequency.value = corte; f.Q.value = .7;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + ataque); g.gain.setTargetAtTime(.0001, t + dur, dur * .35 + .03);
    f.connect(g); g.connect(master);
    if (rev) { const s = ctx.createGain(); s.gain.value = rev; g.connect(s).connect(reverb); }
    if (conEco) { const s = ctx.createGain(); s.gain.value = conEco; g.connect(s).connect(eco); }
    notas.forEach((n, i) => { [-6, 6].forEach(det => { const o = ctx.createOscillator(); o.type = tipo; o.frequency.value = nota(n); o.detune.value = det + i; o.connect(f); o.start(t); o.stop(t + dur * 2.5 + .5); }); });
  }
  function campana(t, n, v = .12, conEco = .6) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = nota(n);
    envolvente(g, t, .005, v, 1.2); o.connect(g).connect(master);
    const e = ctx.createGain(); e.gain.value = conEco; g.connect(e).connect(eco); o.start(t); o.stop(t + 1.5);
  }

  /* ---------- estilos (patrones por semicorchea, 16 pasos por compás) ---------- */
  const ESTILOS = {
    reggae: {
      nombre: 'Reggae del cerro', bpm: 74, fondo: 'jamaica',
      acordes: [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]],  // Am G F G
      raices: [45, 43, 41, 43],
      tocar(t, s, c, sc) {
        const i = c % 4;
        if (s === 8) { bombo(t, .9); caja(t, .7, .5); }                       // one drop
        if (s % 2 === 0) platillo(t, s % 4 === 2 ? .7 : .35);
        if (s === 4 || s === 12) acorde(t, this.acordes[i].map(n => n + 12), sc * 1.2, { tipo: 'square', corte: 2400, v: .05, rev: .5 }); // skank
        if ([0, 3, 6, 10, 14].includes(s)) bajo(t, this.raices[i] + (s === 10 ? 7 : s === 14 ? 5 : 0), sc * 2.4, .55);
      }
    },
    cosmico: {
      nombre: 'Viaje cósmico', bpm: 62, fondo: 'cosmos',
      acordes: [[52, 55, 59, 66], [48, 52, 55, 59], [55, 59, 62, 66], [50, 54, 57, 64]], // Em9 Cmaj7 Gmaj7 D
      arpegio: [0, 2, 1, 3, 2, 1, 3, 0],
      tocar(t, s, c, sc) {
        const i = c % 4, ac = this.acordes[i];
        if (s === 0) { acorde(t, ac, sc * 15, { corte: 900, v: .06, rev: .9, ataque: .9 }); bombo(t, .5); bajo(t, ac[0] - 12, sc * 14, .35); }
        if (s % 2 === 0) campana(t, ac[this.arpegio[(s / 2) % 8]] + 12, .07, .75);
        if (s === 8) caja(t, .25, 1.2);
        if (s % 4 === 2) platillo(t, .18, .09);
      }
    },
    boombap: {
      nombre: 'Boom bap callejero', bpm: 88, fondo: 'calle',
      acordes: [[50, 53, 57, 60, 64], [55, 59, 62, 65, 69], [48, 52, 55, 59, 62], [57, 61, 64, 67]], // Dm9 G13 Cmaj9 A7
      raices: [38, 43, 36, 45],
      tocar(t, s, c, sc) {
        const i = c % 4, swing = (s % 2 === 1) ? sc * .18 : 0, tt = t + swing;
        if ([0, 7, 10].includes(s)) bombo(tt, s === 0 ? 1 : .8);
        if (s === 4 || s === 12) caja(tt, .95, .35);
        if (s % 2 === 0 || s === 15) platillo(tt, s % 4 === 0 ? .55 : .35, s === 14 ? .16 : .04);
        if (s === 0) acorde(tt, this.acordes[i], sc * 10, { tipo: 'triangle', corte: 1800, v: .09, rev: .35 });
        if (s === 0 || s === 7 || s === 10) bajo(tt, this.raices[i], sc * 3, .6);
      }
    }
  };

  function programar() {
    const e = ESTILOS[actual]; if (!e) return;
    const sc = 60 / e.bpm / 4;
    while (proximo < ctx.currentTime + .15) {
      const s = paso % 16, c = Math.floor(paso / 16);
      e.tocar(proximo, s, c, sc);
      proximo += sc; paso++;
    }
  }

  function tocar(id) {
    iniciarAudio();
    if (ctx.state === 'suspended') ctx.resume();
    detener(true);
    actual = id; paso = 0; proximo = ctx.currentTime + .08;
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(.55, ctx.currentTime);
    timer = setInterval(programar, 25);
    return ESTILOS[id];
  }
  function detener(rapido) {
    clearInterval(timer); timer = null;
    if (ctx && master && !rapido) { master.gain.setTargetAtTime(.0001, ctx.currentTime, .15); setTimeout(() => master && master.gain.setValueAtTime(.55, ctx.currentTime), 700); }
    actual = null;
  }

  D.estaciones = { tocar, detener, lista: Object.entries(ESTILOS).map(([id, e]) => ({ id, nombre: e.nombre, fondo: e.fondo })), get actual() { return actual; } };
})();
