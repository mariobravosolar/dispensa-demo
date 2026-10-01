/* ============================================================
   Dispensa — vista «panel»: el panel del DUEÑO del dispensario.
   Escritorio: barra lateral + contenido. Celular (<720 px): app con
   barra inferior y hojas deslizables.
   Prefijo de clases: .pn-   (estilos en css/v-panel.css)
   ============================================================ */
(function () {
  const D = window.DEMO;
  if (!D) return;
  const ico = (n, c) => D.ico(n, c);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clp = n => D.fmt.clp(n);
  const g = n => D.fmt.g(n);
  const num = n => Math.round(n).toLocaleString('es-CL');
  const clpM = n => '$' + (n / 1e6).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' M';
  const esMovil = () => matchMedia('(max-width: 720px)').matches;
  const reducido = () => !!(D.fx && D.fx.reducido);
  const espera = ms => new Promise(r => setTimeout(r, reducido() ? 0 : ms));
  const iniciales = n => String(n).split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const corto = n => { const p = String(n).split(' '); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : ''); };
  const dias = f => D.diasEntre(D.hoy(), f);
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const DIAS_S = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  /* ---------- estado de la vista ---------- */
  let raiz = null, seccion = 'resumen', vivo = 0;
  let timers = [], secTimers = [], limpiezas = [];
  let pedidos = null, campanaNuevos = 0;
  const uiInicial = () => ({
    filtro: 'todos', busca: '', solTab: 'pendiente', solSel: null, pedFiltro: 'todos', invFiltro: 'todo',
    pres: { id: 100, modo: 'canje', items: {}, bolsa: 'b55', medio: 'Efectivo', busca: '' },
    com: { asunto: 'Llegó Celestial Gas 🌙', mensaje: 'Hola {nombre}, llegó Celestial Gas: indoor premium, solo 12 unidades. Ya está en tu tienda.', seg: 'receta', correo: true, campana: true, enviando: false },
    fiscalCorriendo: false
  });
  let ui = uiInicial();
  const T = (fn, ms, lista) => { const id = setTimeout(fn, ms); (lista || timers).push(id); return id; };

  /* datos propios del panel dentro del estado compartido (se crean al vuelo) */
  function P() {
    const s = D.state;
    if (!s.panel) s.panel = { acento: 'naranja', acentoLibre: null, goteo: 0, reglas: { gracia: 15, despacho: 5, cupo: 40, avisoReceta: '30 · 15 · 7 · 0', avisoMem: '60 · 30 · 15 · 7 · 0' } };
    return s.panel;
  }
  const seg = id => (D.state.segmentos.find(x => x.id === id) || { n: 0 }).n;

  /* ---------- socios (Camila = socia de la demo, con datos vivos) ---------- */
  function socioVivo(s) {
    if (s.id !== 100) return s;
    const c = D.state.socio;
    return Object.assign({}, s, { nombre: c.nombre, tokens: c.tokens, recFin: c.receta.hasta, memFin: c.memFin, limite: c.receta.limite, consumido: D.gramosMes(), camila: true });
  }
  const socios = () => D.state.socios.map(socioVivo);
  const socioPorId = id => socios().find(s => s.id === +id);
  function estReceta(s) {
    const d = dias(s.recFin);
    if (d < 0) return { cls: 'alerta', txt: 'Vencida', det: `hace ${-d} d`, d };
    if (d <= 30) return { cls: 'aviso', txt: d === 0 ? 'Vence hoy' : `Vence en ${d} d`, det: D.fmt.fechaCorta(s.recFin), d };
    return { cls: 'ok', txt: 'Vigente', det: `hasta ${D.fmt.fechaCorta(s.recFin)}`, d };
  }
  function estMem(s) {
    const d = dias(s.memFin), gr = P().reglas.gracia;
    if (d < -gr) return { cls: 'alerta', txt: 'Vencida', d };
    if (d < 0) return { cls: 'alerta', txt: `En gracia · ${gr + d} d`, d };
    if (d <= 30) return { cls: 'aviso', txt: `${d} días`, d };
    return { cls: 'ok', txt: `${d} días`, d };
  }
  /** Las MISMAS reglas del carrito del socio. Para Camila usa DEMO.puedeCanjear. */
  function reglas(s, tokens, gramos) {
    if (s.camila) return D.puedeCanjear(tokens, gramos);
    if (dias(s.recFin) < 0) return { ok: false, motivo: 'receta', txt: 'La receta venció. El carrito queda en pausa hasta que suba la nueva. La membresía sigue activa.' };
    if (dias(s.memFin) < -P().reglas.gracia) return { ok: false, motivo: 'membresia', txt: 'La membresía venció. Renuévala aquí mismo y vuelve a canjear.' };
    const disp = Math.max(0, s.limite - s.consumido);
    if (gramos > disp) return { ok: false, motivo: 'gramaje', txt: `Supera el gramaje autorizado. Le quedan ${g(disp)} este mes.` };
    if (tokens > s.tokens) return { ok: false, motivo: 'tokens', txt: `Le faltan ${tokens - s.tokens} tokens. Puede hacer un aporte en efectivo.` };
    return { ok: true };
  }
  const disponibles = s => Math.max(0, s.limite - s.consumido);
  function semilla(n) { let r = n * 9301 + 49297; return () => (r = (r * 9301 + 49297) % 233280) / 233280; }

  /* ---------- pedidos (lista del panel + los de Camila en vivo) ---------- */
  function pedidosBase() {
    return [
      { id: 2058, socio: 'Tomás Fuentes', items: 'Celestial Gas 5 g + Ungüento CBD', tokens: 65, gramos: 5, entrega: 'Despacho · Ñuñoa', estado: 'preparando', firma: null, fecha: D.hoy() },
      { id: 2057, socio: 'Antonia Reyes', items: 'Aceite CBD 1500 mg', tokens: 45, gramos: 0, entrega: 'Despacho · Viña del Mar', estado: 'en-camino', firma: 'pendiente', fecha: D.hoy() },
      { id: 2056, socio: 'Martín Silva', items: 'Púrpura 5 g × 2', tokens: 48, gramos: 10, entrega: 'Retiro en local', estado: 'preparando', firma: null, fecha: D.hoy() },
      { id: 2053, socio: 'Isidora Vargas', items: 'Lemon Octane CBD 8 g', tokens: 30, gramos: 8, entrega: 'Despacho · Providencia', estado: 'en-camino', firma: 'pendiente', fecha: D.masDias(D.hoy(), -1) },
      { id: 2051, socio: 'Valentina Soto', items: 'White Wedding 5 g', tokens: 36, gramos: 5, entrega: 'Despacho · Valparaíso', estado: 'entregado', firma: 'firmada', fecha: D.masDias(D.hoy(), -1) },
      { id: 2049, socio: 'Lucas Morales', items: 'Sour Diesel 5 g', tokens: 25, gramos: 5, entrega: 'Retiro en local', estado: 'entregado', firma: 'firmada', fecha: D.masDias(D.hoy(), -2) },
      { id: 2046, socio: 'Florencia Díaz', items: 'Ungüento CBD', tokens: 20, gramos: 0, entrega: 'Despacho · Viña del Mar', estado: 'entregado', firma: 'pendiente', fecha: D.masDias(D.hoy(), -3) }
    ];
  }
  function listaPedidos() {
    if (!pedidos) pedidos = pedidosBase();
    const c = D.state.socio;
    (c.pedidos || []).forEach(p => {
      let x = pedidos.find(q => q.id === p.id);
      const est = p.estado === 'entregado' ? 'entregado' : (/camino/.test(p.estado || '') ? 'en-camino' : 'preparando');
      if (!x) {
        x = { id: p.id, socio: c.nombre, items: p.items, tokens: p.tokens, gramos: p.gramos, entrega: p.entrega || 'Despacho · Providencia', estado: est, firma: p.firmado ? 'firmada' : (est !== 'preparando' ? 'pendiente' : null), camila: true, fecha: p.fecha };
        pedidos.push(x);
      } else if (p.firmado && x.firma !== 'firmada') { x.firma = 'firmada'; x.estado = 'entregado'; x.recien = true; }
    });
    D.state.eventos.forEach(e => {
      if (e.tipo !== 'firma' || !/firmad/i.test(e.txt)) return;
      const m = /#(\d+)/.exec(e.txt); if (!m) return;
      const x = pedidos.find(q => q.id === +m[1]);
      if (x && x.firma !== 'firmada') { x.firma = 'firmada'; x.estado = 'entregado'; x.recien = true; }
    });
    return pedidos.sort((a, b) => b.id - a.id);
  }
  const sinFirma = () => listaPedidos().filter(p => p.firma === 'pendiente' || p.estado === 'preparando').length;
  const pendientes = () => D.state.solicitudes.filter(s => !s.estado || s.estado === 'pendiente');
  const stockBajo = () => D.state.productos.filter(p => p.stock <= 12).length;

  function trazo(seed) {
    const r = semilla(seed); let x = 10, d = `M${x} ${34 + r() * 8}`;
    for (let i = 0; i < 6; i++) { const nx = x + 18 + r() * 12, y = 14 + r() * 32; d += ` Q${(x + nx) / 2 - 4} ${y - 22 + r() * 44} ${nx} ${y}`; x = nx; }
    d += ` M${24 + r() * 20} ${46 + r() * 4} C${70} ${40}, ${120} ${52}, ${x + 8} ${42}`;
    return d;
  }
  const firmaSvg = (p, cls) => `<svg class="pn-trazo ${cls || ''} ${p.recien ? 'pn-dibuja' : ''}" viewBox="0 0 200 60" aria-label="Firma de ${esc(p.socio)}"><path d="${trazo(p.id)}" pathLength="1"/></svg>`;

  /* ---------- fechas ---------- */
  function fechaLarga() {
    const [y, m, d] = D.hoy().split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return `${DIAS_S[dt.getDay()]} ${d} de ${MESES[m - 1]}`;
  }
  const horaAhora = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  /* ---------- métricas del resumen ---------- */
  const canjesHoy = () => 11 + D.state.eventos.filter(e => e.tipo === 'canje').length;
  function ventasMes() {
    let extra = 0;
    D.state.eventos.forEach(e => { if (e.tipo === 'pago' || e.tipo === 'aporte') { const m = /\$([\d.]+)/.exec(e.txt); if (m) extra += +m[1].replace(/\./g, ''); } });
    return 3850000 + extra;
  }
  const TIPOS = {
    canje: { i: 'token', c: 'miel' }, firma: { i: 'firma', c: 'ok' }, receta: { i: 'receta', c: 'aviso' }, bloqueo: { i: 'candado', c: 'alerta' },
    pago: { i: 'billetera', c: 'ok' }, aporte: { i: 'billetera', c: 'ok' }, solicitud: { i: 'documento', c: 'malva' }, auto: { i: 'rayo', c: 'malva' },
    comunicado: { i: 'comunicado', c: 'malva' }, pedido: { i: 'camion', c: 'miel' }, membresia: { i: 'membresia', c: 'ok' }, ajuste: { i: 'engranaje', c: 'malva' }
  };
  const tipoDe = t => TIPOS[t] || { i: 'evento', c: 'malva' };
  const eventoLi = (e, nuevo) => { const t = tipoDe(e.tipo); return `<li class="pn-ev ${nuevo ? 'pn-nuevo' : ''}"><time class="mono">${esc(e.t)}</time><span class="pn-ev-ico pn-c-${t.c}">${ico(t.i)}</span><p>${esc(e.txt)}</p></li>`; };

  /* =====================================================================
     SECCIONES
     ===================================================================== */
  const SECCIONES = [
    { id: 'resumen', nombre: 'Resumen', ico: 'inicio', tecla: '1' },
    { id: 'solicitudes', nombre: 'Solicitudes', ico: 'documento', tecla: '2', badge: () => pendientes().length },
    { id: 'socios', nombre: 'Socios', ico: 'socios', tecla: '3' },
    { id: 'presencial', nombre: 'Atención presencial', ico: 'tienda', tecla: '4' },
    { id: 'pedidos', nombre: 'Pedidos y firmas', ico: 'firma', tecla: '5', badge: () => sinFirma() },
    { id: 'inventario', nombre: 'Inventario', ico: 'inventario', tecla: '6', badge: () => stockBajo(), tono: 'aviso' },
    { id: 'tokens', nombre: 'Tokens', ico: 'token', tecla: '7' },
    { id: 'comunicados', nombre: 'Comunicados', ico: 'comunicado', tecla: '8', corto: 'Comunicar' },
    { id: 'fiscalizacion', nombre: 'Fiscalización', ico: 'fiscalizacion', tecla: '9' },
    { id: 'ajustes', nombre: 'Ajustes y marca', ico: 'engranaje', tecla: '0' }
  ];
  const secPorId = id => SECCIONES.find(s => s.id === id);
  const TABS = ['resumen', 'solicitudes', 'socios', 'comunicados'];

  const cabecera = (eyebrow, titulo, sub, extra) => `
    <header class="pn-cab">
      <div><p class="eyebrow">${eyebrow}</p><h1 class="pn-h1">${titulo}</h1>${sub ? `<p class="pn-sub">${sub}</p>` : ''}</div>
      ${extra || ''}
    </header>`;

  /* ---------------------------- 1. RESUMEN ---------------------------- */
  const RESUELTAS = [
    { i: 'carrito', n: 3, t: 'Carritos pausados por receta vencida', s: 'la membresía sigue activa' },
    { i: 'receta', n: 14, t: 'Recordatorios de receta enviados', s: 'a 30, 15 y 7 días · sin duplicados' },
    { i: 'comunicado', n: 9, t: 'Avisos de renovación enviados', s: 'con el enlace de pago incluido' },
    { i: 'membresia', n: 2, t: 'Membresías activadas tras el pago', s: 'Webpay · sin tocar nada' },
    { i: 'firma', n: 4, t: 'Seguimientos de firma pendiente', s: 'recordatorio al socio a los 3 días' }
  ];
  const BENEFICIOS = [['engranaje', 'Automatiza tareas repetitivas'], ['whatsapp', 'Menos WhatsApp'], ['documento', 'Trazabilidad lista'], ['escudo', 'Cumplimiento en regla']];
  function kpis() {
    return [
      { i: 'socios', l: 'Socios activos', v: seg('todos'), d: '+6 este mes', ir: 'socios', tono: 'ok' },
      { i: 'carrito', l: 'Canjes hoy', v: canjesHoy(), d: '+18% vs. el miércoles pasado', ir: 'pedidos', tono: 'miel', k: 'canjes' },
      { i: 'billetera', l: `Tokens vendidos · ${MESES[+D.hoy().slice(5, 7) - 1]}`, v: ventasMes(), f: 'clpM', d: '+12% vs. el mes anterior', ir: 'tokens', tono: 'ok', k: 'ventas' },
      { i: 'receta', l: 'Recetas por vencer', v: seg('rec30'), d: 'en 30 días · ya avisadas', ir: 'socios', filtro: 'porvencer', tono: 'alerta' },
      { i: 'membresia', l: 'Membresías por vencer', v: seg('mem30'), d: 'en 30 días · cobro listo', ir: 'socios', filtro: 'mem', tono: 'miel' }
    ];
  }
  const resumen = {
    html() {
      const s = D.state;
      const total = RESUELTAS.reduce((a, b) => a + b.n, 0);
      const semana = s.ventasSemana.reduce((a, b) => a + b.clp, 0);
      return `
      <div class="pn-hola">
        <div>
          <h1 class="pn-h1 pn-retro">Hola, <span class="pn-oro">Diego</span> ${ico('hoja', 'pn-hola-hoja')}</h1>
          <p class="pn-sub">Aquí tienes el resumen de ${esc(s.dispensario.nombre)}. <span class="pn-fecha">${fechaLarga()}</span></p>
        </div>
        <p class="pn-mano pn-hola-mano">hoy el sistema ya hizo<br><b>${total} cosas</b> por ti</p>
      </div>
      <div class="pn-kpis">
        ${kpis().map((k, i) => `
          <button type="button" class="pn-kpi pn-t-${k.tono}" data-ir="${k.ir}" ${k.filtro ? `data-filtro="${k.filtro}"` : ''} style="--i:${i}">
            <span class="pn-kpi-ico">${ico(k.i)}</span>
            <b class="num" data-cuenta="${k.v}" data-f="${k.f || ''}" ${k.k ? `data-kpi="${k.k}"` : ''}>${k.f === 'clpM' ? clpM(k.v) : num(k.v)}</b>
            <small>${k.l}</small>
            <em>${k.d}</em>
          </button>`).join('')}
      </div>
      <div class="pn-res-grid">
        <div class="pn-col pn-col-a">
        <section class="pn-card pn-ventas">
          <div class="pn-card-cab">
            <div><h2 class="pn-h2">Ventas de la semana</h2><div class="pn-leyenda"><span><i class="pn-l-clp"></i>Aportes CLP</span><span><i class="pn-l-tok"></i>Tokens canjeados</span></div></div>
            <div class="pn-ventas-total"><b class="num">${clp(semana)}</b><small class="pn-ok">+16% ↗</small></div>
          </div>
          <div class="pn-grafico" id="pn-grafico"></div>
        </section>
        <section class="pn-card pn-resuelto">
          <div class="pn-card-cab"><h2 class="pn-h2">${ico('engranaje', 'pn-h2-ico')}Alertas que el sistema ya resolvió por ti</h2><span class="pn-etiqueta">${total} acciones automáticas</span></div>
          <ul class="pn-resueltas">
            ${RESUELTAS.map((r, i) => `<li style="--i:${i}"><span class="pn-res-ok">${ico('check')}</span><span class="pn-res-ico">${ico(r.i)}</span><div><p>${r.t} <b class="num">· ${r.n}</b></p><small>${r.s}</small></div><em>Resuelto automáticamente</em></li>`).join('')}
          </ul>
          <p class="pn-mano pn-resuelto-mano">mientras dormías</p>
        </section>
        </div>
        <div class="pn-col pn-col-b">
        <button type="button" class="pn-card pn-presahora" data-ir="presencial">
          <span class="pn-presahora-ico">${ico('socios')}</span>
          <span><small>Atención presencial ahora</small><b><span class="pn-oro num">3</span> personas en espera</b><span class="pn-presahora-cta">Ver en tiempo real ${ico('flecha')}</span></span>
          <span class="pn-presahora-flecha">${ico('flecha')}</span>
        </button>
        <section class="pn-card pn-vivo">
          <div class="pn-card-cab">
            <h2 class="pn-h2">${ico('grafico', 'pn-h2-ico')}Historial en vivo</h2>
            <span class="pn-envivo"><i></i>En vivo</span>
          </div>
          <p class="pn-mini">Lo que hace el socio en su app aparece aquí al instante.</p>
          <ul class="pn-eventos">${s.eventos.slice(0, 7).map(e => eventoLi(e)).join('')}</ul>
        </section>
        </div>
      </div>
      <div class="pn-beneficios">
        ${BENEFICIOS.map(([i, t]) => `<span>${ico(i)}${t}</span>`).join('')}
        <p class="pn-retro">Todo en regla, <br>todo en orden.</p>
      </div>`;
    },
    montar(c) {
      c.querySelectorAll('[data-cuenta]').forEach(b => {
        const v = +b.dataset.cuenta, f = b.dataset.f === 'clpM' ? clpM : num;
        b.dataset.valor = 0; D.fx.contar(b, v, 1100, f);
      });
      pintarGrafico();
      // goteo de eventos para que el panel se sienta vivo durante la presentación
      const GOTEO = [
        ['canje', 'Antonia R. canjeó Rainbow Guava 5 g · −39 tokens'],
        ['pago', 'Lucas M. compró Bolsa 55 tokens · $50.000 por Webpay'],
        ['firma', 'Pedido #2057 firmado al recibir por Antonia R.'],
        ['receta', 'Florencia D. subió su receta nueva · vigente hasta abr 2027']
      ];
      const siguiente = () => {
        const p = P(); if (p.goteo >= GOTEO.length || seccion !== 'resumen') return;
        const [t, x] = GOTEO[p.goteo++]; D.evento(t, x);
        T(siguiente, 16000, secTimers);
      };
      T(siguiente, 9000, secTimers);
    }
  };

  function pintarGrafico() {
    const cont = raiz && raiz.querySelector('#pn-grafico'); if (!cont) return;
    const v = D.state.ventasSemana;
    const W = Math.max(300, cont.clientWidth || 600), H = esMovil() ? 220 : 250, pl = 58, pr = 8, pt = 12, pb = 30;
    const max = Math.ceil(Math.max(...v.map(x => Math.max(x.clp, x.tokens * 1000))) / 200000) * 200000;
    const iw = W - pl - pr, ih = H - pt - pb, gw = iw / v.length, bw = Math.min(26, gw * .3);
    const [yy, mm, dd] = D.hoy().split('-').map(Number); const hoyIdx = (new Date(yy, mm - 1, dd).getDay() + 6) % 7;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Gráfico de ventas de la semana">`;
    for (let i = 0; i <= 4; i++) {
      const y = pt + ih - ih * i / 4;
      s += `<line class="pn-g-linea" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text class="pn-g-eje" x="${pl - 8}" y="${y + 4}" text-anchor="end">${i ? '$' + (max * i / 4 / 1000) + ' mil' : '0'}</text>`;
    }
    v.forEach((d, i) => {
      const cx = pl + gw * i + gw / 2, h1 = ih * d.clp / max, h2 = ih * d.tokens * 1000 / max;
      s += `<g class="pn-g-dia ${i === hoyIdx ? 'hoy' : ''}" data-i="${i}">
        <rect class="pn-g-hit" x="${pl + gw * i}" y="${pt}" width="${gw}" height="${ih}" rx="10"/>
        <rect class="pn-barra pn-b-clp" x="${cx - bw - 3}" y="${pt + ih - h1}" width="${bw}" height="${h1}" rx="6" style="--i:${i}"/>
        <rect class="pn-barra pn-b-tok" x="${cx + 3}" y="${pt + ih - h2}" width="${bw}" height="${h2}" rx="6" style="--i:${i}"/>
        <text class="pn-g-dia-t" x="${cx}" y="${H - 8}" text-anchor="middle">${d.d}${i === hoyIdx ? ' ·hoy' : ''}</text></g>`;
    });
    s += '</svg><div class="pn-tip" hidden></div>';
    cont.innerHTML = s;
    const tip = cont.querySelector('.pn-tip');
    const mostrar = gEl => {
      const i = +gEl.dataset.i, d = v[i];
      cont.querySelectorAll('.pn-g-dia').forEach(x => x.classList.toggle('activo', x === gEl));
      tip.innerHTML = `<b>${d.d}</b><span><i class="pn-l-clp"></i>${clp(d.clp)}</span><span><i class="pn-l-tok"></i>${num(d.tokens)} tokens</span>`;
      tip.hidden = false;
      const x = (pl + gw * i + gw / 2) / W * 100;
      tip.style.left = Math.min(82, Math.max(18, x)) + '%';
    };
    cont.querySelectorAll('.pn-g-dia').forEach(gEl => {
      gEl.addEventListener('pointerenter', () => mostrar(gEl));
      gEl.addEventListener('click', () => mostrar(gEl));
    });
    cont.addEventListener('pointerleave', () => { tip.hidden = true; cont.querySelectorAll('.pn-g-dia').forEach(x => x.classList.remove('activo')); });
  }

  /* --------------------------- 2. SOLICITUDES -------------------------- */
  function respuestas(s) {
    if (Array.isArray(s.respuestas)) return s.respuestas.map(r => Array.isArray(r) ? r : [r.p || r.pregunta, r.r || r.respuesta]);
    if (s.respuestas && typeof s.respuestas === 'object') return Object.entries(s.respuestas);
    return [
      ['RUT', `${s.rut || '16.482.' + (100 + (s.edad || 30) * 7) + '-K'}  ✓ dígito verificador válido`],
      ['Edad', `${s.edad || '—'} años`],
      ['Comuna', s.comuna || '—'],
      ['Motivo de consulta', s.motivo || '—'],
      ['Tratamientos previos', 'Kinesiología y antiinflamatorios por dos años, sin mejora sostenida.'],
      ['¿Ha usado cannabis antes?', 'Sí, de forma ocasional y sin supervisión médica.'],
      ['Receta declarada', s.receta || '—'],
      ['¿Cómo nos conoció?', 'Recomendación de otra socia']
    ];
  }
  const adjuntoSvg = tipo => {
    if (tipo === 'cedula') return `<svg viewBox="0 0 120 76"><rect x="4" y="4" width="112" height="68" rx="8" class="pn-adj-fondo"/><rect x="12" y="14" width="30" height="38" rx="5" class="pn-adj-foto"/><circle cx="27" cy="28" r="7" class="pn-adj-linea"/><path d="M17 48c2-6 6-9 10-9s8 3 10 9" class="pn-adj-linea"/><path d="M52 18h52M52 28h40M52 38h48M52 48h30" class="pn-adj-linea"/><path d="M12 62h96" class="pn-adj-linea pn-adj-fina"/></svg>`;
    if (tipo === 'reverso') return `<svg viewBox="0 0 120 76"><rect x="4" y="4" width="112" height="68" rx="8" class="pn-adj-fondo"/><path d="M14 18h92M14 26h92M14 34h70" class="pn-adj-linea pn-adj-fina"/><path d="M14 52h92M14 58h92M14 64h92" class="pn-adj-linea"/></svg>`;
    return `<svg viewBox="0 0 90 116"><rect x="4" y="4" width="82" height="108" rx="6" class="pn-adj-fondo"/><path d="M14 18h40M14 30h62M14 38h62M14 46h50M14 58h62M14 66h44" class="pn-adj-linea pn-adj-fina"/>${tipo === 'receta' ? '<path d="M20 90c6 0 8-10 14-10s2 8 7 8 6-5 9-5 3 3 10 3" class="pn-adj-firma"/><circle cx="66" cy="92" r="11" class="pn-adj-sello"/>' : '<rect x="14" y="80" width="30" height="10" rx="3" class="pn-adj-sello"/>'}</svg>`;
  };
  function fichaSolicitud(s) {
    if (!s) return `<div class="pn-vacio">${ico('check', 'pn-vacio-ico')}<p class="pn-mano">Bandeja al día.</p><small>Cuando alguien postule desde el sitio, aparece aquí al instante.</small></div>`;
    const estado = s.estado || 'pendiente';
    const falta = !!s.incompleta;
    const adj = [['cedula', 'Cédula · frente'], ['reverso', 'Cédula · reverso'], ['doc', 'Antecedentes'], ['receta', 'Receta médica']];
    return `
      <div class="pn-ficha-sol" data-sol="${esc(s.id)}">
        <div class="pn-fs-cab">
          <span class="pn-avatar pn-avatar-l">${iniciales(s.nombre)}</span>
          <div><p class="eyebrow mono">${esc(s.id)} · ${esc(s.hace || 'ahora')}</p><h2 class="pn-h2">${esc(s.nombre)}</h2><p class="pn-mini">${esc(s.edad || '')}${s.edad ? ' años · ' : ''}${esc(s.comuna || '')}</p></div>
          ${estado !== 'pendiente' ? `<span class="chip ${estado === 'aprobada' ? 'ok' : 'alerta'}">${estado === 'aprobada' ? 'Aprobada' : 'No admitida'}</span>` : (falta ? '<span class="chip aviso">Falta receta</span>' : '<span class="chip ok">Completa</span>')}
        </div>
        <h3 class="pn-h3">Entrevista</h3>
        <dl class="pn-resp">${respuestas(s).map(([p, r]) => `<div><dt>${esc(p)}</dt><dd>${esc(r)}</dd></div>`).join('')}</dl>
        <h3 class="pn-h3">Adjuntos <small class="pn-mini">protegidos · solo el comité los ve</small></h3>
        <div class="pn-adjuntos">
          ${adj.map(([t, n]) => (t === 'receta' && falta)
            ? `<div class="pn-adj pn-adj-falta">${ico('adjunto')}<b>${n}</b><small>No la adjuntó</small></div>`
            : `<button type="button" class="pn-adj" data-accion="ver-adjunto" data-n="${esc(n)}">${adjuntoSvg(t)}<b>${n}</b><small class="pn-ok">✓ OK${t === 'receta' ? ' · coincide' : ''}</small></button>`).join('')}
        </div>
        <button type="button" class="btn btn-fantasma btn-sm pn-pdf" data-accion="pdf">${ico('descarga')}<span>Descargar entrevista en PDF</span></button>
        ${estado === 'pendiente' ? `
        <div class="pn-listo">
          <p><b>${ico('hoja')}${falta ? 'Al aprobar, en automático' : 'Todo listo para aprobar'}</b></p>
          <ul>${['Cuenta creada', falta ? 'Receta: queda pendiente, carrito en pausa' : 'Receta traspasada', 'Cobro de membresía', 'Correo de bienvenida'].map(x => `<li>${ico('check')}${x}</li>`).join('')}</ul>
        </div>
        <button type="button" class="btn btn-primario btn-bloque pn-aprobar-grande" data-accion="aprobar" data-id="${esc(s.id)}">Aprobar en 1 clic ${ico('flecha')}</button>
        <div class="pn-decidir">
          <button type="button" class="btn btn-fantasma" data-accion="comentar" data-id="${esc(s.id)}">${ico('correo')}Comentar</button>
          <button type="button" class="btn btn-fantasma pn-btn-rechazo" data-accion="rechazar" data-id="${esc(s.id)}">${ico('x')}Rechazar</button>
        </div>
        <p class="pn-mano pn-decidir-nota">tú decides; el sistema hace el resto</p>` : ''}
      </div>`;
  }
  const solicitudes = {
    html() {
      const todas = D.state.solicitudes;
      const cuenta = t => todas.filter(s => (s.estado || 'pendiente') === t).length;
      const lista = todas.filter(s => (s.estado || 'pendiente') === ui.solTab);
      if (!esMovil() && (!ui.solSel || !lista.find(s => s.id === ui.solSel))) ui.solSel = lista[0] ? lista[0].id : null;
      const sel = todas.find(s => s.id === ui.solSel);
      return `
      ${cabecera('Comité de admisión', 'Solicitudes', 'Postulan desde tu sitio, sin cuenta. Tú revisas y decides aquí.')}
      <div class="pn-chips" role="tablist">
        ${[['pendiente', 'Pendientes'], ['aprobada', 'Aprobadas'], ['rechazada', 'No admitidas']].map(([k, n]) => `<button type="button" class="pn-chip" role="tab" aria-selected="${ui.solTab === k}" data-accion="sol-tab" data-v="${k}">${n}<b>${cuenta(k)}</b></button>`).join('')}
      </div>
      <div class="pn-sol-grid">
        <div class="pn-sol-lista">
          ${lista.length ? lista.map((s, i) => `
            <button type="button" class="pn-sol ${s.id === ui.solSel && !esMovil() ? 'activa' : ''}" data-accion="ver-sol" data-id="${esc(s.id)}" style="--i:${i}">
              <span class="pn-avatar">${iniciales(s.nombre)}</span>
              <span class="pn-sol-txt"><b>${esc(s.nombre)}</b><small>${esc(s.motivo || '')}</small>
                <span class="pn-sol-meta">${ico('adjunto')}${s.adjuntos || 0} adjuntos · ${esc(s.receta || '')}</span></span>
              <span class="pn-sol-der"><small>${esc(s.hace || '')}</small>${s.incompleta ? '<span class="chip aviso">Falta receta</span>' : '<span class="chip ok">Completa</span>'}</span>
            </button>`).join('') : `<div class="pn-vacio pn-vacio-sm">${ico('flor', 'pn-vacio-ico')}<p class="pn-mano">${ui.solTab === 'pendiente' ? 'Nada pendiente.' : 'Todavía nada por aquí.'}</p></div>`}
        </div>
        <div class="pn-sol-ficha pn-card">${fichaSolicitud(sel)}</div>
      </div>`;
    }
  };

  async function aprobar(id, btn) {
    const s = D.state.solicitudes.find(x => x.id === id); if (!s || (s.estado && s.estado !== 'pendiente')) return;
    const m = /(\d+)\s*mes/.exec(s.receta || ''), meses = m ? +m[1] : 0;
    const gm = /(\d+)\s*g/.exec(s.receta || ''), cupo = gm ? +gm[1] : P().reglas.cupo;
    const email = String(s.email || (s.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.') + '@correo.cl'));
    const pasos = [
      { i: 'usuario', t: 'Cuenta creada', s: email },
      s.incompleta
        ? { i: 'receta', t: 'Receta pendiente', s: 'el carrito queda en pausa hasta que la suba', aviso: true }
        : { i: 'receta', t: 'Receta traspasada', s: `vigencia ${meses} meses · cupo ${cupo} g/mes` },
      { i: 'membresia', t: 'Cobro de membresía generado', s: '$20.000 · Webpay o transferencia' },
      { i: 'correo', t: 'Correo de bienvenida enviado', s: 'con tu logo y el enlace de pago' },
      { i: 'billetera', t: 'Billetera de tokens creada', s: 'lista para su primer aporte' }
    ];
    const h = abrirLateral(`
      <div class="pn-cadena">
        <p class="eyebrow">Aprobado en 1 clic</p>
        <h2 class="pn-h1 pn-retro">${esc(s.nombre.split(' ')[0])} ya es parte del club</h2>
        <ol>${pasos.map(p => `<li class="${p.aviso ? 'aviso' : ''}"><span class="pn-cad-ico">${ico(p.i)}</span><div><b>${p.t}</b><small>${esc(p.s)}</small></div><span class="pn-cad-ok">${ico(p.aviso ? 'reloj' : 'check')}</span></li>`).join('')}</ol>
        <p class="pn-mano pn-cad-fin">Tú hiciste 1 clic. El sistema hizo 5 cosas.</p>
        <button type="button" class="btn btn-primario btn-bloque" data-accion="cerrar">Seguir con la bandeja ${ico('flecha')}</button>
      </div>`, 'pn-modal');
    // efectos
    s.estado = 'aprobada';
    const r = btn ? btn.getBoundingClientRect() : null;
    D.fx.confeti(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top : innerHeight / 3, 90);
    const yo = vivo;
    const lis = [...h.querySelectorAll('.pn-cadena li')];
    for (const li of lis) { await espera(520); if (yo !== vivo) return; li.classList.add('hecho'); }
    h.querySelector('.pn-cad-fin').classList.add('ver');
    // datos: nuevo socio con billetera en cero
    const nuevo = {
      id: 200 + D.state.socios.length, nombre: s.nombre, email, tokens: 0,
      memFin: D.masDias(D.hoy(), 365), recFin: s.incompleta ? D.masDias(D.hoy(), -1) : D.masDias(D.hoy(), meses * 30 || 90),
      limite: cupo, consumido: 0, comuna: s.comuna || 'Santiago', nuevo: true
    };
    D.state.socios.push(nuevo);
    D.state.segmentos.forEach(x => { if (x.id === 'todos' || x.id === 'sintok' || (x.id === 'receta' && !s.incompleta)) x.n++; });
    D.evento('solicitud', `Comité aprobó a ${corto(s.nombre)} · cuenta, cobro y correo en automático`);
    D.notificar({ titulo: `¡Bienvenida/o a ${D.state.dispensario.nombre}! 🌱`, txt: 'El comité aprobó tu solicitud. Activa tu membresía y haz tu primer aporte.', tipo: 'bienvenida' });
    ui.solSel = null;
    if (seccion === 'solicitudes') repintar();
  }
  function rechazar(id) {
    const s = D.state.solicitudes.find(x => x.id === id); if (!s) return;
    abrirLateral(`
      <div class="pn-dialogo">
        <p class="eyebrow">No admitir</p><h2 class="pn-h2">${esc(s.nombre)}</h2>
        <p class="pn-mini">Le llega un correo respetuoso con tu marca. Nunca se revela a terceros que postuló.</p>
        <div class="campo"><label for="pn-motivo">Motivo (solo lo ve el comité)</label>
          <select id="pn-motivo"><option>No cumple el perfil médico</option><option>Documentación inconsistente</option><option>Otro</option></select></div>
        <div class="pn-dialogo-bot">
          <button type="button" class="btn btn-fantasma" data-accion="cerrar">Volver</button>
          <button type="button" class="btn btn-peligro" data-accion="rechazar-ok" data-id="${esc(id)}">No admitir y avisar</button>
        </div>
      </div>`, 'pn-modal');
  }
  function comentar(id) {
    const s = D.state.solicitudes.find(x => x.id === id); if (!s) return;
    const txt = s.incompleta
      ? `Hola ${s.nombre.split(' ')[0]}, gracias por postular. Para seguir necesitamos tu receta médica vigente. Puedes responder este correo con la foto.`
      : `Hola ${s.nombre.split(' ')[0]}, gracias por postular. ¿Nos podrías contar un poco más sobre tu tratamiento actual?`;
    abrirLateral(`
      <div class="pn-dialogo">
        <p class="eyebrow">Escribirle sin decidir</p><h2 class="pn-h2">Comentario para ${esc(s.nombre.split(' ')[0])}</h2>
        <div class="campo"><label for="pn-coment">Mensaje</label><textarea id="pn-coment" rows="5">${esc(txt)}</textarea></div>
        <p class="pn-mini">${ico('correo')} Se envía por correo con tu logo. La solicitud sigue pendiente.</p>
        <div class="pn-dialogo-bot">
          <button type="button" class="btn btn-fantasma" data-accion="cerrar">Cancelar</button>
          <button type="button" class="btn btn-primario" data-accion="comentar-ok" data-id="${esc(id)}">${ico('correo')}Enviar comentario</button>
        </div>
      </div>`, 'pn-modal');
  }

  /* ----------------------------- 3. SOCIOS ----------------------------- */
  const FILTROS = [
    ['todos', 'Todos', () => true],
    ['vigente', 'Receta vigente', s => estReceta(s).cls === 'ok'],
    ['porvencer', 'Receta por vencer', s => estReceta(s).cls === 'aviso'],
    ['vencida', 'Receta vencida', s => estReceta(s).cls === 'alerta'],
    ['mem', 'Membresía por vencer', s => { const d = dias(s.memFin); return d >= 0 && d <= 30; }],
    ['sintok', 'Sin tokens', s => s.tokens === 0]
  ];
  function sociosFiltrados() {
    const f = (FILTROS.find(x => x[0] === ui.filtro) || FILTROS[0])[2];
    const q = ui.busca.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return socios().filter(f).filter(s => !q || (s.nombre + ' ' + s.email + ' ' + s.comuna).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
  }
  function filasSocios() {
    const l = sociosFiltrados();
    if (!l.length) return `<div class="pn-vacio pn-vacio-sm">${ico('lupa', 'pn-vacio-ico')}<p class="pn-mano">Nadie por aquí con ese filtro.</p><small>Prueba otro chip o limpia la búsqueda.</small></div>`;
    return l.map((s, i) => {
      const r = estReceta(s), m = estMem(s), pct = Math.min(100, s.consumido / s.limite * 100), mp = Math.max(0, Math.min(100, m.d / 365 * 100));
      return `
      <button type="button" class="pn-fila" data-accion="ficha" data-id="${s.id}" style="--i:${Math.min(i, 12)}">
        <span class="pn-f-socio"><span class="pn-avatar">${iniciales(s.nombre)}</span><span><b>${esc(s.nombre)}${s.camila ? ' <em class="pn-demo-tag">app demo</em>' : ''}${s.nuevo ? ' <em class="pn-demo-tag">nueva</em>' : ''}</b><small>${esc(s.comuna)}</small></span></span>
        <span class="pn-f-tok"><span class="moneda">T</span><b class="num">${s.tokens}</b></span>
        <span class="pn-f-mem"><small class="pn-f-lbl">Membresía</small><span class="pn-barrita pn-t-${m.cls}"><i style="width:${mp}%"></i></span><small class="pn-${m.cls}">${m.txt}</small></span>
        <span class="pn-f-rec"><small class="pn-f-lbl">Receta</small><span class="chip ${r.cls}">${r.txt}</span></span>
        <span class="pn-f-gr"><small class="pn-f-lbl">Gramaje del mes</small><span class="pn-barrita pn-t-${pct >= 90 ? 'alerta' : pct >= 70 ? 'aviso' : 'ok'}"><i style="width:${pct}%"></i></span><small class="num">${g(s.consumido)} / ${s.limite} g</small></span>
      </button>`;
    }).join('');
  }
  const sociosSec = {
    html() {
      const todos = socios();
      return `
      ${cabecera('Padrón', 'Socios', `${seg('todos')} socios · receta, membresía y gramaje en una sola mirada.`,
        `<button type="button" class="btn btn-fantasma btn-sm" data-accion="csv-socios">${ico('excel')}Exportar CSV</button>`)}
      <div class="pn-buscador">${ico('lupa')}<input type="search" id="pn-busca-socios" placeholder="Buscar por nombre, correo o comuna" value="${esc(ui.busca)}" autocomplete="off"><kbd>/</kbd></div>
      <div class="pn-chips pn-chips-scroll">
        ${FILTROS.map(([k, n, f]) => `<button type="button" class="pn-chip" aria-pressed="${ui.filtro === k}" data-accion="filtro" data-v="${k}">${n}<b>${todos.filter(f).length}</b></button>`).join('')}
      </div>
      <div class="pn-tabla-cab"><span>Socio</span><span>Tokens</span><span>Membresía</span><span>Receta</span><span>Gramaje del mes</span></div>
      <div class="pn-tabla" id="pn-filas">${filasSocios()}</div>
      <p class="pn-mano pn-pie-nota">mostrando ${todos.length} de ${seg('todos')} · el resto sigue igual de ordenado</p>`;
    },
    montar(c) {
      const inp = c.querySelector('#pn-busca-socios');
      inp.addEventListener('input', () => { ui.busca = inp.value; c.querySelector('#pn-filas').innerHTML = filasSocios(); });
    }
  };
  function fichaSocio(id) {
    const s = socioPorId(id); if (!s) return;
    const r = estReceta(s), m = estMem(s), rnd = semilla(s.id);
    const hist = Array.from({ length: 12 }, (_, i) => i === 11 ? s.consumido : Math.round(s.limite * (.35 + rnd() * .6) * 2) / 2);
    const [yy, mm] = D.hoy().split('-').map(Number);
    const meses = Array.from({ length: 12 }, (_, i) => MES_C[(mm - 12 + i + 12) % 12]);
    const max = Math.max(s.limite, ...hist);
    const ped = listaPedidos().filter(p => p.socio === s.nombre).slice(0, 3);
    const pedidosS = ped.length ? ped : [
      { id: 1900 + s.id % 97, items: 'Púrpura 5 g', tokens: 24, fecha: D.masDias(D.hoy(), -9), firma: 'firmada', socio: s.nombre },
      { id: 1850 + s.id % 89, items: 'Aceite CBD 1500 mg', tokens: 45, fecha: D.masDias(D.hoy(), -31), firma: 'firmada', socio: s.nombre }
    ];
    const movs = [
      { t: 'Canje', f: D.masDias(D.hoy(), -5), v: -38, a: 'App del socio' },
      { t: 'Compra Bolsa 55', f: D.masDias(D.hoy(), -12), v: +55, a: 'Webpay' },
      { t: 'Canje en local', f: D.masDias(D.hoy(), -20), v: -24, a: 'Carla (mesón)' },
      { t: 'Devolución automática', f: D.masDias(D.hoy(), -26), v: +20, a: 'Sistema' }
    ];
    const h = abrirLateral(`
      <div class="pn-ficha">
        <div class="pn-fs-cab">
          <span class="pn-avatar pn-avatar-l">${iniciales(s.nombre)}</span>
          <div><h2 class="pn-h2">${esc(s.nombre)}</h2><p class="pn-mini">${esc(s.email)} · ${esc(s.comuna)}</p>
          <div class="pn-fila-chips"><span class="chip ${r.cls}">Receta ${r.txt.toLowerCase()}</span><span class="chip ${m.cls}">Membresía ${m.txt}</span></div></div>
        </div>
        <div class="pn-ficha-stats">
          <div><small>Tokens</small><b class="num">${s.tokens}</b></div>
          <div><small>Disponible</small><b class="num">${g(disponibles(s))}</b></div>
          <div><small>Receta</small><b>${r.det}</b></div>
          <div><small>Cupo</small><b class="num">${s.limite} g/mes</b></div>
        </div>
        <h3 class="pn-h3">Historial de consumo <small class="pn-mini">12 meses · línea = cupo</small></h3>
        <svg class="pn-mini-graf" viewBox="0 0 360 120" role="img" aria-label="Consumo de los últimos 12 meses">
          <line class="pn-g-cupo" x1="0" x2="360" y1="${100 - s.limite / max * 86}" y2="${100 - s.limite / max * 86}"/>
          ${hist.map((v, i) => `<rect class="pn-barra ${i === 11 ? 'pn-b-clp' : 'pn-b-hist'}" x="${i * 30 + 6}" y="${100 - v / max * 86}" width="18" height="${v / max * 86}" rx="4" style="--i:${i}"/><text class="pn-g-eje" x="${i * 30 + 15}" y="116" text-anchor="middle">${meses[i]}</text>`).join('')}
        </svg>
        <h3 class="pn-h3">Pedidos</h3>
        <ul class="pn-lista-simple">${pedidosS.map(p => `<li><span class="mono">#${p.id}</span><span>${esc(p.items)}</span><span class="num">−${p.tokens}</span>${p.firma === 'firmada' ? firmaSvg(Object.assign({}, p, { recien: false }), 'pn-trazo-xs') : '<span class="chip aviso">sin firma</span>'}</li>`).join('')}</ul>
        <h3 class="pn-h3">Movimientos de tokens <small class="pn-mini">inmutables · con autor</small></h3>
        <ul class="pn-lista-simple">${movs.map(x => `<li><span class="mono">${D.fmt.fechaCorta(x.f)}</span><span>${x.t}<small>${x.a}</small></span><span class="num ${x.v > 0 ? 'pn-ok' : ''}">${x.v > 0 ? '+' : '−'}${Math.abs(x.v)}</span></li>`).join('')}</ul>
        <div class="pn-ficha-bot">
          <button type="button" class="btn btn-primario" data-accion="csv-socio" data-id="${s.id}">${ico('descarga')}Exportar historial para fiscalización</button>
          <button type="button" class="btn btn-fantasma" data-accion="atender" data-id="${s.id}">${ico('tienda')}Atender en el mesón</button>
        </div>
      </div>`, 'pn-lado-der');
    h.dataset.hist = JSON.stringify({ hist, meses, movs, pedidosS });
  }

  /* ------------------------ 4. ATENCIÓN PRESENCIAL --------------------- */
  const RAPIDOS = [100, 102, 113, 114];
  function resultadosPres() {
    const q = ui.pres.busca.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const l = q ? socios().filter(s => s.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).slice(0, 6) : RAPIDOS.map(socioPorId).filter(Boolean);
    if (!l.length) return `<p class="pn-mini pn-pad">Nadie con ese nombre. ¿Quizás es una solicitud pendiente?</p>`;
    return l.map(s => { const r = estReceta(s); return `<button type="button" class="pn-res ${ui.pres.id === s.id ? 'activa' : ''}" data-accion="pres-sel" data-id="${s.id}"><span class="pn-avatar">${iniciales(s.nombre)}</span><span><b>${esc(s.nombre)}</b><small>${s.tokens} tokens · ${esc(s.comuna)}</small></span><span class="chip ${r.cls}">${r.txt}</span></button>`; }).join('');
  }
  function totalPres() {
    let t = 0, gr = 0; const nombres = [];
    Object.entries(ui.pres.items).forEach(([id, q]) => { const p = D.state.productos.find(x => x.id === +id); if (p && q > 0) { t += p.tokens * q; gr += p.gramos * q; nombres.push(`${p.nombre}${q > 1 ? ' × ' + q : ''}`); } });
    return { t, gr, nombres };
  }
  function panelPres() {
    const s = ui.pres.id ? socioPorId(ui.pres.id) : null;
    if (!s) return `<div class="pn-vacio">${ico('persona', 'pn-vacio-ico')}<p class="pn-mano">¿A quién atiendes hoy?</p><small>Busca al socio y registra su canje, su aporte o su membresía sin entrar a su cuenta.</small></div>`;
    const r = estReceta(s), m = estMem(s), disp = disponibles(s), pct = Math.min(100, s.consumido / s.limite * 100);
    const modo = ui.pres.modo;
    let cuerpo = '';
    if (modo === 'canje') {
      const { t, gr } = totalPres();
      const v = t ? reglas(s, t, gr) : null;
      cuerpo = `
        <div class="pn-pres-prods">
          ${D.state.productos.map(p => { const q = ui.pres.items[p.id] || 0; return `<div class="pn-pp ${q ? 'on' : ''}"><img src="${p.img}" alt=""><span><b>${esc(p.nombre)}</b><small>${p.tokens} T · ${p.gramos ? g(p.gramos) : 'sin gramaje'}</small></span><span class="pn-stepper"><button type="button" data-accion="pres-q" data-id="${p.id}" data-d="-1" aria-label="Quitar">${ico('menos')}</button><b class="num">${q}</b><button type="button" data-accion="pres-q" data-id="${p.id}" data-d="1" aria-label="Agregar">${ico('mas')}</button></span></div>`; }).join('')}
        </div>
        <div class="pn-pres-total">
          <div><small>Total</small><b class="num">${t} tokens · ${g(gr)}</b></div>
          ${v ? (v.ok ? `<p class="pn-regla ok">${ico('check')}Cumple receta, cupo, membresía y saldo.</p>` : `<p class="pn-regla alerta">${ico('candado')}${esc(v.txt)}</p>`) : '<p class="pn-regla">Agrega productos: se validan con las mismas reglas de la app.</p>'}
          <button type="button" class="btn btn-primario btn-bloque" data-accion="pres-canje" ${v && v.ok ? '' : 'disabled'}>${ico('token')}Registrar canje</button>
        </div>`;
    } else if (modo === 'aporte') {
      cuerpo = `
        <p class="pn-mini">Aporte en el mesón: los tokens caen al tiro en su billetera.</p>
        <div class="pn-pres-bolsas">${D.state.bolsas.map(b => `<button type="button" class="pn-pb ${ui.pres.bolsa === b.id ? 'on' : ''}" data-accion="pres-bolsa" data-id="${b.id}"><span class="moneda">T</span><b class="num">${b.tokens}</b><small>${clp(b.precio)}</small></button>`).join('')}</div>
        <div class="pn-chips">${['Efectivo', 'Débito', 'Transferencia'].map(x => `<button type="button" class="pn-chip" aria-pressed="${ui.pres.medio === x}" data-accion="pres-medio" data-v="${x}">${x}</button>`).join('')}</div>
        <button type="button" class="btn btn-token btn-bloque" data-accion="pres-aporte">${ico('billetera')}Registrar aporte</button>`;
    } else {
      cuerpo = `
        <div class="pn-pres-mem"><span>${ico('membresia')}</span><div><b>Membresía anual · $20.000</b><small>${m.d >= 0 ? `Vence el ${D.fmt.fecha(s.memFin)}` : 'Vencida'} · al pagar suma 12 meses</small></div></div>
        <div class="pn-chips">${['Efectivo', 'Débito', 'Transferencia'].map(x => `<button type="button" class="pn-chip" aria-pressed="${ui.pres.medio === x}" data-accion="pres-medio" data-v="${x}">${x}</button>`).join('')}</div>
        <button type="button" class="btn btn-primario btn-bloque" data-accion="pres-mem">${ico('check')}Registrar pago de membresía</button>
        <p class="pn-mano">con la receta vencida también puede pagarla ✓</p>`;
    }
    return `
      <div class="pn-pres-socio">
        <div class="pn-fs-cab"><span class="pn-avatar pn-avatar-l">${iniciales(s.nombre)}</span><div><h2 class="pn-h2">${esc(s.nombre)}</h2><p class="pn-mini">${esc(s.comuna)}${s.camila ? ' · socia de la app demo' : ''}</p></div></div>
        <div class="pn-pres-estado">
          <div class="pn-pe"><small>Saldo</small><b id="pn-pres-saldo"><span class="moneda">T</span>${s.tokens}</b></div>
          <div class="pn-pe pn-t-${r.cls}"><small>Receta</small><b>${r.txt}</b><em>${r.det}</em></div>
          <div class="pn-pe"><small>Gramos disponibles</small><b>${g(disp)}</b><span class="pn-barrita pn-t-${pct >= 90 ? 'alerta' : 'ok'}"><i style="width:${pct}%"></i></span></div>
          <div class="pn-pe pn-t-${m.cls}"><small>Membresía</small><b>${m.d >= 0 ? m.d + ' días' : 'Vencida'}</b></div>
        </div>
        <div class="pn-seg" role="tablist">
          ${[['canje', 'Canje', 'token'], ['aporte', 'Aporte en efectivo', 'billetera'], ['membresia', 'Membresía', 'membresia']].map(([k, n, i]) => `<button type="button" role="tab" aria-selected="${modo === k}" data-accion="pres-modo" data-v="${k}">${ico(i)}${n}</button>`).join('')}
        </div>
        <div class="pn-pres-cuerpo">${cuerpo}</div>
      </div>`;
  }
  const presencial = {
    html() {
      return `
      ${cabecera('Mesón', 'Atención presencial', 'Sin entrar a la cuenta del socio. Mismas reglas que la app, y queda tu nombre en el registro.')}
      <div class="pn-pres-grid">
        <div class="pn-card pn-pres-busca">
          <div class="pn-buscador">${ico('lupa')}<input type="search" id="pn-busca-pres" placeholder="Nombre o RUT del socio" value="${esc(ui.pres.busca)}" autocomplete="off"></div>
          <p class="eyebrow pn-pad">${ui.pres.busca ? 'Resultados' : 'Frecuentes'}</p>
          <div id="pn-pres-res">${resultadosPres()}</div>
          <p class="pn-mano pn-pad">tip: prueba con Valentina, su receta está vencida</p>
        </div>
        <div class="pn-card pn-pres-panel" id="pn-pres-panel">${panelPres()}</div>
      </div>`;
    },
    montar(c, opts) {
      const inp = c.querySelector('#pn-busca-pres');
      inp.addEventListener('input', () => { ui.pres.busca = inp.value; c.querySelector('#pn-pres-res').innerHTML = resultadosPres(); });
      if (opts && opts.socioId) { ui.pres.id = +opts.socioId; repintarPres(); }
    }
  };
  function repintarPres() {
    const p = raiz && raiz.querySelector('#pn-pres-panel'); if (!p) return;
    p.innerHTML = panelPres();
    const r = raiz.querySelector('#pn-pres-res'); if (r) r.innerHTML = resultadosPres();
  }
  function socioCrudo(id) { return D.state.socios.find(x => x.id === +id); }
  function registrarCanje(btn) {
    const s = socioPorId(ui.pres.id); if (!s) return;
    const { t, gr, nombres } = totalPres(); const v = reglas(s, t, gr);
    if (!v.ok) { btn.classList.add('pn-sacude'); setTimeout(() => btn.classList.remove('pn-sacude'), 500); return; }
    const idPed = Math.max(...listaPedidos().map(p => p.id)) + 1;
    if (s.camila) {
      const c = D.state.socio; c.tokens -= t;
      const dia = +D.hoy().slice(8, 10) - 1; while (c.consumoDiario.length <= dia) c.consumoDiario.push(0);
      c.consumoDiario[dia] = Math.round((c.consumoDiario[dia] + gr) * 10) / 10;
      c.pedidos.unshift({ id: idPed, fecha: D.hoy(), items: nombres.join(' + '), tokens: t, gramos: gr, estado: 'entregado', firmado: true, entrega: 'En el local' });
      D.notificar({ titulo: 'Registramos tu canje en el local', txt: `${nombres.join(' + ')} · −${t} tokens. Te quedan ${c.tokens}.`, tipo: 'tokens' });
      D.emit('saldo', c.tokens);
    } else {
      const x = socioCrudo(s.id); x.tokens -= t; x.consumido = Math.round((x.consumido + gr) * 10) / 10;
    }
    listaPedidos().push({ id: idPed, socio: s.nombre, items: nombres.join(' + '), tokens: t, gramos: gr, entrega: 'En el local', estado: 'entregado', firma: 'firmada', recien: true, fecha: D.hoy(), camila: !!s.camila });
    D.evento('canje', `${corto(s.nombre)} canjeó en el local · −${t} tokens · ${g(gr)} · atendió Diego`);
    D.fx.toast('Canje registrado', `−${t} tokens · firmó en el mesón`, '✓');
    const r = btn.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top, 40);
    ui.pres.items = {};
    repintarPres(); pintarBadges();
  }
  async function registrarAporte(btn) {
    const s = socioPorId(ui.pres.id); const b = D.state.bolsas.find(x => x.id === ui.pres.bolsa); if (!s || !b) return;
    const desde = raiz.querySelector('.pn-pb.on') || btn, hasta = raiz.querySelector('#pn-pres-saldo');
    D.fx.monedas(desde, hasta, 8);
    if (s.camila) {
      D.state.socio.tokens += b.tokens; D.emit('saldo', D.state.socio.tokens);
      D.notificar({ titulo: `Sumaste ${b.tokens} tokens`, txt: `Aporte de ${clp(b.precio)} registrado en el local. Ya están en tu billetera.`, tipo: 'tokens' });
    } else socioCrudo(s.id).tokens += b.tokens;
    D.evento('aporte', `${corto(s.nombre)} aportó ${clp(b.precio)} en ${ui.pres.medio.toLowerCase()} · +${b.tokens} tokens`);
    await espera(900);
    D.fx.toast('Aporte registrado', `+${b.tokens} tokens para ${corto(s.nombre)}`, 'T');
    repintarPres();
  }
  function registrarMem() {
    const s = socioPorId(ui.pres.id); if (!s) return;
    const base = dias(s.memFin) > 0 ? s.memFin : D.hoy();
    const fin = D.masDias(base, 365);
    if (s.camila) { D.state.socio.memFin = fin; D.notificar({ titulo: 'Membresía renovada ✓', txt: `Pagada en el local. Vigente hasta el ${D.fmt.fecha(fin)}.`, tipo: 'membresia' }); }
    else socioCrudo(s.id).memFin = fin;
    D.evento('pago', `${corto(s.nombre)} renovó su membresía en el local · $20.000 en ${ui.pres.medio.toLowerCase()}`);
    D.fx.toast('Membresía renovada', `Hasta el ${D.fmt.fecha(fin)}`, '✓');
    D.fx.confeti(innerWidth / 2, innerHeight / 3, 50);
    repintarPres();
  }

  /* ------------------------- 5. PEDIDOS Y FIRMAS ----------------------- */
  const EST_PED = { preparando: ['aviso', 'Preparando'], 'en-camino': ['lila', 'En camino'], entregado: ['ok', 'Entregado'] };
  const pedidosSec = {
    html() {
      const l = listaPedidos();
      const f = { todos: () => true, preparando: p => p.estado === 'preparando', 'en-camino': p => p.estado === 'en-camino', entregado: p => p.estado === 'entregado', firma: p => p.firma === 'pendiente' }[ui.pedFiltro] || (() => true);
      const firmadas = l.filter(p => p.firma === 'firmada').length, entregados = l.filter(p => p.estado !== 'preparando').length;
      const vis = l.filter(f);
      return `
      ${cabecera('Despacho y retiro', 'Pedidos y firmas', 'Marca «completado» y el socio recibe su enlace para firmar con el dedo.',
        `<div class="pn-mini-kpi"><b class="num">${Math.round((312 + firmadas) / (318 + entregados) * 100)}%</b><small>entregas con firma este mes</small></div>`)}
      <div class="pn-chips pn-chips-scroll">
        ${[['todos', 'Todos'], ['preparando', 'Preparando'], ['en-camino', 'En camino'], ['entregado', 'Entregados'], ['firma', 'Firma pendiente']].map(([k, n]) => `<button type="button" class="pn-chip" aria-pressed="${ui.pedFiltro === k}" data-accion="ped-filtro" data-v="${k}">${n}<b>${k === 'todos' ? l.length : l.filter({ preparando: p => p.estado === 'preparando', 'en-camino': p => p.estado === 'en-camino', entregado: p => p.estado === 'entregado', firma: p => p.firma === 'pendiente' }[k]).length}</b></button>`).join('')}
      </div>
      <div class="pn-pedidos">
        ${vis.length ? vis.map((p, i) => {
          const [ec, et] = EST_PED[p.estado];
          return `
          <article class="pn-ped pn-card" style="--i:${Math.min(i, 10)}" data-ped="${p.id}">
            <div class="pn-ped-a"><span class="mono pn-folio">#${p.id}</span><span class="chip ${ec}">${et}</span></div>
            <div class="pn-ped-b"><b>${esc(p.socio)}${p.camila ? ' <em class="pn-demo-tag">app demo</em>' : ''}</b><small>${esc(p.items)}</small><small class="pn-ped-ent">${ico(p.entrega === 'Retiro en local' || p.entrega === 'En el local' ? 'tienda' : 'camion')}${esc(p.entrega)}</small></div>
            <div class="pn-ped-c"><span class="moneda">T</span><b class="num">${p.tokens}</b><small>${p.gramos ? g(p.gramos) : ''}</small></div>
            <div class="pn-ped-firma">${p.firma === 'firmada' ? `${firmaSvg(p)}<small class="pn-ok">${ico('check')}Firmada</small>` : p.firma === 'pendiente' ? `<span class="pn-firma-vacia">${ico('firma')}<small>Esperando firma<br><em>enlace vence en 30 días</em></small></span>` : '<small class="pn-mini">se pide al completar</small>'}</div>
            <div class="pn-ped-acc">
              ${p.estado === 'preparando' ? `<button type="button" class="btn btn-primario btn-sm" data-accion="completar" data-id="${p.id}">${ico('check')}Marcar como completado</button>` : ''}
              ${p.firma === 'pendiente' ? `<button type="button" class="btn btn-fantasma btn-sm" data-accion="${p.camila ? 'simular-firma' : 'reenviar'}" data-id="${p.id}">${ico(p.camila ? 'firma' : 'correo')}${p.camila ? 'Simular firma' : 'Reenviar enlace'}</button>` : ''}
              ${p.firma === 'firmada' ? `<button type="button" class="btn btn-fantasma btn-sm" data-accion="comprobante" data-id="${p.id}">${ico('documento')}Comprobante</button>` : ''}
            </div>
          </article>`;
        }).join('') : `<div class="pn-vacio pn-vacio-sm">${ico('firma', 'pn-vacio-ico')}<p class="pn-mano">Todo firmado.</p></div>`}
      </div>`;
    },
    montar() { listaPedidos().forEach(p => { p.recien = false; }); }
  };
  function completar(id) {
    const p = listaPedidos().find(x => x.id === +id); if (!p) return;
    p.estado = 'en-camino'; p.firma = 'pendiente';
    const quien = corto(p.socio);
    if (p.camila) {
      const q = (D.state.socio.pedidos || []).find(x => x.id === p.id); if (q) { q.estado = 'en-camino'; q.firmado = false; }
      D.notificar({ titulo: 'Tu pedido va en camino, firma al recibir', txt: `Pedido #${p.id}: firma con el dedo cuando lo tengas en la mano. El enlace vence en 30 días.`, tipo: 'firma', pedido: p.id });
      D.emit('pedido', { id: p.id, estado: 'en-camino' });
    } else {
      T(() => { if (p.firma === 'firmada') return; D.evento('firma', `Pedido #${p.id} firmado al recibir por ${quien}`); }, 5200);
    }
    D.evento('pedido', `Pedido #${p.id} completado · enlace de firma enviado a ${quien}`);
    D.fx.toast('Enlace de firma enviado', `${quien} lo recibe en su correo y en la campanita`, '✍');
    repintar();
  }

  /* ---------------------------- 6. INVENTARIO -------------------------- */
  function tarjetaBolsa(b) {
    const porT = b.precio / b.tokens, promo = b.tokens * 1000 > b.precio;
    return `
      <article class="pn-bolsa ${b.destacada ? 'dest' : ''}" data-bolsa-card="${b.id}">
        <div class="pn-bolsa-top"><span class="moneda moneda-l">T</span>${promo ? `<span class="chip ok">Promo +${Math.round((b.tokens * 1000 / b.precio - 1) * 100)}%</span>` : '<span class="chip">Precio base</span>'}</div>
        <label class="pn-edit"><small>Tokens que entrega</small><input type="number" min="1" step="1" value="${b.tokens}" data-bolsa="${b.id}" data-campo="tokens" inputmode="numeric"></label>
        <label class="pn-edit"><small>Precio en CLP</small><input type="number" min="1000" step="1000" value="${b.precio}" data-bolsa="${b.id}" data-campo="precio" inputmode="numeric"></label>
        <p class="pn-mini">${clp(porT)} por token</p>
      </article>`;
  }
  const bloqueBolsas = () => `
    <section class="pn-bloque">
      <div class="pn-card-cab"><div><h2 class="pn-h2">Bolsas de tokens</h2><p class="pn-mini">Precio y tokens son independientes: puedes hacer promociones sin llamar a nadie.</p></div><span class="pn-mano">promociones configurables</span></div>
      <div class="pn-bolsas">${D.state.bolsas.map(tarjetaBolsa).join('')}</div>
    </section>`;
  const inventario = {
    html() {
      const l = D.state.productos.filter(p => ui.invFiltro === 'bajo' ? p.stock <= 12 : true);
      return `
      ${cabecera('Catálogo', 'Inventario', 'Cambia tokens o gramos aquí y la tienda del socio se actualiza al instante.')}
      <div class="pn-chips">
        <button type="button" class="pn-chip" aria-pressed="${ui.invFiltro === 'todo'}" data-accion="inv-filtro" data-v="todo">Todo<b>${D.state.productos.length}</b></button>
        <button type="button" class="pn-chip pn-chip-aviso" aria-pressed="${ui.invFiltro === 'bajo'}" data-accion="inv-filtro" data-v="bajo">Stock bajo<b>${stockBajo()}</b></button>
      </div>
      <div class="pn-prods">
        ${l.map((p, i) => `
          <article class="pn-prod ${p.stock <= 12 ? 'bajo' : ''}" style="--i:${Math.min(i, 10)}" data-prod-card="${p.id}">
            <div class="pn-prod-img"><img src="${p.img}" alt="${esc(p.nombre)}" loading="lazy">${p.stock <= 12 ? `<span class="chip alerta">Stock bajo</span>` : ''}</div>
            <div class="pn-prod-cuerpo">
              <b>${esc(p.nombre)}</b><small>${esc(p.tipo)} · ${esc(p.cultivo)}</small>
              <div class="pn-stock"><span class="pn-barrita pn-t-${p.stock <= 12 ? 'alerta' : p.stock <= 25 ? 'aviso' : 'ok'}"><i style="width:${Math.min(100, p.stock / 70 * 100)}%"></i></span><small class="num"><b data-stock="${p.id}">${p.stock}</b> u.</small><button type="button" class="pn-mini-btn" data-accion="reponer" data-id="${p.id}">+20</button></div>
              <div class="pn-prod-edit">
                <label class="pn-edit"><small>Tokens</small><span class="pn-stepper"><button type="button" data-accion="paso" data-id="${p.id}" data-campo="tokens" data-d="-1" aria-label="Menos">${ico('menos')}</button><input type="number" min="1" value="${p.tokens}" data-prod="${p.id}" data-campo="tokens" inputmode="numeric"><button type="button" data-accion="paso" data-id="${p.id}" data-campo="tokens" data-d="1" aria-label="Más">${ico('mas')}</button></span></label>
                <label class="pn-edit"><small>Gramos</small><span class="pn-stepper"><button type="button" data-accion="paso" data-id="${p.id}" data-campo="gramos" data-d="-0.5" aria-label="Menos">${ico('menos')}</button><input type="number" min="0" step="0.5" value="${p.gramos}" data-prod="${p.id}" data-campo="gramos" inputmode="decimal"><button type="button" data-accion="paso" data-id="${p.id}" data-campo="gramos" data-d="0.5" aria-label="Más">${ico('mas')}</button></span></label>
              </div>
            </div>
          </article>`).join('')}
      </div>
      ${bloqueBolsas()}`;
    }
  };
  function cambiarProducto(id, campo, valor, input) {
    const p = D.state.productos.find(x => x.id === +id); if (!p) return;
    const v = campo === 'gramos' ? Math.max(0, Math.round(valor * 2) / 2) : Math.max(1, Math.round(valor));
    if (isNaN(v) || p[campo] === v) { if (input) input.value = p[campo]; return; }
    p[campo] = v;
    const card = raiz.querySelector(`[data-prod-card="${id}"]`);
    if (card) { const i = card.querySelector(`input[data-campo="${campo}"]`); if (i) i.value = v; card.classList.remove('pn-destello'); void card.offsetWidth; card.classList.add('pn-destello'); }
    D.emit('productos', { id: p.id, campo, valor: v });
    D.fx.toast(`${p.nombre} actualizado`, `${campo === 'tokens' ? v + ' tokens' : g(v)} · ya se ve así en la tienda del socio`, '✓');
  }
  function cambiarBolsa(id, campo, valor) {
    const b = D.state.bolsas.find(x => x.id === id); if (!b) return;
    const v = campo === 'precio' ? Math.max(1000, Math.round(valor / 100) * 100) : Math.max(1, Math.round(valor));
    if (isNaN(v)) return;
    b[campo] = v;
    const card = raiz.querySelector(`[data-bolsa-card="${id}"]`);
    if (card) { card.outerHTML = tarjetaBolsa(b); const n = raiz.querySelector(`[data-bolsa-card="${id}"]`); n.classList.add('pn-destello'); }
    D.emit('bolsas', { id, campo, valor: v });
    D.fx.toast('Bolsa actualizada', `${b.tokens} tokens por ${clp(b.precio)} · visible para los socios`, 'T');
  }

  /* ------------------------------ 7. TOKENS ---------------------------- */
  const tokensSec = {
    html() {
      const circ = socios().reduce((a, s) => a + s.tokens, 0) + 2410;
      const ledger = [
        ['14 oct 10:42', 'Tomás Fuentes', 'Canje', -60, 'App del socio'],
        ['14 oct 09:12', 'Lucas Morales', 'Compra Bolsa 55', +55, 'Webpay'],
        ['13 oct 18:30', 'Josefa Muñoz', 'Devolución parcial', +20, 'Sistema'],
        ['13 oct 17:05', 'Valentina Soto', 'Canje en local', -36, 'Carla (mesón)'],
        ['13 oct 12:48', 'Gabriel Tapia', 'Ajuste manual', +5, 'Diego · «compensación despacho»'],
        ['12 oct 20:11', 'Camila Rojas', 'Compra Bolsa 12', +12, 'Transferencia']
      ];
      return `
      ${cabecera('Billeteras', 'Tokens', 'Bolsas → billetera → canje. Carriles separados: nunca se mezcla una compra con un canje.')}
      <div class="pn-kpis pn-kpis-4">
        <div class="pn-kpi pn-t-ok"><span class="pn-kpi-ico">${ico('token')}</span><small>En circulación</small><b class="num">${num(circ)}</b><em>tokens en billeteras</em></div>
        <div class="pn-kpi pn-t-ok"><span class="pn-kpi-ico">${ico('billetera')}</span><small>Aportes del mes</small><b class="num">${clp(ventasMes())}</b><em>Webpay, transferencia y mesón</em></div>
        <div class="pn-kpi pn-t-ok"><span class="pn-kpi-ico">${ico('carrito')}</span><small>Canjeados del mes</small><b class="num">3.512</b><em>tokens</em></div>
        <div class="pn-kpi pn-t-aviso"><span class="pn-kpi-ico">${ico('actualizar')}</span><small>Devoluciones automáticas</small><b class="num">4</b><em>total y parcial, sin planillas</em></div>
      </div>
      <section class="pn-bloque pn-card">
        <div class="pn-card-cab"><div><h2 class="pn-h2">Libro de movimientos</h2><p class="pn-mini">Inmutable, con autor. Nadie puede borrar un movimiento.</p></div><span class="pn-mano">listo para fiscalización</span></div>
        <div class="pn-ledger">${ledger.map(([f, s, t, v, a]) => `<div class="pn-led"><span class="mono">${f}</span><b>${s}</b><span>${t}<small>${a}</small></span><span class="num ${v > 0 ? 'pn-ok' : 'pn-neg'}">${v > 0 ? '+' : '−'}${Math.abs(v)}</span></div>`).join('')}</div>
      </section>
      ${bloqueBolsas()}`;
    }
  };

  /* ---------------------------- 8. COMUNICADOS ------------------------- */
  const PLANTILLAS = [
    ['Renueva tu receta', 'Tu receta vence pronto', 'Hola {nombre}, tu receta vence pronto. Súbela desde tu app y sigue canjeando sin pausa 🌿'],
    ['Llegó cepa nueva', 'Llegó Celestial Gas 🌙', 'Hola {nombre}, llegó Celestial Gas: indoor premium, solo 12 unidades. Ya está en tu tienda.'],
    ['Horario especial', 'Este sábado cerramos a las 14:00', 'Hola {nombre}: los despachos siguen igual. ¡Buen fin de semana!']
  ];
  const conNombre = t => String(t || '').replace(/\{nombre\}/g, D.state.socio.primer || 'Camila');
  const comunicados = {
    html() {
      const c = ui.com, s = D.state;
      return `
      ${cabecera('Correo + campanita', 'Comunicados', 'Escribe una vez. Le llega al segmento correcto por correo y en la campanita de su app.')}
      <div class="pn-com-grid">
        <section class="pn-card pn-com-form">
          <p class="eyebrow">Plantillas rápidas</p>
          <div class="pn-chips">${PLANTILLAS.map((p, i) => `<button type="button" class="pn-chip" data-accion="plantilla" data-i="${i}">${ico('rayo')}${p[0]}</button>`).join('')}</div>
          <div class="campo"><label for="pn-asunto">Asunto</label><input id="pn-asunto" maxlength="70" placeholder="Ej.: Llegó cepa nueva" value="${esc(c.asunto)}"></div>
          <div class="campo"><label for="pn-mensaje">Mensaje <small class="pn-mini">escribe {nombre} y cada socio ve el suyo</small></label><textarea id="pn-mensaje" rows="4" maxlength="160" placeholder="Hola {nombre}, …">${esc(c.mensaje)}</textarea><span class="pn-contador mono" id="pn-cont">${c.mensaje.length}/160</span></div>
          <p class="eyebrow">Selecciona el segmento</p>
          <div class="pn-chips pn-chips-check">${s.segmentos.map(x => `<button type="button" class="pn-chip" aria-pressed="${c.seg === x.id}" data-accion="segmento" data-v="${x.id}">${esc(x.nombre)}<b>${x.n}</b></button>`).join('')}</div>
          <p class="eyebrow">Canal</p>
          <div class="pn-canales">
            <button type="button" class="pn-canal" aria-pressed="${c.correo}" data-accion="canal" data-v="correo">${ico('correo')}Correo<small>con tu logo</small></button>
            <button type="button" class="pn-canal" aria-pressed="${c.campana}" data-accion="canal" data-v="campana">${ico('campana')}Campanita<small>en su app</small></button>
          </div>
          <div class="pn-envio" id="pn-envio" hidden><div class="progreso"><i style="width:0%"></i></div><p class="mono" id="pn-envio-txt">Preparando…</p></div>
          <button type="button" class="btn btn-arcoiris btn-bloque" data-accion="enviar-com" id="pn-btn-enviar">${ico('comunicado')}Enviar a <span id="pn-n-seg">${seg(c.seg)}</span> socios</button>
          <p class="pn-mano">sale por lotes de 10, sin caer en spam</p>
        </section>
        <aside class="pn-com-lado">
          <p class="eyebrow pn-prev-lbl">Vista previa · así lo ve el socio</p>
          <div class="pn-tel" aria-label="Vista previa en el celular del socio">
            <div class="pn-tel-pant">
              <div class="pn-tel-isla"></div>
              <p class="pn-tel-hora mono">10:4${new Date().getMinutes() % 10}</p>
              <div class="pn-tel-noti ${c.campana ? '' : 'off'}" id="pn-prev-noti">
                <span class="pn-tel-app">${logoMarca('pn-tel-logo')}</span>
                <div><small>${esc(s.dispensario.nombre)} · ahora</small><b id="pn-prev-asunto">${esc(c.asunto || 'Tu asunto aquí')}</b><p id="pn-prev-msg">${esc(conNombre(c.mensaje) || 'Así lo verá el socio en su campanita.')}</p></div>
              </div>
              <div class="pn-tel-mail ${c.correo ? '' : 'off'}" id="pn-prev-mail">
                <div class="pn-tel-mail-cab">${logoMarca('pn-tel-logo')}<b>${esc(s.dispensario.nombre)}</b></div>
                <b id="pn-prev-asunto2">${esc(c.asunto || 'Tu asunto aquí')}</b>
                <p id="pn-prev-msg2">${esc(conNombre(c.mensaje) || 'Y así en su correo, con tu marca.')}</p>
                <span class="pn-tel-mail-btn">Abrir mi app</span>
              </div>
            </div>
          </div>
          <section class="pn-card pn-historial">
            <h2 class="pn-h3">Historial</h2>
            <ul>${s.comunicados.map(x => `<li data-com="${x.id}"><div><b>${esc(x.asunto)}</b><small>${esc(x.segmento)} · ${D.fmt.fechaCorta(x.fecha)}</small></div><div class="pn-hist-num"><span class="pn-barrita pn-t-ok"><i style="width:${x.enviados ? x.abiertos / x.enviados * 100 : 0}%"></i></span><small class="num"><b data-abiertos>${x.abiertos}</b> de ${x.enviados} abiertos</small></div></li>`).join('')}</ul>
          </section>
        </aside>
      </div>`;
    },
    montar(c) {
      const a = c.querySelector('#pn-asunto'), m = c.querySelector('#pn-mensaje');
      const upd = () => {
        ui.com.asunto = a.value; ui.com.mensaje = m.value;
        ['#pn-prev-asunto', '#pn-prev-asunto2'].forEach(s => { const e = c.querySelector(s); if (e) e.textContent = a.value || 'Tu asunto aquí'; });
        ['#pn-prev-msg', '#pn-prev-msg2'].forEach(s => { const e = c.querySelector(s); if (e) e.textContent = conNombre(m.value) || 'Así lo verá el socio.'; });
        const k = c.querySelector('#pn-cont'); if (k) k.textContent = m.value.length + '/160';
      };
      a.addEventListener('input', upd); m.addEventListener('input', upd);
    }
  };
  async function enviarComunicado(btn) {
    const c = ui.com; if (c.enviando) return;
    if (!c.asunto.trim()) { const a = raiz.querySelector('#pn-asunto'); a.focus(); a.classList.add('pn-sacude'); setTimeout(() => a.classList.remove('pn-sacude'), 500); D.fx.toast('Falta el asunto', 'Escribe algo corto, o usa una plantilla.', '!'); return; }
    if (!c.correo && !c.campana) { D.fx.toast('Elige un canal', 'Correo, campanita o ambos.', '!'); return; }
    const segm = D.state.segmentos.find(x => x.id === c.seg), n = segm.n, lotes = Math.ceil(n / 10);
    c.enviando = true; btn.disabled = true;
    const caja = raiz.querySelector('#pn-envio'), barra = caja.querySelector('i'), txt = caja.querySelector('#pn-envio-txt');
    caja.hidden = false; const yo = vivo;
    for (let i = 1; i <= lotes; i++) {
      await espera(Math.max(45, 2400 / lotes)); if (yo !== vivo) { c.enviando = false; return; }
      barra.style.width = (i / lotes * 100) + '%';
      txt.textContent = `Lote ${i} de ${lotes} · ${Math.min(n, i * 10)} de ${n} enviados`;
    }
    const nuevo = { id: Date.now(), asunto: c.asunto.trim(), segmento: segm.nombre, enviados: n, abiertos: 0, fecha: D.hoy() };
    D.state.comunicados.unshift(nuevo);
    if (c.campana) D.notificar({ titulo: nuevo.asunto, txt: conNombre(c.mensaje.trim()), tipo: 'comunicado' });
    D.evento('comunicado', `Comunicado «${nuevo.asunto}» enviado a ${n} socios`);
    const r = btn.getBoundingClientRect(); D.fx.confeti(r.left + r.width / 2, r.top, 60);
    D.fx.toast('Comunicado enviado', `${n} socios · ya está en su campanita`, '✉');
    ui.com = Object.assign(uiInicial().com, { asunto: '', mensaje: '', seg: c.seg });
    repintar();
    // los abiertos van subiendo en vivo
    const meta = Math.round(n * .74);
    const sube = () => {
      if (nuevo.abiertos >= meta) return;
      nuevo.abiertos = Math.min(meta, nuevo.abiertos + Math.max(1, Math.round(n / 14)));
      const li = raiz && raiz.querySelector(`[data-com="${nuevo.id}"]`);
      if (li) { li.querySelector('[data-abiertos]').textContent = nuevo.abiertos; li.querySelector('.pn-barrita i').style.width = (nuevo.abiertos / n * 100) + '%'; }
      D.guardar(); T(sube, 650);
    };
    T(sube, 900);
  }

  /* --------------------------- 9. FISCALIZACIÓN ------------------------ */
  const CHECKS = [
    ['Datos completos', '148 de 148 fichas con RUT, receta y consentimiento'],
    ['Recetas vigentes', '121 vigentes · 3 vencidas con carrito pausado solo'],
    ['Entregas firmadas', '312 de 318 · 6 dentro del plazo de 30 días'],
    ['Gramaje dentro del cupo', '0 canjes por sobre lo autorizado'],
    ['Historial exportable', 'consumo, pedidos y tokens por socio, en segundos']
  ];
  const fiscal = {
    html() {
      return `
      ${cabecera('Todo en regla, todo en orden', 'Fiscalización', 'Si mañana llega el fiscalizador, esto es lo que ve. Y lo tienes en 1 clic.')}
      <div class="pn-fis-grid">
        <section class="pn-card pn-fis-modo">
          <div class="pn-card-cab">
            <div class="pn-fis-tit">${ico('escudo')}<div><h2 class="pn-h2">Modo fiscalización</h2><p class="pn-mini">Vista de solo lectura, sin datos que no necesita.</p></div></div>
            <button type="button" class="pn-switch" role="switch" aria-checked="false" data-accion="fiscal" aria-label="Activar modo fiscalización"><i></i></button>
          </div>
          <ul class="pn-checks">${CHECKS.map(([t, d], i) => `<li class="hecho" style="--i:${i}"><span class="pn-chk">${ico('check')}</span><div><b>${t}</b><small>${d}</small></div></li>`).join('')}</ul>
          <div class="pn-fis-score"><svg viewBox="0 0 120 120" class="pn-anillo"><circle cx="60" cy="60" r="50" class="pn-an-fondo"/><circle cx="60" cy="60" r="50" class="pn-an-val" pathLength="100" style="stroke-dashoffset:2"/></svg><div><b class="num" id="pn-score">98%</b><small>cumplimiento · última revisión hoy 08:00</small></div></div>
        </section>
        <section class="pn-card pn-ley">
          <div class="pn-card-cab"><div class="pn-fis-tit">${ico('ley')}<div><h2 class="pn-h2">Ley 21.719 · datos personales</h2><p class="pn-mini">Rige desde el 1 de diciembre de 2026 · en Argentina, REPROCANN</p></div></div></div>
          <div class="pn-ley-blq">
            <div class="pn-ley-num"><b class="num">146<small>/148</small></b><span>consentimientos de datos de salud</span><span class="pn-barrita pn-t-ok"><i style="width:98.6%"></i></span><small class="pn-mini">2 se piden solos en su próximo ingreso</small></div>
          </div>
          <h3 class="pn-h3">Solicitudes de derechos <small class="pn-mini">plazo legal: 30 días</small></h3>
          <ul class="pn-lista-simple">
            <li><span>${ico('ojo')}</span><span>Acceso a sus datos<small>Gabriel T. · ingresó el 6 oct</small></span><span class="chip aviso">quedan 22 d</span></li>
            <li><span>${ico('usuario')}</span><span>Rectificación de domicilio<small>Sofía A.</small></span><span class="chip ok">resuelta en 2 d</span></li>
            <li><span>${ico('x')}</span><span>Supresión de datos<small>ex socio · con sus archivos</small></span><span class="chip aviso">quedan 9 d</span></li>
          </ul>
          <h3 class="pn-h3">Registro de accesos</h3>
          <ul class="pn-lista-simple pn-accesos">
            <li><span class="mono">10:32</span><span>Diego vio la ficha de Tomás F.</span></li>
            <li><span class="mono">10:05</span><span>Carla (mesón) registró un canje de Valentina S.</span></li>
            <li><span class="mono">09:40</span><span>Sistema envió 3 avisos de receta</span></li>
            <li><span class="mono">08:12</span><span>Diego exportó el historial de Ignacio P.</span></li>
          </ul>
        </section>
        <section class="pn-card pn-informe">
          <div class="pn-card-cab"><div><h2 class="pn-h2">Informe para la autoridad</h2><p class="pn-mini">Socios, recetas, gramaje, entregas firmadas y accesos. Firmado y fechado.</p></div></div>
          <div class="pn-doc" id="pn-doc">
            <div class="pn-doc-hoja">
              <div class="pn-doc-cab">${logoMarca('pn-doc-logo')}<div><b>${esc(D.state.dispensario.nombre)}</b><small>Informe de cumplimiento · ${D.fmt.fecha(D.hoy())}</small></div></div>
              ${['Padrón de socios', 'Recetas y vigencias', 'Gramaje por socio', 'Entregas firmadas', 'Registro de accesos'].map((t, i) => `<div class="pn-doc-sec" style="--i:${i}"><b>${i + 1}. ${t}</b><i style="width:${92 - i * 7}%"></i><i style="width:${70 + i * 4}%"></i><i style="width:${54 + i * 6}%"></i></div>`).join('')}
              <span class="pn-sello">LISTO</span>
            </div>
          </div>
          <button type="button" class="btn btn-primario btn-bloque" data-accion="informe" id="pn-btn-informe">${ico('documento')}Generar informe</button>
        </section>
      </div>`;
    }
  };
  async function correrFiscal(sw) {
    if (ui.fiscalCorriendo) return;
    const on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on);
    raiz.querySelector('.pn').classList.toggle('pn-modo-fiscal', on);
    if (!on) { D.fx.toast('Modo fiscalización apagado', 'Vuelves a la vista completa.', '✓'); return; }
    ui.fiscalCorriendo = true; const yo = vivo;
    const lis = [...raiz.querySelectorAll('.pn-checks li')];
    lis.forEach(li => { li.classList.remove('hecho'); li.classList.add('revisando'); });
    const score = raiz.querySelector('#pn-score'), anillo = raiz.querySelector('.pn-an-val');
    anillo.style.strokeDashoffset = 100; score.dataset.valor = 0;
    for (const li of lis) { await espera(480); if (yo !== vivo) return; li.classList.remove('revisando'); li.classList.add('hecho'); }
    anillo.style.strokeDashoffset = 2; D.fx.contar(score, 98, 900, v => Math.round(v) + '%');
    ui.fiscalCorriendo = false;
    D.evento('auto', 'Modo fiscalización activado · 5 de 5 controles en regla');
    D.fx.toast('Todo en regla', '5 de 5 controles · listo para mostrar', '✓');
  }
  async function generarInforme(btn) {
    const doc = raiz.querySelector('#pn-doc'); if (!doc || doc.classList.contains('armando')) return;
    doc.classList.remove('listo'); void doc.offsetWidth; doc.classList.add('armando');
    btn.disabled = true; btn.lastChild.textContent = 'Armando informe…';
    const yo = vivo; await espera(2600); if (yo !== vivo) return;
    doc.classList.remove('armando'); doc.classList.add('listo');
    btn.disabled = false; btn.innerHTML = `${ico('descarga')}Informe listo · 14 páginas (PDF simulado)`;
    D.fx.toast('Informe generado', '14 páginas, firmado y fechado · listo para entregar', '✓');
  }

  /* ----------------------------- 10. AJUSTES --------------------------- */
  const ACENTOS = ['naranja', 'mostaza', 'rosa', 'malva', 'salvia', 'bosque-2'];
  function valorAcento() { const p = P(); return p.acentoLibre || `var(--${p.acento})`; }
  function logoMarca(cls) {
    const l = D.state.dispensario.logo;
    return l ? `<img class="${cls || ''} pn-logo-img" src="${l}" alt="">` : `<span class="${cls || ''} pn-logo-ico"><svg viewBox="0 0 40 40" aria-hidden="true"><path class="pn-esc-borde" d="M20 3 6 8v11c0 9 6 15 14 18 8-3 14-9 14-18V8Z"/><path class="pn-esc-monte" d="m9 27 7-9 4 5 3-3 8 7Z"/><circle class="pn-esc-sol" cx="25" cy="14" r="3"/></svg></span>`;
  }
  const ajustes = {
    html() {
      const d = D.state.dispensario, p = P(), r = p.reglas, modo = document.documentElement.getAttribute('data-modo');
      const regla = (k, t, u, ayuda, tipo) => `<label class="pn-regla-campo"><span><b>${t}</b><small>${ayuda}</small></span><span class="pn-regla-in"><input ${tipo === 'txt' ? 'type="text"' : 'type="number" min="0"'} value="${esc(r[k])}" data-regla="${k}"><em>${u}</em></span></label>`;
      return `
      ${cabecera('Marca blanca', 'Ajustes y marca', 'Tu nombre, tu logo, tus colores y tus reglas. Sin tocar una línea de código.')}
      <div class="pn-aj-grid">
        <section class="pn-card">
          <h2 class="pn-h2">Tu marca</h2>
          <div class="campo"><label for="pn-nombre">Nombre del dispensario</label><input id="pn-nombre" value="${esc(d.nombre)}" maxlength="32"></div>
          <div class="pn-logo-up">
            <span class="pn-logo-prev">${logoMarca('pn-logo-grande')}</span>
            <div><b>Logo</b><small class="pn-mini">PNG o SVG, se ve en el panel, la app y los correos.</small>
              <div class="pn-logo-bots"><label class="btn btn-fantasma btn-sm">${ico('camara')}Subir logo<input type="file" accept="image/*" id="pn-logo-file" hidden></label>${d.logo ? `<button type="button" class="btn btn-fantasma btn-sm" data-accion="quitar-logo">${ico('x')}Quitar</button>` : ''}</div></div>
          </div>
          <p class="eyebrow">Color de acento</p>
          <div class="pn-acentos">${ACENTOS.map(a => `<button type="button" class="pn-acento" style="--c:var(--${a})" aria-pressed="${!p.acentoLibre && p.acento === a}" data-accion="acento" data-v="${a}" aria-label="Acento ${a}"></button>`).join('')}
            <label class="pn-acento pn-acento-libre" aria-pressed="${!!p.acentoLibre}" title="Otro color"><input type="color" id="pn-color" value="${p.acentoLibre || '#FF6B35'}">${ico('mas')}</label></div>
          <p class="eyebrow">Modo de color</p>
          <div class="pn-seg">${[['claro', 'Claro', 'sol'], ['oscuro', 'Oscuro', 'luna'], ['verde', 'Verde', 'hoja']].map(([k, n, i]) => `<button type="button" role="tab" aria-selected="${modo === k}" data-accion="modo" data-v="${k}">${ico(i)}${n}</button>`).join('')}</div>
        </section>
        <section class="pn-card">
          <h2 class="pn-h2">Tus reglas</h2>
          <p class="pn-mini">Aplican desde ahora a toda la operación.</p>
          ${regla('gracia', 'Días de gracia', 'días', 'tras vencer la membresía, antes de pausar el acceso')}
          ${regla('despacho', 'Recargo por despacho', 'tokens', 'el retiro en local no cuesta nada')}
          ${regla('cupo', 'Cupo por defecto', 'g/mes', 'si la receta no indica otro')}
          ${regla('avisoReceta', 'Avisos de receta', 'días antes', 'recordatorios automáticos al socio y a ti', 'txt')}
          ${regla('avisoMem', 'Avisos de membresía', 'días antes', 'con el enlace de pago incluido', 'txt')}
        </section>
        <section class="pn-card pn-aj-prev">
          <h2 class="pn-h2">Así se ve</h2>
          <div class="pn-prev-mail">
            <div class="pn-prev-mail-cab">${logoMarca('pn-prev-logo')}<b data-marca-nombre>${esc(d.nombre)}</b></div>
            <div class="pn-prev-mail-cuerpo"><b>¡Hola, Camila!</b><p>Tu receta vence en 15 días. Súbela desde tu app y sigue canjeando sin pausa.</p><span class="pn-prev-btn">Subir mi receta</span></div>
          </div>
          <p class="pn-mano">cada dispensario, su propia cara</p>
        </section>
      </div>`;
    },
    montar(c) {
      const n = c.querySelector('#pn-nombre');
      n.addEventListener('input', () => { D.state.dispensario.nombre = n.value || 'Mi dispensario'; pintarMarca(); });
      n.addEventListener('change', () => { D.emit('marca', D.state.dispensario); D.fx.toast('Nombre actualizado', 'Panel, app y correos ya lo usan.', '✓'); });
      c.querySelector('#pn-color').addEventListener('input', e => { P().acentoLibre = e.target.value; aplicarAcento(); c.querySelectorAll('.pn-acento').forEach(b => b.setAttribute('aria-pressed', b.classList.contains('pn-acento-libre'))); });
      c.querySelector('#pn-color').addEventListener('change', () => D.emit('marca', D.state.dispensario));
      c.querySelector('#pn-logo-file').addEventListener('change', e => {
        const f = e.target.files && e.target.files[0]; if (!f) return;
        const lector = new FileReader();
        lector.onload = () => {
          const img = new Image();
          img.onload = () => {
            const k = Math.min(1, 240 / Math.max(img.width, img.height));
            const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(img.width * k)); cv.height = Math.max(1, Math.round(img.height * k));
            cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
            let url; try { url = cv.toDataURL('image/png'); } catch (err) { url = lector.result; }
            D.state.dispensario.logo = url; D.emit('marca', D.state.dispensario);
            pintarMarca(); repintar();
            D.fx.toast('Logo actualizado', 'Ya aparece en el panel, la app y los correos.', '✓');
          };
          img.src = lector.result;
        };
        lector.readAsDataURL(f);
      });
    }
  };
  function aplicarAcento() { const n = raiz && raiz.querySelector('.pn'); if (n) n.style.setProperty('--pn-acento', valorAcento()); }
  function pintarMarca() {
    if (!raiz) return;
    const d = D.state.dispensario;
    raiz.querySelectorAll('[data-marca-nombre]').forEach(e => { e.textContent = d.nombre; });
    raiz.querySelectorAll('[data-marca-logo]').forEach(e => { e.innerHTML = logoMarca('pn-marca-logo'); });
  }

  const SEC = { resumen, solicitudes, socios: sociosSec, presencial, pedidos: pedidosSec, inventario, tokens: tokensSec, comunicados, fiscalizacion: fiscal, ajustes };

  /* =====================================================================
     ARMAZÓN, NAVEGACIÓN Y HOJAS
     ===================================================================== */
  function shell() {
    const d = D.state.dispensario;
    return `
    <div class="pn">
      <aside class="pn-lado" aria-label="Menú del panel">
        <div class="pn-producto">${ico('logo')}<span>Dispensa</span></div>
        <div class="pn-marca"><span data-marca-logo>${logoMarca('pn-marca-logo')}</span><div><b data-marca-nombre>${esc(d.nombre)}</b><small>Panel del dueño</small></div></div>
        <nav class="pn-nav">
          ${SECCIONES.map(s => `<button type="button" class="pn-nav-item" data-ir="${s.id}"><span class="pn-nav-ico">${ico(s.ico)}</span><span class="pn-nav-txt">${s.nombre}</span>${s.badge ? `<span class="pn-badge ${s.tono ? 'pn-badge-' + s.tono : ''}" data-badge="${s.id}"></span>` : ''}<kbd>${s.tecla}</kbd></button>`).join('')}
        </nav>
        <div class="pn-lado-pie">
          <svg class="pn-lado-deco" viewBox="0 0 200 70" aria-hidden="true"><path d="M20 66c0-20 6-34 20-44M40 22c-10-2-16-8-18-16 8 1 14 6 18 16ZM40 22c8-4 12-10 12-18-8 3-12 9-12 18Z"/><path d="M150 66V44M136 44a14 12 0 0 1 28 0Z"/><circle cx="146" cy="36" r="1.6"/><circle cx="154" cy="38" r="1.2"/><path d="M178 66V52M172 52a6 5 0 0 1 12 0Z"/><path d="M4 66h192"/></svg>
          <p class="pn-mano">menos caos,<br>más orden</p>
          <p class="pn-atajos"><kbd>1</kbd>–<kbd>0</kbd> secciones · <kbd>/</kbd> buscar · <kbd>Esc</kbd> cerrar</p>
        </div>
      </aside>
      <section class="pn-main">
        <header class="pn-top">
          <div class="pn-top-marca"><span data-marca-logo>${logoMarca('pn-marca-logo')}</span><b data-marca-nombre>${esc(d.nombre)}</b></div>
          <div class="pn-top-busca">${ico('lupa')}<input type="search" id="pn-busca-global" placeholder="Buscar socio, pedido o folio…" autocomplete="off"><kbd>/</kbd><div class="pn-sugs" hidden></div></div>
          <span class="pn-envivo pn-top-vivo"><i></i>En vivo</span>
          <button type="button" class="pn-campana" data-accion="campana" aria-label="Actividad reciente">${ico('campana')}<span class="pn-badge" data-badge="campana" hidden></span></button>
          <span class="pn-yo"><span class="pn-avatar">DM</span><span><b>Diego M.</b><small>Dueño</small></span></span>
        </header>
        <div class="pn-contenido" tabindex="-1"></div>
      </section>
      <nav class="pn-tabbar" aria-label="Secciones">
        ${TABS.map(id => { const s = secPorId(id); return `<button type="button" data-ir="${id}">${ico(s.ico)}<span>${s.corto || s.nombre}</span>${s.badge ? `<span class="badge" data-badge="${id}"></span>` : ''}</button>`; }).join('')}
        <button type="button" data-accion="mas">${ico('menu')}<span>Más</span><span class="badge" data-badge="mas"></span></button>
      </nav>
    </div>`;
  }
  function pintarNav() {
    raiz.querySelectorAll('[data-ir]').forEach(b => {
      if (!b.closest('.pn-nav') && !b.closest('.pn-tabbar') && !b.closest('.pn-mas')) return;
      b.setAttribute('aria-current', b.dataset.ir === seccion ? 'true' : 'false');
    });
    const masAct = !TABS.includes(seccion);
    const m = raiz.querySelector('.pn-tabbar [data-accion="mas"]'); if (m) m.setAttribute('aria-current', masAct ? 'true' : 'false');
  }
  function pintarBadges() {
    if (!raiz) return;
    const vals = {}; SECCIONES.forEach(s => { if (s.badge) vals[s.id] = s.badge(); });
    vals.mas = SECCIONES.filter(s => s.badge && !TABS.includes(s.id)).reduce((a, s) => a + vals[s.id], 0);
    vals.campana = campanaNuevos;
    raiz.querySelectorAll('[data-badge]').forEach(b => {
      const v = vals[b.dataset.badge] || 0;
      if (String(v) !== b.textContent) { b.textContent = v; b.classList.remove('pn-pulso'); void b.offsetWidth; if (b.dataset.visto) b.classList.add('pn-pulso'); }
      b.dataset.visto = 1; b.hidden = !v;
    });
  }
  function ir(id, opts) {
    if (!SEC[id] || !raiz) return;
    secTimers.forEach(clearTimeout); secTimers = [];
    seccion = id; cerrarLateral(true);
    pintarNav();
    const c = raiz.querySelector('.pn-contenido');
    c.innerHTML = SEC[id].html();
    c.classList.remove('pn-entra'); void c.offsetWidth; c.classList.add('pn-entra');
    c.scrollTop = 0; if (esMovil()) window.scrollTo(0, 0);
    if (SEC[id].montar) SEC[id].montar(c, opts);
    pintarBadges();
  }
  function repintar() {
    if (!raiz) return;
    const c = raiz.querySelector('.pn-contenido'), y = c.scrollTop;
    c.innerHTML = SEC[seccion].html();
    if (SEC[seccion].montar && seccion !== 'resumen') SEC[seccion].montar(c);
    else if (seccion === 'resumen') { pintarGrafico(); }
    c.scrollTop = y; pintarBadges();
  }
  function abrirLateral(html, clase) {
    cerrarLateral(true);
    const cont = raiz.querySelector('.pn');
    const velo = document.createElement('div'); velo.className = 'pn-velo';
    const hoja = document.createElement('aside'); hoja.className = 'pn-hoja ' + (clase || '');
    hoja.setAttribute('role', 'dialog'); hoja.setAttribute('aria-modal', 'true');
    hoja.innerHTML = `<button type="button" class="pn-cerrar" data-accion="cerrar" aria-label="Cerrar">${ico('x')}</button>${html}`;
    cont.append(velo, hoja);
    velo.addEventListener('click', () => cerrarLateral());
    return hoja;
  }
  function cerrarLateral(ya) {
    const cont = raiz && raiz.querySelector('.pn'); if (!cont) return;
    cont.querySelectorAll('.pn-velo, .pn-hoja').forEach(n => {
      if (ya || reducido()) n.remove(); else { n.classList.add('sale'); setTimeout(() => n.remove(), 260); }
    });
  }
  function hojaMas() {
    const otros = SECCIONES.filter(s => !TABS.includes(s.id));
    abrirLateral(`
      <div class="pn-mas">
        <p class="eyebrow">Todo el panel</p>
        <div class="pn-mas-grid">${otros.map(s => `<button type="button" data-ir="${s.id}" aria-current="${s.id === seccion}">${ico(s.ico)}<span>${s.nombre}</span>${s.badge && s.badge() ? `<span class="badge">${s.badge()}</span>` : ''}</button>`).join('')}</div>
        <p class="pn-mano">todo el dispensario, en tu bolsillo</p>
      </div>`, 'pn-hoja-mas');
  }
  function descargar(nombre, filas) {
    const csv = filas.map(f => f.map(x => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n');
    const b = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }
  function sugerencias(q) {
    const box = raiz.querySelector('.pn-sugs'); if (!box) return;
    q = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!q) { box.hidden = true; return; }
    const ss = socios().filter(s => s.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).slice(0, 5);
    const ps = listaPedidos().filter(p => String(p.id).includes(q.replace('#', ''))).slice(0, 3);
    box.innerHTML = ss.map(s => `<button type="button" data-accion="ficha" data-id="${s.id}"><span class="pn-avatar">${iniciales(s.nombre)}</span>${esc(s.nombre)}<small>${s.tokens} T</small></button>`).join('')
      + ps.map(p => `<button type="button" data-ir="pedidos"><span class="pn-avatar">${ico('firma')}</span>Pedido #${p.id}<small>${esc(corto(p.socio))}</small></button>`).join('')
      || '<p class="pn-mini pn-pad">Sin resultados</p>';
    box.hidden = false;
  }

  /* ---------- clics delegados ---------- */
  function onClick(e) {
    const irB = e.target.closest('[data-ir]');
    if (irB && raiz.contains(irB)) {
      e.preventDefault();
      if (irB.dataset.filtro) { ui.filtro = irB.dataset.filtro; }
      const box = raiz.querySelector('.pn-sugs'); if (box) box.hidden = true;
      ir(irB.dataset.ir); return;
    }
    const b = e.target.closest('[data-accion]'); if (!b || !raiz.contains(b)) return;
    const a = b.dataset.accion, id = b.dataset.id, v = b.dataset.v;
    switch (a) {
      case 'cerrar': cerrarLateral(); break;
      case 'mas': hojaMas(); break;
      case 'campana': campanaNuevos = 0; pintarBadges(); if (seccion !== 'resumen') ir('resumen'); T(() => { const l = raiz.querySelector('.pn-vivo'); if (l) l.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'center' }); }, 80); break;
      // solicitudes
      case 'sol-tab': ui.solTab = v; ui.solSel = null; repintar(); break;
      case 'ver-sol':
        ui.solSel = id;
        if (esMovil()) abrirLateral(fichaSolicitud(D.state.solicitudes.find(s => s.id === id)), 'pn-lado-der');
        else { raiz.querySelectorAll('.pn-sol').forEach(x => x.classList.toggle('activa', x.dataset.id === id)); const f = raiz.querySelector('.pn-sol-ficha'); f.innerHTML = fichaSolicitud(D.state.solicitudes.find(s => s.id === id)); f.classList.remove('pn-entra'); void f.offsetWidth; f.classList.add('pn-entra'); }
        break;
      case 'aprobar': aprobar(id, b); break;
      case 'rechazar': rechazar(id); break;
      case 'rechazar-ok': {
        const s = D.state.solicitudes.find(x => x.id === id); if (s) { s.estado = 'rechazada'; D.evento('solicitud', `Comité no admitió a ${corto(s.nombre)} · correo enviado con respeto`); }
        cerrarLateral(); ui.solSel = null; D.fx.toast('Solicitud cerrada', 'Se le avisó por correo.', '✓'); repintar(); break;
      }
      case 'comentar': comentar(id); break;
      case 'comentar-ok': {
        const s = D.state.solicitudes.find(x => x.id === id); if (s) D.evento('solicitud', `Comité escribió a ${corto(s.nombre)} · la solicitud sigue pendiente`);
        cerrarLateral(); D.fx.toast('Comentario enviado', 'Le llegó por correo con tu logo.', '✉'); break;
      }
      case 'pdf': {
        if (b.dataset.ok) break; b.dataset.ok = 1; const t = b.querySelector('span');
        t.textContent = 'Armando PDF con fotos…'; b.classList.add('pn-cargando');
        T(() => { t.textContent = 'PDF descargado ✓'; b.classList.remove('pn-cargando'); D.fx.toast('Entrevista en PDF', 'Con fotos incrustadas y casilla de resolución (simulado)', '✓'); T(() => { t.textContent = 'Descargar entrevista en PDF'; delete b.dataset.ok; }, 2600); }, 1400);
        break;
      }
      case 'ver-adjunto': D.fx.toast(b.dataset.n, 'Archivo protegido: solo lo abre el comité.', '🔒'); break;
      // socios
      case 'filtro': ui.filtro = v; repintar(); break;
      case 'ficha': { const box = raiz.querySelector('.pn-sugs'); if (box) box.hidden = true; fichaSocio(id); break; }
      case 'atender': ui.pres.id = +id; ui.pres.items = {}; ui.pres.modo = 'canje'; ir('presencial'); break;
      case 'csv-socios': descargar('socios.csv', [['Socio', 'Correo', 'Comuna', 'Tokens', 'Membresía hasta', 'Receta hasta', 'Consumido (g)', 'Cupo (g)']].concat(sociosFiltrados().map(s => [s.nombre, s.email, s.comuna, s.tokens, s.memFin, s.recFin, s.consumido, s.limite]))); D.fx.toast('CSV descargado', 'Ábrelo en Excel o Google Sheets.', '✓'); break;
      case 'csv-socio': {
        const s = socioPorId(id), h = JSON.parse(b.closest('.pn-hoja').dataset.hist || '{}');
        const filas = [['Historial para fiscalización', s.nombre], ['Receta hasta', s.recFin], ['Cupo mensual (g)', s.limite], [], ['Mes', 'Consumo (g)']].concat((h.meses || []).map((m, i) => [m, h.hist[i]])).concat([[], ['Pedido', 'Detalle', 'Tokens', 'Firma']]).concat((h.pedidosS || []).map(p => ['#' + p.id, p.items, p.tokens, p.firma || ''])).concat([[], ['Fecha', 'Movimiento', 'Tokens', 'Autor']]).concat((h.movs || []).map(m => [m.f, m.t, m.v, m.a]));
        descargar(`historial-${s.nombre.toLowerCase().replace(/\s+/g, '-')}.csv`, filas);
        D.evento('auto', `Diego exportó el historial de ${corto(s.nombre)} para fiscalización`);
        D.fx.toast('Historial exportado', 'Consumo, pedidos, firmas y tokens en un CSV.', '✓'); break;
      }
      // presencial
      case 'pres-sel': ui.pres.id = +id; ui.pres.items = {}; repintarPres(); if (esMovil()) T(() => { const p = raiz.querySelector('#pn-pres-panel'); p && p.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth' }); }, 60); break;
      case 'pres-modo': ui.pres.modo = v; repintarPres(); break;
      case 'pres-q': { const q = (ui.pres.items[id] || 0) + +b.dataset.d; ui.pres.items[id] = Math.max(0, Math.min(9, q)); const y = raiz.querySelector('.pn-pres-prods'); const sc = y ? y.scrollTop : 0; repintarPres(); const y2 = raiz.querySelector('.pn-pres-prods'); if (y2) y2.scrollTop = sc; break; }
      case 'pres-canje': registrarCanje(b); break;
      case 'pres-bolsa': ui.pres.bolsa = id; raiz.querySelectorAll('.pn-pb').forEach(x => x.classList.toggle('on', x.dataset.id === id)); break;
      case 'pres-medio': ui.pres.medio = v; raiz.querySelectorAll('[data-accion="pres-medio"]').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); break;
      case 'pres-aporte': registrarAporte(b); break;
      case 'pres-mem': registrarMem(); break;
      // pedidos
      case 'ped-filtro': ui.pedFiltro = v; repintar(); break;
      case 'completar': completar(id); break;
      case 'simular-firma': { const p = listaPedidos().find(x => x.id === +id); if (p) { const q = (D.state.socio.pedidos || []).find(x => x.id === p.id); if (q) { q.firmado = true; q.estado = 'entregado'; } D.evento('firma', `Pedido #${p.id} firmado al recibir por ${corto(p.socio)}`); } break; }
      case 'reenviar': D.fx.toast('Enlace reenviado', 'Le llega de nuevo por correo y campanita.', '✉'); break;
      case 'comprobante': { const p = listaPedidos().find(x => x.id === +id); abrirLateral(`<div class="pn-dialogo pn-comprobante"><p class="eyebrow">Comprobante de recepción</p><h2 class="pn-h2">Pedido #${p.id}</h2><p>${esc(p.socio)} · ${esc(p.items)}</p><div class="pn-comp-firma">${firmaSvg(Object.assign({}, p, { recien: true }))}</div><p class="pn-mini">Firmado con el dedo · ${D.fmt.fecha(p.fecha || D.hoy())} · imagen protegida · copia enviada a tu correo</p></div>`, 'pn-modal'); break; }
      // inventario
      case 'inv-filtro': ui.invFiltro = v; repintar(); break;
      case 'paso': { const p = D.state.productos.find(x => x.id === +id); if (p) cambiarProducto(id, b.dataset.campo, p[b.dataset.campo] + +b.dataset.d); break; }
      case 'reponer': { const p = D.state.productos.find(x => x.id === +id); if (p) { p.stock += 20; D.emit('productos', { id: p.id, campo: 'stock' }); D.fx.toast('Stock repuesto', `${p.nombre}: ${p.stock} unidades`, '✓'); repintar(); } break; }
      // comunicados
      case 'plantilla': { const p = PLANTILLAS[+b.dataset.i]; ui.com.asunto = p[1]; ui.com.mensaje = p[2]; const a2 = raiz.querySelector('#pn-asunto'), m2 = raiz.querySelector('#pn-mensaje'); a2.value = p[1]; m2.value = p[2]; a2.dispatchEvent(new Event('input')); break; }
      case 'segmento': ui.com.seg = v; raiz.querySelectorAll('[data-accion="segmento"]').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); raiz.querySelector('#pn-n-seg').textContent = seg(v); break;
      case 'canal': ui.com[v] = !ui.com[v]; b.setAttribute('aria-pressed', ui.com[v]); { const el = raiz.querySelector(v === 'correo' ? '#pn-prev-mail' : '#pn-prev-noti'); if (el) el.classList.toggle('off', !ui.com[v]); } break;
      case 'enviar-com': enviarComunicado(b); break;
      // fiscalización
      case 'fiscal': correrFiscal(b); break;
      case 'informe': generarInforme(b); break;
      // ajustes
      case 'acento': P().acento = v; P().acentoLibre = null; aplicarAcento(); raiz.querySelectorAll('.pn-acento').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === v)); D.emit('marca', D.state.dispensario); break;
      case 'modo': { const mb = document.querySelector(`.demobar .modos button[data-modo="${v}"]`); if (mb) mb.click(); else document.documentElement.setAttribute('data-modo', v); break; }
      case 'quitar-logo': delete D.state.dispensario.logo; D.emit('marca', D.state.dispensario); pintarMarca(); repintar(); break;
    }
  }
  function onChange(e) {
    const t = e.target;
    if (t.dataset.prod) cambiarProducto(t.dataset.prod, t.dataset.campo, parseFloat(t.value), t);
    else if (t.dataset.bolsa) cambiarBolsa(t.dataset.bolsa, t.dataset.campo, parseFloat(t.value));
    else if (t.dataset.regla) {
      const k = t.dataset.regla, r = P().reglas;
      r[k] = t.type === 'number' ? Math.max(0, parseInt(t.value, 10) || 0) : t.value.trim();
      t.value = r[k]; D.emit('reglas', r);
      D.evento('ajuste', `Diego cambió una regla: ${t.closest('label').querySelector('b').textContent.toLowerCase()} → ${r[k]}`);
      D.fx.toast('Regla actualizada', 'Aplica desde ahora, sin tocar código.', '✓');
    }
  }
  function onTecla(e) {
    if (!raiz || !document.body.contains(raiz)) return;
    const esc_ = e.key === 'Escape';
    if (esc_) { cerrarLateral(); const box = raiz.querySelector('.pn-sugs'); if (box) box.hidden = true; return; }
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); const i = raiz.querySelector(seccion === 'socios' ? '#pn-busca-socios' : '#pn-busca-global'); if (i && i.offsetParent) i.focus(); return; }
    const s = SECCIONES.find(x => x.tecla === e.key); if (s) { e.preventDefault(); ir(s.id); }
  }
  function onEvento(ev) {
    if (!raiz) return;
    campanaNuevos++;
    const lista = raiz.querySelector('.pn-eventos');
    if (lista && seccion === 'resumen') {
      lista.insertAdjacentHTML('afterbegin', eventoLi({ t: horaAhora(), tipo: ev.tipo, txt: ev.txt }, true));
      while (lista.children.length > 7) lista.lastElementChild.remove();
      const k1 = raiz.querySelector('[data-kpi="canjes"]'); if (k1) D.fx.contar(k1, canjesHoy(), 700, num);
      const k2 = raiz.querySelector('[data-kpi="ventas"]'); if (k2) D.fx.contar(k2, ventasMes(), 900, clpM);
    }
    if (ev.tipo === 'firma' && seccion === 'pedidos') repintar();
    pintarBadges();
  }
  function ajustarAlto() {
    const bar = document.getElementById('demobar');
    if (raiz) raiz.style.setProperty('--pn-barra', (bar ? bar.offsetHeight : 56) + 'px');
    if (seccion === 'resumen') pintarGrafico();
  }

  D.views.panel = {
    titulo: 'Panel del dueño',
    render(el) {
      raiz = el; vivo++;
      el.innerHTML = shell();
      aplicarAcento();
      ajustarAlto();
      el.addEventListener('click', onClick);
      el.addEventListener('change', onChange);
      const glob = el.querySelector('#pn-busca-global');
      glob.addEventListener('input', () => sugerencias(glob.value));
      glob.addEventListener('blur', () => setTimeout(() => { const bx = el.querySelector('.pn-sugs'); if (bx) bx.hidden = true; }, 200));
      let rz; const onRz = () => { clearTimeout(rz); rz = setTimeout(ajustarAlto, 150); };
      addEventListener('resize', onRz); limpiezas.push(() => removeEventListener('resize', onRz));
      const barra = document.getElementById('demobar');
      if (barra && 'ResizeObserver' in window) { const ro = new ResizeObserver(onRz); ro.observe(barra); limpiezas.push(() => ro.disconnect()); }
      addEventListener('keydown', onTecla); limpiezas.push(() => removeEventListener('keydown', onTecla));
      const alTodo = () => pintarBadges();
      const alModo = m => { raiz && raiz.querySelectorAll('[data-accion="modo"]').forEach(x => x.setAttribute('aria-selected', x.dataset.v === m)); };
      const alReinicio = () => { pedidos = null; ui = uiInicial(); campanaNuevos = 0; seccion = 'resumen'; };
      D.on('evento', onEvento); D.on('*', alTodo); D.on('modo', alModo); D.on('reinicio', alReinicio);
      limpiezas.push(() => { D.off('evento', onEvento); D.off('*', alTodo); D.off('modo', alModo); D.off('reinicio', alReinicio); });
      ir(seccion);
    },
    salir() {
      vivo++;
      timers.forEach(clearTimeout); secTimers.forEach(clearTimeout); timers = []; secTimers = [];
      limpiezas.forEach(f => { try { f(); } catch (e) { } }); limpiezas = [];
      if (raiz) { raiz.removeEventListener('click', onClick); raiz.removeEventListener('change', onChange); raiz.style.removeProperty('--pn-barra'); }
      raiz = null;
    }
  };
})();
