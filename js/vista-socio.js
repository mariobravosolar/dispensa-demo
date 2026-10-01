/* ============================================================
   Dispensa — vista «socio»: la APP DEL SOCIO (jardín nocturno psicodélico).
   En escritorio: marco de teléfono + panel del presentador + narrador
   «Lo que está pasando». En el celular (<720 px) la app ocupa la pantalla.
   Prefijo de clases: .so-   (estilos en css/v-socio.css)
   ============================================================ */
(function () {
  const D = window.DEMO = window.DEMO || {};
  D.views = D.views || {};
  // respaldo: store.js reemplaza window.DEMO y puede borrar el DEMO.ico de iconos.js
  if (!D.ico) D.ico = (n, c) => `<svg class="ico ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const ico = (n, c) => `<svg class="ico ${c || ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const S = () => D.state;
  const F = () => D.fmt;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reducido = () => (D.fx && D.fx.reducido) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const espera = ms => new Promise(r => setTimeout(r, reducido() ? 0 : ms));
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const MES_LARGO = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DESTINO = '2026-11-21';
  const DESPACHO = 5;

  const TABS = [
    { id: 'inicio', txt: 'Inicio', ico: 'inicio' },
    { id: 'tienda', txt: 'Tienda', ico: 'tienda' },
    { id: 'billetera', txt: 'Billetera', ico: 'billetera' },
    { id: 'receta', txt: 'Receta', ico: 'receta' },
    { id: 'perfil', txt: 'Perfil', ico: 'usuario' }
  ];
  const FILTROS = [['todos', 'Todo'], ['flores', 'Flores'], ['aceites', 'Aceites y tópicos'], ['cbd', 'CBD']];

  let raiz = null, pantalla = null, paginas = null;
  let tab = 'inicio', filtro = 'todos', entrega = 'retiro', ocupado = false, busqueda = '';
  const favoritos = new Set([3]);
  let timers = [];
  const oyentes = [];
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const escuchar = (evt, fn) => { D.on(evt, fn); oyentes.push([evt, fn]); };

  /* ============================================================
     Datos propios de la app (se siembran una vez en el estado compartido)
     ============================================================ */
  function sembrar() {
    const so = S() && S().socio;
    if (!so || so._app) return;
    so._app = 1;
    so.movs = [
      { fecha: '2026-10-12', txt: 'Canje pedido #2049', tokens: -63, medio: 'Créditos' },
      { fecha: '2026-10-09', txt: 'Canje pedido #2044', tokens: -38, medio: 'Créditos' },
      { fecha: '2026-10-05', txt: 'Bolsa 110 tokens', tokens: 110, medio: 'Webpay' },
      { fecha: '2026-10-02', txt: 'Canje pedido #2031', tokens: -24, medio: 'Créditos' },
      { fecha: '2026-09-20', txt: 'Bolsa 55 tokens', tokens: 55, medio: 'Transferencia' }
    ];
    so.recetasPrev = [
      { medico: 'Dr. Andrés Lagos', desde: '2026-01-15', hasta: '2026-07-15', limite: 25, folio: 'RX-71540' },
      { medico: 'Dr. Andrés Lagos', desde: '2025-07-10', hasta: '2026-01-10', limite: 20, folio: 'RX-60218' }
    ];
    so.comunicadosOn = true;
    if (!so.pedidos.some(p => p.estado === 'entregado' && !p.firmado)) {
      so.pedidos.unshift({ id: 2049, fecha: '2026-10-12', items: 'Aceite CBD 1500 mg · Ungüento CBD', tokens: 65, gramos: 0, estado: 'entregado', firmado: false, entrega: 'Despacho' });
    }
    D.guardar();
  }

  /* ============================================================
     Utilidades
     ============================================================ */
  const hoy = () => D.hoy();
  const fechaC = s => F().fechaCorta(s);
  const fechaL = s => F().fecha(s);
  const g = n => F().g(n);
  const noLeidas = () => S().notificaciones.filter(n => !n.leida).length;
  const itemsCarrito = () => S().carrito.reduce((a, it) => a + it.cant, 0);
  const prod = id => S().productos.find(p => p.id === +id);
  const pendienteFirma = () => S().socio.pedidos.find(p => p.estado === 'entregado' && !p.firmado);
  const dMes = iso => +iso.split('-')[2];
  const mesDe = iso => +iso.split('-')[1];
  const mesBase = () => mesDe(S().hoy); // el consumo diario corresponde al mes base de la demo
  function idxHoy() {
    const c = S().socio.consumoDiario;
    return mesDe(hoy()) === mesBase() ? dMes(hoy()) - 1 : c.length - 1;
  }
  function totales() {
    let tokens = 0, gramos = 0;
    S().carrito.forEach(it => { const p = prod(it.id); if (p) { tokens += p.tokens * it.cant; gramos += p.gramos * it.cant; } });
    const envio = entrega === 'despacho' ? DESPACHO : 0;
    return { tokens, gramos, envio, total: tokens + envio };
  }
  function enFiltro(p, f) {
    switch (f) {
      case 'flores': return /Flor|Pre-enrolado/.test(p.tipo) && !/CBD/.test(p.tipo);
      case 'aceites': return /Aceite|Tópico/.test(p.tipo);
      case 'comestibles': return /Comestible/.test(p.tipo);
      case 'extractos': return /Extracto|Tricomas/.test(p.tipo);
      case 'cbd': return /CBD/.test(p.nombre + ' ' + p.tipo);
      default: return true;
    }
  }
  function saludo() { return 'buenas noches, planta nocturna'; }

  /* ---------- piezas visuales ---------- */
  function anillo(p, tam, grosor, clase, centro) {
    const r = (tam - grosor) / 2, c = +(2 * Math.PI * r).toFixed(2);
    const off = +(c * (1 - Math.max(0, Math.min(1, p)))).toFixed(2);
    return `<div class="so-anillo ${clase || ''}" style="width:${tam}px;height:${tam}px">
      <svg viewBox="0 0 ${tam} ${tam}" aria-hidden="true">
        <circle class="so-an-fondo" cx="${tam / 2}" cy="${tam / 2}" r="${r}" stroke-width="${grosor}"/>
        <circle class="so-an-val" cx="${tam / 2}" cy="${tam / 2}" r="${r}" stroke-width="${grosor}" stroke-dasharray="${c}" stroke-dashoffset="${off}" style="--c:${c}" transform="rotate(-90 ${tam / 2} ${tam / 2})"/>
      </svg><div class="so-anillo-c">${centro}</div></div>`;
  }
  const moneda = (n, cls) => `<span class="so-tok ${cls || ''}"><span class="moneda">T</span><b class="num">${n}</b></span>`;
  const hongo = cls => `<svg class="so-ilu ${cls || ''}" viewBox="0 0 60 72" aria-hidden="true"><path class="a" d="M6 34C6 18 17 8 30 8s24 10 24 26Z"/><path class="b" d="M24 34c-1 12-3 22-6 34h24c-3-12-5-22-6-34Z"/><g class="c"><circle cx="21" cy="21" r="3"/><circle cx="36" cy="17" r="2.6"/><circle cx="44" cy="27" r="2"/><circle cx="28" cy="28" r="1.6"/></g></svg>`;
  const florcita = cls => `<svg class="so-ilu ${cls || ''}" viewBox="0 0 40 40" aria-hidden="true"><g class="p">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="20" cy="10" rx="5.5" ry="9" transform="rotate(${a} 20 20)"/>`).join('')}</g><circle class="m" cx="20" cy="20" r="5"/></svg>`;
  const hojita = cls => `<svg class="so-ilu ${cls || ''}" viewBox="0 0 80 90" aria-hidden="true"><path class="h" d="M40 84V40M40 58C28 48 22 32 24 12c12 10 16 26 16 46ZM40 58c12-10 18-26 16-46-12 10-16 26-16 46ZM40 70C26 66 14 56 8 40c16 2 26 12 32 30ZM40 70c14-4 26-14 32-30-16 2-26 12-32 30Z"/></svg>`;

  /* ============================================================
     Estructura
     ============================================================ */
  function estructura() {
    const tabs = TABS.map(t => `<button type="button" data-tab="${t.id}" aria-label="${t.txt}">${ico(t.ico)}<span>${t.txt}</span></button>`).join('');
    return `
    <section class="so-escena">
      <div class="so-fondo" aria-hidden="true">
        <span class="so-luna"></span>
        <svg class="so-montes" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax slice"><path class="m1" d="M0 220 180 120l110 70 160-130 140 120 120-80 170 140 130-90 170 110 110-60 150 90v130H0Z"/><path class="m2" d="M0 260c140-30 260-40 400-20s260 30 420 6 300-36 440-12 140 20 180 16v70H0Z"/></svg>
        ${hongo('so-f-hongo')}${florcita('so-f-flor1')}${florcita('so-f-flor2')}${hojita('so-f-hoja1')}${hojita('so-f-hoja2')}
      </div>

      <aside class="so-presentador" aria-label="Controles del presentador">
        <p class="eyebrow">App del socio · demo en vivo</p>
        <h1 class="so-h-retro">Tu dispensario <em>en el bolsillo</em></h1>
        <p class="so-mano so-mano-lg">demo interactiva: prueba cada acción</p>
        <div class="so-control" data-control>
          ${controlCalendario()}
        </div>
        <div class="so-control">
          <p class="eyebrow">Simular desde el club</p>
          <div class="so-club-btns">
            <button type="button" class="btn btn-fantasma btn-sm" data-acc="sim-comunicado">${ico('comunicado')} Enviar comunicado</button>
            <button type="button" class="btn btn-fantasma btn-sm" data-acc="sim-entrega">${ico('camion')} Entregar pedido</button>
          </div>
          <p class="so-mano">lo que hace el panel, llega a la campanita</p>
        </div>
      </aside>

      <div class="so-centro">
        <div class="telefono so-tel">
          <div class="isla"></div>
          <div class="pantalla so-pantalla">
            <div class="so-status" aria-hidden="true"><b>9:41</b><span class="so-st-ico"><i></i><i></i><i></i><i></i><em></em></span></div>
            <div class="so-paginas"></div>
            <nav class="tabbar so-tabbar" aria-label="Secciones de la app">${tabs}</nav>
          </div>
        </div>
      </div>

      <aside class="so-narrador" aria-label="Lo que está pasando">
        <h2 class="so-narr-tit">Lo que está pasando <span class="so-vivo">en vivo</span></h2>
        <p class="so-mano">cada regla que el sistema aplica, contada en voz alta</p>
        <ol class="so-narr-lista" aria-live="polite"></ol>
      </aside>
    </section>`;
  }

  function controlCalendario() {
    const base = S().hoy, h = hoy(), fin = DESTINO;
    const total = D.diasEntre(base, fin);
    const pos = x => Math.max(0, Math.min(100, D.diasEntre(base, x) / total * 100));
    const rec = S().socio.receta.hasta;
    const recEnRango = rec >= base && rec <= fin;
    const [y, m, d] = h.split('-');
    const adelantado = h !== base;
    return `
      <p class="eyebrow">Control del presentador</p>
      <h3 class="so-ctrl-tit">Adelantar calendario</h3>
      <div class="so-fecha"><b class="num" data-fecha-dia>${+d}</b><span><em data-fecha-mes>${MES_LARGO[m - 1]}</em><small class="num">${y}</small></span></div>
      <div class="so-ruta">
        <div class="so-ruta-barra"><i style="width:${pos(h)}%"></i><span class="so-ruta-punto" style="left:${pos(h)}%"></span>
          ${recEnRango ? `<span class="so-ruta-marca" style="left:${pos(rec)}%" title="Vence la receta"></span>` : ''}
        </div>
        <div class="so-ruta-txt"><span>14 oct<br><small>hoy</small></span>${recEnRango ? `<span class="so-ruta-rec" style="left:${pos(rec)}%"><small>vence receta</small> ${fechaC(rec)}</span>` : ''}<span>21 nov</span></div>
      </div>
      ${adelantado
        ? `<button type="button" class="btn btn-fantasma btn-bloque" data-acc="volver-hoy">${ico('atras')} Volver a hoy</button>`
        : `<button type="button" class="btn btn-arcoiris btn-bloque" data-acc="adelantar">${ico('calendario')} Adelantar a 21-nov</button>`}`;
  }

  /* ============================================================
     Páginas
     ============================================================ */
  function appTop(derecha) {
    return `<header class="so-app-top"><span></span><span class="so-logo">${ico('logo')}<b>Dispensa</b></span><span class="so-app-top-der">${derecha || ''}</span></header>`;
  }

  const PAG = {
    inicio() {
      const so = S().socio, r = so.receta, vig = D.recetaVigente();
      const dm = D.diasMembresia(), dr = D.diasReceta();
      const gm = D.gramosMes(), lim = r.limite, disp = D.gramosDisponibles();
      const pct = Math.round(gm / lim * 100);
      const pend = pendienteFirma();
      const sugeridos = [3, 7, 8, 11].map(prod).filter(Boolean);
      return `
      ${appTop(`<button type="button" class="so-campana" data-acc="notifs" aria-label="Notificaciones">${ico('campana')}<span class="so-cont" data-cont ${noLeidas() ? '' : 'hidden'}>${noLeidas()}</span></button>`)}
      <div class="so-saludo"><h1 class="so-hola">Hola, ${esc(so.primer)}</h1><p>Qué bueno tenerte aquí ${ico('hoja', 'so-hojita')}</p></div>
      ${vig ? '' : bannerPausa()}
      <button type="button" class="so-card so-wallet" data-ir="billetera">
        <span class="so-moneda-oro">${ico('hoja')}</span>
        <span class="so-wallet-txt"><b><span class="num" data-saldo>${so.tokens}</span> tokens</b><small>Tu saldo disponible</small></span>
        ${ico('flecha', 'so-chev')}
      </button>
      <button type="button" class="so-card so-mem" data-ir="perfil">
        ${anillo(Math.max(0, dm) / 365, 132, 10, 'so-an-salvia', `${ico('hoja', 'so-an-hoja')}<b class="num">${Math.max(0, dm)}</b><small>días</small>`)}
        <span class="so-mem-txt"><b>${dm >= 0 ? 'Tu membresía<br>está activa' : 'Membresía<br>en gracia'}</b><small>Un acceso más consciente todos los días.</small><span class="so-mano">hasta el ${fechaC(so.memFin)}</span></span>
      </button>
      <button type="button" class="so-card so-fila ${vig ? '' : 'vencida'}" data-ir="receta">
        <span class="so-fila-ico">${ico(vig ? 'receta' : 'candado')}</span>
        <span class="so-fila-txt"><b>${!vig ? 'Receta vencida' : dr <= 30 ? 'Receta vigente · ' + dr + ' días' : 'Receta vigente'}</b><small>${vig ? 'Hasta el ' + fechaC(r.hasta) : 'Venció el ' + fechaC(r.hasta) + ' · sube la nueva'}</small></span>
        ${ico('flecha', 'so-chev')}
      </button>
      <button type="button" class="so-card so-gram" data-ir="receta">
        <span class="so-fila-ico">${ico('hoja')}</span>
        <span class="so-gram-txt"><small>Gramaje del mes</small><b><span class="num">${F().g(gm).replace(' g', '')}</span> <em>de ${lim} g</em></b>
          <span class="so-gram-barra"><span class="progreso"><i style="width:${Math.min(100, pct)}%"></i></span><em class="num">${pct}%</em></span>
          <small class="dim">Disponible: ${g(disp)}</small></span>
      </button>
      ${pend ? `<div class="so-card so-aviso-firma">
        <span class="so-fila-ico">${ico('firma')}</span>
        <span class="so-fila-txt"><b>Tu pedido #${pend.id} llegó</b><small>Firma la recepción: 5 segundos.</small></span>
        <button type="button" class="btn btn-primario btn-sm" data-acc="firmar" data-id="${pend.id}">Firmar</button>
      </div>` : ''}
      <div class="so-sec-tit"><h2>Para ti esta semana</h2><button type="button" class="so-link" data-ir="tienda">Ver tienda ${ico('flecha')}</button></div>
      <div class="so-carrusel">
        ${sugeridos.map(p => `<button type="button" class="so-sug" data-acc="ficha" data-id="${p.id}">
          <img src="${p.img}" alt="" loading="lazy"><span class="so-sug-txt"><b>${esc(p.nombre)}</b><span>${moneda(p.tokens)}</span></span></button>`).join('')}
      </div>
      <p class="so-mano so-pie">para clubes y dispensarios</p>`;
    },

    tienda() {
      const vig = D.recetaVigente();
      return `
      ${appTop(`<button type="button" class="so-btn-carrito ${vig ? '' : 'pausado'}" data-acc="carrito" aria-label="Carrito">${ico(vig ? 'carrito' : 'candado')}<span class="so-cont" data-cont-carrito ${itemsCarrito() ? '' : 'hidden'}>${itemsCarrito()}</span></button>`)}
      <div class="so-tit-fila"><div><h1 class="so-h-pag">Tienda</h1><p class="dim">Bienestar que se cultiva.</p></div>
        <span class="so-pill-saldo" data-pill-saldo><span class="moneda">T</span><b class="num" data-saldo>${S().socio.tokens}</b></span></div>
      <label class="so-buscar">${ico('lupa')}<input type="search" data-buscar placeholder="Buscar flores, aceites, tópicos…" value="${esc(busqueda)}" aria-label="Buscar productos"></label>
      ${vig ? '' : bannerPausa()}
      <div class="so-chips" role="tablist" aria-label="Filtrar productos">
        ${FILTROS.map(([id, t]) => `<button type="button" role="tab" class="so-chipf" data-acc="filtro" data-id="${id}" aria-selected="${filtro === id}">${t}</button>`).join('')}
      </div>
      <div class="so-grilla" data-grilla>${grilla()}</div>`;
    },

    billetera() {
      const so = S().socio;
      return `
      ${appTop('')}
      <div class="so-tit-fila"><div><h1 class="so-h-pag">Billetera</h1><p class="dim">Tu alcancía verde.</p></div></div>
      <div class="so-saldo-grande">
        <span class="eyebrow">Saldo disponible</span>
        <span class="so-sg-num"><span class="moneda moneda-xxl">T</span><b class="num" data-saldo data-saldo-grande>${so.tokens}</b></span>
        <span class="so-mano">1 token ≈ $1.000 · no vencen</span>
      </div>
      <div class="so-sec-tit"><h2>Cargar tokens</h2><small class="dim">Webpay · Flow · Transferencia</small></div>
      <div class="so-bolsas">
        ${S().bolsas.map(b => `<button type="button" class="so-bolsa ${b.destacada ? 'destacada' : ''}" data-acc="bolsa" data-id="${b.id}">
          ${b.destacada ? '<span class="so-bolsa-cinta">La favorita</span>' : ''}
          <span class="so-bolsa-mon"><span class="moneda">T</span><span class="moneda">T</span><span class="moneda">T</span></span>
          <b class="num">${b.tokens}</b><small>tokens</small>
          <span class="so-bolsa-precio num">${F().clp(b.precio)}</span>
          <span class="so-bolsa-et">${esc(b.etiqueta)}</span>
        </button>`).join('')}
      </div>
      <div class="so-sec-tit"><h2>Movimientos</h2><small class="dim">extracto inmutable</small></div>
      <ul class="so-movs">${movsHTML()}</ul>`;
    },

    receta() {
      const so = S().socio, r = so.receta, vig = D.recetaVigente(), dr = D.diasReceta();
      const total = Math.max(1, D.diasEntre(r.desde, r.hasta));
      const p = Math.max(0, Math.min(100, D.diasEntre(r.desde, hoy()) / total * 100));
      const c = so.consumoDiario, gm = D.gramosMes();
      let imax = 0; c.forEach((v, i) => { if (v > c[imax]) imax = i; });
      const estado = !vig ? ['alerta', 'Vencida', 'El carrito está en pausa. Tu membresía sigue activa.'] : dr <= 30 ? ['aviso', `Vence en ${dr} días`, 'Te avisamos a los 30, 15, 7 y 0 días.'] : ['ok', 'Vigente', `Quedan ${dr} días de tratamiento.`];
      return `
      ${appTop('')}
      <div class="so-tit-fila"><div><h1 class="so-h-pag">Receta</h1><p class="dim">Tu tratamiento, sin papeleo.</p></div></div>
      <div class="so-card so-rec-estado ${estado[0]}">
        <span class="so-re-ico">${ico(vig ? 'receta' : 'candado')}</span>
        <span><span class="chip ${estado[0]}">${estado[1]}</span><b>${vig ? 'Hasta el ' + fechaL(r.hasta) : 'Venció el ' + fechaL(r.hasta)}</b><small>${estado[2]}</small></span>
      </div>
      <div class="so-card so-rec-ficha">
        <dl>
          <div><dt>Médico</dt><dd>${esc(r.medico)}</dd></div>
          <div><dt>Folio</dt><dd class="mono">${esc(r.folio)}</dd></div>
          <div><dt>Límite mensual</dt><dd><b class="num">${r.limite} g</b></dd></div>
        </dl>
        <div class="so-linea">
          <div class="so-linea-barra ${vig ? '' : 'vencida'}"><i style="width:${p}%"></i><span class="so-linea-hoy" style="left:${p}%"><em>hoy</em></span></div>
          <div class="so-linea-fechas"><span>${fechaC(r.desde)}</span><span>${fechaC(r.hasta)}</span></div>
        </div>
      </div>
      <div class="so-card so-graf">
        <div class="so-graf-top"><div><span class="so-card-t">Consumo diario · ${MES_LARGO[mesBase() - 1]}</span><small class="dim">cada barra es un día</small></div><span class="chip lila sin-punto">${g(gm)} / ${r.limite} g</span></div>
        ${grafico()}
        <div class="so-graf-datos">
          <div><small>Total del mes</small><b class="num">${g(gm)}</b></div>
          <div><small>Día de mayor consumo</small><b class="num">${c[imax] ? dMes(S().hoy.slice(0, 8) + String(imax + 1).padStart(2, '0')) + ' ' + MESES[mesBase() - 1] + ' · ' + g(c[imax]) : '—'}</b></div>
          <div class="so-gd-disp"><small>Disponible</small><b class="num">${g(D.gramosDisponibles())}</b></div>
        </div>
      </div>
      <button type="button" class="btn btn-arcoiris btn-bloque so-subir" data-acc="subir-receta">${ico('camara')} Subir receta nueva</button>
      <p class="so-mano so-centrado">foto o PDF · el club la valida y listo</p>
      <div class="so-sec-tit"><h2>Historial de recetas</h2></div>
      <ul class="so-hist">
        <li class="actual"><span class="so-h-punto"></span><span><b>${esc(r.folio)}</b><small>${fechaC(r.desde)} → ${fechaC(r.hasta)} · ${r.limite} g/mes</small></span><span class="chip ${vig ? 'ok' : 'alerta'}">${vig ? 'Actual' : 'Vencida'}</span></li>
        ${(so.recetasPrev || []).map(x => `<li><span class="so-h-punto"></span><span><b>${esc(x.folio)}</b><small>${fechaC(x.desde)} ${x.desde.slice(0, 4)} → ${fechaC(x.hasta)} ${x.hasta.slice(0, 4)} · ${x.limite} g/mes</small></span><span class="chip sin-punto">Archivada</span></li>`).join('')}
      </ul>`;
    },

    perfil() {
      const so = S().socio, dm = D.diasMembresia();
      const pedidos = so.pedidos;
      const pm = Math.max(0, Math.min(1, D.diasEntre(so.memInicio, hoy()) / Math.max(1, D.diasEntre(so.memInicio, so.memFin))));
      return `
      ${appTop('')}
      <header class="so-perfil-top">
        <span class="so-avatar">${esc(so.primer[0])}</span>
        <div><h1 class="so-h-pag">${esc(so.nombre)}</h1><small class="dim mono">${esc(so.rut)} · socia desde ene 2026</small></div>
      </header>
      <div class="so-card so-memb">
        <div class="so-memb-top"><span class="so-memb-ico">${ico('membresia')}</span><span><span class="so-card-t">Membresía anual</span><small class="dim">${S().dispensario.nombre}</small></span><span class="chip ${dm > 30 ? 'ok' : dm >= 0 ? 'aviso' : 'alerta'}">${dm >= 0 ? 'Activa' : 'En gracia'}</span></div>
        <div class="progreso"><i style="width:${pm * 100}%"></i></div>
        <div class="so-memb-fechas"><span><small>Inicio</small>${fechaL(so.memInicio)}</span><span><small>Renueva</small>${fechaL(so.memFin)}</span></div>
        <div class="so-memb-pie"><b class="num">${Math.max(0, dm)} días</b><button type="button" class="btn btn-primario btn-sm" data-acc="renovar">Renovar · $20.000</button></div>
      </div>
      <div class="so-sec-tit"><h2>Mis pedidos</h2><small class="dim">${pedidos.length} en total</small></div>
      ${pedidos.length ? `<ul class="so-pedidos">${pedidos.map(pedidoHTML).join('')}</ul>` : vacio('Aún no hay pedidos', 'cuando canjees, tus pedidos aparecen aquí')}
      <div class="so-card so-presenta-movil">
        <p class="eyebrow">Modo presentador</p>
        <div class="so-club-btns">
          <button type="button" class="btn btn-arcoiris btn-sm" data-acc="${hoy() === S().hoy ? 'adelantar' : 'volver-hoy'}">${ico('calendario')} ${hoy() === S().hoy ? 'Adelantar a 21-nov' : 'Volver a hoy'}</button>
          <button type="button" class="btn btn-fantasma btn-sm" data-acc="sim-entrega">${ico('camion')} Entregar pedido</button>
        </div>
      </div>
      <div class="so-sec-tit"><h2>Mis datos y privacidad</h2><span class="chip sin-punto">${ico('ley')} Ley 21.719</span></div>
      <ul class="so-priv">
        <li><button type="button" data-acc="priv-descargar">${ico('descarga')}<span><b>Descargar mis datos</b><small>Todo lo que el club sabe de ti, en un archivo</small></span>${ico('flecha', 'so-chev')}</button></li>
        <li><button type="button" data-acc="priv-corregir">${ico('documento')}<span><b>Corregir mis datos</b><small>Nombre, correo o teléfono</small></span>${ico('flecha', 'so-chev')}</button></li>
        <li><button type="button" data-acc="priv-borrar">${ico('x')}<span><b>Pedir que borren mis datos</b><small>Salvo lo que exige la ley sanitaria</small></span>${ico('flecha', 'so-chev')}</button></li>
        <li><label class="so-switch-fila">${ico('comunicado')}<span><b>Recibir comunicados</b><small>Los avisos de tu receta siguen siempre</small></span><input type="checkbox" class="so-switch" data-acc="priv-comunicados" ${so.comunicadosOn !== false ? 'checked' : ''}></label></li>
      </ul>
      <p class="so-mano so-pie">tus datos son tuyos</p>`;
    }
  };

  function bannerPausa() {
    return `<div class="so-pausa" role="status">
      <span class="so-pausa-ico">${ico('candado')}</span>
      <span><b>Carrito en pausa</b><small>Tu receta venció el ${fechaC(S().socio.receta.hasta)}. La membresía sigue activa.</small></span>
      <button type="button" class="btn btn-sm btn-token" data-acc="subir-receta">Subir receta</button>
    </div>`;
  }

  function grilla() {
    const q = busqueda.trim().toLowerCase();
    const lista = S().productos.filter(p => enFiltro(p, filtro) && (!q || (p.nombre + ' ' + p.tipo + ' ' + p.tag).toLowerCase().includes(q)));
    if (!lista.length) return vacio('Nada por aquí', 'prueba otro filtro');
    return lista.map((p, i) => `
      <article class="so-prod" style="--i:${i}">
        <button type="button" class="so-prod-foto" data-acc="ficha" data-id="${p.id}" aria-label="Ver ${esc(p.nombre)}">
          <img src="${p.img}" alt="" loading="lazy">
          ${p.stock <= 12 ? `<span class="so-stock">¡Quedan ${p.stock}!</span>` : ''}
        </button>
        <button type="button" class="so-corazon" data-acc="fav" data-id="${p.id}" aria-pressed="${favoritos.has(p.id)}" aria-label="Favorito">${ico('corazon')}</button>
        <div class="so-prod-cuerpo">
          <b class="so-prod-nom">${esc(p.nombre)}</b>
          <span class="so-prod-meta">${esc(p.tipo.replace('Flor ', '').replace(/^./, c => c.toUpperCase()))}${p.gramos ? ' · ' + g(p.gramos) : ''}</span>
          <span class="so-prod-meta2">THC ${esc(p.thc)} · CBD ${esc(p.cbd)}</span>
          <span class="so-prod-pie">${moneda(p.tokens)}<button type="button" class="so-add" data-acc="agregar" data-id="${p.id}" aria-label="Agregar ${esc(p.nombre)} para canje">${ico('mas')}</button></span>
        </div>
      </article>`).join('');
  }

  function grafico() {
    const c = S().socio.consumoDiario, n = 31, W = 330, H = 150, base = H - 20, alto = base - 26;
    const ih = idxHoy();
    const max = Math.max(5, ...c);
    let imax = 0; c.forEach((v, i) => { if (v > c[imax]) imax = i; });
    const bw = W / n;
    let barras = '';
    for (let i = 0; i < n; i++) {
      const v = c[i] || 0, fut = i > ih;
      const h = v ? Math.max(6, v / max * alto) : 3;
      const x = i * bw + 1.6, w = bw - 3.2;
      const cls = fut ? 'fut' : v ? (i === imax ? 'pico' : 'con') : 'cero';
      barras += `<rect class="so-b ${cls}" x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="2.5" style="--i:${i}"/>`;
    }
    const etiquetas = [1, 8, 15, 22, 29].map(d => `<text x="${((d - 1) * bw + bw / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle">${d}</text>`).join('');
    const px = imax * bw + bw / 2, py = base - Math.max(6, (c[imax] || 0) / max * alto) - 8;
    const hx = ih * bw + bw / 2;
    return `<svg class="so-grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Consumo diario del mes: ${g(D.gramosMes())} en total">
      <line class="so-g-base" x1="0" x2="${W}" y1="${base + .5}" y2="${base + .5}"/>
      ${barras}
      ${c[imax] ? `<text class="so-g-pico" x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle">${g(c[imax])}</text>` : ''}
      ${ih >= 0 && ih < n ? `<g class="so-g-hoy"><circle cx="${hx.toFixed(1)}" cy="${base + 7}" r="3"/></g>` : ''}
      <g class="so-g-eje">${etiquetas}</g>
    </svg>`;
  }

  function movsHTML() {
    const m = S().socio.movs || [];
    if (!m.length) return `<li>${vacio('Sin movimientos', 'aquí verás tus aportes y canjes')}</li>`;
    return m.map(x => `<li class="${x.tokens > 0 ? 'mas' : 'menos'}">
      <span class="so-mov-ico">${ico(x.tokens > 0 ? 'mas' : 'carrito')}</span>
      <span class="so-mov-txt"><b>${esc(x.txt)}</b><small>${fechaC(x.fecha)} · ${esc(x.medio)}</small></span>
      <b class="so-mov-n num">${x.tokens > 0 ? '+' : '−'}${Math.abs(x.tokens)}</b></li>`).join('');
  }

  function pedidoHTML(p) {
    const est = p.estado === 'entregado' ? (p.firmado ? ['ok', 'Entregado · firmado'] : ['aviso', 'Entregado · falta tu firma']) : p.estado === 'en camino' ? ['lila', 'En camino'] : ['lila', 'Preparando'];
    return `<li class="so-ped">
      <span class="so-ped-ico">${ico(p.estado === 'entregado' ? (p.firmado ? 'check' : 'firma') : 'camion')}</span>
      <span class="so-ped-txt"><b>#${p.id} · ${fechaC(p.fecha)}</b><small>${esc(p.items)}</small><span class="chip ${est[0]}">${est[1]}</span></span>
      <span class="so-ped-der">${moneda(p.tokens)}${p.estado === 'entregado' && !p.firmado ? `<button type="button" class="btn btn-primario btn-sm" data-acc="firmar" data-id="${p.id}">${ico('firma')} Firmar recepción</button>` : ''}${p.firmado && p.estado === 'entregado' ? '<span class="so-mini-sello">firmado</span>' : ''}</span>
    </li>`;
  }

  function vacio(t, m) {
    return `<div class="so-vacio">${hongo('so-vacio-ilu')}<b>${t}</b><span class="so-mano">${m}</span></div>`;
  }

  function esqueleto() {
    return `<div class="so-pag-in so-esq" aria-hidden="true"><i class="t"></i><i class="s"></i><i class="b"></i><div class="d"><i></i><i></i></div><i class="b2"></i><i class="l"></i><i class="l"></i></div>`;
  }

  /* ============================================================
     Navegación entre pestañas
     ============================================================ */
  function marcarTabbar() {
    raiz.querySelectorAll('.so-tabbar button').forEach(b => {
      b.setAttribute('aria-current', b.dataset.tab === tab ? 'true' : 'false');
      let badge = b.querySelector('.badge');
      let n = 0;
      if (b.dataset.tab === 'tienda') n = itemsCarrito();
      if (b.dataset.tab === 'perfil') n = pendienteFirma() ? 1 : 0;
      if (n) { if (!badge) { badge = document.createElement('span'); badge.className = 'badge'; b.appendChild(badge); } badge.textContent = n; }
      else if (badge) badge.remove();
    });
  }

  function llenar(pag, animar) {
    pag.innerHTML = `<div class="so-pag-in so-p-${tab} ${animar ? 'so-anima' : ''}">${PAG[tab]()}</div>`;
    if (animar) {
      pag.querySelectorAll('[data-saldo]').forEach(el => { el.dataset.valor = 0; el.textContent = '0'; D.fx.contar(el, S().socio.tokens, 900); });
    }
  }

  function cambiarTab(n, forzar) {
    if (!PAG[n]) return;
    const vieja = paginas.querySelector('.so-pag:not(.so-sale)');
    if (n === tab && !forzar && vieja) { vieja.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const iA = TABS.findIndex(t => t.id === tab), iB = TABS.findIndex(t => t.id === n);
    tab = n; marcarTabbar();
    const nueva = document.createElement('div');
    nueva.className = 'so-pag';
    if (vieja && !reducido()) {
      const der = iB >= iA;
      nueva.classList.add(der ? 'so-entra-der' : 'so-entra-izq');
      vieja.classList.add('so-sale', der ? 'so-sale-izq' : 'so-sale-der');
      later(() => vieja.remove(), 420);
    } else if (vieja) vieja.remove();
    paginas.appendChild(nueva);
    if (vieja && !reducido()) {
      nueva.innerHTML = esqueleto();
      later(() => { if (nueva.isConnected) llenar(nueva, true); }, 280);
    } else llenar(nueva, false);
  }

  /** Repinta la pestaña actual sin transición y conservando el scroll */
  function refrescar() {
    if (!paginas) return;
    const pag = paginas.querySelector('.so-pag:not(.so-sale)');
    if (!pag) return;
    const y = pag.scrollTop;
    llenar(pag, false);
    pag.scrollTop = y;
    marcarTabbar();
    const ctrl = raiz.querySelector('[data-control]');
    if (ctrl) ctrl.innerHTML = controlCalendario();
  }

  /* ============================================================
     Narrador «Lo que está pasando»
     ============================================================ */
  const NARR_ICO = { ok: 'check', aviso: 'reloj', alerta: 'candado', info: 'rayo', ley: 'ley', token: 'token', firma: 'firma' };
  function narrar(tipo, titulo, texto, sinAnim) {
    const lista = raiz && raiz.querySelector('.so-narr-lista');
    if (!lista) return;
    const li = document.createElement('li');
    li.className = 'so-narr so-n-' + tipo + (sinAnim ? '' : ' nuevo');
    li.innerHTML = `<span class="so-narr-ico">${ico(NARR_ICO[tipo] || 'rayo')}</span><div><small class="mono">${fechaC(hoy())}</small><b></b><p></p></div>`;
    li.querySelector('b').textContent = titulo;
    li.querySelector('p').textContent = texto || '';
    lista.prepend(li);
    [...lista.children].slice(5).forEach(x => x.remove());
  }
  function narrarInicio() {
    const r = S().socio.receta, vig = D.recetaVigente();
    narrar('info', `Gramaje de ${MES_LARGO[mesBase() - 1]}: ${g(D.gramosMes())} de ${r.limite} g`, `Quedan ${g(D.gramosDisponibles())}. El sistema lo descuenta en cada canje.`, true);
    narrar('ok', `Membresía activa: quedan ${Math.max(0, D.diasMembresia())} días`, 'Avisos automáticos a los 60, 30, 15, 7 y 0 días.', true);
    if (vig) narrar('ok', `El sistema revisó tu receta: vigente hasta ${fechaC(r.hasta)}`, 'Mientras esté vigente, el carrito funciona normal.', true);
    else narrar('alerta', 'Receta vencida: carrito en pausa', 'La membresía sigue activa. Basta subir la receta nueva.', true);
  }

  /* ---------- aviso dentro de la app (tipo notificación iOS) ---------- */
  function avisoApp(titulo, texto, icono) {
    if (!pantalla) return;
    const a = document.createElement('div');
    a.className = 'so-banner';
    a.innerHTML = `<span class="so-banner-ico">${ico(icono || 'campana')}</span><div><small>${esc(S().dispensario.nombre)} · ahora</small><b></b><p></p></div>`;
    a.querySelector('b').textContent = titulo;
    a.querySelector('p').textContent = texto || '';
    a.addEventListener('click', () => { a.remove(); abrirNotifs(); });
    pantalla.appendChild(a);
    later(() => { a.classList.add('sale'); later(() => a.remove(), 400); }, 3600);
  }

  function actualizarContadores() {
    if (!raiz) return;
    const n = noLeidas();
    raiz.querySelectorAll('[data-cont]').forEach(el => { el.textContent = n; el.hidden = !n; });
    const k = itemsCarrito();
    raiz.querySelectorAll('[data-cont-carrito]').forEach(el => { el.textContent = k; el.hidden = !k; });
    marcarTabbar();
  }
  function actualizarSaldo() {
    raiz.querySelectorAll('[data-saldo]').forEach(el => D.fx.contar(el, S().socio.tokens, 900));
  }
  function rebote(el) {
    if (!el || reducido()) return;
    el.classList.remove('so-rebota'); void el.offsetWidth; el.classList.add('so-rebota');
  }

  /* ============================================================
     Hojas (bottom sheets)
     ============================================================ */
  function cerrarHoja(inmediato) {
    const h = pantalla && pantalla.querySelector('.so-hoja-cont');
    if (!h) return Promise.resolve();
    if (inmediato || reducido()) { h.remove(); return Promise.resolve(); }
    h.classList.add('cierra');
    return new Promise(r => setTimeout(() => { h.remove(); r(); }, 300));
  }
  function abrirHoja(html, clase) {
    cerrarHoja(true);
    const cont = document.createElement('div');
    cont.className = 'so-hoja-cont';
    cont.innerHTML = `<div class="velo" data-cerrar></div><div class="hoja so-hoja ${clase || ''}" role="dialog" aria-modal="true"><button type="button" class="so-hoja-x" data-cerrar aria-label="Cerrar">${ico('x')}</button><div class="so-hoja-in">${html}</div></div>`;
    pantalla.appendChild(cont);
    return cont.querySelector('.hoja');
  }
  const hojaIn = () => pantalla.querySelector('.so-hoja .so-hoja-in');

  /* ---------- notificaciones ---------- */
  const NOT_ICO = { info: 'comunicado', receta: 'receta', producto: 'flor', pedido: 'camion', pago: 'token', firma: 'firma' };
  function notifsHTML() {
    const ns = S().notificaciones;
    if (!ns.length) return vacio('Sin avisos nuevos', 'todo en orden');
    const nuevas = ns.filter(n => !n.leida), viejas = ns.filter(n => n.leida);
    const item = n => `<li class="so-not ${n.leida ? '' : 'nueva'}">
      <span class="so-not-av">${ico(NOT_ICO[n.tipo] || 'campana')}</span>
      <span class="so-not-txt"><b>${esc(n.titulo)}</b><small>${esc(n.txt || '')}</small><em>${esc(n.de || '')} · ${esc(n.hace || '')}</em></span>
    </li>`;
    return `${nuevas.length ? `<h4 class="so-not-grupo">Nuevas</h4><ul class="so-nots">${nuevas.map(item).join('')}</ul>` : ''}
      ${viejas.length ? `<h4 class="so-not-grupo">Anteriores</h4><ul class="so-nots">${viejas.map(item).join('')}</ul>` : ''}`;
  }
  function abrirNotifs() {
    abrirHoja(`<h3 class="so-hoja-tit">Notificaciones</h3><p class="so-mano">lo que el club te contó</p><div data-notifs>${notifsHTML()}</div>`, 'so-hoja-alta');
    later(() => {
      S().notificaciones.forEach(n => { n.leida = true; });
      D.guardar(); actualizarContadores();
      pantalla.querySelectorAll('.so-not.nueva').forEach(el => el.classList.add('leyendo'));
    }, 900);
  }

  /* ---------- ficha de producto ---------- */
  function abrirFicha(id) {
    const p = prod(id); if (!p) return;
    let cant = 1;
    const hoja = abrirHoja(`
      <div class="so-ficha-foto"><img src="${p.img}" alt="${esc(p.nombre)}"><span class="chip sin-punto">${esc(p.tag)}</span></div>
      <p class="eyebrow">${esc(p.tipo)} · ${esc(p.cultivo)}</p>
      <h3 class="so-ficha-nom">${esc(p.nombre)}</h3>
      <div class="so-specs">
        <div><small>THC</small><b>${esc(p.thc)}</b></div>
        <div><small>CBD</small><b>${esc(p.cbd)}</b></div>
        <div><small>Gramos</small><b>${p.gramos ? g(p.gramos) : '—'}</b></div>
        <div><small>Stock</small><b class="${p.stock <= 12 ? 'bajo' : ''}">${p.stock}</b></div>
      </div>
      <p class="so-ficha-cupo">${p.gramos ? `${ico('gramaje')} Cuenta ${g(p.gramos)} para tu cupo · te quedan ${g(D.gramosDisponibles())}` : `${ico('check')} No descuenta gramaje de tu cupo`}</p>
      <div class="so-ficha-pie">
        <div class="so-stepper"><button type="button" data-f="-" aria-label="Menos">${ico('menos')}</button><b class="num" data-cant>1</b><button type="button" data-f="+" aria-label="Más">${ico('mas')}</button></div>
        <button type="button" class="btn btn-primario so-ficha-add" data-acc="agregar" data-id="${p.id}">Agregar para canje · <span class="moneda">T</span><b class="num" data-tot>${p.tokens}</b></button>
      </div>`, 'so-hoja-ficha');
    hoja.addEventListener('click', e => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      cant = Math.max(1, Math.min(5, cant + (b.dataset.f === '+' ? 1 : -1)));
      hoja.querySelector('[data-cant]').textContent = cant;
      hoja.querySelector('[data-tot]').textContent = p.tokens * cant;
      hoja.querySelector('.so-ficha-add').dataset.cant = cant;
      rebote(hoja.querySelector('[data-cant]'));
    });
  }

  /* ---------- carrito ---------- */
  function volarFoto(origen, id) {
    const p = prod(id);
    const destino = raiz.querySelector('.so-btn-carrito') || raiz.querySelector('.so-tabbar [data-tab="tienda"]');
    if (reducido() || !origen || !destino || !p) return Promise.resolve();
    const a = origen.getBoundingClientRect(), b = destino.getBoundingClientRect();
    const im = document.createElement('img');
    im.src = p.img; im.className = 'so-vuela';
    const t = Math.min(a.width, a.height, 120);
    Object.assign(im.style, { left: (a.left + a.width / 2 - t / 2) + 'px', top: (a.top + a.height / 2 - t / 2) + 'px', width: t + 'px', height: t + 'px' });
    document.body.appendChild(im);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    return new Promise(res => {
      im.animate([
        { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
        { transform: `translate(${dx * .45}px, ${dy * .45 - 80}px) scale(.55) rotate(-12deg)`, opacity: 1, offset: .5 },
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(10deg)`, opacity: .4 }
      ], { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = () => { im.remove(); rebote(destino); res(); };
    });
  }

  async function agregar(id, cant, origen) {
    const p = prod(id); if (!p) return;
    const c = S().carrito;
    const it = c.find(x => x.id === p.id);
    if (it) it.cant += cant; else c.push({ id: p.id, cant });
    D.guardar();
    const enHoja = pantalla.querySelector('.so-hoja-ficha');
    if (enHoja) { await volarFoto(enHoja.querySelector('.so-ficha-foto img'), id); cerrarHoja(); }
    else await volarFoto(origen, id);
    actualizarContadores();
    const t = totales();
    const disp = D.gramosDisponibles();
    avisoApp(`${p.nombre} en el carrito`, `${t.tokens} tokens · ${g(t.gramos)} en total`, 'carrito');
    if (!D.recetaVigente()) narrar('alerta', 'Producto guardado, pero el carrito está en pausa', 'La receta venció: se podrá canjear apenas suba la nueva.');
    else if (t.gramos > disp) narrar('aviso', `Ojo: el carrito ya suma ${g(t.gramos)}`, `El cupo disponible es ${g(disp)}. El sistema lo va a frenar al canjear.`);
    else narrar('info', `Carrito: ${t.tokens} tokens · ${g(t.gramos)}`, `Dentro del cupo: quedan ${g(disp)} este mes.`);
  }

  function candadoXL() {
    return `<svg class="so-candado-xl" viewBox="0 0 120 140" aria-hidden="true"><defs><linearGradient id="so-g-cand" x1="0" y1="0" x2=".3" y2="1"><stop offset="0" class="c1"/><stop offset="1" class="c2"/></linearGradient></defs>
      <path class="arco" d="M33 64V44a27 27 0 0 1 54 0v20"/><rect x="12" y="58" width="96" height="76" rx="20" fill="url(#so-g-cand)"/>
      <rect class="brillo" x="22" y="66" width="10" height="44" rx="5"/><circle class="ojo" cx="60" cy="90" r="10"/><path class="ojo" d="M55 94h10l3 22H52Z"/></svg>`;
  }
  function pausaHero() {
    const so = S().socio, dr = D.diasReceta(), c = S().carrito;
    return `<div class="so-pausa-hero">
      <div class="so-ph-cielo" aria-hidden="true">
        <span class="so-ph-luna"></span>
        <svg class="so-ph-montes" viewBox="0 0 400 120" preserveAspectRatio="none"><path class="m1" d="M0 80 60 40l40 26 60-50 50 44 40-28 60 46 40-24 50 30v56H0Z"/><path class="m2" d="M0 100c60-12 120-14 200-6s140 8 200-4v30H0Z"/></svg>
        ${florcita('so-ph-f1')}${florcita('so-ph-f2')}${hojita('so-ph-h1')}${hojita('so-ph-h2')}
      </div>
      ${candadoXL()}
      <h3 class="so-ph-tit">${dr >= -1 ? 'Tu receta venció hoy.' : 'Tu receta venció.'}</h3>
      <p class="so-ph-txt">El carrito queda en pausa;<br>tu membresía sigue activa.</p>
      <span class="so-ph-chip">${ico('check')} Membresía activa · ${Math.max(0, D.diasMembresia())} días</span>
      <button type="button" class="so-card so-fila so-ph-aviso" data-acc="subir-receta">
        <span class="so-fila-ico">${ico('campana')}</span><span class="so-fila-txt"><b>Sube tu nueva receta</b><small>y sigue canjeando como siempre.</small></span>${ico('flecha', 'so-chev')}
      </button>
      <button type="button" class="btn btn-bloque so-btn-naranja" data-acc="subir-receta">${ico('descarga', 'so-rot')} Subir receta nueva</button>
      ${c.length ? `<p class="so-mano so-centrado">tus ${itemsCarrito()} producto${itemsCarrito() > 1 ? 's' : ''} quedan guardados aquí</p>` : `<p class="so-mano so-centrado">nada se pierde: ni tokens, ni historial</p>`}
    </div>`;
  }

  function carritoHTML(motivo) {
    const c = S().carrito, vig = D.recetaVigente(), t = totales(), so = S().socio;
    if (!vig) return pausaHero();
    if (!c.length) return `<h3 class="so-hoja-tit">Tu carrito</h3>${vacio('Tu carrito está vacío', 'agrega productos desde la tienda')}<button type="button" class="btn btn-fantasma btn-bloque" data-acc="ir-tienda">Ir a la tienda</button>`;
    const filas = c.map(it => { const p = prod(it.id); return `<li class="so-ci">
      <img src="${p.img}" alt=""><span class="so-ci-txt"><b>${esc(p.nombre)}</b><small>${p.gramos ? g(p.gramos * it.cant) + ' · ' : ''}${p.tokens} c/u</small></span>
      <span class="so-stepper so-stepper-sm"><button type="button" data-acc="cant" data-id="${p.id}" data-d="-1" aria-label="Menos">${ico('menos')}</button><b class="num">${it.cant}</b><button type="button" data-acc="cant" data-id="${p.id}" data-d="1" aria-label="Más">${ico('mas')}</button></span>
    </li>`; }).join('');
    const M = motivo ? motivoHTML(motivo) : '';
    return `
      <div class="so-carr-top"><h3 class="so-hoja-tit">Tu carrito</h3><span class="so-pill-saldo" data-pill-hoja><span class="moneda">T</span><b class="num" data-saldo>${so.tokens}</b></span></div>
      ${vig ? '' : `<div class="so-pausa so-pausa-grande"><span class="so-pausa-ico">${ico('candado')}</span><span><b>Carrito en pausa</b><small>Tu receta venció el ${fechaC(so.receta.hasta)}. Tu membresía sigue activa.</small></span></div>`}
      <ul class="so-carr ${vig ? '' : 'pausado'}">${filas}</ul>
      <p class="eyebrow">Entrega</p>
      <div class="so-entrega" role="radiogroup">
        <button type="button" role="radio" data-acc="entrega" data-id="retiro" aria-checked="${entrega === 'retiro'}">${ico('tienda')}<span><b>Retiro en local</b><small>0 tokens</small></span></button>
        <button type="button" role="radio" data-acc="entrega" data-id="despacho" aria-checked="${entrega === 'despacho'}">${ico('camion')}<span><b>Despacho</b><small>+${DESPACHO} tokens</small></span></button>
      </div>
      <div class="so-resumen">
        <div><span>Productos</span><b class="num">${t.tokens} tokens</b></div>
        ${t.envio ? `<div><span>Despacho</span><b class="num">${t.envio} tokens</b></div>` : ''}
        <div><span>Gramos del canje</span><b class="num">${g(t.gramos)} <small>de ${g(D.gramosDisponibles())} disp.</small></b></div>
        <div class="total"><span>Total</span><b class="num" data-total-canje><span class="moneda">T</span>${t.total}</b></div>
      </div>
      <div data-motivo>${M}</div>
      ${vig
        ? `<button type="button" class="btn btn-arcoiris btn-bloque so-canjear" data-acc="canjear">${ico('token')} Canjear ${t.total} tokens</button>`
        : `<button type="button" class="btn btn-token btn-bloque" data-acc="subir-receta">${ico('camara')} Subir receta nueva</button>`}
      <p class="so-mano so-centrado">${vig ? 'el sistema revisa receta, cupo y saldo en un segundo' : 'tus productos quedan guardados aquí'}</p>`;
  }

  const MOTIVOS = {
    receta: ['candado', 'Receta vencida'],
    gramaje: ['gramaje', 'Supera tu gramaje'],
    tokens: ['token', 'Tokens insuficientes'],
    membresia: ['membresia', 'Membresía vencida']
  };
  function motivoHTML(r) {
    const m = MOTIVOS[r.motivo] || ['x', 'No se puede canjear'];
    const extra = r.motivo === 'tokens' ? `<button type="button" class="btn btn-token btn-sm" data-acc="ir-billetera">${ico('token')} Comprar tokens</button>`
      : r.motivo === 'receta' ? `<button type="button" class="btn btn-token btn-sm" data-acc="subir-receta">Subir receta</button>`
        : r.motivo === 'membresia' ? `<button type="button" class="btn btn-primario btn-sm" data-acc="renovar">Renovar</button>`
          : `<small class="so-mano">quita algo del carrito y listo</small>`;
    return `<div class="so-motivo"><span class="so-motivo-ico">${ico(m[0])}</span><span><b>Canje bloqueado: ${m[1].toLowerCase()}</b><small>${esc(r.txt)}</small></span>${extra}</div>`;
  }

  function abrirCarrito() {
    abrirHoja(carritoHTML(), 'so-hoja-carrito' + (D.recetaVigente() ? '' : ' so-hoja-pausa'));
    if (!D.recetaVigente()) narrar('alerta', 'Carrito en pausa', 'La receta venció. La membresía sigue activa: el socio no pierde nada.');
  }
  function repintarCarrito(motivo) { const h = hojaIn(); if (h && pantalla.querySelector('.so-hoja-carrito')) h.innerHTML = carritoHTML(motivo); }

  async function canjear(boton) {
    if (ocupado) return;
    const t = totales();
    const r = D.puedeCanjear(t.total, t.gramos);
    if (!r.ok) {
      repintarCarrito(r);
      const hoja = pantalla.querySelector('.so-hoja-carrito');
      if (hoja && !reducido()) { hoja.classList.remove('so-sacude'); void hoja.offsetWidth; hoja.classList.add('so-sacude'); }
      const tit = { receta: 'Canje bloqueado: receta vencida', gramaje: 'Canje bloqueado: supera tu gramaje', tokens: 'Canje bloqueado: faltan tokens', membresia: 'Canje bloqueado: membresía vencida' }[r.motivo] || 'Canje bloqueado';
      narrar('alerta', tit, r.txt);
      D.evento('bloqueo', `Canje frenado a Camila R. · ${tit.split(': ')[1] || r.motivo}`);
      return;
    }
    ocupado = true;
    boton.disabled = true;
    boton.innerHTML = `<span class="so-giro"></span> Revisando receta, cupo y saldo…`;
    await espera(650);
    const pill = pantalla.querySelector('[data-pill-hoja]') || pantalla.querySelector('[data-pill-saldo]');
    const so = S().socio;
    const nuevoId = Math.max(2051, ...so.pedidos.map(p => p.id)) + 1;
    const items = S().carrito.map(it => { const p = prod(it.id); return p.nombre + (it.cant > 1 ? ' ×' + it.cant : ''); }).join(' · ');
    const tot = boton.closest('.so-hoja-in') && boton.closest('.so-hoja-in').querySelector('[data-total-canje]');
    await D.fx.monedas(pill, tot || boton, 9);
    so.tokens -= t.total;
    const ih = idxHoy();
    while (so.consumoDiario.length <= ih) so.consumoDiario.push(0);
    so.consumoDiario[ih] = Math.round((so.consumoDiario[ih] + t.gramos) * 10) / 10;
    so.pedidos.unshift({ id: nuevoId, fecha: hoy(), items, tokens: t.total, gramos: t.gramos, estado: 'preparando', firmado: false, entrega: entrega === 'despacho' ? 'Despacho' : 'Retiro' });
    so.movs = so.movs || [];
    so.movs.unshift({ fecha: hoy(), txt: `Canje pedido #${nuevoId}`, tokens: -t.total, medio: 'Créditos' });
    S().carrito = [];
    S().socio.carritoVacio = true;
    D.guardar();
    actualizarSaldo(); actualizarContadores();
    const h = hojaIn();
    if (h) h.innerHTML = `<div class="so-exito">
        <span class="so-exito-check">${ico('check')}</span>
        <h3 class="so-hoja-tit">¡Canje listo!</h3>
        <p>Pedido <b class="mono">#${nuevoId}</b> · ${t.total} tokens · ${g(t.gramos)}</p>
        <p class="so-mano">${entrega === 'despacho' ? 'va en camino a tu casa,' : 'te esperamos en el local'}</p>
        <div class="so-exito-checks"><span>${ico('check')} Receta vigente</span><span>${ico('check')} Dentro del cupo</span><span>${ico('check')} Saldo suficiente</span></div>
        <button type="button" class="btn btn-primario btn-bloque" data-acc="ver-pedidos">Ver mis pedidos</button>
      </div>`;
    const rc = pantalla.querySelector('.so-exito');
    if (rc) { const b = rc.getBoundingClientRect(); D.fx.confeti(b.left + b.width / 2, b.top + 40, 50); }
    narrar('ok', `Canje aprobado: pedido #${nuevoId}`, `Receta ✓ · cupo ✓ · saldo ✓. −${t.total} tokens y +${g(t.gramos)} al consumo de hoy. El pedido ya está en el panel del club.`);
    D.evento('canje', `Camila R. canjeó ${items.split(' · ').length} producto${items.split(' · ').length > 1 ? 's' : ''} · −${t.total} tokens · ${g(t.gramos)}`);
    D.fx.toast('Canje listo', `Pedido #${nuevoId} · ${t.total} tokens`, ico('check'));
    refrescar();
    ocupado = false;
  }

  /* ---------- pago (bolsas y membresía) ---------- */
  function abrirPago(op) {
    const hoja = abrirHoja(`
      <p class="eyebrow">${esc(op.eyebrow)}</p>
      <h3 class="so-hoja-tit">${esc(op.titulo)}</h3>
      <div class="so-pago-monto"><b class="num">${F().clp(op.monto)}</b>${op.tokens ? `<span>${moneda('+' + op.tokens)}</span>` : ''}</div>
      <p class="eyebrow">Medio de pago</p>
      <div class="so-medios" role="radiogroup">
        <button type="button" role="radio" data-medio="webpay" aria-checked="true">${ico('rayo')}<span><b>Webpay · Flow</b><small>Débito o crédito · al instante</small></span></button>
        <button type="button" role="radio" data-medio="transferencia" aria-checked="false">${ico('mundo')}<span><b>Transferencia</b><small>El club confirma y llegan solos</small></span></button>
      </div>
      <div data-pago-estado></div>
      <button type="button" class="btn btn-primario btn-bloque" data-pagar>Pagar ${F().clp(op.monto)}</button>
      <p class="so-mano so-centrado">simulado: aquí no se cobra ni un peso</p>`, 'so-hoja-pago');
    let medio = 'webpay';
    hoja.addEventListener('click', async e => {
      const m = e.target.closest('[data-medio]');
      if (m) { medio = m.dataset.medio; hoja.querySelectorAll('[data-medio]').forEach(b => b.setAttribute('aria-checked', b === m ? 'true' : 'false')); rebote(m); return; }
      const pb = e.target.closest('[data-pagar]');
      if (!pb || pb.disabled) return;
      pb.disabled = true;
      const est = hoja.querySelector('[data-pago-estado]');
      const pasos = medio === 'webpay' ? ['Conectando con Webpay…', 'Autorizando con tu banco…', 'Pago aprobado'] : ['Generando datos de transferencia…', 'Pedido en espera: el club confirma'];
      est.innerHTML = `<ul class="so-pasos"></ul>`;
      const ul = est.querySelector('ul');
      for (let i = 0; i < pasos.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<span class="so-giro"></span>${pasos[i]}`;
        ul.appendChild(li);
        await espera(620);
        li.classList.add('hecho'); li.querySelector('.so-giro').outerHTML = ico('check');
      }
      await espera(350);
      if (medio === 'webpay') { await cerrarHoja(); op.alPagar('Webpay'); }
      else {
        pb.textContent = 'Listo, te avisamos';
        pb.disabled = false; pb.removeAttribute('data-pagar'); pb.setAttribute('data-cerrar', '');
        narrar('aviso', 'Transferencia en espera', 'Con transferencia el pedido queda en espera hasta que el club confirma el pago en su panel.');
        later(() => { cerrarHoja(); op.alPagar('Transferencia'); }, 2400);
      }
    });
  }

  function comprarBolsa(id, origen) {
    const b = S().bolsas.find(x => x.id === id); if (!b) return;
    abrirPago({
      eyebrow: 'Cargar tokens', titulo: `Bolsa ${b.tokens} tokens`, monto: b.precio, tokens: b.tokens,
      alPagar: async medio => {
        const so = S().socio;
        if (medio === 'Transferencia') {
          D.notificar({ titulo: 'Transferencia confirmada', txt: `+${b.tokens} tokens ya están en tu billetera.`, propia: true, tipo: 'pago' });
        }
        const destino = raiz.querySelector('[data-saldo-grande]') || raiz.querySelector('[data-saldo]');
        const src = raiz.querySelector(`.so-bolsa[data-id="${id}"]`) || origen;
        if (src && destino && src.isConnected) await D.fx.monedas(src, destino, 12);
        so.tokens += b.tokens;
        so.movs = so.movs || [];
        so.movs.unshift({ fecha: hoy(), txt: `Bolsa ${b.tokens} tokens`, tokens: b.tokens, medio });
        D.guardar();
        actualizarSaldo();
        const ul = raiz.querySelector('.so-movs');
        if (ul) { ul.innerHTML = movsHTML(); ul.firstElementChild && ul.firstElementChild.classList.add('so-nuevo'); }
        if (destino && destino.isConnected) { const r = destino.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top, 36); rebote(destino); }
        narrar('token', `${medio === 'Webpay' ? 'Pago Webpay aprobado' : 'El club confirmó la transferencia'}: +${b.tokens} tokens`, 'Quedan en el libro de movimientos, con fecha y medio de pago. No se pueden editar.');
        D.evento('pago', `Camila R. compró Bolsa ${b.tokens} tokens · ${F().clp(b.precio)} por ${medio}`);
        avisoApp(`+${b.tokens} tokens`, `Tu saldo ahora es ${so.tokens}`, 'token');
        refrescarSiNo('billetera');
      }
    });
  }
  function refrescarSiNo(t) { if (tab !== t) refrescar(); }

  function renovar() {
    abrirPago({
      eyebrow: 'Membresía anual', titulo: `Renovar en ${S().dispensario.nombre}`, monto: 20000,
      alPagar: medio => {
        const so = S().socio;
        so.memFin = D.masDias(so.memFin, 365);
        D.guardar();
        refrescar();
        D.fx.confeti(undefined, undefined, 80);
        narrar('ok', `Membresía renovada hasta ${fechaL(so.memFin)}`, 'Se activa sola al confirmarse el pago. Nada que hacer en el panel.');
        D.evento('pago', `Camila R. renovó su membresía · $20.000 por ${medio}`);
        avisoApp('Membresía renovada', `Activa hasta el ${fechaL(so.memFin)}`, 'membresia');
      }
    });
  }

  /* ---------- subir receta ---------- */
  function subirReceta() {
    const hoja = abrirHoja(`
      <p class="eyebrow">Receta nueva</p>
      <h3 class="so-hoja-tit">Sube tu receta</h3>
      <button type="button" class="so-drop" data-drop>
        ${ico('camara')}<b>Toca para sacar foto o elegir PDF</b><small>JPG, PNG o PDF · máx. 8 MB</small>
      </button>
      <div data-subida></div>
      <p class="so-mano so-centrado">se guarda en una carpeta protegida, solo la ve el club</p>`, 'so-hoja-receta');
    hoja.querySelector('[data-drop]').addEventListener('click', async e => {
      const drop = e.currentTarget; if (drop.disabled) return;
      drop.disabled = true;
      drop.classList.add('cargado');
      drop.innerHTML = `${ico('documento')}<b>receta-dra-mendez.pdf</b><small>1,2 MB</small><span class="progreso"><i style="width:0%"></i></span>`;
      const barra = drop.querySelector('.progreso i');
      requestAnimationFrame(() => { barra.style.width = '100%'; });
      await espera(1100);
      const cont = hoja.querySelector('[data-subida]');
      cont.innerHTML = '<ul class="so-pasos"></ul>';
      const ul = cont.querySelector('ul');
      const nuevaHasta = D.masDias(hoy(), 182);
      const pasos = ['Folio y firma del médico legibles', 'Vigencia: 6 meses', 'Límite: 30 g al mes', 'Revisión del club: aprobada'];
      for (const p of pasos) {
        const li = document.createElement('li'); li.innerHTML = `<span class="so-giro"></span>${p}`; ul.appendChild(li);
        await espera(480); li.classList.add('hecho'); li.querySelector('.so-giro').outerHTML = ico('check');
      }
      const so = S().socio;
      so.recetasPrev = so.recetasPrev || [];
      so.recetasPrev.unshift(Object.assign({}, so.receta));
      so.receta = { medico: so.receta.medico, desde: hoy(), hasta: nuevaHasta, limite: 30, folio: 'RX-' + (90000 + Math.floor(Math.random() * 9999)) };
      D.guardar();
      await espera(300);
      cont.insertAdjacentHTML('beforeend', `<div class="so-exito so-exito-mini"><span class="so-exito-check">${ico('check')}</span><b>Vigente hasta el ${fechaL(nuevaHasta)}</b><span class="so-mano">carrito reactivado</span></div>`);
      const r = cont.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top + 40, 90);
      narrar('ok', `Receta nueva: vigente hasta ${fechaC(nuevaHasta)}`, 'El carrito se reactivó solo. Nadie tuvo que tocar nada en el panel.');
      D.evento('receta', `Camila R. subió receta nueva · vigente hasta ${fechaC(nuevaHasta)}`);
      D.notificar({ titulo: 'Receta aprobada', txt: `Vigente hasta el ${fechaL(nuevaHasta)}. Tu carrito vuelve a funcionar.`, propia: true, tipo: 'receta' });
      await espera(1500);
      await cerrarHoja();
      refrescar();
    });
  }

  /* ---------- firma de recepción ---------- */
  function itemsDePedido(p) {
    return p.items.split(' · ').map(txt => {
      const nom = txt.replace(/ ×\d+$/, '');
      const pr = S().productos.find(x => x.nombre.startsWith(nom) || nom.startsWith(x.nombre));
      return { txt, pr };
    });
  }
  function abrirFirma(id) {
    const p = S().socio.pedidos.find(x => x.id === +id); if (!p) return;
    const hoja = abrirHoja(`
      <div class="so-fi-top"><span class="so-fi-check">${ico('check')}</span><span><h3 class="so-hoja-tit">Entrega recibida</h3><p>¡Disfruta tu tratamiento!</p></span></div>
      <div class="so-card so-fi-ped">
        <div class="so-fi-cab"><b>Pedido #${p.id}</b><small class="dim">${fechaC(p.fecha)}</small></div>
        <ul>${itemsDePedido(p).map(({ txt, pr }) => `<li>${pr ? `<img src="${pr.img}" alt="">` : `<span class="so-fi-sinfoto">${ico('hoja')}</span>`}<span><b>${esc(txt)}</b><small>${pr && pr.gramos ? g(pr.gramos) : pr ? esc(pr.tipo) : ''}</small></span>${pr ? moneda(pr.tokens, 'so-tok-sm') : ''}</li>`).join('')}</ul>
        <div class="so-fi-ent">${ico(p.entrega === 'Retiro' ? 'tienda' : 'camion')}<span>${p.entrega === 'Retiro' ? 'Retiro en local' : 'Entrega a domicilio'}</span><span class="chip ok sin-punto">Entregado</span></div>
      </div>
      <div class="so-card so-fi-firma">
        <div class="so-fi-cab"><span><b>Firma de recepción</b><small class="dim">Dibuja tu firma con el dedo</small></span><button type="button" class="so-link" data-limpiar>Limpiar</button></div>
        <div class="so-lienzo-cont">
          <canvas class="so-lienzo" aria-label="Firma aquí con el dedo o el mouse"></canvas>
          <span class="so-lienzo-guia">firma aquí</span>
          <span class="so-lienzo-linea"></span>
        </div>
      </div>
      <button type="button" class="btn btn-bloque so-btn-verde" data-confirmar disabled>Confirmar recepción</button>
      <p class="so-mano so-centrado">el club recibe el comprobante al tiro</p>`, 'so-hoja-firma so-hoja-alta');
    const cv = hoja.querySelector('canvas');
    const conf = hoja.querySelector('[data-confirmar]');
    const lienzo = prepararLienzo(cv, () => { conf.disabled = false; hoja.querySelector('.so-lienzo-guia').classList.add('oculta'); });
    hoja.querySelector('[data-limpiar]').addEventListener('click', () => { lienzo.limpiar(); conf.disabled = true; hoja.querySelector('.so-lienzo-guia').classList.remove('oculta'); });
    conf.addEventListener('click', async () => {
      conf.disabled = true;
      const cont = hoja.querySelector('.so-lienzo-cont');
      cont.insertAdjacentHTML('beforeend', `<span class="so-sello"><b>Entrega firmada</b><small class="mono">#${p.id} · ${fechaC(hoy())}</small></span>`);
      p.firmado = true; p.firmaFecha = hoy();
      D.guardar();
      narrar('firma', `Entrega firmada: pedido #${p.id}`, 'Firma con el dedo, sin contraseña. El comprobante con la imagen llega al panel del club.');
      D.evento('firma', `Pedido #${p.id} firmado al recibir por Camila R.`);
      await espera(1700);
      await cerrarHoja();
      avisoApp('Recepción confirmada', `Pedido #${p.id} · comprobante enviado al club`, 'firma');
      refrescar();
    });
  }

  function prepararLienzo(cv, alTrazar) {
    const ctx = cv.getContext('2d');
    let pts = [], dibujando = false, hubo = false;
    function ajustar() {
      const r = cv.getBoundingClientRect(), dpr = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = getComputedStyle(cv).color;
    }
    requestAnimationFrame(ajustar);
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    cv.addEventListener('pointerdown', e => {
      e.preventDefault(); cv.setPointerCapture(e.pointerId);
      if (!cv.width || cv.width < 10) ajustar();
      dibujando = true; pts = [pos(e)];
      ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 1.3, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
    });
    cv.addEventListener('pointermove', e => {
      if (!dibujando) return;
      const p = pos(e); pts.push(p);
      if (pts.length < 3) return;
      const [a, b, c] = pts.slice(-3);
      const v = Math.hypot(c.x - b.x, c.y - b.y) / Math.max(1, c.t - b.t);
      ctx.lineWidth = Math.max(1.4, Math.min(3.6, 3.6 - v * 1.2));
      const m1 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, m2 = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
      ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.quadraticCurveTo(b.x, b.y, m2.x, m2.y); ctx.stroke();
      if (!hubo && pts.length > 6) { hubo = true; alTrazar(); }
    });
    const fin = () => { dibujando = false; };
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    return { limpiar() { ctx.clearRect(0, 0, cv.width, cv.height); hubo = false; } };
  }

  /* ---------- privacidad (Ley 21.719) ---------- */
  function descargarDatos() {
    const so = S().socio;
    const datos = { exportado: hoy(), club: S().dispensario.nombre, socio: { nombre: so.nombre, rut: so.rut, email: so.email }, membresia: { inicio: so.memInicio, fin: so.memFin }, receta: so.receta, recetas_anteriores: so.recetasPrev, consumo_diario_g: so.consumoDiario, pedidos: so.pedidos, movimientos: so.movs, nota: 'Datos ficticios de demostración.' };
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'mis-datos-demo.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) { }
    D.fx.toast('Tus datos, en un archivo', 'Derecho de acceso: listo en un clic.', ico('descarga'));
    narrar('ley', 'Ley 21.719: derecho de acceso', 'El socio descarga todo lo que el club guarda de él, sin pedirlo por correo.');
  }
  function corregirDatos() {
    const so = S().socio;
    const hoja = abrirHoja(`
      <p class="eyebrow">Derecho de rectificación</p>
      <h3 class="so-hoja-tit">Corregir mis datos</h3>
      <div class="so-form">
        <div class="campo"><label for="so-c-nom">Nombre</label><input id="so-c-nom" value="${esc(so.nombre)}" autocomplete="name"></div>
        <div class="campo"><label for="so-c-mail">Correo</label><input id="so-c-mail" type="email" value="${esc(so.email)}" autocomplete="email"></div>
        <div class="campo"><label for="so-c-tel">Teléfono</label><input id="so-c-tel" type="tel" value="+56 9 5555 0142" autocomplete="tel"></div>
      </div>
      <button type="button" class="btn btn-primario btn-bloque" data-guardar>Guardar cambios</button>`, 'so-hoja-form');
    hoja.querySelector('[data-guardar]').addEventListener('click', async () => {
      const nom = hoja.querySelector('#so-c-nom').value.trim(), mail = hoja.querySelector('#so-c-mail').value.trim();
      if (nom) { so.nombre = nom; so.primer = nom.split(/\s+/)[0]; }
      if (mail) so.email = mail;
      D.guardar();
      await cerrarHoja(); refrescar();
      D.fx.toast('Datos corregidos', 'Quedó registro de quién y cuándo.', ico('check'));
      narrar('ley', 'Ley 21.719: derecho de rectificación', 'El socio corrige sus datos; el cambio queda registrado con fecha.');
    });
  }
  function borrarDatos() {
    const hoja = abrirHoja(`
      <p class="eyebrow">Derecho de supresión</p>
      <h3 class="so-hoja-tit">¿Pedir que borren tus datos?</h3>
      <p class="so-texto-hoja">El club recibe tu solicitud y te responde dentro del plazo legal. Lo que exige la normativa sanitaria (recetas y dispensaciones) se conserva el tiempo obligatorio; todo lo demás se borra, incluidos los archivos.</p>
      <button type="button" class="btn btn-peligro btn-bloque" data-pedir>Enviar solicitud</button>
      <button type="button" class="btn btn-fantasma btn-bloque" data-cerrar>Mejor no</button>
      <p class="so-mano so-centrado">atención ordenada y trazable</p>`, 'so-hoja-form');
    hoja.querySelector('[data-pedir]').addEventListener('click', async () => {
      await cerrarHoja();
      D.fx.toast('Solicitud enviada', 'El club te responde por correo.', ico('check'));
      narrar('ley', 'Ley 21.719: derecho de supresión', 'La solicitud llega al panel con fecha. Se borra con archivos, respetando lo que la ley sanitaria obliga a guardar.');
      D.evento('ley', 'Camila R. pidió supresión de datos · plazo legal corriendo');
    });
  }
  function toggleComunicados(input) {
    const so = S().socio; so.comunicadosOn = input.checked; D.guardar();
    if (input.checked) D.fx.toast('Comunicados activados', 'Vuelves a recibir novedades del club.', ico('comunicado'));
    else D.fx.toast('Listo, sin comunicados', 'Los avisos de tu receta siguen: son de seguridad.', ico('check'));
    narrar('ley', input.checked ? 'Consentimiento: comunicados activados' : 'Oposición: dejar de recibir comunicados', 'El segmento de envíos lo respeta automáticamente. Los avisos de receta no se apagan.');
  }

  /* ============================================================
     Presentador: adelantar calendario
     ============================================================ */
  async function adelantar() {
    if (ocupado) return;
    ocupado = true;
    await cerrarHoja(true);
    const so = S().socio;
    const hasta = so.receta.hasta;
    let cruzo = false;
    let d = hoy();
    const pasos = D.diasEntre(d, DESTINO);
    narrar('info', `Adelantando el calendario ${pasos} días…`, 'La revisión diaria corre sola cada mañana, como en el sistema real.');
    const dia = raiz.querySelector('[data-fecha-dia]'), mes = raiz.querySelector('[data-fecha-mes]');
    const velocidad = reducido() ? 0 : Math.max(18, 1400 / pasos);
    while (d < DESTINO) {
      d = D.masDias(d, 1);
      S().fechaSimulada = d;
      const [, m, dd] = d.split('-');
      if (dia) { dia.textContent = +dd; mes.textContent = MES_LARGO[m - 1]; }
      const ctrl = raiz.querySelector('.so-ruta');
      if (ctrl) {
        const tot = D.diasEntre(S().hoy, DESTINO), p = D.diasEntre(S().hoy, d) / tot * 100;
        ctrl.querySelector('.so-ruta-barra i').style.width = p + '%';
        ctrl.querySelector('.so-ruta-punto').style.left = p + '%';
      }
      if (!cruzo && d > hasta) {
        cruzo = true;
        refrescar();
        narrar('alerta', `${fechaC(hasta)}: la receta venció`, 'El sistema lo detectó solo en la revisión diaria.');
        await espera(500);
        narrar('alerta', 'Carrito en pausa automáticamente', 'No se puede canjear con receta vencida: ni en la app ni en el mesón.');
        D.notificar({ titulo: 'Tu receta venció', txt: 'El carrito queda en pausa hasta que subas la nueva. Tu membresía sigue activa.', propia: true, tipo: 'receta' });
        D.evento('bloqueo', 'Carrito en pausa a Camila R. · receta vencida');
        await espera(500);
      }
      if (velocidad) await new Promise(r => setTimeout(r, velocidad));
    }
    D.guardar();
    D.emit('calendario', d);
    refrescar();
    if (cruzo || !D.recetaVigente()) narrar('ok', `La membresía sigue activa: ${D.diasMembresia()} días`, 'Receta y membresía son ciclos separados. Vencer una no corta la otra.');
    else narrar('ok', `Receta aún vigente hasta ${fechaC(so.receta.hasta)}`, 'Nada que pausar: el carrito sigue funcionando.');
    ocupado = false;
    if (cruzo) { cambiarTab('tienda'); later(() => { if (raiz) abrirCarrito(); }, 650); }
  }
  async function volverHoy() {
    if (ocupado) return;
    await cerrarHoja(true);
    S().fechaSimulada = null;
    D.guardar();
    D.emit('calendario', hoy());
    refrescar();
    narrar('info', 'Calendario de vuelta a hoy: 14 oct', D.recetaVigente() ? `Receta vigente hasta ${fechaC(S().socio.receta.hasta)}.` : 'La receta sigue vencida.');
  }

  function simComunicado() {
    D.notificar({ titulo: 'Nueva cosecha: Rainbow Guava', txt: 'Sativa indoor, ideal para el día. Stock limitado.', tipo: 'producto' });
    D.evento('comunicado', 'Comunicado «Nueva cosecha» enviado a 121 socios con receta vigente');
  }
  function simEntrega() {
    const so = S().socio;
    const p = so.pedidos.find(x => x.estado !== 'entregado');
    if (!p) { D.fx.toast('No hay pedidos en preparación', 'Canjea algo en la Tienda primero.', ico('carrito')); narrar('info', 'Sin pedidos por entregar', 'Haz un canje en la Tienda y luego márcalo como entregado.'); return; }
    p.estado = 'entregado'; p.firmado = false;
    D.guardar();
    D.notificar({ titulo: `Tu pedido #${p.id} fue entregado`, txt: 'Firma la recepción con el dedo: toma 5 segundos.', tipo: 'pedido' });
    D.evento('entrega', `Pedido #${p.id} entregado a Camila R. · firma pendiente`);
    refrescar();
  }

  /* ============================================================
     Pull to refresh (visual, táctil)
     ============================================================ */
  function pullToRefresh() {
    let y0 = null, dy = 0, pag = null;
    paginas.addEventListener('touchstart', e => {
      pag = e.target.closest('.so-pag');
      if (!pag || pag.scrollTop > 0 || pantalla.querySelector('.so-hoja-cont')) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    paginas.addEventListener('touchmove', e => {
      if (y0 == null || !pag) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      const inn = pag.querySelector('.so-pag-in');
      if (inn) inn.style.transform = `translateY(${Math.min(80, dy * .4)}px)`;
      let ind = paginas.querySelector('.so-ptr');
      if (!ind && dy > 10) { ind = document.createElement('span'); ind.className = 'so-ptr'; ind.innerHTML = ico('hoja'); paginas.appendChild(ind); }
      if (ind) ind.style.setProperty('--p', Math.min(1, dy / 140));
    }, { passive: true });
    paginas.addEventListener('touchend', () => {
      if (y0 == null || !pag) return;
      const inn = pag.querySelector('.so-pag-in'); if (inn) { inn.style.transition = 'transform .35s var(--rebote)'; inn.style.transform = ''; later(() => { inn.style.transition = ''; }, 400); }
      const ind = paginas.querySelector('.so-ptr');
      if (dy > 120 && ind) { ind.classList.add('gira'); later(() => { ind.remove(); refrescar(); avisoApp('Todo al día', 'Saldo, receta y pedidos sincronizados', 'actualizar'); }, 800); }
      else if (ind) ind.remove();
      y0 = null;
    });
  }

  /* ============================================================
     Clicks (delegación)
     ============================================================ */
  function alClick(e) {
    const t = e.target;
    if (t.closest('[data-cerrar]')) { cerrarHoja(); return; }
    const tb = t.closest('.so-tabbar [data-tab]');
    if (tb) { rebote(tb); cambiarTab(tb.dataset.tab); return; }
    const ir = t.closest('[data-ir]');
    if (ir) { rebote(ir); cambiarTab(ir.dataset.ir); return; }
    const a = t.closest('[data-acc]');
    if (!a) return;
    const acc = a.dataset.acc, id = a.dataset.id;
    if (a.matches('input')) return; // switches se manejan en change
    rebote(a);
    switch (acc) {
      case 'notifs': abrirNotifs(); break;
      case 'filtro': filtro = id; raiz.querySelectorAll('.so-chipf').forEach(c => c.setAttribute('aria-selected', c.dataset.id === id ? 'true' : 'false')); { const gr = raiz.querySelector('[data-grilla]'); if (gr) gr.innerHTML = grilla(); } break;
      case 'ficha': abrirFicha(id); break;
      case 'fav': { const n = +id; if (favoritos.has(n)) favoritos.delete(n); else { favoritos.add(n); if (!reducido()) { const r = a.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top + r.height / 2, 12); } } a.setAttribute('aria-pressed', favoritos.has(n)); break; }
      case 'agregar': agregar(id, +(a.dataset.cant || 1), a.closest('.so-prod') ? a.closest('.so-prod').querySelector('img') : a); break;
      case 'carrito': abrirCarrito(); break;
      case 'cant': {
        const it = S().carrito.find(x => x.id === +id);
        if (it) { it.cant += +a.dataset.d; if (it.cant <= 0) S().carrito = S().carrito.filter(x => x !== it); }
        D.guardar(); repintarCarrito(); actualizarContadores(); break;
      }
      case 'entrega': entrega = id; repintarCarrito(); if (id === 'despacho') narrar('info', `Despacho: +${DESPACHO} tokens`, 'El recargo de envío se cobra en tokens, en el mismo canje.'); break;
      case 'canjear': canjear(a); break;
      case 'ir-tienda': cerrarHoja(); cambiarTab('tienda'); break;
      case 'ir-billetera': cerrarHoja(); cambiarTab('billetera'); break;
      case 'ver-pedidos': cerrarHoja(); cambiarTab('perfil'); later(() => { const p = raiz.querySelector('.so-pedidos'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 500); break;
      case 'bolsa': comprarBolsa(id, a); break;
      case 'renovar': renovar(); break;
      case 'subir-receta': subirReceta(); break;
      case 'firmar': abrirFirma(id); break;
      case 'priv-descargar': descargarDatos(); break;
      case 'priv-corregir': corregirDatos(); break;
      case 'priv-borrar': borrarDatos(); break;
      case 'adelantar': adelantar(); break;
      case 'volver-hoy': volverHoy(); break;
      case 'sim-comunicado': simComunicado(); break;
      case 'sim-entrega': simEntrega(); break;
    }
  }
  function alEscribir(e) {
    if (!e.target.matches('[data-buscar]')) return;
    busqueda = e.target.value;
    const gr = raiz.querySelector('[data-grilla]'); if (gr) gr.innerHTML = grilla();
  }
  function alCambiar(e) {
    if (e.target.matches('[data-acc="priv-comunicados"]')) toggleComunicados(e.target);
  }

  /* ============================================================
     Eventos compartidos
     ============================================================ */
  function alNotificar(n) {
    if (!raiz) return;
    actualizarContadores();
    raiz.querySelectorAll('.so-campana').forEach(c => { c.classList.remove('so-suena'); void c.offsetWidth; c.classList.add('so-suena'); });
    avisoApp(n.titulo || 'Aviso nuevo', n.txt || '', NOT_ICO[n.tipo] || 'campana');
    if (!n.propia) narrar('info', 'Llegó un aviso a la campanita', `«${n.titulo}». Lo que el club envía desde el panel aparece aquí al instante.`);
    const lista = pantalla.querySelector('[data-notifs]');
    if (lista) lista.innerHTML = notifsHTML();
    if (!pantalla.querySelector('.so-hoja-cont') && (tab === 'perfil' || tab === 'inicio')) refrescar();
  }
  function alReiniciar() {
    if (!raiz) return;
    sembrar();
    tab = 'inicio'; filtro = 'todos'; entrega = 'retiro'; ocupado = false;
    cerrarHoja(true);
    paginas.innerHTML = '';
    cambiarTab('inicio', true);
    const ctrl = raiz.querySelector('[data-control]'); if (ctrl) ctrl.innerHTML = controlCalendario();
    const l = raiz.querySelector('.so-narr-lista'); if (l) { l.innerHTML = ''; narrarInicio(); }
  }

  /* ============================================================
     Contrato de vista
     ============================================================ */
  D.views.socio = {
    titulo: 'App del socio',
    render(el) {
      if (!D.state || !D.state.socio) { el.innerHTML = '<p style="padding:40px;text-align:center">Cargando la app…</p>'; return; }
      sembrar();
      el.innerHTML = estructura();
      raiz = el.querySelector('.so-escena');
      pantalla = raiz.querySelector('.so-pantalla');
      paginas = raiz.querySelector('.so-paginas');
      tab = 'inicio'; ocupado = false;
      const pag = document.createElement('div'); pag.className = 'so-pag'; paginas.appendChild(pag);
      llenar(pag, false);
      marcarTabbar();
      narrarInicio();
      raiz.addEventListener('click', alClick);
      raiz.addEventListener('change', alCambiar);
      raiz.addEventListener('input', alEscribir);
      pullToRefresh();
      escuchar('notificacion', alNotificar);
      escuchar('reinicio', alReiniciar);
    },
    salir() {
      timers.forEach(clearTimeout); timers = [];
      oyentes.forEach(([e, f]) => D.off(e, f)); oyentes.length = 0;
      document.querySelectorAll('.so-vuela').forEach(x => x.remove());
      raiz = pantalla = paginas = null;
      ocupado = false;
    }
  };
})();
