/* ============================================================
   Dispensa — vista «presentacion»: diapositivas a pantalla completa
   para mostrar el sistema al dueño de un dispensario.
   Flechas del teclado, clic, deslizar, puntos, contador, pantalla
   completa y avance automático. Prefijo de clases: .pz-
   (estilos en css/v-presentacion.css)
   ============================================================ */
(function () {
  const D = window.DEMO;
  const ico = (n, c) => D.ico(n, c);
  const reducido = () => D.fx && D.fx.reducido;
  const AUTO_MS = 11000;
  const CLAVE_VUELTA = 'dispensa-pres-vuelta';

  let raiz = null, idx = 0, secciones = [], global = [], delDia = [], auto = false, autoT = null, ultimoPuntero = 'mouse';

  /* ---------- temporizadores de la diapositiva activa (se limpian al cambiar) ---------- */
  const T = {
    set(fn, ms) { const id = setTimeout(fn, reducido() ? Math.min(ms, 60) : ms); delDia.push(() => clearTimeout(id)); return id; },
    cada(fn, ms) { const id = setInterval(fn, ms); delDia.push(() => clearInterval(id)); return id; }
  };
  function limpiarDia() { delDia.forEach(f => { try { f(); } catch (e) { } }); delDia = []; }
  /** Ejecuta pasos [espera, fn] en orden; con bucle vuelve a empezar */
  function secuencia(pasos, bucle) {
    let i = 0;
    const sigue = () => T.set(() => { pasos[i][1](); i++; if (i < pasos.length) sigue(); else if (bucle) { i = 0; sigue(); } }, pasos[i][0]);
    sigue();
  }
  const contar = (el, a, dur, f) => { if (!el) return; el.dataset.valor = 0; D.fx.contar(el, a, dur, f); };
  const reiniciarAnim = el => { if (!el) return; el.classList.remove('pz-on'); void el.offsetWidth; el.classList.add('pz-on'); };
  const d = s => `style="--d:${s}s"`;
  /** zorro culpeo, la mascota, con globo de diálogo */
  const zorro = (clase, globo, dd) => `<div class="pz-zorro-png ${clase}" style="--d:${dd || .8}s" aria-hidden="true"><span class="pz-globo">${globo}</span><img src="img/arte/zorro.png" alt="" draggable="false" onerror="this.parentNode && this.parentNode.remove()"></div>`;
  const RUTA = n => typeof n === 'number' ? `img/escenas/escena-${n}.jpg` : n;
  /* la url va directa en el estilo en línea (dentro de una variable CSS se resolvería contra la carpeta css/) */
  const foto = (n, c) => /paisaje/.test(n)
    ? `<div class="pz-foto ${c || ''}" style="background-image:var(--fondo-img, url(${RUTA(n)})), var(--atardecer)" aria-hidden="true"></div>`
    : `<div class="pz-foto ${c || ''}" style="background-image:url(${RUTA(n)}), var(--atardecer)" aria-hidden="true"></div>`;

  /* ============================================================
     DIAPOSITIVAS
     ============================================================ */

  /* 1 · Portada */
  function hPortada() {
    const est = [[6, 10], [15, 26], [24, 7], [33, 18], [44, 5], [52, 22], [61, 9], [70, 16], [79, 6], [88, 20], [95, 10], [40, 32], [66, 30], [9, 40]]
      .map(([x, y], i) => `<i style="left:${x}%;top:${y}%;--t:${(i * .53) % 3}s"></i>`).join('');
    return `
    ${foto('img/arte/paisaje-cannabis.jpg', 'pz-foto-portada')}
    <div class="pz-estrellas" aria-hidden="true">${est}</div>
    ${zorro('pz-zorro-portada', '¡Hola! Te muestro el dispensario ordenado', 1.3)}
    <figure class="pz-polaroid pz-a pz-de" ${d(.9)}><span style="background-image:url(${RUTA(1)})"></span><figcaption>un día cualquiera en Raíz Austral, ordenado</figcaption></figure>
    <div class="pz-portada">
      <span class="pz-logo pz-a pz-pop">${ico('logo')}</span>
      <h1 class="pz-mega pz-a pz-iz" ${d(.1)}>Dispensa</h1>
      <p class="pz-lema pz-a pz-iz" ${d(.3)}>La <em>aplicación</em> para dispensarios de cannabis medicinal.</p>
      <p class="pz-paises pz-a pz-ab" ${d(.6)}><span>${ico('mundo')}Chile</span><span>${ico('mundo')}Argentina</span></p>
      <p class="pz-mano pz-a pz-ab" ${d(1)}>para clubes y dispensarios</p>
    </div>
    <p class="pz-pista pz-a pz-ab" ${d(1.8)}>Avanza con las flechas ${ico('flecha')} o deslizando</p>`;
  }

  /* 2 · El problema */
  const CAOS = [
    ['whatsapp', 'WhatsApp que no para', '«¿hay stock?»', '99+', 0, 2, -6],
    ['excel', 'El Excel de socios', 'socios_FINAL_v3.xlsx', '', 52, 0, 5],
    ['receta', 'Recetas vencidas', '¿y esta de cuándo es?', '', 4, 36, 3],
    ['billetera', 'Cobros a mano', '«te transfiero mañana»', '', 54, 33, -5],
    ['fiscalizacion', 'Miedo a la fiscalización', '¿dónde quedó ese papel?', '', 2, 70, -3],
    ['reloj', '23:47', 'y sigues contestando', '', 52, 68, 6]
  ];
  function hProblema() {
    const cartas = CAOS.map(([i, t, s, b, x, y, r], k) =>
      `<div class="pz-caos-c pz-vidrio" style="left:${x}%;top:${y}%;--r:${r}deg;--d:${(.35 + k * .28).toFixed(2)}s">
        <span class="pz-caos-i">${ico(i)}${b ? `<i class="pz-badge">${b}</i>` : ''}</span><span><b>${t}</b><small>${s}</small></span></div>`).join('');
    return `
    <div class="pz-2col">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">El problema</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Así es el día<br>del dueño <em>hoy</em>.</h2>
        <p class="pz-sub pz-a pz-iz" ${d(.3)}>Todo pasa por tu celular. Y por tu cabeza.</p>
        <p class="pz-mano pz-a pz-ab" ${d(2.4)}>no tiene que ser así</p>
      </div>
      <div class="pz-caos" aria-label="Tareas que hoy se hacen a mano">${cartas}</div>
    </div>`;
  }

  /* 3 · La idea: todo conectado */
  const NODOS = [
    ['mundo', 'Sitio público', 'tu marca y catálogo', 50, 9],
    ['telefono', 'App del socio', 'canjea solo', 88, 38],
    ['grafico', 'Panel del dueño', 'todo a la vista', 74, 84],
    ['correo', 'Correos automáticos', 'con tu logo', 26, 84],
    ['campana', 'Campanita', 'avisos al instante', 12, 38]
  ];
  function hIdea() {
    const lineas = NODOS.map((n, k) => `<path class="pz-trazo" pathLength="1" d="M50 50 L${n[3]} ${n[4]}" style="--d:${(.3 + k * .18).toFixed(2)}s"/>`).join('');
    const pulsos = reducido() ? '' : NODOS.map((n, k) => `<circle class="pz-pulso" r="1.3"><animateMotion dur="2.6s" begin="${(1.4 + k * .5).toFixed(1)}s" repeatCount="indefinite" path="M50 50 L${n[3]} ${n[4]}"/></circle>`).join('');
    const nodos = NODOS.map((n, k) => `<div class="pz-nodo" style="left:${n[3]}%;top:${n[4]}%"><div class="pz-nodo-in pz-a pz-pop" ${d((.7 + k * .2).toFixed(2))}><span>${ico(n[0])}</span><b>${n[1]}</b><small>${n[2]}</small></div></div>`).join('');
    return `
    ${foto('img/arte/paisaje-cannabis.jpg', 'pz-foto-velo')}
    <div class="pz-2col pz-idea">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">La idea</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Todo <em>conectado</em>.<br>Un solo sistema.</h2>
        <p class="pz-sub pz-a pz-iz" ${d(.3)}>Lo que haces en el panel, el socio lo ve en su app. Al tiro.</p>
        <p class="pz-mano pz-a pz-ab" ${d(2)}>una sola plataforma, no siete</p>
      </div>
      <div class="pz-radial">
        <svg class="pz-radial-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="pz-anillo" cx="50" cy="50" r="30"/><circle class="pz-anillo pz-anillo-2" cx="50" cy="50" r="43"/>
          ${lineas}${pulsos}
        </svg>
        <div class="pz-nucleo pz-a pz-pop">${ico('logo')}<b>Dispensa</b></div>
        ${nodos}
      </div>
    </div>`;
  }

  /* 4 · El viaje del socio */
  const PASOS = [
    ['documento', 'Postula', 'online, sin cuenta'],
    ['socios', 'Comité revisa', 'entrevista y adjuntos'],
    ['check', 'Aprueba', 'con 1 clic'],
    ['billetera', 'Bienvenida', '+ billetera creada'],
    ['membresia', 'Membresía anual', 'corre sola'],
    ['receta', 'Receta', 'con su gramaje'],
    ['token', 'Tokens y canje', 'desde el celular'],
    ['firma', 'Recibe y firma', 'con el dedo']
  ];
  function hViaje() {
    const pasos = PASOS.map((p, k) => `<li class="pz-paso pz-a pz-pop" ${d((.5 + k * .22).toFixed(2))}><span class="pz-paso-ico">${ico(p[0])}<i>${k + 1}</i></span><b>${p[1]}</b><small>${p[2]}</small></li>`).join('');
    return `
    <div class="pz-col">
      <div class="pz-cabeza">
        <p class="pz-eyebrow pz-a pz-iz">El viaje del socio</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>De postular a recibir, en <em>8 pasos</em>.</h2>
        ${zorro('pz-zorro-viaje', '¡sígueme!', 1.2)}
      </div>
      <div class="pz-viaje">
        <svg class="pz-viaje-svg" aria-hidden="true">
          <path id="pz-ruta" class="pz-ruta-base"/>
          <path class="pz-ruta pz-trazo" pathLength="1" style="--d:.3s;--dur:2.6s"/>
          ${reducido() ? '' : '<circle class="pz-paquete" r="9"><animateMotion dur="7s" repeatCount="indefinite" rotate="auto"><mpath href="#pz-ruta"/></animateMotion></circle><circle class="pz-paquete-n" r="4"><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#pz-ruta"/></animateMotion></circle>'}
        </svg>
        <ol class="pz-pasos">${pasos}</ol>
      </div>
    </div>`;
  }
  function posRel(el, anc) { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; }
  function rutaViaje() {
    const cont = raiz && raiz.querySelector('.pz-viaje');
    if (!cont || !cont.offsetWidth) return;
    const w = cont.offsetWidth, h = cont.offsetHeight;
    const pts = [...cont.querySelectorAll('.pz-paso-ico')].map(e => { const [x, y] = posRel(e, cont); return [x + e.offsetWidth / 2, y + e.offsetHeight / 2, e.offsetWidth / 2]; });
    let ruta = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0, r0] = pts[i - 1], [x, y] = pts[i];
      if (Math.abs(y - y0) > 4 && Math.abs(x - x0) < 4) {
        const s = x > w / 2 ? 1 : -1, k = r0 * 1.6 + 24;
        ruta += ` C${x0 + s * k} ${y0} ${x + s * k} ${y} ${x} ${y}`;
      } else ruta += ` L${x} ${y}`;
    }
    const svg = cont.querySelector('svg');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.querySelectorAll('path').forEach(p => p.setAttribute('d', ruta));
  }

  /* 5 · Receta inteligente */
  function hReceta() {
    const s = D.state;
    return `
    ${foto(2, 'pz-foto-tenue')}
    <div class="pz-2col">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">Receta inteligente</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Si vence, el carrito se <em>pausa solo</em>.</h2>
        <p class="pz-sub pz-a pz-iz" ${d(.3)}>La membresía sigue activa. Sube la receta nueva y todo vuelve a andar.</p>
        <p class="pz-mano pz-a pz-ab" ${d(1.6)}>nadie tiene que acordarse de nada</p>
      </div>
      <div class="pz-rx pz-a pz-de" ${d(.3)} data-estado="vigente">
        <div class="pz-rx-cal pz-vidrio">
          <span class="pz-rx-mes">${ico('calendario')}Noviembre 2026</span>
          <b class="pz-rx-dia num">18</b>
          <span class="pz-rx-est"><span class="chip ok">Receta vigente</span><span class="chip alerta">Venció hoy</span><span class="chip ok">Receta nueva hasta may 2027</span></span>
          <small class="pz-rx-folio mono">${s.socio.receta.folio} · ${s.socio.receta.medico}</small>
        </div>
        <div class="pz-rx-carro pz-vidrio">
          <span class="pz-rx-c-ico">${ico('carrito')}<span class="pz-rx-candado">${ico('candado')}</span></span>
          <b class="pz-rx-c-t"><span>Carrito activo</span><span>Carrito en pausa</span><span>¡Reactivado!</span></b>
          <small class="pz-rx-c-s"><span>Canjea cuando quieras</span><span>Hasta que suba la receta nueva</span><span>Sin llamar a nadie</span></small>
        </div>
        <div class="pz-rx-mem"><span class="chip ok">${ico('membresia')} Membresía activa · no se toca</span></div>
        <div class="pz-rx-doc pz-vidrio">${ico('receta')}<span><b>Receta nueva</b><small>subida desde la app</small></span>${ico('check', 'pz-rx-ok')}</div>
      </div>
    </div>`;
  }
  function eReceta(sec) {
    const rx = sec.querySelector('.pz-rx'), dia = sec.querySelector('.pz-rx-dia');
    const pon = (e, n) => { rx.dataset.estado = e; if (n) dia.textContent = n; };
    secuencia([
      [50, () => pon('vigente', 18)], [900, () => pon('vigente', 19)], [800, () => pon('vigente', 20)],
      [800, () => pon('vence', 21)], [1300, () => pon('pausa')], [2600, () => pon('nueva')], [3400, () => { }]
    ], true);
  }

  /* 6 · Gramaje diario */
  function datosGramaje() {
    const s = D.state, hoy = D.hoy(), [y, m] = hoy.split('-').map(Number);
    const diasMes = new Date(y, m, 0).getDate(), c = s.socio.consumoDiario;
    let max = 0, diaMax = 0; c.forEach((g, i) => { if (g > max) { max = g; diaMax = i + 1; } });
    return { c, diasMes, max, diaMax, total: D.gramosMes(), disp: D.gramosDisponibles(), limite: s.socio.receta.limite, mes: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][m - 1], mesC: D.fmt.fechaCorta(`${y}-${String(m).padStart(2, '0')}-01`).split(' ')[1] };
  }
  function hGramaje() {
    const g = datosGramaje(), escala = Math.max(5, g.max);
    let barras = '';
    for (let i = 0; i < g.diasMes; i++) {
      const v = g.c[i];
      if (v === undefined) barras += `<i class="fut"></i>`;
      else barras += `<i class="${v ? 'con' : 'cero'}${i + 1 === g.diaMax ? ' pico' : ''}" style="--h:${Math.max(3, v / escala * 100)}%;--i:${i}">${i + 1 === g.diaMax ? `<em>${D.fmt.g(v)}</em>` : ''}</i>`;
    }
    const pct = Math.min(100, g.total / g.limite * 100);
    return `
    <div class="pz-col">
      <div class="pz-cabeza pz-cabeza-fila">
        <div>
          <p class="pz-eyebrow pz-a pz-iz">Gramaje diario · ${g.mes}</p>
          <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Cada gramo, <em>contado solo</em>.</h2>
        </div>
        <p class="pz-mano pz-a pz-de" ${d(2)}>el sistema cuenta, tú no</p>
      </div>
      <div class="pz-gram pz-vidrio pz-a pz-ab" ${d(.25)}>
        <div class="pz-gram-barras" aria-label="Consumo por día del mes">${barras}</div>
        <div class="pz-gram-eje mono"><span>1 ${g.mesC}</span><span>hoy</span><span>${g.diasMes} ${g.mesC}</span></div>
        <div class="pz-gram-cupo"><span class="progreso"><i style="width:${pct}%"></i></span><small class="mono">${D.fmt.g(g.total)} de ${g.limite} g autorizados</small></div>
      </div>
      <div class="pz-stats">
        <div class="pz-stat pz-a pz-ab" ${d(.6)}><small>Este mes</small><b class="num" data-pz-g="${g.total}">${D.fmt.g(g.total)}</b></div>
        <div class="pz-stat pz-a pz-ab" ${d(.75)}><small>Día de mayor consumo</small><b class="num">${g.diaMax} ${g.mesC} · ${D.fmt.g(g.max)}</b></div>
        <div class="pz-stat pz-stat-ok pz-a pz-ab" ${d(.9)}><small>Disponible</small><b class="num" data-pz-g="${g.disp}">${D.fmt.g(g.disp)}</b></div>
      </div>
    </div>`;
  }
  function eGramaje(sec) {
    sec.querySelectorAll('[data-pz-g]').forEach(el => contar(el, +el.dataset.pzG, 1400, v => D.fmt.g(v)));
    const barra = sec.querySelector('.pz-gram-cupo .progreso i');
    if (barra) { const w = barra.style.width; barra.style.width = '0%'; T.set(() => { barra.style.width = w; }, 500); }
  }

  /* 7 · Tokens */
  function hTokens() {
    const s = D.state, p = s.productos[0];
    const bolsas = s.bolsas.map((b, k) => `<div class="pz-bolsa${b.destacada ? ' dest' : ''}" data-b="${b.id}"><b class="num">${b.tokens}</b><small>tokens</small><em class="mono">${D.fmt.clp(b.precio)}</em></div>`).join('');
    return `
    <div class="pz-col">
      <div class="pz-cabeza">
        <p class="pz-eyebrow pz-a pz-iz">Tokens</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Se aporta antes, se <em>canjea</em> después.</h2>
      </div>
      <div class="pz-tok">
        <div class="pz-tok-est pz-a pz-iz" ${d(.3)}>
          <p class="pz-tok-tit">${ico('tienda')}Bolsas</p>
          <div class="pz-bolsas">${bolsas}</div>
          <small class="pz-tok-pie">Webpay · Flow · Mercado Pago</small>
        </div>
        <span class="pz-tok-flecha pz-a pz-pop" ${d(.6)}>${ico('flecha')}</span>
        <div class="pz-tok-est pz-tok-bille pz-a pz-ab" ${d(.5)}>
          <p class="pz-tok-tit">${ico('billetera')}Billetera de ${s.socio.primer}</p>
          <div class="pz-tok-saldo"><span class="moneda">T</span><b class="num" data-pz-saldo>${s.socio.tokens}</b></div>
          <small class="pz-tok-pie">cada movimiento queda registrado</small>
        </div>
        <span class="pz-tok-flecha pz-a pz-pop" ${d(.8)}>${ico('flecha')}</span>
        <div class="pz-tok-est pz-tok-prod pz-a pz-de" ${d(.7)}>
          <p class="pz-tok-tit">${ico('carrito')}Canje</p>
          <div class="pz-tok-foto" style="background-image:url(${p.img})"><span class="pz-sello-mini">Canjeado ✓</span></div>
          <b class="pz-tok-nom">${p.nombre} · 5 g</b>
          <span class="pz-tok-precio"><span class="moneda">T</span>${p.tokens} tokens</span>
        </div>
      </div>
      <p class="pz-mano pz-a pz-ab pz-der" ${d(1.6)}>caja al día, cero efectivo en el mesón</p>
    </div>`;
  }
  function eTokens(sec) {
    const s = D.state, base = s.socio.tokens, p = s.productos[0], b55 = s.bolsas.find(b => b.destacada) || s.bolsas[1];
    const saldo = sec.querySelector('[data-pz-saldo]'), bolsa = sec.querySelector(`[data-b="${b55.id}"]`), bille = sec.querySelector('.pz-tok-saldo'), prod = sec.querySelector('.pz-tok-prod');
    const activa = () => sec.classList.contains('activa');
    secuencia([
      [1300, () => { saldo.dataset.valor = base; saldo.textContent = base; prod.classList.remove('canjeado'); bolsa.classList.add('elegida'); }],
      [500, () => { if (activa()) D.fx.monedas(bolsa, bille, 8); T.set(() => { contar(saldo, 0); saldo.dataset.valor = base; D.fx.contar(saldo, base + b55.tokens, 700); bille.classList.add('late'); }, 700); }],
      [1900, () => { bolsa.classList.remove('elegida'); bille.classList.remove('late'); prod.classList.add('eligiendo'); }],
      [500, () => { if (activa()) D.fx.monedas(bille, prod, 6); T.set(() => { D.fx.contar(saldo, base + b55.tokens - p.tokens, 700); prod.classList.remove('eligiendo'); prod.classList.add('canjeado'); }, 800); }],
      [3200, () => { }]
    ], true);
  }

  /* 8 · Postulación + comité */
  function hPostular() {
    const docs = [['cedula', 'Cédula', 'frente y reverso', -6, 'iz'], ['documento', 'Antecedentes', 'PDF protegido', 4, 'de'], ['receta', 'Receta médica', 'con gramaje', -3, 'iz'], ['socios', 'Entrevista', 'preguntas de tu comité', 5, 'de']];
    const pila = docs.map((x, k) => `<div class="pz-doc pz-vidrio pz-a pz-${x[4]}" style="--r:${x[3]}deg;--k:${k};--d:${(.4 + k * .35).toFixed(2)}s">${ico(x[0])}<span><b>${x[1]}</b><small>${x[2]}</small></span>${ico('check', 'pz-doc-ok')}</div>`).join('');
    return `
    <div class="pz-2col">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">Postulación online + comité</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Postulan solos. Tú <em>apruebas</em> con un clic.</h2>
        <ul class="pz-lista">
          <li class="pz-a pz-iz" ${d(.4)}>${ico('check')}Sin crear cuenta ni contraseñas</li>
          <li class="pz-a pz-iz" ${d(.55)}>${ico('check')}Adjuntos guardados bajo llave</li>
          <li class="pz-a pz-iz" ${d(.7)}>${ico('check')}Tu entrevista, tus preguntas</li>
        </ul>
      </div>
      <div class="pz-pila">
        ${pila}
        <div class="pz-sello" aria-hidden="true"><span>Aprobado</span></div>
        <div class="pz-bienvenida pz-vidrio">${ico('correo')}<span><b>Bienvenida enviada</b><small>+ billetera creada para Rocío</small></span></div>
      </div>
    </div>`;
  }
  function ePostular(sec) {
    T.set(() => {
      const s = sec.querySelector('.pz-sello'); if (!s || !sec.classList.contains('activa')) return;
      const r = s.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top + r.height / 2, 80);
    }, 2350);
  }

  /* 9 · App del socio (4 pantallas, como la lámina 05) */
  const APP_PANT = ['Inicio', 'Tienda', 'Carrito pausado', 'Firma de recepción'];
  function hApp() {
    const s = D.state, so = s.socio;
    const dm = D.diasMembresia(), pctMem = Math.max(4, Math.min(100, dm / 365 * 100));
    const gm = D.gramosMes(), pctG = Math.min(100, gm / so.receta.limite * 100);
    const prods = s.productos.slice(0, 4).map(p => `<div class="pz-app-prod"><span style="background-image:url(${p.img})"></span><b>${p.nombre}</b><small>${p.tipo}</small><em><span class="moneda">T</span>${p.tokens} tokens</em></div>`).join('');
    const marca = `<p class="pz-app-marca">${ico('logo')}Dispensa</p>`;
    const pant1 = `
      <div class="pz-app-pan">
        ${marca}
        <div class="pz-app-top"><span><b>Hola, ${so.primer}</b><small>qué bueno tenerte aquí</small></span><span class="pz-app-campana">${ico('campana')}<i>2</i></span></div>
        <div class="pz-app-fila pz-app-tok"><span class="moneda">T</span><span><b>${so.tokens} tokens</b><small>tu saldo disponible</small></span>${ico('flecha')}</div>
        <div class="pz-app-mem"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18"/><circle class="pz-app-arco" cx="22" cy="22" r="18" pathLength="100" style="--p:${pctMem}"/></svg><b class="num">${dm}<small>días</small></b><span><b>Tu membresía está activa</b><small>renueva sola, con aviso</small></span></div>
        <div class="pz-app-fila">${ico('receta')}<span><b>Receta vigente</b><small>hasta el ${D.fmt.fechaCorta(so.receta.hasta)}</small></span>${ico('flecha')}</div>
        <div class="pz-app-fila pz-app-gram">${ico('gramaje')}<span><b>Gramaje del mes</b><small>${D.fmt.g(gm)} de ${so.receta.limite} g</small><i class="progreso"><i style="width:${pctG}%"></i></i></span></div>
      </div>`;
    const pant2 = `
      <div class="pz-app-pan">
        ${marca}
        <div class="pz-app-top"><span><b>Tienda</b><small>bienestar que se cultiva</small></span><span class="pz-app-campana">${ico('carrito')}</span></div>
        <div class="pz-app-chips"><span class="on">Todas</span><span>Flores</span><span>Aceites</span></div>
        <div class="pz-app-grid">${prods}</div>
      </div>`;
    const pant3 = `
      <div class="pz-app-pan pz-app-pausa">
        ${marca}
        <span class="pz-app-candado">${ico('candado')}</span>
        <b class="pz-app-gran">Tu receta venció hoy.</b>
        <small>El carrito queda en pausa; tu membresía sigue activa.</small>
        <span class="chip ok">Membresía activa</span>
        <span class="pz-app-subir">${ico('receta')}Subir receta nueva</span>
      </div>`;
    const pant4 = `
      <div class="pz-app-pan">
        ${marca}
        <div class="pz-app-ok">${ico('check')}<span><b>Entrega recibida</b><small>¡disfruta tu tratamiento!</small></span></div>
        <div class="pz-app-ped"><small class="mono">Pedido #2052</small><p><span style="background-image:url(${s.productos[0].img})"></span>${s.productos[0].nombre} 5 g<em>${s.productos[0].tokens} T</em></p><p><span style="background-image:url(${s.productos[8].img})"></span>${s.productos[8].nombre}<em>${s.productos[8].tokens} T</em></p></div>
        <div class="pz-app-firma"><small>Firma con el dedo</small><svg viewBox="0 0 200 60" aria-hidden="true"><path class="pz-app-trazo" pathLength="1" d="M10 42c10-2 14-26 24-26 8 0 0 26 10 26 8 0 10-18 18-18 6 0 3 14 9 14 8 0 11-22 20-22 7 0 4 20 12 20 10 0 14-10 26-12M120 50c20-2 44-3 66-4"/></svg></div>
        <span class="pz-app-subir pz-app-conf">Confirmar recepción</span>
      </div>`;
    return `
    ${foto(3, 'pz-foto-app')}
    <div class="pz-2col">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">App del socio</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Todo en su bolsillo. <em>Parece app, es app.</em></h2>
        <ul class="pz-lista">
          <li class="pz-a pz-iz" ${d(.35)}>${ico('billetera')}Tokens y membresía</li>
          <li class="pz-a pz-iz" ${d(.5)}>${ico('tienda')}Tienda para canjear</li>
          <li class="pz-a pz-iz" ${d(.65)}>${ico('candado')}Se pausa sola si vence la receta</li>
          <li class="pz-a pz-iz" ${d(.8)}>${ico('firma')}Firma al recibir</li>
        </ul>
        <p class="pz-mano pz-a pz-ab" ${d(1.6)}>sin descargar nada de ninguna tienda</p>
      </div>
      <div class="pz-cel-zona pz-a pz-de" ${d(.2)}>
        <div class="pz-cel"><div class="pz-cel-pant">
          <span class="pz-cel-isla"></span>
          <div class="pz-app-riel">${pant1}${pant2}${pant3}${pant4}</div>
          <div class="pz-app-tab">${[['inicio', 'Inicio'], ['tienda', 'Tienda'], ['billetera', 'Billetera'], ['receta', 'Receta'], ['usuario', 'Perfil']].map(([n, t]) => `<i>${ico(n)}<small>${t}</small></i>`).join('')}</div>
        </div></div>
        <p class="pz-app-rotulo"><span>Inicio</span></p>
      </div>
    </div>`;
  }
  function eApp(sec) {
    const riel = sec.querySelector('.pz-app-riel'), tabs = sec.querySelectorAll('.pz-app-tab i'), rot = sec.querySelector('.pz-app-rotulo span'), trazo = sec.querySelector('.pz-app-trazo');
    const tabDe = [0, 1, 3, 4];
    let k = 0;
    const pon = n => {
      k = n; riel.style.transform = `translateX(${-n * 25}%)`;
      tabs.forEach((t, j) => t.classList.toggle('on', j === tabDe[n]));
      rot.textContent = APP_PANT[n]; reiniciarAnim(rot);
      if (n === 3) T.set(() => reiniciarAnim(trazo), 500);
    };
    pon(0);
    T.cada(() => pon((k + 1) % 4), 3200);
  }

  /* 10 · Panel del dueño */
  function hPanel() {
    const s = D.state, max = Math.max(...s.ventasSemana.map(v => v.tokens));
    const barras = s.ventasSemana.map((v, i) => `<i style="--h:${Math.round(v.tokens / max * 100)}%;--i:${i}"><em>${v.d}</em></i>`).join('');
    const ev = s.eventos.slice(0, 4).map(e => `<li><span class="mono">${e.t}</span>${e.txt}</li>`).join('');
    const sol = s.solicitudes[0];
    return `
    <div class="pz-col">
      <div class="pz-cabeza pz-cabeza-fila">
        <div>
          <p class="pz-eyebrow pz-a pz-iz">Panel del dueño</p>
          <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Tu panel, también en el <em>celular</em>.</h2>
        </div>
        <p class="pz-mano pz-a pz-de" ${d(2)}>administra desde donde estés</p>
      </div>
      <div class="pz-pan">
        <div class="pz-ven pz-a pz-iz" ${d(.3)}>
          <div class="pz-ven-barra"><i></i><i></i><i></i><span class="mono">${s.dispensario.nombre.toLowerCase().replace(/\s+/g, '')}.cl/panel</span></div>
          <div class="pz-ven-cuerpo">
            <aside>${ico('logo')}<span class="on">${ico('inicio')}</span><span>${ico('socios')}</span><span>${ico('receta')}</span><span>${ico('token')}</span><span>${ico('fiscalizacion')}</span></aside>
            <div class="pz-ven-main">
              <div class="pz-kpis">
                <div><small>Socios activos</small><b class="num" data-pz-n="148">148</b></div>
                <div><small>Recetas por vencer</small><b class="num aviso" data-pz-n="14">14</b></div>
                <div><small>Membresías a renovar</small><b class="num" data-pz-n="9">9</b></div>
                <div><small>Canjes hoy</small><b class="num ok" data-pz-n="23">23</b></div>
              </div>
              <div class="pz-ven-fila">
                <div class="pz-ven-graf"><small>Tokens canjeados esta semana</small><div class="pz-ven-barras">${barras}</div></div>
                <ul class="pz-ven-ev">${ev}</ul>
              </div>
            </div>
          </div>
        </div>
        <div class="pz-cel pz-cel-chico pz-a pz-de" ${d(.6)}><div class="pz-cel-pant">
          <span class="pz-cel-isla"></span>
          <div class="pz-app-pan">
            <div class="pz-app-top"><span><small>${s.dispensario.nombre}</small><b>Panel</b></span><span class="pz-app-campana">${ico('campana')}<i>3</i></span></div>
            <div class="pz-mkpi"><div><b class="num">148</b><small>socios</small></div><div><b class="num ok">23</b><small>canjes hoy</small></div></div>
            <div class="pz-msol"><small>Nueva postulación</small><b>${sol.nombre}</b><span>${sol.comuna} · ${sol.adjuntos} adjuntos</span><em>${ico('check')}Aprobar</em></div>
          </div>
        </div></div>
      </div>
    </div>`;
  }
  function ePanel(sec) {
    sec.querySelectorAll('[data-pz-n]').forEach((el, k) => T.set(() => contar(el, +el.dataset.pzN, 1100), 500 + k * 120));
    T.set(() => { const b = sec.querySelector('.pz-msol em'); b && b.classList.add('pz-on'); }, 2600);
  }

  /* 11 · Comunicados + campanita */
  function hComunicados() {
    const segs = D.state.segmentos.filter(x => ['todos', 'receta', 'rec30', 'sintok'].includes(x.id));
    return `
    <div class="pz-2col">
      <div class="pz-texto">
        <p class="pz-eyebrow pz-a pz-iz">Comunicados segmentados</p>
        <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Le hablas a quien <em>corresponde</em>.</h2>
        <div class="pz-comp pz-vidrio pz-a pz-ab" ${d(.35)}>
          <small>Para</small>
          <div class="pz-segs">${segs.map(x => `<span data-seg="${x.id}">${x.nombre} <b class="num">${x.n}</b></span>`).join('')}</div>
          <small>Asunto</small>
          <p class="pz-asunto"><span></span><i class="pz-cursor"></i></p>
          <span class="pz-enviar">${ico('comunicado')}<span class="pz-env-a">Enviar a 14 socios</span><span class="pz-env-b">Enviado ✓</span></span>
        </div>
      </div>
      ${foto(5, 'pz-foto-app')}
      <div class="pz-cel-zona pz-a pz-de" ${d(.2)}>
        <div class="pz-campana-grande">${ico('campana')}<i class="num">0</i></div>
        <div class="pz-cel pz-cel-bloqueo"><div class="pz-cel-pant">
          <span class="pz-cel-isla"></span>
          <div class="pz-bloq-hora"><b class="num">10:42</b><small>miércoles 14 de octubre</small></div>
          <div class="pz-notis"></div>
        </div></div>
      </div>
    </div>`;
  }
  function eComunicados(sec) {
    const asunto = sec.querySelector('.pz-asunto span'), seg = sec.querySelector('[data-seg="rec30"]'), env = sec.querySelector('.pz-enviar'),
      notis = sec.querySelector('.pz-notis'), campana = sec.querySelector('.pz-campana-grande'), badge = campana.querySelector('i');
    const texto = 'Renueva tu receta a tiempo';
    const nota = (t, x, cuando) => { const n = document.createElement('div'); n.className = 'pz-noti'; n.innerHTML = `<span>${ico('logo')}</span><div><small>${D.state.dispensario.nombre} · ${cuando}</small><b>${t}</b><p>${x}</p></div>`; notis.prepend(n); };
    const reset = () => { asunto.textContent = ''; seg.classList.remove('on'); env.classList.remove('on', 'ok'); notis.innerHTML = ''; badge.textContent = '0'; campana.classList.remove('suena', 'con'); nota('Este sábado atendemos hasta las 14:00', 'Feriado largo: los despachos siguen.', 'hace 3 h'); };
    reset();
    const pasos = [[900, () => seg.classList.add('on')]];
    [...texto].forEach(() => pasos.push([55, () => { asunto.textContent = texto.slice(0, asunto.textContent.length + 1); }]));
    pasos.push([700, () => env.classList.add('on')], [450, () => { env.classList.remove('on'); env.classList.add('ok'); }],
      [600, () => { nota(texto, 'Tu receta vence en 30 días. Súbela desde la app y sigue canjeando.', 'ahora'); reiniciarAnim(campana); campana.classList.add('suena', 'con'); badge.textContent = '1'; }],
      [4200, reset]);
    secuencia(pasos, true);
  }

  /* 12 · Firma, fiscalización y ley */
  function hRegla() {
    return `
    <div class="pz-col">
      <div class="pz-cabeza pz-cabeza-fila">
        <div>
          <p class="pz-eyebrow pz-a pz-iz">Cumplimiento</p>
          <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Todo en regla, <em>todo en orden</em>.</h2>
        </div>
        ${zorro('pz-zorro-regla', 'todo en orden por aquí', 1)}
      </div>
      <div class="pz-tres">
        <div class="pz-caja pz-vidrio pz-a pz-ab" ${d(.3)}>
          <p class="pz-caja-t">${ico('firma')}Firma de recepción</p>
          <div class="pz-caja-foto" style="background-image:url(${RUTA(4)}), var(--atardecer)" aria-hidden="true"></div>
          <div class="pz-firma"><svg viewBox="0 0 240 90" aria-hidden="true"><path class="pz-firma-p" pathLength="1" d="M12 62c14-2 20-40 34-40 10 0 2 38 14 38 10 0 12-26 22-26 8 0 4 20 12 20 10 0 14-30 26-30 9 0 5 26 16 26 12 0 16-14 30-16M150 70c20-3 50-4 78-6"/></svg><span class="pz-firma-linea"></span></div>
          <small>Pedido #2051 · firmado en la puerta, con el dedo</small>
        </div>
        <div class="pz-caja pz-vidrio pz-a pz-ab" ${d(.5)}>
          <p class="pz-caja-t">${ico('escudo')}Modo fiscalización</p>
          <ul class="pz-check">
            <li class="pz-a pz-iz" ${d(1)}>${ico('check')}Datos completos por socio</li>
            <li class="pz-a pz-iz" ${d(1.25)}>${ico('check')}Entregas firmadas</li>
            <li class="pz-a pz-iz" ${d(1.5)}>${ico('check')}Receta y gramaje al día</li>
            <li class="pz-a pz-iz" ${d(1.75)}>${ico('check')}Historial exportable</li>
          </ul>
        </div>
        <div class="pz-caja pz-vidrio pz-a pz-ab" ${d(.7)}>
          <p class="pz-caja-t">${ico('ley')}Marco legal</p>
          <div class="pz-ley"><span>${ico('balanza')}</span><div><b>Ley 21.719 · Chile</b><small>datos de salud tratados con cuidado</small></div></div>
          <div class="pz-ley"><span>${ico('montana')}</span><div><b>REPROCANN · Argentina</b><small>registro de socios en orden</small></div></div>
        </div>
      </div>
    </div>`;
  }
  function eRegla(sec) {
    const p = sec.querySelector('.pz-firma-p');
    reiniciarAnim(p);
    T.cada(() => reiniciarAnim(p), 5200);
  }

  /* 13 · Lo que gana el dueño */
  function hGana() {
    const g = [['grafico', 'Vende más', 'el socio canjea solo, a cualquier hora', 'n'], ['reloj', 'Ahorra horas', 'adiós WhatsApp, Excel y cobrar a mano', 'm'], ['escudo', 'Está en regla', 'receta, gramaje e historial controlados', 'v'], ['estrella', 'Se ve increíble', 'tu marca, tu app, tres modos de color', 'r']];
    return `
    ${foto(1, 'pz-foto-gana')}
    <div class="pz-col">
      <div class="pz-cabeza pz-cabeza-fila">
        <div>
          <p class="pz-eyebrow pz-a pz-iz">Lo que ganas tú</p>
          <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Menos caos. <em>Más dispensario.</em></h2>
        </div>
        <p class="pz-mano pz-a pz-de" ${d(2.2)}>con trazabilidad completa</p>
      </div>
      <div class="pz-gana">${g.map((x, k) => `<div class="pz-gana-c pz-vidrio pz-c-${x[3]} pz-a pz-pop" ${d((.35 + k * .25).toFixed(2))}><span>${ico(x[0])}</span><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join('')}</div>
    </div>`;
  }

  /* 14 · Próximo paso (sin precios: se cotiza con cada dispensario) */
  function hPlanes() {
    return `
    ${foto('img/arte/paisaje-cannabis.jpg', 'pz-foto-velo')}
    <div class="pz-col pz-planes-col">
      <div class="pz-cabeza pz-cabeza-fila">
        <div>
          <p class="pz-eyebrow pz-a pz-iz">Próximo paso</p>
          <h2 class="pz-t pz-a pz-iz" ${d(.1)}>Tu dispensario, <em>con tu marca</em>.</h2>
        </div>
        <p class="pz-oferta pz-a pz-de" ${d(.3)}>${ico('estrella')}<span><b>Propuesta a la medida</b> de cada dispensario</span></p>
      </div>
      <div class="pz-planes">
        <div class="pz-plan pz-vidrio pz-a pz-ab" ${d(.45)}>
          <p class="pz-plan-n">1 · Conversamos</p>
          <ul><li>${ico('check')}Cómo opera hoy tu club</li><li>${ico('check')}Socios, recetas y canjes</li><li>${ico('check')}Qué te quita más tiempo</li></ul>
        </div>
        <div class="pz-plan pz-plan-dest pz-vidrio pz-a pz-ab" ${d(.3)}>
          <span class="pz-plan-tag">${ico('estrella')}En 2 semanas</span>
          <p class="pz-plan-n">2 · Lo dejamos andando</p>
          <ul><li>${ico('check')}Tu marca y tu dominio</li><li>${ico('check')}Carga de socios y productos</li><li>${ico('check')}Capacitación al equipo</li></ul>
        </div>
        <div class="pz-plan pz-vidrio pz-a pz-ab" ${d(.6)}>
          <p class="pz-plan-n">3 · Te acompañamos</p>
          <ul><li>${ico('check')}Soporte cercano</li><li>${ico('check')}Mejoras continuas</li><li>${ico('check')}Chile y Argentina</li></ul>
        </div>
      </div>
      <div class="pz-cta pz-a pz-ab" ${d(1.1)}>
        <b>Ver la demo en vivo</b>
        <a class="btn btn-arcoiris btn-sm" href="#club">${ico('mundo')}Sitio del club</a>
        <a class="btn btn-fantasma btn-sm" href="#postular">${ico('documento')}Postulación</a>
        <a class="btn btn-fantasma btn-sm" href="#socio">${ico('telefono')}App del socio</a>
        <a class="btn btn-fantasma btn-sm" href="#panel">${ico('grafico')}Panel</a>
      </div>
    </div>`;
  }

  const DIAS = [
    { id: 'portada', nombre: 'Dispensa', html: hPortada },
    { id: 'problema', nombre: 'El problema', html: hProblema },
    { id: 'idea', nombre: 'Todo conectado', html: hIdea, vivo: 'club' },
    { id: 'viaje', nombre: 'El viaje del socio', html: hViaje, entrar: () => { rutaViaje(); T.set(rutaViaje, 400); }, vivo: 'postular' },
    { id: 'receta', nombre: 'Receta inteligente', html: hReceta, entrar: eReceta, vivo: 'socio' },
    { id: 'gramaje', nombre: 'Gramaje diario', html: hGramaje, entrar: eGramaje, vivo: 'socio' },
    { id: 'tokens', nombre: 'Tokens', html: hTokens, entrar: eTokens, vivo: 'socio' },
    { id: 'postular', nombre: 'Postulación y comité', html: hPostular, entrar: ePostular, vivo: 'postular' },
    { id: 'app', nombre: 'App del socio', html: hApp, entrar: eApp, vivo: 'socio' },
    { id: 'panel', nombre: 'Panel del dueño', html: hPanel, entrar: ePanel, vivo: 'panel' },
    { id: 'comunicados', nombre: 'Comunicados', html: hComunicados, entrar: eComunicados, vivo: 'panel' },
    { id: 'regla', nombre: 'Todo en regla', html: hRegla, entrar: eRegla, vivo: 'panel' },
    { id: 'gana', nombre: 'Lo que ganas', html: hGana },
    { id: 'planes', nombre: 'Próximo paso', html: hPlanes }
  ];
  const N = DIAS.length;

  /* ---------- flora decorativa (SVG propio, colores por variables) ---------- */
  const flora = `
  <div class="pz-flora" aria-hidden="true">
    <svg class="pz-fl pz-fl-iz" viewBox="0 0 200 260"><path class="tallo" d="M40 260C44 200 30 150 46 90M46 150c-22-8-34-26-36-50 20 6 32 24 36 50ZM44 190c20-6 34-22 38-44-20 4-34 20-38 44Z"/><path class="hongo" d="M92 214c0-26 18-42 40-42s40 16 40 42Z"/><path class="pie" d="M124 214c-2 16-4 30-8 46h32c-4-16-6-30-8-46"/><circle class="punto" cx="118" cy="196" r="5"/><circle class="punto" cx="146" cy="190" r="4"/><path class="hongo h2" d="M150 238c0-14 10-22 22-22s22 8 22 22Z"/><path class="pie" d="M166 238l-3 22h18l-3-22"/><g class="flor"><circle cx="46" cy="84" r="8"/><circle cx="46" cy="68" r="7"/><circle cx="60" cy="78" r="7"/><circle cx="32" cy="78" r="7"/><circle cx="54" cy="94" r="7"/><circle cx="38" cy="94" r="7"/></g><circle class="centro" cx="46" cy="82" r="5"/></svg>
    <svg class="pz-fl pz-fl-de" viewBox="0 0 200 260"><path class="tallo" d="M150 260V110"/><path class="hoja" d="M150 150c-14-12-22-30-20-52 14 12 20 30 20 52Zm0 0c14-12 22-30 20-52-14 12-20 30-20 52ZM150 168c-16-4-32-16-38-34 18 2 32 14 38 34Zm0 0c16-4 32-16 38-34-18 2-32 14-38 34ZM150 180c-14 2-28-2-36-12 14-3 28 0 36 12Zm0 0c14 2 28-2 36-12-14-3-28 0-36 12Z"/><path class="tallo" d="M70 260c0-40-8-70 4-104"/><g class="flor f2"><circle cx="74" cy="150" r="7"/><circle cx="74" cy="136" r="6"/><circle cx="86" cy="144" r="6"/><circle cx="62" cy="144" r="6"/><circle cx="80" cy="158" r="6"/><circle cx="68" cy="158" r="6"/></g><circle class="centro" cx="74" cy="148" r="4.5"/></svg>
  </div>`;

  /* ============================================================
     NAVEGACIÓN
     ============================================================ */
  function ir(n) {
    n = Math.max(0, Math.min(N - 1, n));
    idx = n;
    limpiarDia();
    secciones.forEach((s, i) => {
      const act = i === n;
      s.classList.toggle('activa', act);
      s.classList.toggle('antes', i < n);
      s.setAttribute('aria-hidden', act ? 'false' : 'true');
      s.inert = !act;
      if (!act) s.scrollTop = 0;
    });
    raiz.querySelectorAll('.pz-puntos button').forEach((b, i) => b.setAttribute('aria-current', i === n ? 'step' : 'false'));
    raiz.querySelector('.pz-cont b').textContent = n + 1;
    raiz.querySelector('[data-pz="prev"]').disabled = n === 0;
    raiz.querySelector('[data-pz="next"]').disabled = n === N - 1;
    raiz.dataset.dia = DIAS[n].id;
    const di = DIAS[n];
    if (di.entrar) { try { di.entrar(secciones[n]); } catch (e) { console.error(e); } }
    if (auto) programarAuto();
  }
  const sig = () => { if (idx < N - 1) ir(idx + 1); else if (auto) ir(0); };
  const ant = () => ir(idx - 1);

  function programarAuto() {
    clearTimeout(autoT);
    const barra = raiz.querySelector('.pz-barra-auto');
    barra.classList.remove('corre'); void barra.offsetWidth;
    if (!auto) return;
    barra.style.setProperty('--ms', AUTO_MS + 'ms');
    barra.classList.add('corre');
    autoT = setTimeout(sig, AUTO_MS);
  }
  function alternarAuto() {
    auto = !auto;
    const b = raiz.querySelector('[data-pz="auto"]');
    b.setAttribute('aria-pressed', auto);
    b.innerHTML = ico(auto ? 'pausa' : 'play');
    b.title = auto ? 'Detener avance automático' : 'Avance automático';
    raiz.classList.toggle('en-auto', auto);
    programarAuto();
    D.fx.toast(auto ? 'Avance automático' : 'Avance manual', auto ? 'Cambia sola cada 11 segundos.' : 'Tú mandas con las flechas.', auto ? '▶' : '❚❚');
  }

  const enPantalla = () => document.fullscreenElement || document.webkitFullscreenElement;
  function pantallaCompleta() {
    try {
      if (enPantalla()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      const f = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
      if (!f) throw new Error('sin soporte');
      const p = f.call(raiz);
      if (p && p.catch) p.catch(() => D.fx.toast('Pantalla completa no disponible', 'Usa el menú del navegador o F11.', '!'));
    } catch (e) { D.fx.toast('Pantalla completa no disponible', 'Usa el menú del navegador o F11.', '!'); }
  }
  function alCambiarPantalla() {
    const b = raiz && raiz.querySelector('[data-pz="pantalla"]');
    if (!b) return;
    const si = !!enPantalla();
    b.innerHTML = ico(si ? 'contraer' : 'pantalla');
    b.title = si ? 'Salir de pantalla completa (F)' : 'Pantalla completa (F)';
    medir();
  }

  function medir() {
    if (!raiz) return;
    const bar = document.getElementById('demobar');
    raiz.style.setProperty('--pz-top', (bar ? bar.getBoundingClientRect().height : 0) + 'px');
    rutaViaje();
  }

  function escuchar(obj, ev, fn, op) { obj.addEventListener(ev, fn, op); global.push(() => obj.removeEventListener(ev, fn, op)); }

  /* ============================================================
     VISTA
     ============================================================ */
  D.views.presentacion = {
    titulo: 'Presentación',
    render(el) {
      let inicio = 0;
      try { const v = sessionStorage.getItem(CLAVE_VUELTA); if (v !== null) { inicio = +v || 0; sessionStorage.removeItem(CLAVE_VUELTA); } } catch (e) { }

      el.innerHTML = `
      <div class="pz" tabindex="-1" aria-roledescription="presentación" aria-label="Presentación de Dispensa">
        ${flora}
        <div class="pz-barra-auto" aria-hidden="true"><i></i></div>
        <div class="pz-escenario">
          ${DIAS.map((di, i) => `
          <section class="pz-dia pz-d-${di.id}" aria-roledescription="diapositiva" aria-label="${i + 1} de ${N}: ${di.nombre}">
            <div class="pz-lienzo">${di.html()}</div>
            ${di.vivo ? `<a class="pz-vivo" href="#${di.vivo}">Verlo en vivo ${ico('flecha')}</a>` : ''}
          </section>`).join('')}
        </div>
        <nav class="pz-ctrl" aria-label="Control de la presentación">
          <button type="button" class="pz-b" data-pz="prev" aria-label="Diapositiva anterior">${ico('atras')}</button>
          <div class="pz-puntos">${DIAS.map((di, i) => `<button type="button" data-pz-ir="${i}" aria-label="Ir a ${i + 1}: ${di.nombre}"></button>`).join('')}</div>
          <button type="button" class="pz-b" data-pz="next" aria-label="Diapositiva siguiente">${ico('flecha')}</button>
          <span class="pz-cont mono" aria-live="polite"><b>1</b> / ${N}</span>
          <button type="button" class="pz-b" data-pz="auto" aria-pressed="false" title="Avance automático">${ico('play')}</button>
          <button type="button" class="pz-b" data-pz="pantalla" title="Pantalla completa (F)">${ico('pantalla')}</button>
        </nav>
      </div>`;

      raiz = el.querySelector('.pz');
      secciones = [...raiz.querySelectorAll('.pz-dia')];
      medir();

      // controles
      raiz.querySelector('.pz-ctrl').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.pzIr !== undefined) ir(+b.dataset.pzIr);
        else if (b.dataset.pz === 'prev') ant();
        else if (b.dataset.pz === 'next') sig();
        else if (b.dataset.pz === 'auto') alternarAuto();
        else if (b.dataset.pz === 'pantalla') pantallaCompleta();
      });

      // clic en la diapositiva (con mouse) avanza; recordar la diapositiva al ir a la demo en vivo
      const esc = raiz.querySelector('.pz-escenario');
      esc.addEventListener('pointerdown', e => { ultimoPuntero = e.pointerType || 'mouse'; });
      esc.addEventListener('click', e => {
        const a = e.target.closest('a');
        if (a) { try { sessionStorage.setItem(CLAVE_VUELTA, String(idx)); } catch (er) { } return; }
        if (e.target.closest('button, input, .pz-ctrl')) return;
        if (ultimoPuntero !== 'mouse') return;
        if (getSelection && String(getSelection())) return;
        (e.clientX < innerWidth * .22) ? ant() : sig();
      });

      // deslizar en celular
      let x0 = null, y0 = null;
      esc.addEventListener('touchstart', e => { const t = e.changedTouches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
      esc.addEventListener('touchend', e => {
        if (x0 === null) return;
        const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? sig : ant)();
      }, { passive: true });

      // teclado
      escuchar(document, 'keydown', e => {
        if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
        const k = e.key;
        if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'ArrowDown') { e.preventDefault(); sig(); }
        else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp') { e.preventDefault(); ant(); }
        else if (k === 'Home') { e.preventDefault(); ir(0); }
        else if (k === 'End') { e.preventDefault(); ir(N - 1); }
        else if (k === 'f' || k === 'F') { e.preventDefault(); pantallaCompleta(); }
        else if (k === 'a' || k === 'A') { e.preventDefault(); alternarAuto(); }
      });

      let rt = null;
      escuchar(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(medir, 120); });
      escuchar(document, 'fullscreenchange', alCambiarPantalla);
      escuchar(document, 'webkitfullscreenchange', alCambiarPantalla);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (raiz) rutaViaje(); });

      ir(inicio);
      raiz.focus({ preventScroll: true });
    },
    salir() {
      limpiarDia();
      clearTimeout(autoT); autoT = null; auto = false;
      global.forEach(f => { try { f(); } catch (e) { } }); global = [];
      if (enPantalla() && raiz && raiz.contains(enPantalla())) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { } }
      raiz = null; secciones = [];
    }
  };
})();
