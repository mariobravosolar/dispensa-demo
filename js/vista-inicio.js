/* ============================================================
   Dispensa — vista «inicio»: página comercial para DUEÑOS de dispensarios.
   Prefijo de clases: .in-   (estilos en css/v-inicio.css)
   ============================================================ */
(function () {
  const D = window.DEMO;
  const ico = (n, c) => (D.ico ? D.ico(n, c) : `<svg class="ico ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`);
  let limpiezas = [];
  const alSalir = f => limpiezas.push(f);

  /* ---------- piezas SVG ilustradas (línea, colores por variable) ---------- */
  const svgHongo = (c) => `<svg class="in-deco ${c || ''}" viewBox="0 0 60 72" aria-hidden="true"><path class="in-d-sombrero" d="M6 34C6 18 17 8 30 8s24 10 24 26Z"/><path class="in-d-pie" d="M24 34c-1 12-3 22-6 34h24c-3-12-5-22-6-34"/><circle cx="21" cy="21" r="3"/><circle cx="36" cy="17" r="2.6"/><circle cx="44" cy="27" r="2"/><circle cx="28" cy="28" r="1.6"/></svg>`;
  const svgFlor = (c) => `<svg class="in-deco ${c || ''}" viewBox="0 0 60 120" aria-hidden="true"><path class="in-d-tallo" d="M30 118C30 90 26 70 30 44"/><path class="in-d-tallo" d="M29 92c-10-4-16-12-18-22 10 2 16 9 18 22ZM30 76c9-3 15-10 17-19-9 1-15 8-17 19Z"/><g class="in-d-petalo"><ellipse cx="30" cy="22" rx="6" ry="13"/><ellipse cx="30" cy="22" rx="6" ry="13" transform="rotate(60 30 34)"/><ellipse cx="30" cy="22" rx="6" ry="13" transform="rotate(120 30 34)"/><ellipse cx="30" cy="22" rx="6" ry="13" transform="rotate(180 30 34)"/><ellipse cx="30" cy="22" rx="6" ry="13" transform="rotate(240 30 34)"/><ellipse cx="30" cy="22" rx="6" ry="13" transform="rotate(300 30 34)"/></g><circle class="in-d-centro" cx="30" cy="34" r="5"/></svg>`;
  const svgHoja = (c) => `<svg class="in-deco ${c || ''}" viewBox="0 0 80 120" aria-hidden="true"><path class="in-d-tallo" d="M40 118V40"/><path class="in-d-hoja" d="M40 60C28 50 20 34 22 14c12 10 18 26 18 46ZM40 60c12-10 20-26 18-46-12 10-18 26-18 46ZM40 74C26 70 12 60 6 44c16 2 28 12 34 30ZM40 74c14-4 28-14 34-30-16 2-28 12-34 30ZM40 84c-12 2-24-2-32-10 12-3 24 0 32 10ZM40 84c12 2 24-2 32-10-12-3-24 0-32 10Z"/></svg>`;

  function mockHeroe() {
    const s = D.state;
    const max = Math.max(...s.ventasSemana.map(v => v.clp));
    const barras = s.ventasSemana.map((v, i) => `<i style="--h:${Math.round(v.clp / max * 100)}%;--i:${i}"><em>${v.d}</em></i>`).join('');
    const modo = document.documentElement.getAttribute('data-modo');
    const seg = ['claro', 'oscuro', 'verde'].map(m => `<button type="button" data-in-modo="${m}" aria-pressed="${m === modo}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('');
    const kpi = (i, n, t, d, c) => `<div class="in-lk ${c || ''}">${ico(i)}<b class="num">${n}</b><small>${t}</small><em>${d}</em></div>`;
    const act = [['usuario', 'María R. realizó un canje', 'hace 12 min'], ['socios', 'Nueva postulación de socio', 'hace 28 min'], ['receta', 'Receta cargada por el Dr. Soto', 'hace 1 hora'], ['membresia', 'Pago de membresía confirmado', 'hace 2 horas']];
    const dm = D.diasMembresia();
    const gm = D.gramosMes(), lim = s.socio.receta.limite, pct = Math.round(gm / lim * 100);
    return `
    <div class="in-mock" aria-label="Vista previa del panel del dueño y la app del socio">
      <div class="in-seg" role="group" aria-label="Probar modo de color"><small>Pruébalo:</small>${seg}</div>
      <div class="in-lap">
        <div class="in-lap-pant">
          <aside class="in-lap-lado">
            <b>${ico('logo')}Dispensa</b>
            <span class="on">${ico('inicio')}Resumen</span><span>${ico('socios')}Socios</span><span>${ico('receta')}Recetas</span><span>${ico('membresia')}Membresías</span><span>${ico('carrito')}Ventas</span><span>${ico('token')}Tokens</span><span>${ico('inventario')}Inventario</span><span>${ico('fiscalizacion')}Fiscalización</span>
          </aside>
          <div class="in-lap-main">
            <div class="in-lap-tit"><span class="in-lap-flor">${ico('flor')}</span><div><b>${s.dispensario.nombre}</b><small>Club de cannabis medicinal</small></div><em>Plantas · Personas · Territorio</em></div>
            <div class="in-lap-kpis">
              ${kpi('socios', '536', 'Socios activos', '↗ +12%', 'ok')}
              ${kpi('carrito', '248', 'Canjes hoy', '↗ +8%', 'ok')}
              ${kpi('receta', '18', 'Recetas por vencer', '↘ −26%', 'alerta')}
              ${kpi('membresia', '32', 'Membresías por vencer', '↘ −14%', 'aviso')}
            </div>
            <div class="in-lap-fila">
              <div class="in-lap-graf"><div class="in-lap-gcab"><b>Ventas de la semana</b><span class="chip ok sin-punto">+32%</span></div><div class="in-v-barras">${barras}</div></div>
              <div class="in-lap-act"><div class="in-lap-gcab"><b>Actividad reciente</b><small>Ver todas →</small></div>${act.map(a => `<p>${ico(a[0])}<span>${a[1]}</span><small>${a[2]}</small></p>`).join('')}</div>
            </div>
          </div>
        </div>
        <div class="in-lap-base"></div>
      </div>
      <div class="in-tel in-tel-1">
        <div class="in-tel-pant">
          <div class="in-tel-top"><span>9:41</span><span class="in-isla"></span><span>●●</span></div>
          <div class="in-tel-marca">${ico('logo')}Dispensa<span class="in-campana">${ico('campana')}<i>2</i></span></div>
          <p class="in-tel-hola">Hola, ${s.socio.primer}<small>Qué bueno tenerte aquí ✦</small></p>
          <div class="in-tt in-tt-tok"><span class="moneda">T</span><span><b class="num">${s.socio.tokens} tokens</b><small>Tu saldo disponible</small></span>${ico('flecha')}</div>
          <div class="in-tt in-tt-mem"><span class="in-anillo" style="--p:${Math.round(dm / 365 * 100)}"><b class="num">${dm}</b><small>días</small></span><span><b>Tu membresía está activa</b><small>Un acceso más consciente, todos los días.</small></span></div>
          <div class="in-tt">${ico('receta')}<span><b>Receta vigente</b><small>Hasta el ${D.fmt.fechaCorta(s.socio.receta.hasta)}</small></span>${ico('flecha')}</div>
          <div class="in-tt in-tt-gram">${ico('hoja')}<span><b>Gramaje del mes</b><small><b class="num">${D.fmt.g(gm).replace(' g', '')}</b> de ${lim} g</small><i class="in-barrita"><i style="width:${pct}%"></i></i></span><em class="num">${pct}%</em></div>
          <div class="in-tel-tab"><span class="on">${ico('inicio')}Inicio</span><span>${ico('tienda')}Tienda</span><span>${ico('receta')}Recetas</span><span>${ico('usuario')}Perfil</span></div>
        </div>
      </div>
      <div class="in-tel in-tel-2">
        <div class="in-tel-pant in-tel-pausa">
          <div class="in-tel-top"><span>9:41</span><span class="in-isla"></span><span>●●</span></div>
          <div class="in-tel-marca">${ico('logo')}Dispensa<span class="in-lunita">${ico('luna')}</span></div>
          <div class="in-candado">${ico('candado')}</div>
          <p class="in-pausa-tit">Carrito pausado automáticamente</p>
          <p class="in-pausa-txt">Tu receta venció hoy. El carrito queda en pausa; tu membresía sigue activa.</p>
          <div class="in-tt-chip">${ico('check')} Membresía activa</div>
          <span class="in-pausa-btn">${ico('descarga')} Subir receta nueva</span>
          <div class="in-tel-tab"><span class="on">${ico('inicio')}Inicio</span><span>${ico('tienda')}Tienda</span><span>${ico('receta')}Recetas</span><span>${ico('usuario')}Perfil</span></div>
        </div>
      </div>
      <div class="in-fisc-card">
        ${ico('escudo', 'in-fisc-escudo')}
        <div><b>Modo fiscalización</b>
          <ul>${['Datos completos', 'Entregas firmadas', 'Historial exportable', 'Sin inconsistencias'].map((t, i) => `<li style="--i:${i}">${ico('check')}${t}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
  }

  /* ---------- secciones ---------- */
  function heroe() {
    return `
    <section class="in-heroe">
      <div class="in-arte" aria-hidden="true"></div>
      <div class="contenedor in-heroe-grid">
        <div class="in-heroe-txt">
          <p class="eyebrow in-versal anim-abajo">Software para dispensarios medicinales</p>
          <h1 class="in-h1 in-h1-heroe anim-abajo" style="animation-delay:.08s">La aplicación para <span class="in-grad">dispensarios de cannabis</span></h1>
          <p class="in-lead anim-abajo" style="animation-delay:.16s">Admisión, recetas, gramaje, tokens, membresías y fiscalización en un solo sistema. Menos WhatsApp y Excel. Más control y más ventas.</p>
          <div class="in-ctas anim-abajo" style="animation-delay:.24s">
            <a class="btn in-btn-verde in-btn-xl" href="#presentacion">Ver la demo en vivo ${ico('flecha')}</a>
            <a class="btn btn-fantasma in-btn-xl" href="#club">Ver el sitio del club</a>
          </div>
          <p class="in-mano in-mano-1">menos enredo,<br>más control ♡</p>
          <div class="in-heroe-bosque" aria-hidden="true">
            <img class="in-zorro-img in-zorro-heroe" src="img/arte/zorro.png" alt="" width="720" height="900">
            <p class="in-mano in-mano-2">La salud<br>también<br>florece ♡</p>
          </div>
        </div>
        <div class="in-heroe-mock anim-der" style="animation-delay:.1s">
          <p class="in-mano in-mano-3">Tecnología<br>que cuida ♡</p>
          ${mockHeroe()}
        </div>
      </div>
      <div class="contenedor">
        <ul class="in-valores">
          <li data-entra="abajo" style="--d:0s">${ico('documento')}<span>Admisión online<small>Postulación + adjuntos</small></span></li>
          <li data-entra="abajo" style="--d:.08s">${ico('receta')}<span>Receta inteligente<small>Pausa automática si vence</small></span></li>
          <li data-entra="abajo" style="--d:.16s">${ico('token')}<span>Tokens y canjes<small>Compra bolsas y canjea productos</small></span></li>
          <li data-entra="abajo" style="--d:.24s">${ico('firma')}<span>Firma digital<small>Recepción desde la app o el local</small></span></li>
        </ul>
      </div>
    </section>`;
  }

  function antesDespues() {
    const t = [
      { i: 'whatsapp', a: ['«¿Me quedan gramos este mes?»', '47 chats sin leer'], b: ['El socio ve su saldo', 'y su gramaje en la app'] },
      { i: 'excel', a: ['socios_FINAL_v7.xlsx', '¿cuál era la buena?'], b: ['Un solo padrón', 'siempre al día'] },
      { i: 'receta', a: ['«¿Cuándo te vence la receta?»', 'nadie sabe'], b: ['Avisos solos a 30, 15 y 7 días', 'y pausa si vence'] },
      { i: 'billetera', a: ['«Te transferí ayer, ¿llegó?»', 'cobros a mano'], b: ['Tokens pagados por adelantado', 'y cobro de membresía automático'] }
    ];
    const tarjetas = t.map((x, k) => `
      <div class="in-ad-t" style="--k:${k}">
        <div class="in-ad-cara in-ad-caos">${ico(x.i)}<p><b>${x.a[0]}</b><small>${x.a[1]}</small></p></div>
        <div class="in-ad-cara in-ad-orden">${ico('check', 'in-ad-ok')}<p><b>${x.b[0]}</b><small>${x.b[1]}</small></p></div>
      </div>`).join('');
    return `
    <section class="seccion in-ad" id="in-ad">
      <div class="contenedor">
        <div class="in-cabeza">
          <p class="eyebrow">Antes / con Dispensa</p>
          <h2 class="in-h2"><span class="in-ad-antes">Así se ve un martes <em>sin sistema.</em></span><span class="in-ad-con">Así se ve con <em>Dispensa.</em></span></h2>
        </div>
        <div class="in-ad-tablero">${tarjetas}</div>
        <div class="in-ad-pie">
          <button type="button" class="btn btn-fantasma" id="in-ad-toggle">${ico('actualizar')} <span>Ver el antes</span></button>
          <p class="in-mano">sí, esto se ordena solo</p>
        </div>
      </div>
    </section>`;
  }

  const pasos = [
    { i: 'documento', t: 'Postula online', d: 'Formulario con cédula, antecedentes y receta.', x: `<span class="chip ok">3 adjuntos</span>` },
    { i: 'socios', t: 'Llega al comité', d: 'Lo revisas en tu panel, sin papeles.', x: `<span class="chip lila">Nueva solicitud</span>` },
    { i: 'check', t: 'Apruebas en 1 clic', d: 'Se crea la cuenta y se traspasa la receta.', x: `<span class="in-mini-btn">${ico('check')} Aprobar socio</span>` },
    { i: 'correo', t: 'Bienvenida automática', d: 'Correo con tu marca y billetera creada.', x: `<span class="chip ok">Correo enviado</span>` },
    { i: 'membresia', t: 'Paga su membresía', d: 'Y el año empieza a correr solo.', x: `<span class="chip ok">Activa · 365 días</span>` },
    { i: 'receta', t: 'Receta con gramaje', d: 'Si vence, el carrito se pausa. Nadie persigue a nadie.', x: `<span class="chip ok">Vigente</span><span class="chip alerta">Pausa si vence</span>` },
    { i: 'token', t: 'Compra tokens y canjea', d: 'Paga por adelantado y canjea cuando quiera.', x: `<span class="in-mini-token"><span class="moneda">T</span> 320 tokens</span>` },
    { i: 'firma', t: 'Recibe y firma', d: 'Firma con el dedo. Queda en el historial.', x: `<svg class="in-firma-mini" viewBox="0 0 120 36" aria-hidden="true"><path d="M4 26c10 0 12-18 20-18s2 16 10 16 8-10 14-10 4 8 12 8 10-12 18-12 6 12 16 12 12-6 20-6"/></svg>` }
  ];

  function viaje() {
    const lista = pasos.map((p, k) => `
      <li class="in-paso ${k % 2 ? 'der' : 'izq'}" data-entra="${k % 2 ? 'der' : 'izq'}" data-paso="${k}">
        <div class="in-paso-t">
          <span class="in-paso-n">${k + 1}</span>
          <span class="in-paso-ico">${ico(p.i)}</span>
          <div><h3>${p.t}</h3><p>${p.d}</p><div class="in-paso-x">${p.x}</div></div>
        </div>
      </li>`).join('');
    return `
    <section class="seccion in-viaje" id="in-viaje">
      <div class="contenedor">
        <div class="in-cabeza centro">
          <p class="eyebrow">Cómo funciona</p>
          <img class="in-zorro-img in-zorro-viaje" src="img/arte/zorro.png" alt="" width="720" height="900" loading="lazy">
          <h2 class="in-h2">De la postulación a la <em>entrega firmada.</em></h2>
          <p class="in-sub">Ocho pasos conectados. Tú solo apruebas.</p>
        </div>
        <div class="in-pista">
          <svg class="in-pista-svg" aria-hidden="true"><path class="in-pista-base"/><path class="in-pista-trazo"/><g class="in-paquete"><circle r="15"/><text text-anchor="middle" dy="5">T</text></g></svg>
          <ol class="in-pasos">${lista}</ol>
        </div>
        <p class="in-mano centro">todo fluye, y tú ni te enteras</p>
      </div>
    </section>`;
  }

  function modulos() {
    const s = D.state;
    const m = [
      { i: 'documento', t: 'Admisión online', d: 'Postulación, entrevista y adjuntos.', x: `<span class="in-pill">${ico('cedula')}Cédula</span><span class="in-pill">${ico('adjunto')}Antecedentes</span><span class="in-pill">${ico('receta')}Receta</span>` },
      { i: 'receta', t: 'Receta inteligente', d: 'Vigencia y reglas automáticas.', x: `<span class="in-pill alerta">${ico('reloj')}Pausa del carrito si vence</span>`, c: 'rojo' },
      { i: 'gramaje', t: 'Gramaje diario', d: 'Consumo, saldo y picos del mes.', x: `<span class="in-pill">Mes <b class="num">${D.fmt.g(D.gramosMes())}</b></span><span class="in-pill ok">Disponible <b class="num">${D.fmt.g(D.gramosDisponibles())}</b></span>` },
      { i: 'token', t: 'Tokens y canje', d: 'Bolsas de tokens y canje de productos.', x: `<span class="in-pill token"><span class="moneda">T</span><b class="num">320</b> tokens ${ico('flecha')}</span>`, c: 'oro' },
      { i: 'membresia', t: 'Membresía anual', d: 'Pago, vigencia y renovación.', x: `<span class="in-pill">${ico('calendario')}Aviso antes de vencer</span>` },
      { i: 'campana', t: 'Comunicados y campanita', d: 'Mensajes a quien corresponde.', x: `<span class="in-pill">${ico('usuario')}Llegó tu renovación <small>hace 2 h</small></span>` }
    ];
    const hasta = s.socio.receta.hasta;
    const diasTotal = D.diasEntre(s.hoy, hasta);
    return `
    <section class="seccion in-mod" id="in-mod">
      <div class="contenedor">
        <div class="in-cabeza">
          <p class="eyebrow">Módulos</p>
          <h2 class="in-h2">Módulos que <em>ordenan</em> tu operación.</h2>
          <p class="in-sub">Todo conectado: admisión, receta, gramaje, tokens, membresía y comunicación.</p>
          <p class="in-mano in-mano-der">para clubes y dispensarios ♡</p>
        </div>
        <div class="in-mod-grid">
          ${m.map((x, k) => `<article class="in-mod-t ${x.c || ''}" data-entra="${k % 3 === 0 ? 'izq' : k % 3 === 2 ? 'der' : 'abajo'}" style="--d:${(k % 3) * .08}s">
            <div class="in-mod-cab">${ico(x.i, 'in-mod-ico')}<div><h3>${x.t}</h3><p>${x.d}</p></div></div>
            <div class="in-mod-x">${x.x}</div>
          </article>`).join('')}
        </div>

        <div class="in-receta" data-entra="abajo">
          <div class="in-receta-txt">
            <p class="eyebrow">Receta inteligente · pruébalo</p>
            <h3 class="in-h3">Si vence, el carrito <em>se pausa solo.</em></h3>
            <p class="in-sub">La membresía sigue activa hasta que suban la receta nueva.</p>
          </div>
          <div class="in-receta-juego">
            <div class="in-cal">
              <div class="in-cal-hoja"><small id="in-cal-mes">oct</small><b id="in-cal-dia" class="num">14</b><small id="in-cal-anio">2026</small></div>
              <div class="in-cal-ctrl">
                <label for="in-cal-rango">${ico('calendario')} Mueve el calendario</label>
                <div class="in-rango-caja">
                  <input type="range" id="in-cal-rango" min="0" max="${diasTotal + 21}" value="0" step="1" style="--vence:${(diasTotal / (diasTotal + 21) * 100).toFixed(2)}%">
                  <span class="in-rango-vence" style="left:${(diasTotal / (diasTotal + 21) * 100).toFixed(2)}%">vence ${D.fmt.fechaCorta(hasta)}</span>
                </div>
                <p class="in-aviso-auto" id="in-aviso-auto">${ico('correo')}<span>Sin avisos pendientes</span></p>
              </div>
            </div>
            <div class="in-flujo">
              <span class="in-est ok" id="in-est-receta">${ico('check')}<span>Receta vigente</span></span>
              ${ico('flecha', 'in-flujo-fl')}
              <span class="in-est" id="in-est-carrito">${ico('carrito')}<span>Carrito activo</span></span>
              <span class="in-est ok in-est-mem" id="in-est-mem">${ico('usuario')}<span>Membresía activa</span></span>
            </div>
            <button type="button" class="btn btn-primario btn-sm in-subir" id="in-subir" hidden>${ico('receta')} Simular: sube la receta nueva</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  function gramaje() {
    const s = D.state;
    const c = s.socio.consumoDiario;
    const lim = s.socio.receta.limite;
    const total = D.gramosMes();
    let maxI = 0; c.forEach((g, i) => { if (g > c[maxI]) maxI = i; });
    const tope = Math.max(6, ...c);
    let barras = '';
    for (let d = 1; d <= 31; d++) {
      const g = c[d - 1];
      const fut = d > c.length;
      barras += `<span class="in-gb ${fut ? 'fut' : ''} ${!fut && d - 1 === maxI && g > 0 ? 'pico' : ''}" style="--h:${fut ? 6 : Math.max(2, (g || 0) / tope * 100)}%;--i:${d}" title="${d} oct: ${fut ? 'aún no llega' : D.fmt.g(g || 0)}">${d % 5 === 0 || d === 1 ? `<em>${d}</em>` : ''}</span>`;
    }
    return `
    <section class="seccion in-gram" id="in-gram">
      <div class="contenedor in-gram-grid">
        <div class="in-gram-txt" data-entra="izq">
          <p class="eyebrow">Gramaje diario</p>
          <h2 class="in-h2">Cada gramo, <em>en su lugar.</em></h2>
          <p class="in-sub">El sistema suma lo que canjea cada socio y frena el carrito si se pasa del cupo de su receta.</p>
          <p class="in-mano">las matemáticas las hace el sistema, tú no</p>
        </div>
        <div class="in-gram-panel" data-entra="der">
          <div class="in-gram-cab"><b>${s.socio.nombre}</b><span class="chip ok">Receta ${lim} g/mes</span></div>
          <div class="in-gram-barras" id="in-gram-barras">${barras}</div>
          <div class="in-gram-stats">
            <div><small>Total del mes</small><b class="num" data-in-num="${total}" data-in-fmt="g">0 g</b></div>
            <div><small>Día de mayor consumo</small><b class="num">${c[maxI] > 0 ? D.fmt.g(c[maxI]) : '—'}</b><small>${c[maxI] > 0 ? `el ${maxI + 1} de octubre` : ''}</small></div>
            <div class="ok"><small>Disponible</small><b class="num" data-in-num="${D.gramosDisponibles()}" data-in-fmt="g">0 g</b></div>
          </div>
          <div class="progreso in-gram-prog"><i style="width:0" data-in-ancho="${Math.min(100, total / lim * 100).toFixed(1)}%"></i></div>
          <p class="in-gram-nota dim">${D.fmt.g(total)} usados de ${lim} g autorizados en octubre</p>
        </div>
      </div>
    </section>`;
  }

  function cumplimiento() {
    const checks = ['Datos del socio completos', 'Recetas vigentes al día', 'Gramaje dentro del cupo', 'Entregas firmadas', 'Historial exportable'];
    return `
    <section class="seccion in-cum" id="in-cum">
      <div class="contenedor">
        <div class="in-cum-grid">
          <div class="in-cum-txt" data-entra="izq">
            <h2 class="in-h2">Todo en regla, <em>todo en orden.</em></h2>
            <p class="in-sub">Si mañana llega una fiscalización, abres el panel y listo.</p>
          </div>
          <div class="in-cum-cards">
            <article class="in-cum-c" data-entra="der" style="--d:0s">${ico('ley', 'in-cum-ico')}<div><h3>Ley 21.719 · Chile</h3><p>Protección de datos: pide solo lo necesario, registra quién aprueba y quién mueve saldo.</p></div></article>
            <article class="in-cum-c" data-entra="der" style="--d:.1s">${ico('mundo', 'in-cum-ico')}<div><h3>REPROCANN · Argentina</h3><p>Receta, cupo y entregas ordenados para el registro.</p></div></article>
            <article class="in-cum-c in-fisc" data-entra="der" style="--d:.2s">
              <div class="in-fisc-cab">${ico('escudo', 'in-cum-ico')}<h3>Modo fiscalización</h3></div>
              <ul class="in-fisc-lista" id="in-fisc">${checks.map((t, i) => `<li style="--i:${i}"><span class="in-caja">${ico('check')}</span>${t}</li>`).join('')}</ul>
              <button type="button" class="btn btn-fantasma btn-sm" id="in-exportar">${ico('descarga')} Historial exportable</button>
            </article>
          </div>
        </div>
      </div>
    </section>`;
  }

  function ganancias() {
    const g = [
      { i: 'rayo', t: 'Vendes más', d: 'Tus socios canjean solos, a cualquier hora, con tokens pagados por adelantado.', c: 'naranja' },
      { i: 'reloj', t: 'Ahorras horas', d: 'Fuera WhatsApp, Excel y perseguir recetas. Aprobar un socio es un clic.', c: 'salvia' },
      { i: 'escudo', t: 'Estás en regla', d: 'Receta y gramaje controlados por el sistema. Historial listo.', c: 'malva' },
      { i: 'estrella', t: 'Te ves increíble', d: 'Tu marca, una app que parece app y tres modos de color.', c: 'mostaza' }
    ];
    return `
    <section class="seccion in-gan">
      <div class="contenedor">
        <div class="in-cabeza centro">
          <p class="eyebrow">Lo que ganas</p>
          <h2 class="in-h2">Tu dispensario, <em>en otra liga.</em></h2>
        </div>
        <div class="in-gan-grid">
          ${g.map((x, k) => `<article class="in-gan-t ${x.c}" data-entra="${k % 2 ? 'der' : 'izq'}" style="--d:${k * .08}s"><span class="in-gan-ico">${ico(x.i)}</span><h3>${x.t}</h3><p>${x.d}</p></article>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function celular() {
    const s = D.state;
    const sol = s.solicitudes[0];
    const ev = s.eventos.slice(0, 3);
    return `
    <section class="seccion in-cel-sec">
      <div class="contenedor in-cel-grid">
        <div class="in-cel-txt" data-entra="izq">
          <p class="eyebrow">Todo en tu celular</p>
          <h2 class="in-h2">Tu dispensario <em>en el bolsillo.</em></h2>
          <ul class="in-lista-grande">
            <li>${ico('check')} Apruebas socios desde donde estés</li>
            <li>${ico('check')} Ves quién canjea, en vivo</li>
            <li>${ico('check')} Envías un comunicado en segundos</li>
            <li>${ico('check')} Atiendes en el mesón sin planillas</li>
          </ul>
          <p class="in-mano">sí, también desde la playa</p>
        </div>
        <div class="in-cel-mock" data-entra="der">
          <div class="in-cel in-cel-grande">
            <div class="in-cel-pant">
              <div class="in-cel-top"><span>9:41</span><span class="in-isla"></span></div>
              <div class="in-ap-cab"><small>Panel</small><b>${s.dispensario.nombre}</b></div>
              <div class="in-ap-kpis"><div><b class="num">148</b><small>socios</small></div><div><b class="num aviso">14</b><small>recetas por vencer</small></div><div><b class="num ok">23</b><small>canjes hoy</small></div></div>
              <div class="in-ap-sol" id="in-ap-sol">
                <small class="dim">Nueva solicitud · ${sol.hace}</small>
                <b>${sol.nombre}</b><span>${sol.motivo} · ${sol.receta}</span>
                <button type="button" class="in-ap-aprobar" id="in-ap-aprobar">${ico('check')} Aprobar socio</button>
              </div>
              <div class="in-ap-ev">${ev.map(e => `<p><span class="mono">${e.t}</span>${e.txt}</p>`).join('')}</div>
              <div class="in-cel-tab"><i class="on"></i><i></i><i></i><i></i></div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  function final() {
    return `
    <section class="seccion in-final">
      ${svgHongo('in-hongo-c')}${svgFlor('in-flor-c')}${svgHoja('in-hoja-c')}
      <div class="contenedor centro">
        <h2 class="in-h1 in-final-tit" data-entra="abajo">¿Lo vemos <em>funcionando?</em></h2>
        <p class="in-lead" data-entra="abajo" style="--d:.08s">Te mostramos tu dispensario con tu marca, en vivo.</p>
        <div class="in-ctas centro" data-entra="abajo" style="--d:.16s">
          <a class="btn btn-arcoiris in-btn-xl" href="#presentacion">${ico('play')} Ver la demo en vivo</a>
          <a class="btn btn-fantasma in-btn-xl" href="#panel">Ver el panel del dueño ${ico('flecha')}</a>
        </div>
      </div>
    </section>
    <footer class="in-pie">
      <div class="contenedor in-pie-fila">
        <span class="in-pie-marca">${ico('logo')} Dispensa</span>
        <span class="chip sin-punto">Chile + Argentina</span>
        <span class="in-mano">ningún Excel fue maltratado en esta demo ♡</span>
      </div>
    </footer>`;
  }

  /* ---------- comportamiento ---------- */
  function entradas(raiz) {
    const els = raiz.querySelectorAll('[data-entra]');
    if (D.fx.reducido || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(ent => ent.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove('in-fuera'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .92) { el.classList.add('in-fuera'); io.observe(el); } });
    alSalir(() => io.disconnect());
  }

  function alVer(el, fn, umbral) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(ent => ent.forEach(e => { if (e.isIntersecting) { fn(); io.disconnect(); } }), { threshold: umbral || .35 });
    io.observe(el);
    alSalir(() => io.disconnect());
  }

  function montarModos(raiz) {
    const sync = () => {
      const m = document.documentElement.getAttribute('data-modo');
      raiz.querySelectorAll('[data-in-modo]').forEach(b => b.setAttribute('aria-pressed', b.dataset.inModo === m));
    };
    raiz.querySelectorAll('[data-in-modo]').forEach(b => b.addEventListener('click', () => {
      const real = document.querySelector(`.modos button[data-modo="${b.dataset.inModo}"]`);
      if (real) real.click(); else document.documentElement.setAttribute('data-modo', b.dataset.inModo);
      sync();
    }));
    D.on('modo', sync); alSalir(() => D.off('modo', sync));
  }

  function montarAntesDespues(raiz) {
    const sec = raiz.querySelector('#in-ad');
    const btn = raiz.querySelector('#in-ad-toggle');
    const poner = orden => {
      sec.classList.toggle('ordenado', orden);
      btn.querySelector('span').textContent = orden ? 'Ver el antes' : 'Ordenar con Dispensa';
    };
    btn.addEventListener('click', () => poner(!sec.classList.contains('ordenado')));
    if (D.fx.reducido) { poner(true); return; }
    poner(false);
    alVer(sec.querySelector('.in-ad-tablero'), () => setTimeout(() => poner(true), 650), .55);
  }

  function montarViaje(raiz) {
    const pista = raiz.querySelector('.in-pista');
    const svg = pista.querySelector('svg');
    const base = svg.querySelector('.in-pista-base');
    const trazo = svg.querySelector('.in-pista-trazo');
    const paq = svg.querySelector('.in-paquete');
    const itemsPaso = [...pista.querySelectorAll('.in-paso')];
    let largo = 0, centros = [];

    function geometria() {
      const w = svg.clientWidth, h = pista.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const cx = w / 2, amp = Math.min(46, w * .22);
      const n = 16; let d = `M ${cx} 0`;
      for (let k = 1; k <= n; k++) {
        const y0 = (k - 1) / n * h, y1 = k / n * h, dir = k % 2 ? 1 : -1;
        d += ` C ${cx + amp * dir} ${y0 + (y1 - y0) * .33}, ${cx + amp * dir} ${y0 + (y1 - y0) * .66}, ${cx} ${y1}`;
      }
      base.setAttribute('d', d); trazo.setAttribute('d', d);
      largo = trazo.getTotalLength();
      trazo.style.strokeDasharray = largo;
      const r0 = pista.getBoundingClientRect().top;
      centros = itemsPaso.map(li => { const r = li.getBoundingClientRect(); return (r.top - r0 + r.height / 2) / h; });
    }

    function pintar() {
      const r = pista.getBoundingClientRect();
      let p = (innerHeight * .55 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (D.fx.reducido) p = 1;
      trazo.style.strokeDashoffset = largo * (1 - p);
      const pt = trazo.getPointAtLength(largo * p);
      paq.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      paq.style.opacity = p > 0.001 && p < .999 ? 1 : .0;
      itemsPaso.forEach((li, k) => li.classList.toggle('activo', p >= centros[k] - .02));
    }

    let pend = false;
    const onScroll = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; pintar(); }); };
    const onResize = () => { geometria(); pintar(); };
    requestAnimationFrame(onResize);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onResize);
    // las fuentes cambian las alturas: recalcular cuando carguen
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (svg.isConnected) onResize(); });
    const t = setTimeout(onResize, 900);
    alSalir(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); clearTimeout(t); });
  }

  function montarReceta(raiz) {
    const s = D.state;
    const rango = raiz.querySelector('#in-cal-rango');
    const dia = raiz.querySelector('#in-cal-dia'), mes = raiz.querySelector('#in-cal-mes'), anio = raiz.querySelector('#in-cal-anio');
    const eRec = raiz.querySelector('#in-est-receta'), eCar = raiz.querySelector('#in-est-carrito'), eMem = raiz.querySelector('#in-est-mem');
    const aviso = raiz.querySelector('#in-aviso-auto');
    const subir = raiz.querySelector('#in-subir');
    const caja = raiz.querySelector('.in-receta');
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    let hasta = s.socio.receta.hasta;
    let pausado = null;

    const est = (el, clase, icono, txt) => { el.className = 'in-est ' + clase + (el === eMem ? ' in-est-mem' : ''); el.innerHTML = ico(icono) + `<span>${txt}</span>`; };

    function pintar() {
      const f = D.masDias(s.hoy, +rango.value);
      const [y, m, d] = f.split('-');
      dia.textContent = +d; mes.textContent = meses[m - 1]; anio.textContent = y;
      const quedan = D.diasEntre(f, hasta);
      const vig = f <= hasta;
      if (!vig) est(eRec, 'alerta', 'reloj', `Venció el ${D.fmt.fechaCorta(hasta)}`);
      else if (quedan === 0) est(eRec, 'aviso', 'reloj', 'Vence hoy · último día');
      else if (quedan <= 15) est(eRec, 'aviso', 'reloj', `Por vencer · ${quedan} días`);
      else est(eRec, 'ok', 'check', `Receta vigente · ${quedan} días`);
      if (vig) est(eCar, 'ok', 'carrito', 'Carrito activo');
      else est(eCar, 'alerta in-pausado', 'candado', 'Carrito pausado automáticamente');
      const dm = D.diasEntre(f, s.socio.memFin);
      est(eMem, 'ok', 'usuario', `Membresía activa · ${dm} días`);
      // avisos automáticos a 30/15/7/0/−1 días (los mismos del sistema real)
      const hitos = [30, 15, 7, 0, -1];
      const ult = hitos.filter(h => quedan <= h).pop();
      aviso.innerHTML = ico('correo') + `<span>${ult === undefined ? 'Sin avisos pendientes' : ult === -1 ? 'Aviso enviado: «tu receta venció, tu carrito está en pausa»' : ult === 0 ? 'Aviso enviado: «tu receta vence hoy»' : `Aviso enviado solo: «tu receta vence en ${ult} días»`}</span>`;
      aviso.classList.toggle('on', ult !== undefined);
      subir.hidden = vig;
      if (pausado !== null && pausado !== !vig) {
        caja.classList.remove('in-sacude'); void caja.offsetWidth;
        if (!vig) caja.classList.add('in-sacude');
      }
      pausado = !vig;
      caja.classList.toggle('pausado', !vig);
      const pct = ((D.diasEntre(s.hoy, hasta)) / +rango.max * 100);
      rango.style.setProperty('--vence', Math.min(100, pct).toFixed(2) + '%');
      rango.style.setProperty('--pos', (+rango.value / +rango.max * 100).toFixed(2) + '%');
      const et = raiz.querySelector('.in-rango-vence');
      et.style.left = Math.min(100, pct).toFixed(2) + '%';
      et.textContent = pct > 100 ? `vence ${D.fmt.fechaCorta(hasta)} →` : `vence ${D.fmt.fechaCorta(hasta)}`;
    }
    rango.addEventListener('input', pintar);
    subir.addEventListener('click', e => {
      const f = D.masDias(s.hoy, +rango.value);
      hasta = D.masDias(f, 180);
      pintar();
      const r = e.currentTarget.getBoundingClientRect();
      D.fx.confeti(r.left + r.width / 2, r.top, 60);
      D.fx.toast('Receta nueva cargada', 'El carrito se reactivó solo. Nadie tuvo que llamar a nadie.');
    });
    pintar();
  }

  function montarGramaje(raiz) {
    const panel = raiz.querySelector('.in-gram-panel');
    alVer(panel, () => {
      panel.classList.add('visto');
      panel.querySelectorAll('[data-in-num]').forEach(el => D.fx.contar(el, +el.dataset.inNum, 1200, v => D.fmt.g(v)));
      const b = panel.querySelector('[data-in-ancho]'); setTimeout(() => { b.style.width = b.dataset.inAncho; }, 200);
    }, .3);
  }

  function montarFisc(raiz) {
    const lista = raiz.querySelector('#in-fisc');
    alVer(lista, () => {
      [...lista.children].forEach((li, i) => setTimeout(() => li.classList.add('on'), D.fx.reducido ? 0 : 350 + i * 420));
    }, .5);
    raiz.querySelector('#in-exportar').addEventListener('click', () => D.fx.toast('Historial exportado', 'Socios, recetas, canjes y firmas en un archivo. (Simulado)'));
  }

  function montarCelular(raiz) {
    const btn = raiz.querySelector('#in-ap-aprobar');
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      D.fx.confeti(r.left + r.width / 2, r.top, 80);
      const caja = raiz.querySelector('#in-ap-sol');
      caja.classList.add('aprobada');
      btn.innerHTML = ico('check') + ' Aprobada · bienvenida enviada';
      btn.disabled = true;
      D.fx.toast('Socio aprobado', 'Cuenta creada, receta traspasada y correo de bienvenida enviado.');
    });
  }

  D.views.inicio = {
    titulo: 'Ordena tu dispensario',
    render(el) {
      limpiezas = [];
      el.innerHTML = `<div class="in-raiz">${heroe()}${antesDespues()}${viaje()}${modulos()}${gramaje()}${cumplimiento()}${ganancias()}${celular()}${final()}</div>`;
      const raiz = el.firstElementChild;
      montarModos(raiz);
      montarAntesDespues(raiz);
      montarViaje(raiz);
      montarReceta(raiz);
      montarGramaje(raiz);
      montarFisc(raiz);
      montarCelular(raiz);
      entradas(raiz);
    },
    salir() { limpiezas.forEach(f => { try { f(); } catch (e) { } }); limpiezas = []; }
  };
})();
