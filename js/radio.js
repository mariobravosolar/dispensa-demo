/* ============================================================
   Dispensa — «Radio del club»: mini reproductor tipo Spotify.
   Es un ícono flotante; al tocarlo se despliega. Vive fuera de la vista,
   así que la música no se corta al navegar entre secciones.
   Usa los videos oficiales de YouTube (no se copia ningún audio): son
   solo para probar; para uso comercial se usa música con licencia.
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  const TEMAS = [
    { id: 'IXdNnw99-Ic', t: 'Wish You Were Here', a: 'Pink Floyd', fondo: 'cosmos' },
    { id: '_FrOQC-zEog', t: 'Comfortably Numb', a: 'Pink Floyd', fondo: 'cosmos' },
    { id: 'JwYX52BP2Sk', t: 'Time', a: 'Pink Floyd', fondo: 'cosmos' },
    { id: '69RdQFDuYPI', t: 'Is This Love', a: 'Bob Marley', fondo: 'jamaica' },
    { id: '1ti2YCFgCoI', t: 'Could You Be Loved', a: 'Bob Marley & The Wailers', fondo: 'jamaica' },
    { id: 'IT8XvzIfi4U', t: 'No Woman, No Cry', a: 'Bob Marley', fondo: 'jamaica' },
    { id: 'RijB8wnJCN0', t: 'Insane in the Brain', a: 'Cypress Hill', fondo: 'calle' }
  ];
  // Lista combinada: primero las estaciones generadas (suenan en cualquier parte), luego los temas de YouTube.
  const EST = (D.estaciones ? D.estaciones.lista : []).map(e => ({ tipo: 'est', id: e.id, t: e.nombre, a: 'Estación del club · suena en cualquier parte', fondo: e.fondo }));
  const LISTA = TEMAS.map(m => Object.assign({ tipo: 'yt' }, m)).concat(EST);
  // En el enlace publicado (claude.ai) no se puede incrustar YouTube: ahí esos temas se abren en YouTube.
  const SIN_EMBED = /claudeusercontent\.com$|claude\.ai$/.test(location.hostname);
  let actual = -1, sonando = false, abierto = false;

  const ico = n => D.ico ? D.ico(n) : '';
  const fila = (m, i) => `<li><button type="button" data-i="${i}"><span class="rd-n">${m.tipo === 'est' ? ico('cannabis') : i + 1}</span><span class="rd-tx"><b>${m.t}</b><small>${m.tipo === 'est' ? 'Estación del club' : m.a}</small></span><span class="rd-mini-eq"><i></i><i></i><i></i></span></button></li>`;
  const raiz = document.createElement('div');
  raiz.className = 'rd' + (SIN_EMBED ? ' sin-embed' : '');
  raiz.innerHTML = `
  <button class="rd-boton" type="button" aria-label="Radio del club" aria-expanded="false">
    <svg viewBox="0 0 24 24" class="rd-nota"><path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="2.6" fill="currentColor"/><circle cx="16.5" cy="16" r="2.6" fill="currentColor"/></svg>
    <span class="rd-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
  </button>
  <div class="rd-barra" aria-label="Reproduciendo">
    <span class="rd-b-tapa">${ico('cannabis')}</span>
    <span class="rd-b-tx"><b class="rd-b-titulo">—</b><small class="rd-b-artista"></small></span>
    <button type="button" class="rd-b-ant" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 5 9 12l10 7Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
    <button type="button" class="rd-b-play" aria-label="Reproducir o pausar"><svg viewBox="0 0 24 24" class="rd-i-play"><path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/></svg><svg viewBox="0 0 24 24" class="rd-i-pausa"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg></button>
    <button type="button" class="rd-b-sig" aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l10 7-10 7Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
    <button type="button" class="rd-b-lista" aria-label="Ver lista de temas"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
  </div>
  <section class="rd-panel" aria-label="Reproductor">
    <header class="rd-cab"><b>Radio del club</b><span>Suena mientras navegas · el fondo cambia con la música</span><button class="rd-cerrar" type="button" aria-label="Minimizar">${ico('menos')}</button></header>
    <div class="rd-ahora">
      <div class="rd-tapa"><div class="rd-video"></div><span class="rd-tapa-vacia">${ico('cannabis')}</span></div>
      <div class="rd-info"><b class="rd-titulo">Elige un tema</b><span class="rd-artista">Pink Floyd · Bob Marley · Cypress Hill</span>
        <div class="rd-ctrl">
          <button type="button" class="rd-ant" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M6 5v14M19 5 9 12l10 7Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
          <button type="button" class="rd-play" aria-label="Reproducir"><svg viewBox="0 0 24 24" class="rd-i-play"><path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/></svg><svg viewBox="0 0 24 24" class="rd-i-pausa"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg></button>
          <button type="button" class="rd-sig" aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M18 5v14M5 5l10 7-10 7Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
        </div>
      </div>
    </div>
    <div class="rd-lista-cont">
      <p class="rd-grupo">Temas originales</p><ol class="rd-lista">${TEMAS.map((m, k) => fila(LISTA[k], k)).join('')}</ol>
      <p class="rd-grupo">Estaciones del club <em>(música generada, suena sin internet)</em></p><ol class="rd-lista">${EST.map((m, k) => fila(LISTA[TEMAS.length + k], TEMAS.length + k)).join('')}</ol>
    </div>
    <footer class="rd-pie"><span>Temas originales: videos oficiales de YouTube, solo para probar.</span> <a class="rd-yt" href="https://www.youtube.com/watch?v=${TEMAS[0].id}" target="_blank" rel="noopener">Abrir en YouTube ↗</a>
      <label class="rd-cogo"><input type="checkbox" checked> CogoMan aparece</label></footer>
  </section>`;
  document.body.appendChild(raiz);

  const $ = s => raiz.querySelector(s);
  const html = document.documentElement;
  let iframe = null, ventana = null;
  function mandar(func) {
    if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  }
  function pintar() {
    raiz.classList.toggle('sonando', sonando);
    document.documentElement.classList.toggle('cg-musica', sonando);
    raiz.querySelectorAll('.rd-lista button').forEach(b => b.classList.toggle('activo', +b.dataset.i === actual));
    if (actual >= 0) {
      const m = LISTA[actual];
      $('.rd-titulo').textContent = m.t;
      $('.rd-artista').textContent = m.tipo === 'yt' && SIN_EMBED ? m.a + ' · suena en la ventanita de YouTube' : m.a;
      if (m.tipo === 'yt') $('.rd-yt').href = 'https://www.youtube.com/watch?v=' + m.id;
      $('.rd-b-titulo').textContent = m.t; $('.rd-b-artista').textContent = m.tipo === 'est' ? 'Estación del club' : m.a;
      $('.rd-b-tapa').style.backgroundImage = m.tipo === 'yt' && !SIN_EMBED ? `url(https://i.ytimg.com/vi/${m.id}/mqdefault.jpg)` : '';
      raiz.classList.add('con-barra'); html.classList.add('rd-con-barra');
    }
  }
  function pararVideo() { if (iframe) { iframe.src = 'about:blank'; } raiz.classList.remove('con-video'); }
  function tocar(i) {
    actual = (i + LISTA.length) % LISTA.length;
    const m = LISTA[actual];
    if (D.fondo && m.fondo) D.fondo.cambiar(m.fondo);   // el fondo cambia solo con cada tema
    if (m.tipo === 'est') {
      pararVideo();
      D.estaciones.tocar(m.id);
      sonando = true; pintar();
    } else {
      D.estaciones && D.estaciones.detener();
      if (SIN_EMBED) {
        // la vista previa de claude.ai bloquea YouTube: no abrimos ventanas; se avisa y queda el enlace manual
        sonando = false; pintar();
        $('.rd-b-artista').textContent = 'En esta vista previa YouTube está bloqueado';
        $('.rd-artista').textContent = 'En esta vista previa YouTube está bloqueado. En la versión instalada suena aquí mismo.';
        return;
      }
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.title = 'Reproductor';
        iframe.allow = 'autoplay; encrypted-media';
        $('.rd-video').appendChild(iframe);
      }
      iframe.src = `https://www.youtube.com/embed/${m.id}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1`;
      raiz.classList.add('con-video');
      sonando = true; pintar();
    }
    if (D.personaje && Math.random() < .7) setTimeout(() => D.personaje.asomar('¡Buena elección! ' + (m.tipo === 'est' ? m.t : m.a) + ' suena mientras navegas.'), 900);
  }
  function alternar() {
    if (actual < 0) return tocar(0);
    const m = LISTA[actual];
    sonando = !sonando;
    if (m.tipo === 'est') { if (sonando) D.estaciones.tocar(m.id); else D.estaciones.detener(); }
    else if (SIN_EMBED) { sonando = false; }
    else mandar(sonando ? 'playVideo' : 'pauseVideo');
    pintar();
  }
  function abrir(v) { abierto = v; raiz.classList.toggle('abierto', v); $('.rd-boton').setAttribute('aria-expanded', v); }

  $('.rd-boton').addEventListener('click', () => abrir(!abierto));
  $('.rd-cerrar').addEventListener('click', () => abrir(false));
  $('.rd-play').addEventListener('click', alternar);
  $('.rd-sig').addEventListener('click', () => tocar(actual + 1));
  $('.rd-ant').addEventListener('click', () => tocar(actual < 0 ? 0 : actual - 1));
  raiz.querySelectorAll('.rd-lista button').forEach(b => b.addEventListener('click', () => { tocar(+b.dataset.i); abrir(false); }));
  $('.rd-b-play').addEventListener('click', alternar);
  $('.rd-b-sig').addEventListener('click', () => tocar(actual + 1));
  $('.rd-b-ant').addEventListener('click', () => tocar(actual < 0 ? 0 : actual - 1));
  $('.rd-b-lista').addEventListener('click', () => abrir(!abierto));
  const chk = $('.rd-cogo input');
  chk.checked = !(D.personaje && D.personaje.silenciado);
  chk.addEventListener('change', () => D.personaje && D.personaje.silenciar(!chk.checked));
  addEventListener('keydown', e => { if (e.key === 'Escape' && abierto) abrir(false); });

  const css = document.createElement('style');
  css.textContent = `
.rd { position: fixed; left: 16px; bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 95; font-family: var(--f-texto); }
.rd-boton { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid var(--linea-fuerte); background: var(--fondo-2); color: var(--salvia);
  display: grid; place-items: center; cursor: pointer; box-shadow: var(--sombra); position: relative; transition: transform .25s var(--rebote); }
.rd-boton:hover { transform: scale(1.08) rotate(-6deg); }
.rd-nota { width: 26px; height: 26px; }
.rd.sonando .rd-boton { background: var(--bosque); color: var(--sobre-bosque); animation: rdLatido 1.8s ease-in-out infinite; }
.rd-eq { position: absolute; right: -4px; top: -4px; display: none; gap: 2px; align-items: flex-end; height: 16px; padding: 3px 4px; border-radius: 8px; background: var(--mostaza); }
.rd.sonando .rd-eq { display: flex; }
.rd-eq i, .rd-mini-eq i { width: 3px; background: #10160f; border-radius: 2px; animation: rdEq .8s ease-in-out infinite alternate; }
.rd-eq i:nth-child(2), .rd-mini-eq i:nth-child(2) { animation-delay: .2s; } .rd-eq i:nth-child(3), .rd-mini-eq i:nth-child(3) { animation-delay: .4s; } .rd-eq i:nth-child(4) { animation-delay: .1s; }
@keyframes rdEq { from { height: 3px; } to { height: 11px; } }
@keyframes rdLatido { 50% { box-shadow: 0 0 0 10px color-mix(in srgb, var(--bosque) 20%, transparent), var(--sombra); } }
/* el panel nunca se quita del DOM: así la música sigue sonando aunque esté cerrado */
.rd-panel { position: absolute; left: 0; bottom: 70px; width: 330px; max-width: calc(100vw - 32px); border-radius: 22px; background: var(--fondo-2);
  backdrop-filter: blur(14px); border: 1px solid var(--linea-fuerte); box-shadow: var(--sombra); padding: 14px; color: var(--tinta);
  transform-origin: bottom left; transform: scale(.4) translateY(40px); opacity: 0; visibility: hidden; transition: transform .35s var(--rebote), opacity .25s, visibility 0s .35s; }
