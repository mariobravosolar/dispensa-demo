/* ============================================================
   Dispensa — capa cannábica: hojas de cannabis y productos en vector
   que flotan en los bordes de las secciones principales de cada vista.
   Se aplica sola después de pintar cada vista (lo llama app.js).
   ============================================================ */
(function () {
  const PRODUCTOS = ['cogollo', 'frasco', 'gotero', 'gomita', 'porro'];
  const COLORES = ['var(--mostaza)', 'var(--salvia)', 'var(--naranja)', 'var(--malva)'];

  // secciones de cada vista donde se siembra, y cuántos elementos
  const MAPA = {
    inicio: [['.in-heroe', 10], ['.in-viaje', 6], ['.in-mod', 6], ['.in-gram', 5], ['.in-final', 9]],
    club: [['.cl-hero', 7], ['.cl-quienes', 5], ['.cl-como', 6], ['.cl-requisitos', 6], ['.cl-candado-sec', 6], ['.cl-final', 9]],
    presentacion: [['.pz-dia', 5]],
    postular: [['.po-form', 5]],
    socio: [['.so-escena', 9]],
    panel: [['.pn-bloque', 3]],
    precios: [['.pr-heroe', 9], ['.pr-cum', 5]]
  };

  let semilla = 7;
  const azar = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };

  function elemento(i, n) {
    const esHoja = i % 3 !== 2;               // 2 de cada 3 son hojas
    const lado = i % 2 === 0 ? 'izq' : 'der';
    // se ubican en los bordes (0–13 % o 87–100 %) para no tapar el contenido
    const x = lado === 'izq' ? -2 + azar() * 12 : 90 + azar() * 12;
    const y = 4 + (i / Math.max(1, n - 1)) * 86 + (azar() - .5) * 8;
    const tam = esHoja ? 56 + azar() * 90 : 30 + azar() * 24;
    const rot = (azar() - .5) * 70;
    const color = esHoja ? COLORES[i % 2 === 0 ? 0 : 1] : COLORES[2 + (i % 2)];
    const nombre = esHoja ? 'cannabis' : PRODUCTOS[i % PRODUCTOS.length];
    const s = document.createElement('span');
    s.className = 'cz-el ' + (esHoja ? 'cz-hoja' : 'cz-prod');
    s.style.cssText = `left:${x}%;top:${y}%;width:${tam}px;height:${tam}px;color:${color};--r:${rot}deg;--d:${(azar() * 6).toFixed(2)}s;--t:${(7 + azar() * 6).toFixed(2)}s`;
    s.innerHTML = esHoja
      ? '<svg viewBox="-112 -142 224 224"><use href="#i-cannabis"/></svg>'
      : `<svg viewBox="0 0 24 24"><use href="#i-${nombre}"/></svg>`;
    return s;
  }

  function sembrar(host, n) {
    if (!host || host.querySelector(':scope > .cz-capa')) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const capa = document.createElement('div');
    capa.className = 'cz-capa';
    capa.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) capa.appendChild(elemento(i, n));
    host.prepend(capa);
  }

  function decorar(nombre, raiz) {
    if (matchMedia('(max-width: 720px)').matches) return;   // en el celular, más liviano
    semilla = 7 + nombre.length * 31;
    (MAPA[nombre] || []).forEach(([sel, n]) => raiz.querySelectorAll(sel).forEach(h => sembrar(h, n)));
  }

  window.DEMO = window.DEMO || {};
  DEMO.decorar = decorar;
  DEMO.sembrarCannabis = sembrar;
})();
