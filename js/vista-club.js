/* ============================================================
   Dispensa — vista «club»: sitio público del club ficticio «Raíz Austral».
   Lo que ve un visitante que aún NO es socio: no hay catálogo ni carrito.
   Prefijo de clases: .cl-   (estilos en css/v-club.css)
   ============================================================ */
(function () {
  const D = window.DEMO;
  const ico = (n, c) => D.ico(n, c);
  let limpiezas = [];
  const alSalir = f => limpiezas.push(f);

  const ESCENAS = [
    { tag: 'Bienvenida', t1: 'Bienvenido', t2: 'a tu *club*', sub: 'Comunidad, bienestar y acceso consciente al cannabis medicinal.', mano: 'Personas reales. Acceso real. Una comunidad que te cuida', anim: 'bienvenida' },
    { tag: 'Receta inteligente', t1: 'Tu receta,', t2: 'tu *medida*', sub: 'Tu cupo mensual sale de tu receta. Ni un gramo más, ni uno menos.', mano: 'la dosis la pone tu médico, no el antojo', anim: 'frasco' },
    { tag: 'App del socio', t1: 'Todo desde', t2: 'tu *celular*', sub: 'Tu saldo, tu receta y tus pedidos en la palma de la mano.', mano: 'menos WhatsApp, más calma', anim: 'celular' },
    { tag: 'Despacho con firma', t1: 'Te lo llevamos', t2: 'y *firmas* al recibir', sub: 'Llega a tu puerta. Firmas en la pantalla y queda registrado.', mano: 'tu firma vale más que un «déjalo ahí»', anim: 'despacho', largo: true },
    { tag: 'Comunidad', t1: 'Una comunidad', t2: 'que *cuida*', sub: 'Socios, médicos y equipo del club, cada uno cuidando al otro.', mano: 'plantas · personas · territorio', anim: 'comunidad', largo: true }
  ];
  const DURACION = 7000;

  /* ---------- ilustración de respaldo (si la foto no carga) ---------- */
  function ilustracion(i) {
    const lunaX = [1080, 980, 1180, 1040, 1120][i];
    let estrellas = '';
    for (let k = 0; k < 22; k++) {
      const x = (k * 137 + i * 61) % 1440, y = (k * 71 + i * 29) % 330;
      estrellas += `<circle cx="${x}" cy="${y}" r="${k % 4 ? 1.3 : 2.2}" style="--d:${(k * .41) % 3}s"/>`;
    }
    const flores = [1240, 1320, 1390, 1180, 90, 170].map((x, k) => `
      <g class="cl-il-flor" transform="translate(${x} ${820 - (k % 3) * 18}) scale(${k % 2 ? .8 : 1.05})">
        <path class="cl-il-tallo" d="M0 0V-80M0-40c-14-4-22-14-24-26 12 2 20 12 24 26Z"/>
        <g class="cl-il-petalos"><ellipse cx="0" cy="-98" rx="7" ry="16"/><ellipse cx="0" cy="-98" rx="7" ry="16" transform="rotate(72 0 -82)"/><ellipse cx="0" cy="-98" rx="7" ry="16" transform="rotate(144 0 -82)"/><ellipse cx="0" cy="-98" rx="7" ry="16" transform="rotate(216 0 -82)"/><ellipse cx="0" cy="-98" rx="7" ry="16" transform="rotate(288 0 -82)"/></g>
        <circle class="cl-il-centro" cx="0" cy="-82" r="6"/>
      </g>`).join('');
    return `<svg class="cl-ilus" viewBox="0 0 1440 860" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g class="cl-il-estrellas">${estrellas}</g>
      <defs><radialGradient id="cl-g-halo"><stop offset="0" stop-color="#F4C542" stop-opacity=".45"/><stop offset="1" stop-color="#F4C542" stop-opacity="0"/></radialGradient></defs><circle cx="${lunaX}" cy="300" r="230" fill="url(#cl-g-halo)"/>
      <circle class="cl-il-luna" cx="${lunaX}" cy="300" r="96"/>
      <path class="cl-il-m1" d="M300 640 470 470l70 50 120-170 110 130 90-80 160 190 120-220 140 170 90-80 150 170v180H300Z"/>
      <path class="cl-il-nieve" d="M660 350l-36 50 22-8 14 18 20-26 16 12ZM1130 400l-30 56 20-10 12 16 14-22 18 10Z"/>
      <path class="cl-il-m2" d="M0 700 170 600l130 70 150-120 140 110 130-80 160 120 120-66 150 100 130-90 170 100 110-40v250H0Z"/>
      <path class="cl-il-lago" d="M0 760h1440v28H0Z"/>
      <path class="cl-il-m3" d="M0 800c140-34 260-40 380-24s260 32 400 10 270-40 410-18c100 14 170 22 250 16v76H0Z"/>
      ${flores}
      <g class="cl-il-hongo" transform="translate(60 800)"><path d="M0-40C0-62 16-76 34-76s34 14 34 36Z"/><path class="cl-il-pie" d="M26-40c-1 16-3 28-6 40h28c-3-12-5-24-6-40"/></g>
    </svg>`;
  }

  /* ---------- animaciones vectoriales de cada escena ---------- */
  function animEscena(tipo) {
    const A = {
      bienvenida: `<svg viewBox="0 0 300 220" class="cl-an cl-an-bienvenida">
          <g class="cl-an-doc"><rect x="70" y="24" width="150" height="176" rx="14"/>
            <path class="cl-an-linea" pathLength="1" d="M94 64h86"/><path class="cl-an-linea l2" pathLength="1" d="M94 90h102"/>
            <path class="cl-an-linea l3" pathLength="1" d="M94 116h70"/><path class="cl-an-firma" pathLength="1" d="M96 168c10-2 14-18 22-18s2 14 10 14 8-10 14-10 6 8 22 6"/></g>
          <text x="94" y="50" class="cl-an-rx">Rx · receta</text>
          <g class="cl-an-sello"><circle cx="222" cy="150" r="34"/><path d="m206 150 11 11 21-22"/></g>
          <g class="cl-an-corazon"><path d="M42 70c-8-10-24-4-20 8 3 8 20 18 20 18s17-10 20-18c4-12-12-18-20-8Z"/></g>
        </svg>`,
      frasco: `<svg viewBox="0 0 300 220" class="cl-an cl-an-frasco">
          <defs><clipPath id="cl-clip-frasco"><path d="M92 58h92c10 0 14 6 14 16v112c0 12-6 18-18 18H96c-12 0-18-6-18-18V74c0-10 4-16 14-16Z"/></clipPath></defs>
          <rect class="cl-an-tapa" x="96" y="30" width="84" height="24" rx="6"/>
          <g clip-path="url(#cl-clip-frasco)"><g class="cl-an-liquido"><rect class="cl-an-nivel" x="70" y="104" width="140" height="120"/>
            <path class="cl-an-ola" d="M60 104c20-8 40 8 60 0s40 8 60 0 40 8 60 0v14H60Z"/></g></g>
          <path class="cl-an-vidrio" d="M92 58h92c10 0 14 6 14 16v112c0 12-6 18-18 18H96c-12 0-18-6-18-18V74c0-10 4-16 14-16Z"/>
          <path class="cl-an-hoja" d="M138 176V130M138 150c-10-6-14-16-12-26 8 4 12 14 12 26Zm0 0c10-6 14-16 12-26-8 4-12 14-12 26Z"/>
          <g class="cl-an-marcas"><path d="M212 74h14M212 104h22M212 134h14M212 164h14M212 194h14"/></g>
          <text x="238" y="109" class="cl-an-g">30 g</text><text x="238" y="126" class="cl-an-gsub">al mes</text>
        </svg>`,
      celular: `<svg viewBox="0 0 300 220" class="cl-an cl-an-celular">
          <rect class="cl-an-tel" x="98" y="8" width="104" height="204" rx="18"/><rect class="cl-an-isla" x="134" y="16" width="32" height="7" rx="4"/>
          <rect class="cl-an-card c1" x="110" y="34" width="80" height="40" rx="9"/>
          <circle class="cl-an-moneda" cx="126" cy="54" r="9"/><text x="140" y="59" class="cl-an-num">42</text>
          <rect class="cl-an-card c2" x="110" y="82" width="80" height="26" rx="8"/><rect class="cl-an-barra" x="118" y="92" width="50" height="6" rx="3"/>
          <rect class="cl-an-card c3" x="110" y="116" width="80" height="26" rx="8"/><rect class="cl-an-barra b2" x="118" y="126" width="36" height="6" rx="3"/>
          <rect class="cl-an-card c4" x="110" y="150" width="80" height="26" rx="8"/><rect class="cl-an-barra b3" x="118" y="160" width="60" height="6" rx="3"/>
          <g class="cl-an-campana"><path d="M232 70a14 14 0 0 1 14 14v10l6 8h-40l6-8V84a14 14 0 0 1 14-14ZM226 106a6 6 0 0 0 12 0"/><circle class="cl-an-punto" cx="246" cy="72" r="6"/></g>
          <g class="cl-an-mon2"><circle cx="54" cy="150" r="14"/><text x="54" y="155" text-anchor="middle">T</text></g>
        </svg>`,
      despacho: `<svg viewBox="0 0 300 220" class="cl-an cl-an-despacho">
          <path class="cl-an-camino" d="M10 104h280"/>
          <g class="cl-an-camion"><path d="M20 62h70v36H20zM90 74h22l12 12v12H90"/><circle cx="42" cy="100" r="8"/><circle cx="106" cy="100" r="8"/></g>
          <rect class="cl-an-pantalla" x="50" y="126" width="200" height="80" rx="14"/>
          <path class="cl-an-firma2" pathLength="1" d="M72 182c14 0 18-30 30-30s4 24 16 24 12-16 22-16 8 14 18 14 12-10 20-10 10 10 22 8"/>
          <path class="cl-an-base" d="M70 194h160"/>
          <g class="cl-an-ok"><circle cx="248" cy="130" r="16"/><path d="m240 130 6 6 10-11"/></g>
        </svg>`,
      comunidad: `<svg viewBox="0 0 300 220" class="cl-an cl-an-comunidad">
          <g class="cl-an-lazos"><path pathLength="1" d="M150 110 70 50"/><path pathLength="1" d="M150 110 230 50"/><path pathLength="1" d="M150 110 50 150"/><path pathLength="1" d="M150 110 250 150"/><path pathLength="1" d="M150 110 150 198"/>
            <path pathLength="1" class="arco" d="M70 50Q150 0 230 50"/><path pathLength="1" class="arco" d="M50 150Q150 250 250 150"/></g>
          <g class="cl-an-personas">${[[70, 50], [230, 50], [50, 150], [250, 150], [150, 198]].map(([x, y], k) => `<g transform="translate(${x} ${y})"><g class="p p${k}"><circle r="17"/><circle cy="-4" r="5"/><path d="M-8 9c2-6 5-8 8-8s6 2 8 8"/></g></g>`).join('')}</g>
          <g transform="translate(0 -30)"><path class="cl-an-cora" d="M150 132c-14-16-40-6-34 12 5 13 34 30 34 30s29-17 34-30c6-18-20-28-34-12Z"/></g>
        </svg>`
    };
    return A[tipo] || '';
  }

  /* ---------- flora ilustrada de los bordes ---------- */
  function flora(lado, extra) {
    const hojas = [[-30, 0], [-12, 1], [8, 0], [26, 1], [-48, 1]].map(([r, k], n) => `<path class="cl-fl-hoja ${k ? 'b' : ''}" transform="rotate(${r} 60 230)" d="M60 230C40 180 42 110 60 ${40 + n * 12}c18 70 20 140 0 190Z"/>`).join('');
    const flor = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" class="cl-fl-flor ${c}">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="0" cy="-11" rx="5" ry="11" transform="rotate(${a})"/>`).join('')}<circle r="4.5" class="cl-fl-centro"/></g>`;
    const hongo = extra === 'hongos' ? `<g class="cl-fl-hongo"><path d="M66 250c0-24 18-38 38-38s38 14 38 38Z"/><path class="pie" d="M94 250c-1 14-3 26-6 36h32c-3-10-5-22-6-36"/><circle cx="90" cy="232" r="4"/><circle cx="112" cy="226" r="3"/><circle cx="124" cy="240" r="2.6"/></g><g class="cl-fl-hongo chico"><path d="M20 268c0-14 10-22 22-22s22 8 22 22Z"/><path class="pie" d="M36 268c-1 8-2 14-4 20h20c-2-6-3-12-4-20"/></g>` : '';
    return `<svg class="cl-flora cl-flora-${lado}" viewBox="0 0 160 300" aria-hidden="true"><g class="cl-fl-mata">${hojas}</g>${flor(30, 120, 1.1, 'rosa')}${flor(118, 70, .9, 'naranja')}${flor(96, 170, .75, 'mostaza')}${flor(20, 210, .7, 'naranja')}${hongo}</svg>`;
  }

  /* ---------- el guía (sin personaje: solo el texto del equipo de admisión) ---------- */
  const zorro = (D.personaje ? D.personaje.svg('cl-zorro') : '');

  const SALUDO = 'Te acompañamos en cada paso del proceso de admisión.';
  const PASOS = [
    { n: 1, ico: 'telefono', t: 'Postulas online', m: '10 minutos', dice: 'Primero completas un formulario breve en línea. Toma unos diez minutos.' },
    { n: 2, ico: 'adjunto', t: 'Subes tus documentos', m: 'Fotos o PDF', dice: 'Luego adjuntas tus documentos: cédula de identidad y receta médica, en foto o PDF.' },
    { n: 3, ico: 'socios', t: 'El comité revisa', m: 'En 48 horas', dice: 'El comité de admisión revisa tu solicitud y tus antecedentes médicos.' },
    { n: 4, ico: 'correo', t: 'Te damos la bienvenida', m: 'Por correo', dice: 'Si todo está en orden, recibes un correo de bienvenida con los siguientes pasos.' },
    { n: 5, ico: 'membresia', t: 'Pagas tu membresía y entras', m: '$20.000 al año', dice: 'Pagas la membresía anual y se habilita tu cuenta de socio.' }
  ];

  const REQUISITOS = [
    { ico: 'cedula', t: 'Cédula por ambos lados', m: 'foto legible, frente y reverso' },
    { ico: 'documento', t: 'Certificado de antecedentes', m: 'se obtiene en línea, sin costo' },
    { ico: 'receta', t: 'Receta médica vigente', m: 'tu médico define la dosis mensual' },
    { ico: '18', t: 'Mayor de edad', m: '18 años o más, sin excepciones' },
    { ico: 'comunicado', t: 'Entrevista', m: 'conversación con el comité de admisión' }
  ];

  const POLITICA = [
    { t: 'Confidencialidad', ico: 'candado', p: 'Lo que cuentas en tu postulación y en la entrevista queda en el comité. Nadie sabrá por nosotros que postulaste ni que eres socio.' },
    { t: 'Solo uso medicinal', ico: 'corazon', p: 'Somos una asociación de pacientes. Todo lo que se canjea tiene un fin terapéutico y queda registrado a tu nombre.' },
    { t: 'Receta obligatoria', ico: 'receta', p: 'Para canjear necesitas una receta vigente con gramaje. Si vence, tu carrito se pausa solo hasta que subas la nueva; tu membresía sigue activa.' },
    { t: 'Cupo mensual según tu receta', ico: 'gramaje', p: 'Tu cupo del mes es el gramaje que indica tu médico. El sistema lo lleva día a día y nunca te deja pasarte.' },
    { t: 'Tus datos protegidos (Ley 21.719)', ico: 'escudo', p: 'Tus datos de salud son datos sensibles: los tratamos solo con tu consentimiento explícito, nunca se venden y puedes pedir verlos, corregirlos o eliminarlos cuando quieras.' }
  ];

  const FAQ = [
    { q: '¿Esto es legal?', a: 'Sí. Somos una asociación de uso medicinal: cada socio tiene receta y cada canje queda registrado dentro de su gramaje autorizado.' },
    { q: '¿Puedo postular sin receta?', a: 'Puedes postular y subirla después. Para canjear sí necesitas una receta vigente; el comité te orienta para conseguirla.' },
    { q: '¿Cuánto cuesta?', a: 'La membresía anual cuesta $20.000. Los productos se canjean con tokens, que compras en bolsas desde $10.000.' },
    { q: '¿Qué pasa si vence mi receta?', a: 'Tu carrito se pausa solo hasta que subas la nueva. Tu membresía sigue activa y tus tokens te esperan.' },
    { q: '¿Quién ve mis datos?', a: 'Solo el comité y el equipo del club. Están protegidos según la Ley 21.719 y nunca se comparten con terceros.' },
    { q: '¿Hacen despacho?', a: 'Sí. Te lo llevamos y firmas en el celular al recibir. Si prefieres, retiras en el local.' }
  ];

  const tituloHTML = t => t.replace(/\*(.+?)\*/g, '<b>$1</b>');
  function hero() {
    const escenas = ESCENAS.map((e, i) => `
      <article class="cl-escena ${i === 0 ? 'activa quieta' : ''} ${e.largo ? 'largo' : ''}" data-i="${i}" aria-roledescription="escena" aria-label="${i + 1} de ${ESCENAS.length}: ${e.t1} ${e.t2.replace(/\*/g, '')}" ${i ? 'aria-hidden="true"' : ''}>
        <div class="cl-fondo-esc">${ilustracion(i)}<div class="cl-arte"></div><div class="cl-foto" data-src="img/escenas/escena-${i + 1}.jpg"></div></div>
        <div class="cl-velo-esc"></div>
        <div class="cl-esc-cont">
          <div class="cl-esc-texto">
            <p class="cl-esc-eyebrow">Raíz Austral<small>Club de cannabis medicinal</small></p>
            <h1 class="cl-esc-titulo"><span>${e.t1}</span> <span>${tituloHTML(e.t2)}</span></h1>
            <p class="cl-esc-sub">${e.sub}</p>
            <div class="cl-esc-ctas">
              <a class="btn cl-btn-salvia cl-btn-xl" href="#postular">Quiero postular ${ico('flecha')}</a>
              <button type="button" class="btn cl-btn-vidrio cl-btn-xl" data-bajar>¿Cómo funciona?</button>
            </div>
          </div>
          <p class="cl-esc-mano">${e.mano}</p>
          <div class="cl-esc-anim"><span class="cl-esc-tag">${e.tag}</span>${animEscena(e.anim)}</div>
        </div>
      </article>`).join('');
    return `
    <section class="cl-hero" aria-roledescription="carrusel" aria-label="Raíz Austral">
      ${escenas}
      <header class="cl-club-nav">
        <nav class="cl-club-links" aria-label="Secciones del club">
          <button type="button" data-ir="cl-quienes">Quiénes somos</button>
          <button type="button" data-ir="cl-como">Cómo ser parte</button>
          <button type="button" data-ir="cl-requisitos">Requisitos</button>
          <button type="button" data-ir="cl-faq">Preguntas</button>
          <a class="cl-club-entrar" href="#socio">${ico('usuario')}<span>Soy socio</span></a>
        </nav>
        <a class="cl-club-marca" href="#club" aria-label="Raíz Austral, inicio">
          <span class="cl-club-logo">${ico('hoja')}</span>
          <b>Raíz Austral</b><small>Club de cannabis medicinal</small>
        </a>
      </header>
      <button type="button" class="cl-flecha cl-flecha-izq" data-mover="-1" aria-label="Escena anterior">${ico('atras')}</button>
      <button type="button" class="cl-flecha cl-flecha-der" data-mover="1" aria-label="Escena siguiente">${ico('flecha')}</button>
      <div class="cl-controles">
        <div class="cl-puntos" role="tablist">${ESCENAS.map((e, i) => `<button type="button" role="tab" data-ir-esc="${i}" aria-label="Ir a la escena ${i + 1}" aria-selected="${i === 0}"></button>`).join('')}</div>
        <button type="button" class="cl-pausa" aria-label="Pausar">${ico('pausa')}</button>
      </div>
      <div class="cl-barra"><i></i></div>
    </section>`;
  }
  function quienes() {
    const items = [
      { ico: 'flor', t: 'Cultivamos con cuidado', m: 'Genéticas trazables, lote por lote.' },
      { ico: 'receta', t: 'Te acompañamos', m: 'Tu receta manda. Nosotros te orientamos.' },
      { ico: 'escudo', t: 'Club privado', m: 'Confidencial desde el primer día.' }
    ];
    return `
    <section class="cl-sec cl-quienes" id="cl-quienes">
      <div class="contenedor">
        <p class="cl-eyebrow cl-rv" data-dir="abajo">Quiénes somos</p>
        <h2 class="cl-h2 cl-rv" data-dir="izq">Un club, <b>no una tienda.</b></h2>
        <p class="cl-mano cl-mano-grande cl-rv" data-dir="der">plantas · personas · territorio</p>
        <div class="cl-tres">
          ${items.map((it, i) => `<div class="cl-tres-item cl-rv" data-dir="${['izq', 'abajo', 'der'][i]}" style="--dl:${i * 120}ms">
            <div class="cl-circulo">${ico(it.ico)}<svg class="cl-anillo" viewBox="0 0 120 120" aria-hidden="true"><circle class="cl-trazo" pathLength="1" cx="60" cy="60" r="56"/></svg></div>
            <h3>${it.t}</h3><p>${it.m}</p></div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function como() {
    return `
    <section class="cl-sec cl-como" id="cl-como">
      ${flora('izq')}${flora('der')}
      <div class="contenedor cl-como-grid">
        <div class="cl-guia">
          <div class="cl-globo" aria-live="polite"><span class="cl-globo-txt">${SALUDO}</span></div>
          ${zorro}
          <p class="cl-mano cl-guia-nombre">Equipo de admisión del club</p>
        </div>
        <div class="cl-como-der">
          <div class="cl-como-cab">
            <div>
              <h2 class="cl-h2 cl-rv" data-dir="izq">Cómo ser <b>parte</b></h2>
              <p class="cl-bajada cl-rv" data-dir="izq">Cinco pasos, un mismo propósito: tu bienestar.</p>
            </div>
            <p class="cl-mano cl-rot cl-rv" data-dir="der">paso a paso</p>
          </div>
          <ol class="cl-pasos">
            ${PASOS.map((p, i) => `<li class="cl-paso cl-rv" data-dir="der" style="--dl:${i * 110}ms" data-paso="${i}">
              <button type="button" class="cl-paso-card" aria-label="Paso ${p.n}: ${p.t}">
                <span class="cl-paso-n">${p.n}</span>
                <span class="cl-paso-ico">${ico(p.ico)}</span>
                <b>${p.t}</b><small>${p.m}</small>
              </button>
              ${i < PASOS.length - 1 ? `<span class="cl-paso-flecha" aria-hidden="true">${ico('flecha')}</span>` : ''}
            </li>`).join('')}
          </ol>
        </div>
      </div>
    </section>`;
  }
  function requisitos() {
    const icono = r => r.ico === '18' ? '<span class="cl-18">18+</span>' : ico(r.ico);
    return `
    <section class="cl-sec cl-requisitos" id="cl-requisitos">
      ${flora('izq', 'hongos')}${flora('der')}
      <div class="contenedor cl-req-fila">
        <div class="cl-req-cab">
          <h2 class="cl-h2 cl-rv" data-dir="izq">Lo que <b>necesitas</b></h2>
          <p class="cl-bajada cl-rv" data-dir="izq">Ten a mano estos documentos para postular.</p>
        </div>
        <div class="cl-req-grid">
          ${REQUISITOS.map((r, i) => `<div class="cl-req cl-rv" data-dir="der" style="--dl:${i * 90}ms" tabindex="0">
            <span class="cl-req-ico">${icono(r)}</span><h3>${r.t}</h3><p class="cl-mano">${r.m}</p></div>`).join('')}
        </div>
        <p class="cl-mano cl-rot cl-req-mano cl-rv" data-dir="der">primero la receta,<br>después el catálogo</p>
      </div>
    </section>`;
  }
  function candado() {
    const imgs = ['img/amethyst.jpg', 'img/aceite.jpg', 'img/celestial.jpg', 'img/unguento.jpg', 'img/lemon.jpg'].map(x => `<img src="${x}" alt="" loading="lazy">`).join('');
    return `
    <section class="cl-sec cl-candado-sec" aria-label="Catálogo reservado para socios">
      ${flora('der')}
      <div class="contenedor">
        <div class="cl-candado cl-rv" data-dir="abajo">
          <div class="cl-cand-texto">
            <h2 class="cl-h2">El catálogo se abre <b>cuando eres socio</b></h2>
            <p>Una vez aprobada tu postulación y con tu membresía activa, podrás acceder al catálogo completo de flores, extractos y más.</p>
            <a class="btn cl-btn-salvia cl-btn-xl" href="#postular">Quiero postular ${ico('flecha')}</a>
          </div>
          <div class="cl-cand-vitrina">
            <div class="cl-cand-fotos" aria-hidden="true">${imgs}</div>
            <div class="cl-cand-centro">
              <span class="cl-cand-ico"><svg viewBox="0 0 48 48" aria-hidden="true"><path class="cl-grillete" d="M15 22v-6a9 9 0 0 1 18 0v6"/><rect x="10" y="22" width="28" height="20" rx="5"/><circle cx="24" cy="31" r="2.6"/><path d="M24 33v4"/></svg></span>
              <b>Catálogo exclusivo para socios</b>
              <small>Activa tu membresía y descubre todo lo que tenemos para ti.</small>
            </div>
          </div>
        </div>
        <p class="cl-mano cl-rot cl-cand-mano">buenas plantas.<br>mejores días</p>
      </div>
    </section>`;
  }
  function politica() {
    return `
    <section class="cl-sec cl-politica" id="cl-politica">
      <div class="contenedor cl-pol-grid">
        <div>
          <p class="cl-eyebrow cl-rv" data-dir="abajo">Política de admisión</p>
          <h2 class="cl-h2 cl-rv" data-dir="izq">Las reglas, <b>claras.</b></h2>
          <p class="cl-mano cl-mano-grande cl-rv" data-dir="izq">sin letra chica</p>
        </div>
        <div class="cl-acordeon">
          ${POLITICA.map((p, i) => `<details class="cl-rv" data-dir="der" style="--dl:${i * 80}ms" ${i === 0 ? 'open' : ''}>
            <summary><span class="cl-acc-ico">${ico(p.ico)}</span><span>${p.t}</span><span class="cl-acc-mas">${ico('mas')}</span></summary>
            <p>${p.p}</p></details>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function porDentro() {
    return `
    <section class="cl-sec cl-dentro" id="cl-dentro">
      <div class="contenedor">
        <p class="cl-eyebrow cl-rv" data-dir="abajo">Cómo funciona por dentro</p>
        <h2 class="cl-h2 cl-rv" data-dir="izq">Tres piezas, <b>con todo en orden.</b></h2>
        <div class="cl-dentro-grid">
          <div class="cl-pieza cl-rv" data-dir="izq">
            <span class="cl-pieza-n">1</span>
            <div class="cl-cal">${ico('calendario')}<b class="cl-cal-num" data-meta="365">365</b><small>días de socio</small></div>
            <h3>Membresía anual</h3><p>$20.000 al año. Te avisamos antes de que venza.</p>
          </div>
          <div class="cl-pieza cl-rv" data-dir="abajo" style="--dl:120ms">
            <span class="cl-pieza-n">2</span>
            <div class="cl-medidor">
              <svg viewBox="0 0 200 120" aria-hidden="true"><path class="cl-med-fondo" d="M20 110a80 80 0 0 1 160 0"/><path class="cl-med-vivo" pathLength="1" d="M20 110a80 80 0 0 1 160 0"/></svg>
              <b><span class="cl-med-num">18</span> <small>de 30 g</small></b>
            </div>
            <h3>Receta con gramaje</h3><p>Tu cupo del mes, al día. Si la receta vence, el carrito se pausa solo.</p>
          </div>
          <div class="cl-pieza cl-rv" data-dir="der" style="--dl:240ms">
            <span class="cl-pieza-n">3</span>
            <div class="cl-tokens">
              <div class="cl-bolsa" title="Bolsa de tokens">${ico('token')}<small>Bolsa 55</small></div>
              <div class="cl-lluvia" aria-hidden="true"><span class="moneda">T</span><span class="moneda">T</span><span class="moneda">T</span></div>
              <div class="cl-billetera">${ico('billetera')}<b class="cl-tok-num">0</b><small>tokens</small></div>
            </div>
            <h3>Tokens para canjear</h3><p>Compras una bolsa, cae a tu billetera y canjeas con un toque.</p>
            <button type="button" class="btn btn-token btn-sm cl-probar">${ico('rayo')} Probar: comprar bolsa</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  function faq() {
    return `
    <section class="cl-sec cl-faq" id="cl-faq">
      <div class="contenedor">
        <p class="cl-eyebrow cl-rv" data-dir="abajo">Preguntas frecuentes</p>
        <h2 class="cl-h2 cl-rv" data-dir="izq">Lo que todos <b>nos preguntan.</b></h2>
        <div class="cl-faq-grid">
          ${FAQ.map((f, i) => `<details class="cl-faq-item cl-rv" data-dir="${i % 2 ? 'der' : 'izq'}" style="--dl:${(i % 2) * 90}ms">
            <summary>${f.q}<span class="cl-acc-mas">${ico('mas')}</span></summary><p>${f.a}</p></details>`).join('')}
        </div>
      </div>
    </section>`;
  }

  function ctaFinal() {
    return `
    <section class="cl-final">
      <div class="cl-final-fondo" aria-hidden="true">${ilustracion(4)}<div class="cl-arte"></div></div>
      <div class="contenedor cl-final-cont">
        <p class="cl-mano cl-mano-grande cl-rv" data-dir="abajo">¿y si esta vez empiezas hoy?</p>
        <h2 class="cl-final-titulo cl-rv" data-dir="abajo">Postula <em>hoy.</em></h2>
        <p class="cl-final-sub cl-rv" data-dir="abajo">10 minutos. Desde tu celular. Sin filas.</p>
        <div class="cl-esc-ctas cl-rv" data-dir="abajo">
          <a class="btn cl-btn-salvia cl-btn-xl" href="#postular">Quiero postular ${ico('flecha')}</a>
          <a class="btn cl-btn-vidrio cl-btn-xl" href="#socio">Ya soy socio · Entrar</a>
        </div>
      </div>
      <footer class="cl-pie contenedor">
        <span>${ico('hoja')} Raíz Austral · Club de cannabis medicinal · ${D.state.dispensario.ciudad}</span>
        <span class="cl-mano">Todo en regla, todo en orden</span>
        <span class="cl-pie-dispensa">${ico('logo')} Hecho con Dispensa</span>
      </footer>
    </section>`;
  }

  /* ---------- carrusel ---------- */
  function carrusel(raiz) {
    const hero = raiz.querySelector('.cl-hero');
    const escenas = [...hero.querySelectorAll('.cl-escena')];
    const puntos = [...hero.querySelectorAll('[data-ir-esc]')];
    const barra = hero.querySelector('.cl-barra');
    const btnPausa = hero.querySelector('.cl-pausa');
    let i = 0, timer = null, pausado = false;

    // fotos: si cargan, tapan la ilustración; si no, queda la ilustración
    hero.querySelectorAll('.cl-foto').forEach(f => {
      const img = new Image();
      img.onload = () => { f.style.backgroundImage = `url("${f.dataset.src}")`; f.classList.add('cargada'); };
      img.src = f.dataset.src;
    });

    function reiniciarBarra() {
      const nueva = document.createElement('i');
      barra.innerHTML = ''; barra.appendChild(nueva);
      barra.classList.toggle('quieta', pausado);
    }
    function mostrar(n) {
      const prev = escenas[i];
      i = (n + escenas.length) % escenas.length;
      if (prev !== escenas[i]) {
        prev.classList.remove('activa', 'quieta'); prev.classList.add('sale'); prev.setAttribute('aria-hidden', 'true');
        setTimeout(() => prev.classList.remove('sale'), 1300);
      }
      escenas[i].classList.remove('quieta');
      escenas[i].classList.add('activa'); escenas[i].removeAttribute('aria-hidden');
      puntos.forEach((p, k) => p.setAttribute('aria-selected', k === i));
      programar();
    }
    function programar() {
      clearTimeout(timer);
      reiniciarBarra();
      if (!pausado) timer = setTimeout(() => mostrar(i + 1), DURACION);
    }
    hero.querySelectorAll('[data-mover]').forEach(b => b.addEventListener('click', () => mostrar(i + +b.dataset.mover)));
    puntos.forEach((p, k) => p.addEventListener('click', () => mostrar(k)));
    btnPausa.addEventListener('click', () => {
      pausado = !pausado;
      btnPausa.innerHTML = ico(pausado ? 'play' : 'pausa');
      btnPausa.setAttribute('aria-label', pausado ? 'Reanudar' : 'Pausar');
      programar();
    });
    // deslizar con el dedo
    let x0 = null;
    hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) mostrar(i + (dx < 0 ? 1 : -1));
    });
    const tecla = e => { if (e.key === 'ArrowRight') mostrar(i + 1); if (e.key === 'ArrowLeft') mostrar(i - 1); };
    hero.addEventListener('keydown', tecla);
    programar();
    alSalir(() => clearTimeout(timer));
  }

  /* ---------- revelado desde los lados (solo lo que está bajo el pliegue) ---------- */
  function revelarLados(raiz) {
    const els = [...raiz.querySelectorAll('.cl-rv')];
    if (D.fx.reducido || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visto')); return; }
    const io = new IntersectionObserver(ent => ent.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visto'); e.target.classList.remove('cl-oculto'); io.unobserve(e.target); alVer(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('cl-oculto'); io.observe(el); }
      else { el.classList.add('visto'); alVer(el); }
    });
    alSalir(() => io.disconnect());
  }

  // efectos que se disparan cuando una pieza entra en pantalla
  function alVer(el) {
    if (el.classList.contains('cl-pieza')) {
      const cal = el.querySelector('.cl-cal-num');
      if (cal) { cal.dataset.valor = 0; D.fx.contar(cal, 365, 1400); }
      const med = el.querySelector('.cl-med-num');
      if (med) { med.dataset.valor = 0; D.fx.contar(med, 18, 1400); }
    }
  }

  /* ---------- guía que habla + línea que se dibuja con el scroll ---------- */
  function guia(raiz) {
    const pasos = [...raiz.querySelectorAll('.cl-paso')];
    const globo = raiz.querySelector('.cl-globo-txt');
    const zor = raiz.querySelector('.cl-zorro');
    const sec = raiz.querySelector('.cl-como');
    let actual = -1, tipeo = 0, timer = null, visible = false, manual = false;

    async function decir(txt) {
      const yo = ++tipeo;
      zor.classList.add('habla');
      if (D.fx.reducido) { globo.textContent = txt; zor.classList.remove('habla'); return; }
      globo.textContent = '';
      for (const ch of txt) { if (yo !== tipeo) return; globo.textContent += ch; await new Promise(r => setTimeout(r, 18)); }
      if (yo === tipeo) zor.classList.remove('habla');
    }
    function activar(n) {
      actual = n;
      pasos.forEach((p, k) => { p.classList.toggle('actual', k === n); p.classList.toggle('hecho', k < n); });
      zor.classList.remove('salta'); void zor.offsetWidth; zor.classList.add('salta');
      decir(n < 0 ? SALUDO : PASOS[n].dice);
    }
    function ciclo() {
      clearTimeout(timer);
      if (!visible || manual) return;
      timer = setTimeout(() => { activar(actual + 1 >= PASOS.length ? -1 : actual + 1); ciclo(); }, actual < 0 ? 2600 : 4200);
    }
    pasos.forEach((p, k) => p.querySelector('.cl-paso-card').addEventListener('click', () => {
      manual = true; clearTimeout(timer); activar(k);
      clearTimeout(p._t); p._t = setTimeout(() => { manual = false; ciclo(); }, 9000);
    }));
    const io = new IntersectionObserver(ent => ent.forEach(e => { visible = e.isIntersecting; if (visible) ciclo(); else clearTimeout(timer); }), { threshold: .35 });
    io.observe(sec);
    alSalir(() => { io.disconnect(); clearTimeout(timer); tipeo++; });
  }
  function zorroImagen(raiz) {
    const img = new Image();
    img.onload = () => {
      const svg = raiz.querySelector('.cl-zorro'); if (!svg) return;
      const el = document.createElement('img');
      el.src = img.src; el.alt = ''; el.className = 'cl-zorro cl-zorro-img';
      svg.replaceWith(el);
    };
    return; // sin guía animado (capa sobria)
  }

  function tokensDemo(raiz) {
    const btn = raiz.querySelector('.cl-probar');
    const num = raiz.querySelector('.cl-tok-num');
    let saldo = 0;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await D.fx.monedas(raiz.querySelector('.cl-bolsa'), raiz.querySelector('.cl-billetera'), 8);
      saldo += 55; D.fx.contar(num, saldo, 900);
      raiz.querySelector('.cl-billetera').classList.add('pulso');
      setTimeout(() => raiz.querySelector('.cl-billetera').classList.remove('pulso'), 700);
      D.fx.toast('+55 tokens en la billetera', 'Así se ve cuando ya eres socio.', 'T');
      btn.disabled = false;
    });
  }

  D.views.club = {
    titulo: 'Raíz Austral',
    render(el) {
      limpiezas = [];
      el.innerHTML = `<div class="cl">${hero()}${como()}${requisitos()}${candado()}${quienes()}${politica()}${porDentro()}${faq()}${ctaFinal()}</div>`;
      const raiz = el.querySelector('.cl');
      const bajar = () => raiz.querySelector('#cl-como').scrollIntoView({ behavior: D.fx.reducido ? 'auto' : 'smooth' });
      raiz.querySelectorAll('[data-bajar]').forEach(b => b.addEventListener('click', bajar));
      raiz.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => raiz.querySelector('#' + b.dataset.ir).scrollIntoView({ behavior: 'smooth' })));
      carrusel(raiz);
      zorroImagen(raiz);
      requestAnimationFrame(() => { revelarLados(raiz); guia(raiz); });
      tokensDemo(raiz);
    },
    salir() { limpiezas.forEach(f => { try { f(); } catch (e) { } }); limpiezas = []; }
  };
})();