.rd.abierto .rd-panel { transform: none; opacity: 1; visibility: visible; transition: transform .35s var(--rebote), opacity .25s; }
.rd-cab { display: grid; grid-template-columns: 1fr auto; align-items: center; margin-bottom: 12px; }
.rd-cab b { font-family: var(--f-retro); font-weight: 900; font-size: 1.15rem; } .rd-cab span { grid-row: 2; font-size: .78rem; color: var(--tinta-3); }
.rd-cerrar { grid-row: 1 / 3; grid-column: 2; background: var(--fondo-3); border: 1px solid var(--linea); color: var(--tinta-2); width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; cursor: pointer; }
.rd-cerrar .ico { width: 16px; height: 16px; }
.rd-ahora { display: grid; grid-template-columns: 118px 1fr; gap: 12px; align-items: center; }
.rd-tapa { width: 118px; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: var(--psico); position: relative; display: grid; place-items: center; }
.rd-tapa-vacia .ico { width: 40px; height: 40px; color: #10160f; }
.rd-video, .rd-video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.rd:not(.con-video) .rd-video { display: none; } .rd.con-video .rd-tapa-vacia { display: none; }
.rd-info b { display: block; font-size: .98rem; line-height: 1.2; } .rd-info .rd-artista { font-size: .8rem; color: var(--tinta-3); }
.rd-ctrl { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
.rd-ctrl button { background: none; border: 0; color: var(--tinta); cursor: pointer; width: 30px; height: 30px; display: grid; place-items: center; }
.rd-ctrl svg { width: 18px; height: 18px; }
.rd-ctrl .rd-play { width: 42px; height: 42px; border-radius: 50%; background: var(--bosque); color: var(--sobre-bosque); transition: transform .2s var(--rebote); }
.rd-ctrl .rd-play:hover { transform: scale(1.08); } .rd-ctrl .rd-play svg { width: 20px; height: 20px; }
.rd-i-pausa { display: none; } .rd.sonando .rd-i-pausa { display: block; } .rd.sonando .rd-i-play { display: none; }
.rd-lista-cont { max-height: 260px; overflow-y: auto; margin-top: 10px; }
.rd-grupo { margin: 8px 4px 4px; font: 700 .68rem var(--f-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--tinta-3); }
.rd-grupo em { font-style: normal; text-transform: none; letter-spacing: 0; }
.rd-lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.rd-lista .rd-n .ico { width: 16px; height: 16px; color: var(--mostaza); }
.rd-lista button { width: 100%; display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: center; text-align: left; padding: 7px 8px; border-radius: 10px; background: none; border: 0; color: var(--tinta); cursor: pointer; }
.rd-lista button:hover { background: var(--fondo-3); }
.rd-lista .rd-n { font: 600 .8rem var(--f-mono); color: var(--tinta-3); text-align: center; }
.rd-lista b { display: block; font-size: .9rem; font-weight: 700; } .rd-lista small { font-size: .75rem; color: var(--tinta-3); }
.rd-lista button.activo b { color: var(--salvia); }
.rd-mini-eq { display: none; gap: 2px; align-items: flex-end; height: 12px; } .rd-mini-eq i { background: var(--salvia); }
.rd.sonando .rd-lista button.activo .rd-mini-eq { display: flex; }
.rd-pie { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--linea); font-size: .72rem; color: var(--tinta-3); display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: center; }
.rd-pie a { color: var(--salvia); }
.rd.sin-embed .rd-yt { background: var(--bosque); color: var(--sobre-bosque); padding: 4px 10px; border-radius: 999px; font-weight: 700; text-decoration: none; } .rd-cogo { margin-left: auto; display: inline-flex; gap: 4px; align-items: center; cursor: pointer; color: var(--tinta-2); }
.rd-barra { position: absolute; left: 64px; bottom: 4px; height: 48px; display: none; align-items: center; gap: 4px; padding: 4px 6px 4px 4px; border-radius: 999px;
  background: var(--fondo-2); border: 1px solid var(--linea-fuerte); box-shadow: var(--sombra); width: max-content; max-width: min(460px, calc(100vw - 96px)); animation: rdBarra .45s cubic-bezier(.34,1.56,.64,1); }
.rd.con-barra .rd-barra { display: flex; }
@keyframes rdBarra { from { clip-path: inset(0 100% 0 0 round 999px); } to { clip-path: inset(0 0 0 0 round 999px); } }
.rd-b-tapa { width: 40px; height: 40px; border-radius: 50%; flex: none; background: var(--psico) center / cover no-repeat; display: grid; place-items: center; }
.rd-b-tapa .ico { width: 20px; height: 20px; color: #10160f; } .rd-b-tapa[style*="ytimg"] .ico { display: none; }
.rd.sonando .rd-b-tapa { animation: rdGira 6s linear infinite; } @keyframes rdGira { to { transform: rotate(360deg); } }
.rd-b-tx { min-width: 0; max-width: 190px; padding: 0 6px; display: grid; line-height: 1.15; }
.rd-b-tx b { font-size: .85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .rd-b-tx small { font-size: .72rem; color: var(--tinta-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rd-barra button { width: 34px; height: 34px; border-radius: 50%; border: 0; background: none; color: var(--tinta); display: grid; place-items: center; cursor: pointer; flex: none; }
.rd-barra button svg { width: 16px; height: 16px; } .rd-barra .rd-b-play { background: var(--bosque); color: var(--sobre-bosque); width: 38px; height: 38px; }
.rd-barra button:hover { background: var(--fondo-3); } .rd-barra .rd-b-play:hover { background: var(--bosque-2); }
@media (max-width: 720px) { .rd { bottom: calc(84px + env(safe-area-inset-bottom, 0px)); left: 12px; } .rd-boton { width: 48px; height: 48px; }
  .rd-barra { left: 54px; bottom: 2px; height: 44px; max-width: calc(100vw - 80px); } .rd-b-tx { max-width: 34vw; } }
`;
  document.head.appendChild(css);
  D.radio = { tocar, alternar, abrir };
})();
