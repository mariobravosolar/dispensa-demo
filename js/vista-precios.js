/* ============================================================
   Dispensa — vista «precios»: planes para dueños de dispensarios.
   Prefijo de clases: .pr-   (estilos en css/v-inicio.css)
   Datos: docs/rediseno-gpt/2026-09-28/propuesta-comercial-datos.md
   ============================================================ */
(function () {
  const D = window.DEMO;
  const ico = (n, c) => (D.ico ? D.ico(n, c) : `<svg class="ico ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`);
  let limpiezas = [];
  const svgZorro = () => `<svg class="in-zorro pr-zorro" viewBox="0 0 140 130" aria-hidden="true"><path d="M44 120c-26-2-40-22-32-44 5-13 20-16 26-6 5 9-4 16-2 26 2 9 10 16 22 18"/><path d="M58 122c-8-18-6-40 6-56l6-12"/><path d="M92 58c4 20 2 42-6 64"/><path d="M66 122v-12M86 122v-10"/><path d="M28 122h84"/><path d="M70 54 66 28l12 14 10-12 2 16 22 10-20 6c-6 6-16 6-22-2Z"/><path d="M80 46l4 3"/><circle cx="96" cy="54" r="1.6" class="in-zorro-nariz"/><path d="M78 30l2 8M88 32l-1 8"/></svg>`;

  const planes = [
    {
      id: 'perpetua', nombre: 'Licencia Perpetua', i: 'llave', precio: 'USD 2.400', per: '', nota: 'pago único · implementación incluida',
      incluye: [['engranaje', 'Implementación incluida'], ['actualizar', '12 meses de actualizaciones'], ['soporte', 'Mantención opcional USD 450/año'], ['corazon', 'El sistema es tuyo para siempre']],
      ideal: 'Ideal para operar en tu propia infraestructura.', cta: 'Hablar de esta opción'
    },
    {
      id: 'anual', nombre: 'Licencia Anual', i: 'documento', precio: 'USD 990', per: '/año', nota: '+ implementación USD 490 una vez', destacada: true,
      incluye: [['grafico', 'Actualizaciones mensuales'], ['escudo', 'Seguridad y soporte mientras esté vigente'], ['llave', '1 clave · 1 instalación · 1 dominio'], ['reloj', 'Si no renuevas, sigue funcionando; solo dejas de recibir lo nuevo']],
      ideal: 'La mejor relación entre inversión y continuidad.', cta: 'Elegir este plan'
    },
    {
      id: 'nube', nombre: 'Dispensa Nube', i: 'mundo', precio: 'USD 129', per: '/mes', nota: 'mínimo 12 meses · implementación USD 490',
      incluye: [['mundo', 'Hosting y dominio incluidos'], ['inventario', 'Respaldos diarios y correos'], ['soporte', 'Actualizaciones y soporte continuo'], ['check', 'No te preocupas de nada técnico']],
      ideal: 'Ideal para equipos que quieren delegar lo técnico.', cta: 'Quiero ir a la nube'
    }
  ];

  const tabla = [
    ['Precio', 'USD 2.400 único', 'USD 990 / año', 'USD 129 / mes'],
    ['Implementación', 'Incluida', 'USD 490 una vez', 'USD 490 una vez'],
    ['Soporte', '3 meses intensivo', '3 meses intensivo + continuo', 'Continuo'],
    ['Mejoras mensuales', '12 meses, luego opcional', 'Incluidas', 'Siempre'],
    ['Seguridad', '12 meses, luego opcional', 'Incluida', 'Siempre'],
    ['Hosting y respaldos', 'Los pones tú (te ayudamos)', 'Los pones tú (te ayudamos)', 'Incluidos'],
    ['Si dejas de pagar', 'Es tuyo', 'Sigue funcionando, sin lo nuevo', 'Te entregamos tus datos']
  ];

  const soporte = [
    ['engranaje', 'Puesta en', 'marcha'], ['socios', 'Carga de', 'catálogo'], ['excel', 'Migración', 'desde Excel'],
    ['billetera', 'Pagos', 'Flow/Webpay · Mercado Pago'], ['usuario', 'Capacitación', 'para tu equipo']
  ];

  const faq = [
    ['¿Qué pasa si no renuevo la Licencia Anual?', 'Nada se apaga. El sistema sigue funcionando en la versión que tienes, con todos tus socios y datos. Solo dejas de recibir mejoras, parches de seguridad y soporte.'],
    ['¿Cuál es la diferencia con la Perpetua?', 'La Perpetua es tuya para siempre e incluye 12 meses de mejoras. Después, las mejoras son opcionales (Mantención USD 450/año). Por eso cuesta más de entrada.'],
    ['¿Puedo administrar desde el celular?', 'Sí. Apruebas socios, ves canjes, envías comunicados y atiendes en el mesón desde el teléfono o el computador, desde cualquier lugar.'],
    ['¿Sirve en Argentina?', 'Sí. Funciona en Chile y Argentina, con Mercado Pago en Argentina y facturación en pesos argentinos (ARS).'],
    ['¿Y si tengo otra sucursal?', 'Cada sucursal es una instalación con su dominio: USD 390 al año adicional.']
  ];

  function tarjetaPlan(p, k) {
    return `
    <article class="pr-plan ${p.destacada ? 'destacada' : ''}" data-entra="${k === 0 ? 'izq' : k === 2 ? 'der' : 'abajo'}" style="--d:${k * .08}s">
      ${p.destacada ? `<span class="pr-cinta">${ico('estrella')} Recomendado</span>` : ''}
      <div class="pr-plan-cab">${ico(p.i, 'pr-plan-ico')}<div><h3>${p.nombre}</h3><p class="pr-precio"><b>${p.precio}</b>${p.per ? `<span>${p.per}</span>` : ''}</p><p class="pr-nota">${p.nota}</p></div></div>
      <ul>${p.incluye.map(([i, t]) => `<li>${ico(i)}<span>${t}</span></li>`).join('')}</ul>
      <p class="pr-ideal">${p.ideal}</p>
      <button type="button" class="btn ${p.destacada ? 'pr-btn-naranja' : 'btn-fantasma pr-btn-linea'} btn-bloque" data-pr-plan="${p.nombre}">${p.destacada ? ico('estrella') : ''}${p.cta} ${ico('flecha')}</button>
    </article>`;
  }

  function licencia() {
    const sitios = ['raizaustral.cl', 'otro-hosting.cl', 'copia-de-prueba.cl'];
    return `
    <section class="seccion pr-lic">
      <div class="contenedor pr-lic-grid">
        <div data-entra="izq">
          <p class="eyebrow">Licencia única</p>
          <h2 class="in-h2"><span class="pr-nw">1 clave ·</span> <span class="pr-nw">1 instalación ·</span> <em class="pr-nw">1 dominio.</em></h2>
          <p class="in-sub">La clave se activa en un solo sitio. Para cambiarte de hosting, la desactivas en uno y la activas en el otro. Y lo administras desde cualquier lugar del mundo.</p>
          <button type="button" class="btn btn-fantasma" id="pr-mover">${ico('llave')} Mover la licencia</button>
        </div>
        <div class="pr-llaves" data-entra="der">
          <div class="pr-llave" id="pr-llave">${ico('llave')}<span class="mono">DSP-7Q4K-RAIZ</span></div>
          <div class="pr-sitios">
            ${sitios.map((s, i) => `<div class="pr-sitio ${i === 0 ? 'activo' : ''}" data-i="${i}"><span class="pr-sitio-barra"><i></i><i></i><i></i><em class="mono">${s}</em></span><span class="pr-sitio-est">${i === 0 ? ico('check') + 'Licencia activa' : ico('candado') + 'Sin licencia'}</span></div>`).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  function montarLicencia(raiz) {
    const sitios = [...raiz.querySelectorAll('.pr-sitio')];
    const llave = raiz.querySelector('#pr-llave');
    let activo = 0, ocupado = false;
    const pintar = () => sitios.forEach((s, i) => {
      s.classList.toggle('activo', i === activo);
      s.querySelector('.pr-sitio-est').innerHTML = i === activo ? ico('check') + 'Licencia activa' : ico('candado') + 'Sin licencia';
    });
    raiz.querySelector('#pr-mover').addEventListener('click', async () => {
      if (ocupado) return; ocupado = true;
      const sig = activo === 0 ? 1 : 0;
      sitios[activo].classList.add('saliendo');
      sitios[activo].querySelector('.pr-sitio-est').innerHTML = ico('reloj') + 'Desactivando…';
      await D.fx.espera(700);
      sitios[activo].classList.remove('saliendo');
      activo = -1; pintar();
      llave.classList.add('viaja');
      await D.fx.espera(600);
      activo = sig; pintar();
      llave.classList.remove('viaja');
      D.fx.toast('Licencia movida', `Ahora vive en ${sitios[sig].querySelector('em').textContent}. Solo una a la vez.`);
      ocupado = false;
    });
  }

  function entradas(raiz) {
    if (D.fx.reducido || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(ent => ent.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('in-fuera'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
    raiz.querySelectorAll('[data-entra]').forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .92) { el.classList.add('in-fuera'); io.observe(el); } });
    limpiezas.push(() => io.disconnect());
  }

  D.views.precios = {
    titulo: 'Planes',
    render(el) {
      limpiezas = [];
      const cupos = Array.from({ length: 10 }, (_, i) => `<i style="--i:${i}">${ico('hoja')}</i>`).join('');
      el.innerHTML = `
      <div class="in-raiz pr-raiz">
        <div class="contenedor pr-ancho">
          <div class="pr-oferta anim-abajo">
            ${ico('rayo', 'pr-oferta-ico')}
            <p><b class="pr-oferta-tit">Oferta de lanzamiento:</b> <b>implementación gratis</b> para los primeros <b>10 dispensarios</b></p>
            <div class="pr-oferta-hojas" aria-hidden="true">${cupos}</div>
            <span class="in-mano pr-oferta-mano">sí, los primeros diez ☾</span>
          </div>
        </div>
        <section class="pr-heroe">
          <div class="in-arte pr-arte" aria-hidden="true"></div>
          <div class="contenedor pr-ancho">
            <h1 class="in-h1 anim-abajo" style="animation-delay:.08s">Precios que <em>ordenan</em><br>tu operación</h1>
            <p class="in-lead anim-abajo" style="animation-delay:.16s">Tres formas de implementar Dispensa, con soporte real y sin enredos técnicos. <span class="in-mano pr-ritmo">elige tu ritmo</span></p>
          </div>
        </section>

        <div class="contenedor pr-ancho">
          <div class="pr-planes">${planes.map(tarjetaPlan).join('')}</div>
          <p class="pr-sucursal dim centro">${ico('tienda')} ¿Otra sucursal? USD 390 al año por instalación adicional · Precios + impuestos · Facturación en CLP o ARS</p>

          <div class="pr-sop" data-entra="abajo">
            <div class="pr-sop-cab">${ico('soporte', 'pr-sop-ico')}<div><h2 class="in-h3">Todos incluyen 3 meses de soporte intensivo</h2><p>Puesta en marcha, catálogo, migración de socios desde Excel, pagos y capacitación. Respuesta en 24 h hábiles por WhatsApp y correo.</p></div></div>
            <ul class="pr-sop-grid">${soporte.map(([i, a, b], k) => `<li style="--i:${k}">${ico(i)}<span>${a}<small>${b}</small></span></li>`).join('')}</ul>
          </div>
        </div>

        <section class="seccion pr-comp">
          <div class="contenedor">
            <div class="in-cabeza centro"><p class="eyebrow">Comparación</p><h2 class="in-h2">Lado a <em>lado.</em></h2></div>
            <div class="pr-tabla-caja" data-entra="abajo">
              <table class="pr-tabla">
                <thead><tr><th></th><th>Perpetua</th><th class="dest">Anual</th><th>Nube</th></tr></thead>
                <tbody>${tabla.map(f => `<tr><th scope="row">${f[0]}</th><td>${f[1]}</td><td class="dest">${f[2]}</td><td>${f[3]}</td></tr>`).join('')}</tbody>
              </table>
            </div>
          </div>
        </section>

        ${licencia()}

        <section class="seccion pr-faq">
          <div class="contenedor pr-faq-caja">
            <div class="in-cabeza centro"><p class="eyebrow">Preguntas</p><h2 class="in-h2">Lo que todos <em>preguntan.</em></h2></div>
            ${faq.map(([q, a], i) => `<details class="pr-q" data-entra="abajo" ${i === 0 ? 'open' : ''}><summary>${q}${ico('mas')}</summary><p>${a}</p></details>`).join('')}
          </div>
        </section>

        <section class="pr-cum">
          <div class="contenedor pr-ancho pr-cum-grid">
            <div class="pr-cum-txt" data-entra="izq"><img class="in-zorro-img pr-zorro" src="img/arte/zorro.png" alt="" width="720" height="900" loading="lazy"><div><h2 class="in-h3">Todo en regla,<br><em>todo en orden.</em></h2><p class="eyebrow">Tecnología para dispensarios reales</p></div></div>
            <div class="pr-cum-c" data-entra="der" style="--d:0s">${ico('ley')}<div><b>Ley 21.719 · Chile</b><small>Protección de datos personales</small></div></div>
            <div class="pr-cum-c" data-entra="der" style="--d:.08s">${ico('mundo')}<div><b>REPROCANN · Argentina</b><small>Receta, cupo y entregas en orden</small></div></div>
            <div class="pr-cum-c pr-cum-f" data-entra="der" style="--d:.16s">${ico('escudo')}<div><b>Modo fiscalización</b><small>${ico('check')} Datos completos</small><small>${ico('check')} Trazabilidad lista</small><small>${ico('check')} Cumplimiento ordenado</small></div></div>
          </div>
        </section>

        <section class="seccion in-final">
          <div class="contenedor centro">
            <h2 class="in-h1 in-final-tit" data-entra="abajo">¿Conversamos <em>tu caso?</em></h2>
            <div class="in-ctas centro" data-entra="abajo">
              <a class="btn btn-arcoiris in-btn-xl" href="#presentacion">${ico('play')} Ver la demo en vivo</a>
              <a class="btn btn-fantasma in-btn-xl" href="#inicio">${ico('atras')} Volver a Dispensa</a>
            </div>
          </div>
        </section>
        <footer class="in-pie">
          <div class="contenedor in-pie-fila">
            <span class="in-pie-marca">${ico('logo')} Dispensa</span>
            <span class="chip sin-punto">Chile + Argentina</span>
            <span class="in-mano">precios claros, como el agua de la cordillera ♡</span>
          </div>
        </footer>
      </div>`;
      const raiz = el.firstElementChild;
      raiz.querySelectorAll('[data-pr-plan]').forEach(b => b.addEventListener('click', () => {
        const r = b.getBoundingClientRect();
        D.fx.confeti(r.left + r.width / 2, r.top, 60);
        D.fx.toast(b.dataset.prPlan, 'Buena elección. Te contactamos para agendar la implementación.');
      }));
      montarLicencia(raiz);
      entradas(raiz);
    },
    salir() { limpiezas.forEach(f => { try { f(); } catch (e) { } }); limpiezas = []; }
  };
})();
