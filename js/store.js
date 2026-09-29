/* ============================================================
   Dispensa — estado compartido de la demo
   Todo es ficticio. Las vistas (landing, postular, app, admin) leen y
   escriben aquí, y se avisan cambios con DEMO.on / DEMO.emit, así lo que
   hace el admin aparece en la app del socio y viceversa.
   ============================================================ */
(function () {
  const HOY = new Date(2026, 9, 14); // 14-oct-2026: fecha "de hoy" de la demo
  const dia = 864e5;
  const iso = d => d.toISOString().slice(0, 10);
  const masDias = (d, n) => new Date(d.getTime() + n * dia);

  const productos = [
    { id: 1, nombre: 'Black Amethyst', tipo: 'Flor índica', cultivo: 'Indoor', gramos: 5, tokens: 38, img: 'img/amethyst.jpg', stock: 42, thc: '22%', cbd: '<1%', tag: 'Noche tranquila' },
    { id: 2, nombre: 'White Wedding', tipo: 'Flor híbrida', cultivo: 'Indoor', gramos: 5, tokens: 36, img: 'img/wedding.jpg', stock: 31, thc: '20%', cbd: '<1%', tag: 'Balance' },
    { id: 3, nombre: 'Celestial Gas', tipo: 'Flor índica', cultivo: 'Indoor premium', gramos: 5, tokens: 45, img: 'img/celestial.jpg', stock: 12, thc: '25%', cbd: '<1%', tag: 'Dolor crónico' },
    { id: 4, nombre: 'Sour Diesel', tipo: 'Flor sativa', cultivo: 'Outdoor', gramos: 5, tokens: 25, img: 'img/sourdiesel.jpg', stock: 58, thc: '18%', cbd: '<1%', tag: 'Día activo' },
    { id: 5, nombre: 'Púrpura', tipo: 'Flor índica', cultivo: 'Outdoor', gramos: 5, tokens: 24, img: 'img/purpura.jpg', stock: 64, thc: '17%', cbd: '1%', tag: 'Sueño' },
    { id: 6, nombre: 'Diamond Daiquiri', tipo: 'Flor híbrida', cultivo: 'Indoor', gramos: 5, tokens: 40, img: 'img/daiquiri.jpg', stock: 8, thc: '23%', cbd: '<1%', tag: 'Ansiedad' },
    { id: 7, nombre: 'Rainbow Guava', tipo: 'Flor sativa', cultivo: 'Indoor', gramos: 5, tokens: 39, img: 'img/guaba.jpg', stock: 19, thc: '21%', cbd: '<1%', tag: 'Ánimo' },
    { id: 8, nombre: 'Lemon Octane CBD', tipo: 'Flor CBD', cultivo: 'Indoor', gramos: 8, tokens: 30, img: 'img/lemon.jpg', stock: 27, thc: '<1%', cbd: '14%', tag: 'Sin psicoactivo' },
    { id: 9, nombre: 'Aceite CBD 1500 mg', tipo: 'Aceite sublingual', cultivo: 'Extracto', gramos: 0, tokens: 45, img: 'img/aceite.jpg', stock: 22, thc: '0%', cbd: '1500 mg', tag: 'Gotero 30 ml' },
    { id: 10, nombre: 'Ungüento CBD', tipo: 'Tópico', cultivo: 'Extracto', gramos: 0, tokens: 20, img: 'img/unguento.jpg', stock: 35, thc: '0%', cbd: '500 mg', tag: 'Articulaciones' },
    { id: 11, nombre: 'Gomitas THC 50 mg', tipo: 'Comestible', cultivo: '6 unidades', gramos: 0, tokens: 18, img: 'img/gomitas.jpg', stock: 40, thc: '50 mg', cbd: '—', tag: 'Dosis exacta' },
    { id: 12, nombre: 'Live Resin 1 g', tipo: 'Extracto', cultivo: 'Indoor', gramos: 1, tokens: 42, img: 'img/resin.jpg', stock: 6, thc: '78%', cbd: '—', tag: 'Alta potencia' },
    { id: 13, nombre: 'Pre-roll x5', tipo: 'Pre-enrolado', cultivo: 'Híbrido', gramos: 3.5, tokens: 22, img: 'img/preroll.jpg', stock: 50, thc: '19%', cbd: '<1%', tag: 'Listo para usar' },
    { id: 14, nombre: 'Kief 1 g', tipo: 'Tricomas', cultivo: 'Índica', gramos: 1, tokens: 15, img: 'img/kief.jpg', stock: 14, thc: '45%', cbd: '—', tag: 'Para espolvorear' }
  ];

  const bolsas = [
    { id: 'b12', tokens: 12, precio: 10000, etiqueta: 'Para probar' },
    { id: 'b55', tokens: 55, precio: 50000, etiqueta: '+10% de regalo', destacada: true },
    { id: 'b110', tokens: 110, precio: 100000, etiqueta: '+10% de regalo' },
    { id: 'b220', tokens: 220, precio: 200000, etiqueta: '+10% de regalo' }
  ];

  // consumo diario de octubre del socio de la demo (gramos por día)
  const consumoOct = [0, 5, 0, 0, 0, 3.5, 0, 0, 5, 0, 0, 0, 0, 0];

  const nombres = ['Camila Rojas', 'Tomás Fuentes', 'Valentina Soto', 'Matías Herrera', 'Josefa Muñoz', 'Benjamín Castro', 'Antonia Reyes', 'Lucas Morales', 'Florencia Díaz', 'Agustín Pérez', 'Isidora Vargas', 'Martín Silva', 'Catalina Núñez', 'Joaquín Torres', 'Renata Flores', 'Vicente Espinoza', 'Emilia Contreras', 'Diego Paredes', 'Sofía Araya', 'Gabriel Tapia', 'Maite Cortés', 'Felipe Navarro', 'Trinidad Salinas', 'Ignacio Pizarro'];
  const socios = nombres.map((n, i) => {
    const memFin = masDias(HOY, [220, 12, 305, -4, 64, 140, 9, 280, 33, 190, 350, 21, 95, 160, -18, 240, 70, 5, 330, 120, 45, 260, 15, 175][i]);
    const recFin = masDias(HOY, [40, 75, -2, 110, 6, 58, 90, 3, 130, 17, 66, 150, 24, 1, 80, 44, 12, 100, 29, 160, 8, 52, 36, 120][i]);
    const limite = [30, 20, 40, 30, 15, 30, 25, 40, 30, 20, 30, 35, 20, 30, 40, 25, 30, 20, 30, 15, 30, 40, 25, 30][i];
    const consumido = Math.min(limite, [13.5, 18, 10, 22, 14, 5, 25, 12, 9, 20, 3, 17, 11, 28, 0, 8, 26, 4, 15, 7, 19, 21, 6, 16][i]);
    return {
      id: 100 + i, nombre: n, email: n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(' ', '.') + '@correo.cl',
      tokens: [42, 5, 118, 0, 33, 76, 12, 60, 24, 91, 8, 150, 17, 45, 0, 66, 3, 88, 29, 54, 11, 72, 38, 20][i],
      memFin: iso(memFin), recFin: iso(recFin), limite, consumido,
      comuna: ['Providencia', 'Ñuñoa', 'Valparaíso', 'Las Condes', 'Santiago', 'La Florida', 'Viña del Mar', 'Maipú'][i % 8]
    };
  });

  const solicitudes = [
    { id: 'S-0418', nombre: 'Rocío Beltrán', edad: 34, comuna: 'Ñuñoa', motivo: 'Dolor lumbar crónico', adjuntos: 4, hace: 'hace 12 min', receta: '3 meses · 30 g/mes' },
    { id: 'S-0417', nombre: 'Andrés Quiroga', edad: 52, comuna: 'Macul', motivo: 'Insomnio', adjuntos: 4, hace: 'hace 2 h', receta: '6 meses · 20 g/mes' },
    { id: 'S-0416', nombre: 'Paula Retamal', edad: 29, comuna: 'Concón', motivo: 'Ansiedad generalizada', adjuntos: 3, hace: 'ayer', receta: 'Falta receta', incompleta: true }
  ];

  const eventos = [
    { t: '10:42', tipo: 'canje', txt: 'Tomás F. canjeó 2 productos · −61 tokens · 10 g' },
    { t: '10:15', tipo: 'firma', txt: 'Pedido #2051 firmado al recibir por Valentina S.' },
    { t: '09:58', tipo: 'receta', txt: 'Receta de Ignacio P. vence mañana · aviso enviado' },
    { t: '09:30', tipo: 'bloqueo', txt: 'Carrito bloqueado a Joaquín T. · receta vencida' },
    { t: '09:02', tipo: 'pago', txt: 'Matías H. renovó su membresía · $20.000 por Webpay' },
    { t: '08:47', tipo: 'solicitud', txt: 'Nueva postulación de Rocío Beltrán' },
    { t: '08:00', tipo: 'auto', txt: 'Revisión diaria: 3 recetas y 2 membresías por vencer' }
  ];

  const ventasSemana = [
    { d: 'Lun', clp: 410000, tokens: 380 }, { d: 'Mar', clp: 380000, tokens: 402 },
    { d: 'Mié', clp: 520000, tokens: 455 }, { d: 'Jue', clp: 460000, tokens: 431 },
    { d: 'Vie', clp: 690000, tokens: 612 }, { d: 'Sáb', clp: 750000, tokens: 588 },
    { d: 'Dom', clp: 240000, tokens: 190 }
  ];

  const segmentos = [
    { id: 'todos', nombre: 'Todos los socios', n: 148 },
    { id: 'receta', nombre: 'Con receta vigente', n: 121 },
    { id: 'rec30', nombre: 'Receta vence en 30 días', n: 14 },
    { id: 'mem30', nombre: 'Membresía vence en 30 días', n: 9 },
    { id: 'sintok', nombre: 'Sin tokens', n: 23 },
    { id: 'inact', nombre: 'Sin canjes en 60 días', n: 17 }
  ];

  function estadoInicial() {
    return {
      hoy: iso(HOY),
      dispensario: { nombre: 'Raíz Austral', sub: 'Asociación de cannabis medicinal', ciudad: 'Santiago, Chile' },
      socio: {
        nombre: 'Camila Rojas', primer: 'Camila', rut: '17.845.302-6', email: 'camila.rojas@correo.cl',
        tokens: 42, memInicio: '2026-01-10', memFin: '2027-01-10',
        receta: { medico: 'Dra. Paula Méndez', desde: '2026-07-20', hasta: '2026-11-20', limite: 30, folio: 'RX-88213' },
        consumoDiario: consumoOct.slice(), // gramos por día del mes, hasta hoy
        pedidos: [
          { id: 2044, fecha: '2026-10-09', items: 'Black Amethyst 5 g', tokens: 38, gramos: 5, estado: 'entregado', firmado: true },
          { id: 2031, fecha: '2026-10-02', items: 'Púrpura 5 g', tokens: 24, gramos: 5, estado: 'entregado', firmado: true }
        ]
      },
      carrito: [],
      notificaciones: [
        { id: 1, de: 'Raíz Austral', titulo: 'Este sábado atendemos hasta las 14:00', txt: 'Feriado largo: el domingo y el lunes el local está cerrado. Los despachos siguen.', hace: 'hace 3 h', leida: false, tipo: 'info' },
        { id: 2, de: 'Dispensa', titulo: 'Tu receta vence en 37 días', txt: 'Súbela antes del 20-nov y sigue canjeando sin pausa.', hace: 'ayer', leida: false, tipo: 'receta' },
        { id: 3, de: 'Raíz Austral', titulo: 'Llegó Celestial Gas 🌙', txt: 'Indoor premium, solo 12 unidades.', hace: 'hace 2 días', leida: true, tipo: 'producto' }
      ],
      productos, bolsas, socios, solicitudes, eventos, ventasSemana, segmentos,
      comunicados: [
        { id: 31, asunto: 'Horario feriado largo', segmento: 'Todos los socios', enviados: 148, abiertos: 112, fecha: '2026-10-13' },
        { id: 30, asunto: 'Renueva tu receta a tiempo', segmento: 'Receta vence en 30 días', enviados: 14, abiertos: 13, fecha: '2026-10-06' }
      ],
      fechaSimulada: null // si el presentador adelanta el calendario
    };
  }

  const CLAVE = 'dispensa-demo-v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(CLAVE)) || estadoInicial(); } catch (e) { state = estadoInicial(); }

  const oyentes = {};
  const DEMO = window.DEMO = window.DEMO || {};
  Object.defineProperties(DEMO, Object.getOwnPropertyDescriptors({
    get state() { return state; },
    on(evt, fn) { (oyentes[evt] = oyentes[evt] || []).push(fn); },
    off(evt, fn) { oyentes[evt] = (oyentes[evt] || []).filter(f => f !== fn); },
    emit(evt, data) { (oyentes[evt] || []).forEach(f => { try { f(data); } catch (e) { console.error(e); } }); (oyentes['*'] || []).forEach(f => f(evt, data)); DEMO.guardar(); },
    guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(state)); } catch (e) { } },
    reiniciar() { state = estadoInicial(); try { localStorage.removeItem(CLAVE); } catch (e) { } DEMO.emit('reinicio'); },

    /* ---------- reglas de negocio (las mismas del sistema real) ---------- */
    hoy() { return state.fechaSimulada || state.hoy; },
    diasEntre(a, b) { return Math.round((new Date(b) - new Date(a)) / dia); },
    recetaVigente() { return DEMO.hoy() <= state.socio.receta.hasta; },
    diasReceta() { return DEMO.diasEntre(DEMO.hoy(), state.socio.receta.hasta); },
    diasMembresia() { return DEMO.diasEntre(DEMO.hoy(), state.socio.memFin); },
    gramosMes() { return state.socio.consumoDiario.reduce((a, b) => a + b, 0); },
    gramosDisponibles() { return Math.max(0, state.socio.receta.limite - DEMO.gramosMes()); },
    /** ¿Puede canjear? Devuelve { ok, motivo } */
    puedeCanjear(tokens, gramos) {
      if (!DEMO.recetaVigente()) return { ok: false, motivo: 'receta', txt: 'Tu receta venció. El carrito queda en pausa hasta que subas la nueva. Tu membresía sigue activa.' };
      if (DEMO.diasMembresia() < -15) return { ok: false, motivo: 'membresia', txt: 'Tu membresía venció. Renuévala para volver a canjear.' };
      if (gramos > DEMO.gramosDisponibles()) return { ok: false, motivo: 'gramaje', txt: `Este canje supera tu gramaje autorizado. Te quedan ${DEMO.fmt.g(DEMO.gramosDisponibles())} este mes.` };
      if (tokens > state.socio.tokens) return { ok: false, motivo: 'tokens', txt: `Te faltan ${tokens - state.socio.tokens} tokens.` };
      return { ok: true };
    },
    notificar(n) {
      state.notificaciones.unshift(Object.assign({ id: Date.now(), hace: 'ahora', leida: false, de: state.dispensario.nombre, tipo: 'info' }, n));
      DEMO.emit('notificacion', n);
    },
    evento(tipo, txt) {
      const d = new Date(); const t = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      state.eventos.unshift({ t, tipo, txt });
      DEMO.emit('evento', { tipo, txt });
    },

    /* ---------- formato ---------- */
    fmt: {
      clp: n => '$' + Math.round(n).toLocaleString('es-CL'),
      g: n => (Math.round(n * 10) / 10).toLocaleString('es-CL') + ' g',
      fecha: s => { const [y, m, d] = s.split('-'); return `${+d} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][m - 1]} ${y}`; },
      fechaCorta: s => { const [, m, d] = s.split('-'); return `${+d} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][m - 1]}`; }
    },
    masDias: (s, n) => iso(masDias(new Date(s), n))
  }));
  DEMO.views = DEMO.views || {};
})();
