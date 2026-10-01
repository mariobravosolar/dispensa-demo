/* ============================================================
   Dispensa — enrutador de vistas y modo de color
   Cada vista se registra en DEMO.views[nombre] = { titulo, render(el), salir?() }
   ============================================================ */
(function () {
  const vista = document.getElementById('vista');
  let actual = null;

  function ir() {
    const nombre = (location.hash || '#inicio').slice(1) || 'inicio';
    const v = DEMO.views[nombre] || DEMO.views.inicio;
    if (actual && actual.salir) { try { actual.salir(); } catch (e) { console.error(e); } }
    vista.innerHTML = '';
    vista.className = 'vista vista-' + nombre;
    document.body.dataset.vista = nombre;
    actual = v;
    if (v) { v.render(vista); DEMO.decorar && DEMO.decorar(nombre, vista); DEMO.personaje && DEMO.personaje.alEntrar(nombre, vista); DEMO.fondo && DEMO.fondo.aplicar(); DEMO.fx.revelar(vista); }
    document.querySelectorAll('.demobar nav a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + nombre ? 'page' : 'false'));
    document.title = v && v.titulo ? v.titulo + ' · Dispensa' : 'Dispensa';
    window.scrollTo(0, 0);
  }

  function modo(m) {
    document.documentElement.setAttribute('data-modo', m);
    try { localStorage.setItem('dispensa-modo-v3', m); } catch (e) { }
    document.querySelectorAll('.modos button').forEach(b => b.setAttribute('aria-checked', b.dataset.modo === m ? 'true' : 'false'));
    DEMO.emit && DEMO.emit('modo', m);
  }

  document.querySelectorAll('.modos button').forEach(b => b.addEventListener('click', () => modo(b.dataset.modo)));
  modo(document.documentElement.getAttribute('data-modo') || 'claro');

  document.getElementById('btn-reset').addEventListener('click', () => {
    DEMO.reiniciar();
    DEMO.fx.toast('Demo reiniciada', 'Todo vuelve al estado inicial.');
    ir();
  });

  addEventListener('hashchange', ir);
  DEMO.ir = h => { if (location.hash === '#' + h) ir(); else location.hash = h; };
  ir();
})();
