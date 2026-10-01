/* ============================================================
   Dispensa — selector de fondo ilustrado. Cambia en vivo la imagen de
   fondo de las portadas (página comercial, club, presentación, planes).
   Solo muestra los fondos cuyo archivo existe.
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  const FONDOS = [
    { id: 'invernadero', n: 'Invernadero', src: 'img/arte/fondo-invernadero.jpg' },
    { id: 'montana', n: 'Montaña', src: 'img/arte/paisaje-cannabis.jpg' }
  ];
  const abs = s => new URL(s, location.href).href;
  let disponibles = [], elegido = null;
  try { elegido = localStorage.getItem('dispensa-fondo-v2'); } catch (e) { }

  function aplicar(id, guardar) {
    const f = disponibles.find(x => x.id === id) || disponibles[0];
    if (!f) return;
    elegido = f.id;
    if (guardar) try { localStorage.setItem('dispensa-fondo-v2', f.id); } catch (e) { }
    document.documentElement.style.setProperty('--fondo-img', `url("${abs(f.src)}")`);
    document.querySelectorAll('img[src*="img/arte/paisaje"], img[src*="img/arte/fondo-"]').forEach(im => { if (!im.src.endsWith(f.src)) im.src = f.src; });
    menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.id === f.id ? 'true' : 'false'));
  }

  // botón y menú en la barra de la demo
  const cont = document.createElement('div');
  cont.className = 'fd';
  cont.innerHTML = `<button type="button" class="fd-boton" aria-haspopup="true" aria-expanded="false" title="Cambiar fondo">
    <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m3.5 16 5-5 4 4 3-3 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="16" cy="9" r="1.6" fill="currentColor"/></svg><span>Fondo</span></button>
    <div class="fd-menu" role="radiogroup" aria-label="Fondo"></div>`;
  const menu = cont.querySelector('.fd-menu');
  const barra = document.querySelector('.demobar .modos');
  if (barra) barra.after(cont);
  cont.querySelector('.fd-boton').addEventListener('click', e => {
    const v = !cont.classList.contains('abierto');
    cont.classList.toggle('abierto', v); e.currentTarget.setAttribute('aria-expanded', v);
  });
  document.addEventListener('click', e => { if (!cont.contains(e.target)) cont.classList.remove('abierto'); });

  Promise.all(FONDOS.map(f => new Promise(res => { const im = new Image(); im.onload = () => res(f); im.onerror = () => res(null); im.src = f.src; })))
    .then(lista => {
      disponibles = lista.filter(Boolean);
      menu.innerHTML = disponibles.map(f => `<button type="button" role="radio" data-id="${f.id}" style="background-image:url('${f.src}')"><span>${f.n}</span></button>`).join('');
      menu.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { aplicar(b.dataset.id, true); cont.classList.remove('abierto'); }));
      aplicar(elegido || disponibles[0]?.id);
    });

  // al cambiar de vista, reaplica a las imágenes nuevas
  D.fondo = {
    aplicar: () => elegido && aplicar(elegido),
    /** cambio con transición suave (lo usa la radio al elegir un tema) */
    cambiar(id) {
      if (!disponibles.some(f => f.id === id) || id === elegido) return;
      document.documentElement.classList.add('fd-transicion');
      setTimeout(() => { aplicar(id); setTimeout(() => document.documentElement.classList.remove('fd-transicion'), 60); }, 380);
    }
  };

  const css = document.createElement('style');
  css.textContent = `
.fd { position: relative; flex: none; }
html.fd-transicion .cl-arte, html.fd-transicion .in-heroe, html.fd-transicion .pz-foto-portada, html.fd-transicion .pz-foto-velo, html.fd-transicion .pr-heroe { opacity: .15; }
.cl-arte, .in-heroe, .pz-foto-portada, .pz-foto-velo, .pr-heroe { transition: opacity .38s ease; }
.fd-boton { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--linea-fuerte); background: var(--fondo-3); color: var(--tinta-2); cursor: pointer; font: 600 .85rem var(--f-texto); }
.fd-boton svg { width: 17px; height: 17px; } .fd-boton:hover { color: var(--tinta); }
.fd-menu { position: absolute; right: 0; top: 44px; width: 330px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; border-radius: 18px;
  background: var(--fondo-2); border: 1px solid var(--linea-fuerte); box-shadow: var(--sombra); opacity: 0; visibility: hidden; transform: translateY(-8px) scale(.96); transition: .25s var(--rebote); z-index: 60; }
.fd.abierto .fd-menu { opacity: 1; visibility: visible; transform: none; }
.fd-menu button { aspect-ratio: 16/9; border-radius: 12px; border: 2px solid transparent; background-size: cover; background-position: center; cursor: pointer; position: relative; overflow: hidden; }
.fd-menu button span { position: absolute; left: 0; right: 0; bottom: 0; padding: 4px 8px; font: 700 .75rem var(--f-texto); color: #fff; background: linear-gradient(transparent, rgba(0,0,0,.75)); text-align: left; }
.fd-menu button[aria-checked="true"] { border-color: var(--salvia); box-shadow: 0 0 0 3px color-mix(in srgb, var(--salvia) 30%, transparent); }
@media (max-width: 720px) { .fd-boton span { display: none; } .fd-boton { padding: 0 9px; } .fd-menu { position: fixed; left: 12px; right: 12px; top: 56px; width: auto; } }
`;
  document.head.appendChild(css);
})();
