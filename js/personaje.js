/* ============================================================
   Dispensa — personajes.
   • CogoMan: la mascota de Dispensa. Te acompaña un rato al entrar (junto al
     botón de música), después se desvanece. Al final de la página lo vuelves a
     encontrar, parado a la izquierda de la sección final.
   • Los primos: personajes distintos que están «estacionados» en las secciones
     (Rasta Rulo, DJ Gorrito). Al final, a la derecha, está Moji, el punk,
     que suelta una bocanada de humo (una vez al llegar y cada vez que lo tocas).
     Si tocas a CogoMan, suelta globos.
   • Máximo tres personajes distintos por página.
   • En el celular: un solo personaje arriba y sin efectos pesados.
   Ilustraciones hechas con ChatGPT, fondo transparente, en img/arte/.
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  const html = document.documentElement;
  const musica = () => html.classList.contains('cg-musica');
  const movil = () => matchMedia('(max-width: 720px)').matches;
  const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- primos (estacionados en las vistas) ---------- */
  const PRIMOS = {
    rasta: { src: 'img/arte/primo-rasta.png', nombre: 'Rasta Rulo' },
    gorrito: { src: 'img/arte/primo-gorrito.png', nombre: 'DJ Gorrito' },
    mohicano: { src: 'img/arte/primo-mohicano.png', nombre: 'Moji' }
  };
  // qué primo va en cada lugar donde antes estaba el zorro
  const LUGARES = [
    ['cl-zorro', 'gorrito'], ['in-zorro-heroe', 'rasta'], ['in-zorro-viaje', 'ninguno'],
    ['pz-zorro-portada', 'rasta'], ['pz-zorro-viaje', 'gorrito'], ['pz-zorro-regla', 'mohicano'], ['pr-zorro', 'gorrito']
  ];
  function primo(id, clase) {
    const p = PRIMOS[id] || PRIMOS.rasta;
    return `<img class="primo primo-${id} ${clase || ''}" src="${p.src}" alt="" title="${p.nombre}" draggable="false" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='${PRIMOS.rasta.src}'}">`;
  }
  /** Reemplaza al zorro (o figuras antiguas) por el primo que corresponde a ese lugar */
  function reemplazarZorro(raiz) {
    let n = 0;
    raiz.querySelectorAll('img[src*="zorro.png"], svg.in-zorro, svg.cl-zorro, img.cl-zorro:not(.primo), svg.cogo, img.cogoman').forEach(el => {
      const cont = (el.getAttribute('class') || '') + ' ' + ((el.closest('[class*="zorro"]') || {}).className || '');
      const lugar = LUGARES.find(([c]) => cont.includes(c));
      const id = lugar ? lugar[1] : ['rasta', 'gorrito', 'mohicano'][n++ % 3];
      if (id === 'ninguno') { el.remove(); return; }
      const t = document.createElement('div');
      t.innerHTML = primo(id, (el.getAttribute('class') || '').replace(/\bcogo(man)?\b/g, '') + ' cg-en-linea');
      el.replaceWith(t.firstElementChild);
    });
    // en el celular: un solo personaje, el de más arriba
    if (movil()) raiz.querySelectorAll('img.primo').forEach((im, k) => { if (k > 0) im.remove(); });
  }

  /** Botón «×» para cerrar una burbuja que tape algo */
  function botonCerrar(alCerrar) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'globo-x'; b.setAttribute('aria-label', 'Cerrar mensaje'); b.textContent = '×';
    b.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); alCerrar(); });
    return b;
  }
  function cierres(raiz) {
    raiz.querySelectorAll('.cl-globo, .pz-globo').forEach(g => {
      if (g.querySelector(':scope > .globo-x')) return;
      if (getComputedStyle(g).position === 'static') g.style.position = 'relative';
      g.appendChild(botonCerrar(() => g.classList.add('globo-cerrado')));
    });
  }

  /* ---------- efectos: humo (Moji) y globos (CogoMan) ---------- */
  function humo(ox, oy) {
    if (reducido() || movil()) return;
    const c = document.createElement('canvas');
    c.className = 'humo-lienzo';
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const P = [];
    for (let i = 0; i < 240; i++) {
      const ang = -Math.PI / 2 + (Math.random() - .5) * 2.1;
      const vel = 3.5 + Math.random() * 7;
      P.push({ x: ox + (Math.random() - .5) * 40, y: oy + (Math.random() - .5) * 24, vx: Math.cos(ang) * vel * 1.3, vy: Math.sin(ang) * vel,
        r: 24 + Math.random() * 40, crece: 2 + Math.random() * 3.4, a: .28 + Math.random() * .22,
        retraso: Math.random() * 90, tono: Math.random() < .35 ? '196,236,206' : '236,240,236' });
    }
    const t0 = performance.now(); let antes = t0;
    (function cuadro(ahora) {
      ahora = ahora || performance.now();
      const dt = Math.min(20, (ahora - antes) / 16.67); antes = ahora;
      const f = (ahora - t0) / 16.67;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let vivos = 0;
      for (const p of P) {
        if (f < p.retraso) { vivos++; continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= Math.pow(.996, dt); p.vy *= Math.pow(.997, dt); p.vy -= .02 * dt; p.vx += Math.sin((f + p.r) * .02) * .08 * dt;
        p.r += p.crece * dt; p.a *= Math.pow(.9948, dt);
        if (p.a < .004 || p.y + p.r < -200) continue;
        vivos++;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${p.tono},${p.a})`); g.addColorStop(.6, `rgba(${p.tono},${p.a * .45})`); g.addColorStop(1, `rgba(${p.tono},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (vivos && ahora - t0 < 8000) requestAnimationFrame(cuadro); else c.remove();
    })();
  }
  function globos(ox, oy) {
    if (reducido()) return;
    const colores = ['#E9C45A', '#5FC48F', '#FF6B35', '#E85D75', '#8FB5E8', '#C9A7F0'];
    for (let i = 0; i < 16; i++) {
      const g = document.createElement('span');
      g.className = 'globo-fiesta';
      const c = colores[i % colores.length];
      g.style.cssText = `left:${ox + (Math.random() - .5) * 120}px;top:${oy + (Math.random() - .5) * 40}px;--c:${c};--dx:${(Math.random() - .5) * 260}px;--dur:${3 + Math.random() * 2}s;--s:${.7 + Math.random() * .6}`;
      document.body.appendChild(g);
      setTimeout(() => g.remove(), 5200);
    }
  }

  /* ---------- CogoMan acompañante (flotante, solo al comienzo) ---------- */
  const POSES = ['apunta', 'saluda', 'pulgar'];
  const src = p => `img/arte/cogoman-${p}.png`;
  const FRASES = {
    inicio: '¡Ey! Soy CogoMan. Te acompaño un rato; abajo nos vemos.',
    club: 'Así ve el club un visitante. DJ Gorrito te explica cómo entrar.',
    postular: 'Aprieta «Rellenar con datos de ejemplo» y mira cómo viaja la solicitud.',
    socio: 'Prueba «Adelantar calendario»: cuando vence la receta, el carrito se pausa solo.',
    panel: 'Aprueba una solicitud en 1 clic y mira todo lo que el sistema hace solo.',
    presentacion: 'Avanza con las flechas del teclado.',
    precios: 'Los primeros 10 dispensarios no pagan la implementación.'
  };
  const SUELTAS = ['Todo en regla, todo en orden.', 'Cada gramo, contado.', 'Receta al día, carrito feliz.', 'Menos WhatsApp, más tiempo para el club.'];
  let yo = null, globoT = null, tSalir = null, silencio = false, pose = 'saluda', visible = false, yInicio = 0, finalVisible = false;
  try { silencio = localStorage.getItem('dispensa-cogo') === 'no'; } catch (e) { }

  function crear() {
    yo = document.createElement('div');
    yo.className = 'cm';
    yo.innerHTML = `<button type="button" class="cm-actor" aria-label="CogoMan"><span class="cm-cuerpo"><img class="cm-img" alt="" draggable="false" src="${src(pose)}"></span></button>`;
    document.body.appendChild(yo);
    yo.querySelector('.cm-actor').addEventListener('click', ev => { saltar(); globos(ev.clientX, ev.clientY); });
  }
  function ponerPose(p) {
    pose = p;
    if (yo) { const im = yo.querySelector('.cm-img'); const s = src(musica() ? 'baila' : p); if (!im.getAttribute('src').endsWith(s)) im.src = s; }
    document.querySelectorAll('img.cm-final').forEach(im => { const s = src(musica() ? 'baila' : 'saluda'); if (!im.getAttribute('src').endsWith(s)) im.src = s; });
  }
  function saltar() { if (!yo) return; const a = yo.querySelector('.cm-actor'); a.classList.remove('cm-salto'); void a.offsetWidth; a.classList.add('cm-salto'); }
  function decir(t) {
    if (!yo || !visible) return;
    let g = yo.querySelector('.cm-globo'); if (g) g.remove();
    g = document.createElement('div'); g.className = 'cm-globo'; g.textContent = t;
    g.appendChild(botonCerrar(() => g.remove()));
    yo.appendChild(g);
    clearTimeout(globoT); globoT = setTimeout(() => { g.classList.add('cm-globo-fuera'); setTimeout(() => g.remove(), 450); }, 5000);
  }
  function entrar(texto) {
    if (silencio || movil() || finalVisible) return;
    if (!yo) crear();
    ponerPose(POSES[Math.floor(Math.random() * POSES.length)]);
    yInicio = scrollY;
    if (!visible) { if (choca()) return; visible = true; setTimeout(() => yo && yo.classList.add('cm-in'), 40); setTimeout(() => decir(texto), 700); }
    else { saltar(); decir(texto); }
    clearTimeout(tSalir); tSalir = setTimeout(salir, 11000);   // te acompaña un rato y se desvanece
  }
  function salir() {
    if (!yo || !visible) return;
    const g = yo.querySelector('.cm-globo'); if (g) g.remove();
    yo.classList.remove('cm-in'); visible = false;
  }
  /** Mensaje del acompañante (también lo usa la radio) */
  function asomar(texto) { entrar(texto); }

  // al hacer scroll: se inclina y da saltitos; si bajaste bastante, se desvanece (lo encuentras al final)
  let ultY = scrollY, vel = 0, inclin = 0, andando = false;
  addEventListener('scroll', () => {
    vel += (scrollY - ultY); ultY = scrollY;
    if (visible && (Math.abs(scrollY - yInicio) > innerHeight * 1.6 || choca())) salir();
    if (!andando && visible) { andando = true; requestAnimationFrame(paso); }
  }, { passive: true });
  /** ¿El acompañante está por toparse con otro personaje? Entonces se desvanece (nunca pasan uno debajo del otro). */
  function choca() {
    if (!yo) return false;
    const a = yo.querySelector('.cm-actor').getBoundingClientRect(), m = 30;
    return [...document.querySelectorAll('img.primo, img.fin-par')].some(im => {
      const b = im.getBoundingClientRect();
      return b.width && !(b.right < a.left - m || b.left > a.right + m || b.bottom < a.top - m || b.top > a.bottom + m);
    });
  }
  function paso() {
    vel *= .86; inclin += (Math.max(-16, Math.min(16, vel * .35)) - inclin) * .2;
    if (yo) {
      const c = yo.querySelector('.cm-cuerpo');
      const salto = Math.abs(inclin) > 1 ? Math.abs(Math.sin(performance.now() / 110)) * Math.min(12, Math.abs(inclin)) : 0;
      c.style.transform = `translateY(${-salto}px) rotate(${inclin}deg)`;
    }
    if (Math.abs(vel) > .3 || Math.abs(inclin) > .3) requestAnimationFrame(paso); else { andando = false; if (yo) yo.querySelector('.cm-cuerpo').style.transform = ''; }
  }

  /* ---------- el encuentro final: CogoMan a la izquierda, Moji a la derecha ---------- */
  const humoHecho = {};
  function encuentroFinal(nombre, raiz) {
    const sec = raiz.querySelector('.cl-final, .in-final');
    if (!sec || movil() || sec.querySelector('.fin-par')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    sec.classList.add('con-final');
    const cogo = document.createElement('img');
    cogo.className = 'fin-par cm-final'; cogo.alt = ''; cogo.title = 'CogoMan'; cogo.draggable = false; cogo.src = src(musica() ? 'baila' : 'saluda');
    const t = document.createElement('div'); t.innerHTML = primo('mohicano', 'fin-par moji-final');
    const moji = t.firstElementChild;
    sec.append(cogo, moji);
    cogo.addEventListener('click', ev => { globos(ev.clientX, ev.clientY - 60); cogo.classList.remove('fin-salta'); void cogo.offsetWidth; cogo.classList.add('fin-salta'); });
    moji.addEventListener('click', () => { const r = moji.getBoundingClientRect(); humo(r.left + r.width * .5, r.top + r.height * .28); });
    const io = new IntersectionObserver(ent => ent.forEach(e => {
      finalVisible = e.isIntersecting;
      if (!e.isIntersecting) return;
      salir();                                  // el acompañante flotante se va: ahora lo ves aquí
      cogo.classList.add('fin-in'); moji.classList.add('fin-in');
      if (!humoHecho[nombre]) {
        humoHecho[nombre] = true;
        setTimeout(() => { const r = moji.getBoundingClientRect(); humo(r.left + r.width * .5, r.top + r.height * .28); }, 900);
      }
    }), { threshold: .3 });
    io.observe(sec);
    D.personaje._io = io;
  }

  function alEntrar(nombre, raiz) {
    finalVisible = false;
    reemplazarZorro(raiz);
    cierres(raiz); setTimeout(() => cierres(raiz), 1500);
    encuentroFinal(nombre, raiz);
    if (yo) salir();
    setTimeout(() => entrar(FRASES[nombre] || SUELTAS[0]), 900);
  }
  new MutationObserver(() => ponerPose(pose)).observe(html, { attributes: true, attributeFilter: ['class'] });

  function silenciar(v) {
    silencio = v;
    try { localStorage.setItem('dispensa-cogo', v ? 'no' : 'si'); } catch (e) { }
    if (v) { clearTimeout(tSalir); if (yo) { yo.remove(); yo = null; visible = false; } } else entrar('¡Volví!');
  }

  /* ---------- estilos ---------- */
  const css = document.createElement('style');
  css.textContent = `
img.primo { display: block; height: auto; object-fit: contain; filter: drop-shadow(0 12px 18px rgba(0,0,0,.45)); user-select: none; transform-origin: 50% 100%; animation: prRespira 4.2s ease-in-out infinite; }
img.primo-gorrito { animation: prCabeceo .6s ease-in-out infinite alternate; }
@keyframes prRespira { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02, .985); } }
@keyframes prCabeceo { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
.vista-presentacion .pz-zorro-png img.primo { width: auto !important; height: min(30vh, 250px) !important; max-width: 100%; }
.vista-inicio img.primo.in-zorro-heroe { width: auto !important; height: min(26vh, 220px) !important; }
/* acompañante flotante: encima del botón de música, se desvanece */
body[data-vista="presentacion"] .cm { bottom: calc(134px + env(safe-area-inset-bottom, 0px)); }
.cm { position: fixed; left: 8px; bottom: calc(76px + env(safe-area-inset-bottom, 0px)); z-index: 90; pointer-events: none; }
.cm-actor { pointer-events: auto; display: block; width: 116px; border: 0; padding: 0; background: none; cursor: pointer; opacity: 0; transform: translateY(24px) scale(.9); transition: opacity .6s ease, transform .7s cubic-bezier(.34,1.56,.64,1); }
.cm.cm-in .cm-actor { opacity: 1; transform: none; }
.cm:not(.cm-in) .cm-actor { pointer-events: none; }
.cm-cuerpo { display: block; transform-origin: 50% 100%; transition: transform .12s linear; }
.cm-img { width: 100%; height: auto; display: block; filter: drop-shadow(0 12px 18px rgba(0,0,0,.5)); animation: cmFlota 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
html.cg-musica .cm-img, html.cg-musica img.cm-final { animation: cmBaila .55s ease-in-out infinite alternate; }
@keyframes cmFlota { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-6px) rotate(1.5deg); } }
@keyframes cmBaila { from { transform: rotate(-5deg) translateY(0); } to { transform: rotate(5deg) translateY(-8px); } }
.cm-actor.cm-salto .cm-cuerpo { animation: cmSalto .7s cubic-bezier(.34,1.56,.64,1); }
@keyframes cmSalto { 0% { translate: 0 0; } 40% { translate: 0 -46px; rotate: -8deg; } 100% { translate: 0 0; rotate: 0deg; } }
.cm-globo { position: absolute; left: 96px; bottom: 120px; width: max-content; max-width: 210px; padding: 8px 28px 8px 12px; border-radius: 14px 14px 14px 4px; background: var(--fondo-2); color: var(--tinta);
  border: 1.5px solid var(--salvia); font: 600 13.5px/1.35 var(--f-texto); box-shadow: var(--sombra-sm); animation: cmGlobo .35s cubic-bezier(.34,1.56,.64,1) both; transition: opacity .4s, transform .4s; pointer-events: auto; }
.cm-globo.cm-globo-fuera { opacity: 0; transform: translateY(6px) scale(.96); pointer-events: none; }
@keyframes cmGlobo { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
.globo-x { position: absolute; top: -9px; right: -9px; width: 24px; height: 24px; border-radius: 50%; background: var(--fondo-3); color: var(--tinta);
  border: 1.5px solid var(--linea-fuerte); font: 700 15px/1 var(--f-texto); cursor: pointer; pointer-events: auto; display: grid; place-items: center; z-index: 3; padding: 0; box-shadow: var(--sombra-sm); }
.globo-x:hover { background: var(--bosque); color: var(--sobre-bosque); }
.globo-cerrado { display: none !important; }
/* encuentro final: parados dentro de la sección final, a los costados */
.con-final { overflow: clip; }
img.fin-par { position: absolute; bottom: 64px; width: auto !important; height: min(22vh, 190px) !important; z-index: 2; cursor: pointer; filter: drop-shadow(0 12px 18px rgba(0,0,0,.5)); opacity: 0; transition: transform .9s cubic-bezier(.34,1.56,.64,1), opacity .5s; user-select: none; }
img.cm-final { left: clamp(90px, 7vw, 160px); transform: translateX(-60px); }
img.moji-final { right: clamp(16px, 4vw, 70px); left: auto; transform: translateX(60px); }
img.fin-par.fin-in { opacity: 1; transform: none; }
img.cm-final.fin-salta { animation: cmSalto .7s cubic-bezier(.34,1.56,.64,1); }
@media (max-width: 1100px) { img.fin-par { height: 130px !important; bottom: 56px; } }
.humo-lienzo { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 88; pointer-events: none; }
.globo-fiesta { position: fixed; z-index: 95; width: calc(34px * var(--s)); height: calc(42px * var(--s)); border-radius: 50% 50% 48% 48%; background: radial-gradient(circle at 32% 30%, rgba(255,255,255,.7), var(--c) 35%, var(--c));
  pointer-events: none; animation: globoSube var(--dur) cubic-bezier(.3,.1,.4,1) forwards; }
.globo-fiesta::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1px; height: calc(40px * var(--s)); background: rgba(255,255,255,.5); }
@keyframes globoSube { 0% { transform: translate(0,0) scale(.3); opacity: 0; } 12% { opacity: 1; transform: translate(0,-20px) scale(1); } 100% { transform: translate(var(--dx), -110vh) rotate(12deg); opacity: .9; } }
@media (max-width: 720px) { .cm, .humo-lienzo, img.fin-par { display: none !important; } }
@media (prefers-reduced-motion: reduce) { .cm-img, img.primo { animation: none !important; } }
`;
  document.head.appendChild(css);

  D.personaje = {
    svg: (clase) => primo('gorrito', clase),   // el anfitrión del club es DJ Gorrito
    primo, asomar, alEntrar, reemplazarZorro, silenciar, humo, globos,
    get silenciado() { return silencio; }
  };
})();
