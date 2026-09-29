/* ============================================================
   Dispensa — personajes.
   • CogoMan: la mascota de Dispensa. Hay UNO SOLO: entra una vez, se queda
     acompañándote en la esquina y te va hablando en cada sección del recorrido.
     Cuando suena música se pone los audífonos y baila.
   • Los primos: personajes distintos (no son CogoMan) que están «estacionados»
     en las secciones haciendo lo suyo: Rasta Rulo, DJ Gorrito y Moji.
   Ilustraciones hechas con ChatGPT, fondo transparente, en img/arte/.
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  const html = document.documentElement;
  const musica = () => html.classList.contains('cg-musica');

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
  /** Reemplaza al zorro (o a cualquier figura antigua) por el primo que corresponde a ese lugar */
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
  }

  /** Botón «×» para cerrar una burbuja de diálogo que tape algo */
  function botonCerrar(alCerrar) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'globo-x'; b.setAttribute('aria-label', 'Cerrar mensaje'); b.textContent = '×';
    b.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); alCerrar(); });
    return b;
  }
  /** Agrega «×» a las burbujas de los primos dentro de una vista */
  function cierres(raiz) {
    raiz.querySelectorAll('.cl-globo, .pz-globo').forEach(g => {
      if (g.querySelector(':scope > .globo-x')) return;
      if (getComputedStyle(g).position === 'static') g.style.position = 'relative';
      g.appendChild(botonCerrar(() => g.classList.add('globo-cerrado')));
    });
  }


  /* ---------- final de página: Moji suelta una bocanada de humo (una sola vez) ---------- */
  const humoHecho = {};
  function humo(ox, oy) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.className = 'humo-lienzo';
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    const P = [];
    for (let i = 0; i < 260; i++) {
      const ang = -Math.PI / 2 + (Math.random() - .5) * 2.1;         // hacia arriba, abanico amplio
      const vel = 3.5 + Math.random() * 7;
      P.push({ x: ox + (Math.random() - .5) * 40, y: oy + (Math.random() - .5) * 24, vx: Math.cos(ang) * vel * 1.3, vy: Math.sin(ang) * vel,
        r: 24 + Math.random() * 40, crece: 2 + Math.random() * 3.4, a: .3 + Math.random() * .25,
        retraso: Math.random() * 90, tono: Math.random() < .35 ? '196,236,206' : '236,240,236' });
    }
    const t0 = performance.now(); let antes = t0;
    (function cuadro(ahora) {
      ahora = ahora || performance.now();
      const dt = Math.min(20, (ahora - antes) / 16.67); antes = ahora;   // pasos de 60 fps, sin importar la velocidad del equipo
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
  /** En la sección final de la vista pone a Moji; al llegar ahí, suelta el humo una vez */
  function finalConHumo(nombre, raiz) {
    const sec = raiz.querySelector('.cl-final, .in-final');
    if (!sec || sec.querySelector('.moji-final')) return;
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    sec.classList.add('con-moji');
    const t = document.createElement('div');
    t.innerHTML = primo('mohicano', 'moji-final');
    const m = t.firstElementChild; sec.appendChild(m);
    const io = new IntersectionObserver(ent => ent.forEach(e => {
      if (!e.isIntersecting || humoHecho[nombre]) return;
      humoHecho[nombre] = true; io.disconnect();
      m.classList.add('moji-sopla');
      setTimeout(() => { const r = m.getBoundingClientRect(); humo(r.left + r.width * .5, r.top + r.height * .28); }, 650);
    }), { threshold: .35 });
    io.observe(sec);
  }

  /* ---------- CogoMan: el acompañante único ---------- */
  const POSES = ['apunta', 'saluda', 'pulgar'];
  const src = p => `img/arte/cogoman-${p}.png`;
  const FRASES = {
    inicio: '¡Ey! Soy CogoMan. Te acompaño en todo el recorrido.',
    club: 'Así ve el club un visitante. DJ Gorrito, mi primo, te explica cómo entrar.',
    postular: 'Aprieta «Rellenar con datos de ejemplo» y mira cómo viaja la solicitud.',
    socio: 'Prueba «Adelantar calendario»: cuando vence la receta, el carrito se pausa solo.',
    panel: 'Aprueba una solicitud en 1 clic y mira todo lo que el sistema hace solo.',
    presentacion: 'Avanza con las flechas del teclado. Yo voy contigo.',
    precios: 'Los primeros 10 dispensarios no pagan la implementación.'
  };
  const SUELTAS = ['Todo en regla, todo en orden.', 'Cada gramo, contado.', '¿Música? La radio está abajo a la izquierda.', 'Receta al día, carrito feliz.', 'Menos WhatsApp, más tiempo para el club.', 'Tócame y salto.', 'Mis primos andan por ahí. Yo soy el original.'];

  let yo = null, globoT = null, silencio = false, pose = 'saluda', visible = false, lado = 'izq', tSalir = null, tVolver = null;
  try { silencio = localStorage.getItem('dispensa-cogo') === 'no'; } catch (e) { }
  const movil = () => innerWidth < 720;

  function crear() {
    yo = document.createElement('div');
    yo.className = 'cm cm-der';
    yo.innerHTML = `<button type="button" class="cm-actor" aria-label="CogoMan"><span class="cm-cuerpo"><img class="cm-img" alt="" draggable="false" src="${src(pose)}"></span></button>`;
    document.body.appendChild(yo);
    yo.querySelector('.cm-actor').addEventListener('click', ev => {
      saltar();
      decir(SUELTAS[Math.floor(Math.random() * SUELTAS.length)]);
      const p = document.createElement('span'); p.className = 'cm-punto'; p.textContent = '+1'; yo.appendChild(p); setTimeout(() => p.remove(), 1000);
      if (D.fx && D.fx.confeti) D.fx.confeti(ev.clientX, ev.clientY, 24);
      programarSalida(10000);
    });
  }
  function ponerPose(p) {
    pose = p; if (!yo) return;
    const im = yo.querySelector('.cm-img');
    const s = src(musica() ? 'baila' : p);
    if (!im.getAttribute('src').endsWith(s)) im.src = s;
  }
  function saltar() {
    if (!yo) return;
    const a = yo.querySelector('.cm-actor');
    a.classList.remove('cm-salto'); void a.offsetWidth; a.classList.add('cm-salto');
  }
  /** Burbuja: chica, con «×», y se va sola a los pocos segundos para no tapar nada */
  function decir(t) {
    if (!yo || !visible) return;
    let g = yo.querySelector('.cm-globo');
    if (g) g.remove();
    g = document.createElement('div'); g.className = 'cm-globo'; g.textContent = t;
    g.appendChild(botonCerrar(() => g.remove()));
    yo.appendChild(g);
    clearTimeout(globoT); globoT = setTimeout(() => { g.classList.add('cm-globo-fuera'); setTimeout(() => g.remove(), 450); }, movil() ? 4000 : 5000);
  }
  /** Entra por abajo (alternando derecha e izquierda) */
  function entrar(texto) {
    if (silencio) return;
    if (!yo) crear();
    clearTimeout(tVolver);
    if (!visible) {
      lado = 'izq';   // CogoMan vive junto al reproductor de música
      yo.classList.remove('cm-der', 'cm-izq'); yo.classList.add('cm-' + lado);
      ponerPose(POSES[Math.floor(Math.random() * POSES.length)]);
      visible = true;
      setTimeout(() => yo && yo.classList.add('cm-in'), 40);
      setTimeout(() => decir(texto), 700);
    } else { saltar(); decir(texto); }
    programarSalida(movil() ? 9000 : 13000);
  }
  function programarSalida(ms) { clearTimeout(tSalir); tSalir = setTimeout(salir, ms); }
  /** Se va por abajo y vuelve más tarde, para no cansar */
  function salir() {
    if (!yo || !visible) return;
    const g = yo.querySelector('.cm-globo'); if (g) g.remove();
    yo.classList.remove('cm-in'); visible = false;
    clearTimeout(tVolver);
    tVolver = setTimeout(() => { if (!document.hidden) entrar(SUELTAS[Math.floor(Math.random() * SUELTAS.length)]); }, 25000 + Math.random() * 20000);
  }
  /** Mensaje del acompañante (también lo usa la radio) */
  function asomar(texto) { entrar(texto); }
  function alEntrar(nombre, raiz) {
    reemplazarZorro(raiz);
    cierres(raiz); setTimeout(() => cierres(raiz), 1500);
    finalConHumo(nombre, raiz);
    setTimeout(() => entrar(FRASES[nombre] || SUELTAS[0]), 900);
  }
  // con música: CogoMan baila; sin música vuelve a su pose
  new MutationObserver(() => ponerPose(pose)).observe(html, { attributes: true, attributeFilter: ['class'] });

  // al hacer scroll, CogoMan «camina» contigo: se inclina y da saltitos según la velocidad
  let ultY = scrollY, vel = 0, inclin = 0, andando = false;
  addEventListener('scroll', () => { vel += (scrollY - ultY); ultY = scrollY; if (!andando) { andando = true; requestAnimationFrame(paso); } }, { passive: true });
  function paso() {
    vel *= .86; inclin += (Math.max(-18, Math.min(18, vel * .35)) - inclin) * .2;
    if (yo) {
      const c = yo.querySelector('.cm-cuerpo');
      const salto = Math.abs(inclin) > 1 ? Math.abs(Math.sin(performance.now() / 110)) * Math.min(14, Math.abs(inclin)) : 0;
      c.style.transform = `translateY(${-salto}px) rotate(${lado === 'der' ? inclin : -inclin}deg)`;
    }
    if (Math.abs(vel) > .3 || Math.abs(inclin) > .3) requestAnimationFrame(paso); else { andando = false; if (yo) yo.querySelector('.cm-cuerpo').style.transform = ''; }
  }

  function silenciar(v) {
    silencio = v;
    try { localStorage.setItem('dispensa-cogo', v ? 'no' : 'si'); } catch (e) { }
    if (v) { clearTimeout(tSalir); clearTimeout(tVolver); if (yo) { yo.remove(); yo = null; visible = false; } } else entrar('¡Volví!');
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
.cm { position: fixed; bottom: calc(10px + env(safe-area-inset-bottom, 0px)); z-index: 90; pointer-events: none; }
.cm.cm-der { right: 18px; } .cm.cm-izq { left: 8px; bottom: calc(74px + env(safe-area-inset-bottom, 0px)); }
.cm-actor { pointer-events: auto; display: block; width: 128px; border: 0; padding: 0; background: none; cursor: pointer; transform: translateY(125%); transition: transform .9s cubic-bezier(.34,1.56,.64,1); }
.cm.cm-in .cm-actor { transform: none; }
.cm:not(.cm-in) .cm-actor { transition: transform .6s ease-in; }
.cm-cuerpo { display: block; transform-origin: 50% 100%; transition: transform .12s linear; }
.cm-img { width: 100%; height: auto; display: block; filter: drop-shadow(0 12px 18px rgba(0,0,0,.5)); animation: cmFlota 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
html.cg-musica .cm-img { animation: cmBaila .55s ease-in-out infinite alternate; }
@keyframes cmFlota { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-6px) rotate(1.5deg); } }
@keyframes cmBaila { from { transform: rotate(-5deg) translateY(0); } to { transform: rotate(5deg) translateY(-8px); } }
.cm-actor.cm-salto .cm-cuerpo { animation: cmSalto .7s cubic-bezier(.34,1.56,.64,1); }
@keyframes cmSalto { 0% { translate: 0 0; } 40% { translate: 0 -46px; rotate: -8deg; } 100% { translate: 0 0; rotate: 0deg; } }
.cm-globo { position: absolute; bottom: 176px; width: max-content; max-width: 210px; padding: 8px 28px 8px 12px; border-radius: 14px; background: var(--fondo-2); color: var(--tinta);
  border: 1.5px solid var(--salvia); font: 600 13.5px/1.35 var(--f-texto); box-shadow: var(--sombra-sm); animation: cmGlobo .35s cubic-bezier(.34,1.56,.64,1) both; transition: opacity .4s, transform .4s; pointer-events: auto; }
.cm-der .cm-globo { right: 20px; border-bottom-right-radius: 4px; } .cm-izq .cm-globo { left: 20px; border-bottom-left-radius: 4px; }
.cm-globo.cm-globo-fuera { opacity: 0; transform: translateY(6px) scale(.96); pointer-events: none; }
@keyframes cmGlobo { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
.cm-punto { position: absolute; left: 50px; bottom: 160px; font: 800 20px/1 var(--f-display); color: var(--mostaza); pointer-events: none; animation: cmPunto 1s ease-out forwards; }
@keyframes cmPunto { to { transform: translateY(-60px); opacity: 0; } }
@media (max-width: 720px) { .cm { bottom: calc(70px + env(safe-area-inset-bottom, 0px)); } .cm.cm-der { right: 6px; } .cm.cm-izq { left: 4px; bottom: calc(136px + env(safe-area-inset-bottom, 0px)); } .cm-actor { width: 84px; } .cm-globo { bottom: 118px; max-width: 170px; font-size: 12.5px; } }
.globo-x { position: absolute; top: -9px; right: -9px; width: 24px; height: 24px; border-radius: 50%; background: var(--fondo-3); color: var(--tinta);
  border: 1.5px solid var(--linea-fuerte); font: 700 15px/1 var(--f-texto); cursor: pointer; pointer-events: auto; display: grid; place-items: center; z-index: 3; padding: 0; box-shadow: var(--sombra-sm); }
.globo-x:hover { background: var(--bosque); color: var(--sobre-bosque); }
.globo-cerrado { display: none !important; }
.humo-lienzo { position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: 88; pointer-events: none; }
img.moji-final { position: absolute; right: clamp(10px, 3vw, 48px); left: auto; bottom: 0; width: auto !important; height: min(24vh, 200px) !important; max-width: 40%; z-index: 2; pointer-events: none; transform: translateX(40px); opacity: .001; transition: transform .8s cubic-bezier(.34,1.56,.64,1), opacity .5s; }
img.moji-final.moji-sopla { transform: none; opacity: 1; }
.con-moji { overflow: clip; }
@media (max-width: 720px) { img.moji-final { height: 96px !important; right: 6px; } }
@media (prefers-reduced-motion: reduce) { .cm-img, img.primo { animation: none !important; } }
`;
  document.head.appendChild(css);

  D.personaje = {
    svg: (clase) => primo('gorrito', clase),   // el anfitrión del club es DJ Gorrito
    primo, asomar, alEntrar, reemplazarZorro, silenciar, humo,
    get silenciado() { return silencio; }
  };
})();
